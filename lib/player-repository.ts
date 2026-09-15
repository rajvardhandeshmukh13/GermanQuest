/**
 * Data Repository Layer for GermanQuest
 *
 * Provides a unified abstraction for fetching and saving player profiles,
 * quiz attempts, and derived statistics, supporting both Demo mode (localStorage)
 * and Authenticated mode (Firebase Realtime Database).
 */

import { ref, get, set, update, child } from "firebase/database";
import { database } from "./firebase";
import { QUIZZES, type Quiz } from "./quiz-data";
import { getQuizHistory, saveQuizAttempt as saveDemoQuizAttempt, type QuizAttempt, INITIAL_DEMO_ATTEMPTS } from "./quiz-history";
import { getPlayerProfile as getDemoPlayerProfile, updatePlayerProfile as updateDemoPlayerProfile, type PlayerProfile as DemoProfile } from "./player-data";
import { getCalculatedPlayerStats, getPlayerLevelInfo, type FullPlayerStats, type TopicProgress } from "./player-stats";
import { getDynamicLeaderboard } from "./demo-leaderboard";

export interface FirebaseUserProfile {
  uid: string;
  name: string;
  avatar: string;
  avatarUrl?: string;
  email?: string;
  createdAt: number;
  totalXP: number;
  level: number;
  currentStreak: number;
  bestStreak: number;
  lastActivityDate: string;
}

export interface SaveAttemptResult {
  attempt: QuizAttempt;
  isNew: boolean;
  xpEarned: number;
}

export interface IPlayerRepository {
  getPlayerStats(): Promise<FullPlayerStats> | FullPlayerStats;
  saveQuizAttempt(
    attemptData: Omit<QuizAttempt, "id" | "timestamp" | "completedAt"> & {
      id?: string;
      timestamp?: number;
      completedAt?: string;
    }
  ): Promise<SaveAttemptResult> | SaveAttemptResult;
  updateProfile(updates: { name?: string; avatar?: string; avatarUrl?: string }): Promise<void> | void;
}

/**
 * Demo Player Repository — Backed by localStorage and deterministic seed data
 */
export class DemoPlayerRepository implements IPlayerRepository {
  getPlayerStats(): FullPlayerStats {
    return getCalculatedPlayerStats(typeof window !== "undefined");
  }

  saveQuizAttempt(
    attemptData: Omit<QuizAttempt, "id" | "timestamp" | "completedAt"> & {
      id?: string;
      timestamp?: number;
      completedAt?: string;
    }
  ): SaveAttemptResult {
    const saved = saveDemoQuizAttempt(attemptData);
    const stats = getCalculatedPlayerStats(true);
    return {
      attempt: saved,
      isNew: true,
      xpEarned: attemptData.xpEarned,
    };
  }

  updateProfile(updates: { name?: string; avatar?: string; avatarUrl?: string }): void {
    updateDemoPlayerProfile(updates);
  }
}

/**
 * Helper to get local date string YYYY-MM-DD
 */
export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Firebase Player Repository — Backed by Firebase Realtime Database users/{uid}
 */
export class FirebasePlayerRepository implements IPlayerRepository {
  private uid: string;

  constructor(uid: string) {
    this.uid = uid;
  }

  /**
   * Initializes a new user profile record in Firebase RTDB if it doesn't already exist.
   */
  static async initializeUserProfile(
    uid: string,
    initialData: { name: string; email?: string; avatar?: string }
  ): Promise<FirebaseUserProfile> {
    const userRef = ref(database, `users/${uid}/profile`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      const existing = snapshot.val() as FirebaseUserProfile;
      if (initialData.name && initialData.name !== "German Learner" && existing.name === "German Learner") {
        const initials = initialData.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);
        await update(userRef, { name: initialData.name, avatar: initialData.avatar || initials });
        return { ...existing, name: initialData.name, avatar: initialData.avatar || initials };
      }
      return existing;
    }

    const todayStr = getTodayDateString();
    const initials = (initialData.name || "GQ")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    const newProfile: FirebaseUserProfile = {
      uid,
      name: initialData.name || "German Learner",
      avatar: initialData.avatar || initials,
      email: initialData.email || "",
      createdAt: Date.now(),
      totalXP: 0,
      level: 1,
      currentStreak: 0,
      bestStreak: 0,
      lastActivityDate: todayStr,
    };

    await set(userRef, newProfile);
    return newProfile;
  }

  async getPlayerStats(): Promise<FullPlayerStats> {
    const userRef = ref(database, `users/${this.uid}`);
    let val: any = null;
    try {
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        val = snapshot.val();
      }
    } catch (err) {
      console.warn("Failed to fetch user stats from Firebase RTDB:", err);
    }

    const historyObj = val?.quizHistory || {};
    const fbAttempts: QuizAttempt[] = Object.entries(historyObj).map(([key, item]: [string, any]) => ({
      id: item?.id || key,
      ...item,
    }));

    const attempts = fbAttempts.sort(
      (a, b) => (b.timestamp || 0) - (a.timestamp || 0)
    );

    const calculatedXP = attempts.reduce((sum, a) => sum + (a.xpEarned || a.score || 0), 0);

    const profile: FirebaseUserProfile = val?.profile || {
      uid: this.uid,
      name: "German Learner",
      avatar: "GL",
      createdAt: Date.now(),
      totalXP: calculatedXP,
      level: getPlayerLevelInfo(calculatedXP).level,
      currentStreak: attempts.length > 0 ? 1 : 0,
      bestStreak: Math.max(0, ...attempts.map((a) => a.bestStreak || 0)),
      lastActivityDate: getTodayDateString(),
    };

    // Ensure totalXP and level are strictly in sync with actual authenticated quiz attempts
    profile.totalXP = calculatedXP;
    profile.level = getPlayerLevelInfo(calculatedXP).level;

    // Proactively clean up RTDB profile record if stored totalXP differed from actual attempts XP
    if (val?.profile && (val.profile.totalXP !== calculatedXP || val.profile.level !== profile.level)) {
      try {
        const profileRef = ref(database, `users/${this.uid}/profile`);
        update(profileRef, {
          totalXP: calculatedXP,
          level: profile.level,
        });
      } catch (err) {
        console.warn("Failed to sync profile totalXP in RTDB:", err);
      }
    }

    return this.buildStatsObject(profile, attempts);
  }

  public buildStatsObject(profile: FirebaseUserProfile, attempts: QuizAttempt[] = []): FullPlayerStats {
    const attemptsXP = attempts.reduce((sum, a) => sum + (a.xpEarned || a.score || 0), 0);
    const totalXP = Math.max(profile.totalXP || 0, attemptsXP);
    const levelInfo = getPlayerLevelInfo(totalXP);
    const level = levelInfo.level;

    const totalCorrect = attempts.reduce((sum, a) => sum + (a.correctAnswers || 0), 0);
    const totalQuestions = attempts.reduce((sum, a) => sum + (a.totalQuestions || 0), 0);
    const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    const uniqueQuizIds = new Set(attempts.map((a) => a.quizId));
    const quizzesCompleted = Math.min(QUIZZES.length, uniqueQuizIds.size);
    const currentStreak = Math.max(profile.currentStreak || 0, attempts.length > 0 ? 1 : 0);
    const bestStreak = Math.max(profile.bestStreak || 0, currentStreak, ...attempts.map((a) => a.bestStreak || 0));

    // Dynamic Leaderboard rank
    const { userRank } = getDynamicLeaderboard(
      {
        id: profile.uid,
        name: profile.name,
        avatar: profile.avatar,
        level,
        totalXP,
        streak: currentStreak,
      },
      "week"
    );

    // Topic progress mapping
    const topicProgress: TopicProgress[] = QUIZZES.map((quiz) => {
      const quizAttempts = attempts.filter((a) => a.quizId === quiz.id);
      if (quizAttempts.length === 0) {
        return {
          quizId: quiz.id,
          title: quiz.title,
          subtitle: quiz.subtitle,
          accuracy: 0,
          progressPercent: 0,
          completedAttempts: 0,
          status: "not_started",
        };
      }
      const qCorrect = quizAttempts.reduce((sum, a) => sum + a.correctAnswers, 0);
      const qTotal = quizAttempts.reduce((sum, a) => sum + a.totalQuestions, 0);
      const qAcc = qTotal > 0 ? Math.round((qCorrect / qTotal) * 100) : 0;
      return {
        quizId: quiz.id,
        title: quiz.title,
        subtitle: quiz.subtitle,
        accuracy: qAcc,
        progressPercent: qAcc,
        completedAttempts: quizAttempts.length,
        status: "completed",
      };
    });

    const recentAttempts = attempts.slice(0, 3);
    const completedQuizIds = new Set(attempts.map((a) => a.quizId));
    const uncompleted = QUIZZES.find((q) => !completedQuizIds.has(q.id));
    const nextChallenge = uncompleted || QUIZZES[0];

    return {
      id: profile.uid,
      name: profile.name,
      avatar: profile.avatar,
      avatarUrl: profile.avatarUrl,
      level,
      totalXP,
      xp: totalXP,
      currentLevelXp: levelInfo.currentLevelXp,
      nextLevelXp: levelInfo.nextLevelXp,
      currentStreak,
      streak: currentStreak,
      bestStreak,
      rank: userRank,
      rankWeeklyChange: 0,
      accuracy,
      quizzesCompleted,
      totalQuizzes: QUIZZES.length,
      questionsAnswered: totalQuestions,
      correctAnswers: totalCorrect,
      levelInfo,
      topicProgress,
      recentAttempts,
      nextChallenge,
    };
  }

  /**
   * Saves a completed quiz attempt into users/{uid}/quizHistory/{attemptId}
   * and updates user totalXP, streak, and level with duplicate submission protection.
   */
  async saveQuizAttempt(
    attemptData: Omit<QuizAttempt, "id" | "timestamp" | "completedAt"> & {
      id?: string;
      timestamp?: number;
      completedAt?: string;
    }
  ): Promise<SaveAttemptResult> {
    const timestamp = attemptData.timestamp || Date.now();
    const attemptId = attemptData.id || `attempt_${timestamp}`;
    const completedAt = attemptData.completedAt || "Completed just now";

    const fullAttempt: QuizAttempt = {
      ...attemptData,
      id: attemptId,
      timestamp,
      completedAt,
      title: attemptData.title || attemptData.quizTitle,
      subtitle: attemptData.subtitle || attemptData.quizSubtitle,
      score: attemptData.xpEarned,
    };

    // Always update demo localStorage as local backup
    saveDemoQuizAttempt(fullAttempt, this.uid);

    try {
      const attemptRef = ref(database, `users/${this.uid}/quizHistory/${attemptId}`);
      const existingSnap = await get(attemptRef);

      if (!existingSnap.exists()) {
        await set(attemptRef, fullAttempt);

        // Fetch all quiz history attempts from RTDB to compute exact totalXP
        const historyRef = ref(database, `users/${this.uid}/quizHistory`);
        const historySnap = await get(historyRef);
        const historyObj = historySnap.exists() ? historySnap.val() : {};
        const allAttempts = Object.values(historyObj) as QuizAttempt[];

        const newTotalXP = allAttempts.reduce((sum, a) => sum + (a.xpEarned || a.score || 0), 0);
        const newLevel = getPlayerLevelInfo(newTotalXP).level;

        const profileRef = ref(database, `users/${this.uid}/profile`);
        const profileSnap = await get(profileRef);
        const currentProfile: FirebaseUserProfile = profileSnap.exists()
          ? profileSnap.val()
          : {
              uid: this.uid,
              name: "German Learner",
              avatar: "GL",
              createdAt: Date.now(),
              totalXP: newTotalXP,
              level: newLevel,
              currentStreak: 0,
              bestStreak: 0,
              lastActivityDate: "",
            };

        const todayStr = getTodayDateString();
        const yesterdayStr = getYesterdayDateString();

        let newCurrentStreak = currentProfile.currentStreak || 0;
        if (!currentProfile.lastActivityDate) {
          newCurrentStreak = 1;
        } else if (currentProfile.lastActivityDate === todayStr) {
          if (newCurrentStreak === 0) newCurrentStreak = 1;
        } else if (currentProfile.lastActivityDate === yesterdayStr) {
          newCurrentStreak += 1;
        } else {
          newCurrentStreak = 1;
        }

        const newBestStreak = Math.max(currentProfile.bestStreak || 0, newCurrentStreak, attemptData.bestStreak || 0);

        const profileUpdates: Partial<FirebaseUserProfile> = {
          totalXP: newTotalXP,
          level: newLevel,
          currentStreak: newCurrentStreak,
          bestStreak: newBestStreak,
          lastActivityDate: todayStr,
        };

        await update(profileRef, profileUpdates);
      }
    } catch (err) {
      console.warn("Firebase RTDB sync warning during saveQuizAttempt:", err);
    }

    // Dispatch global event for client UI synchronization
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("gq_stats_updated"));
    }

    return {
      attempt: fullAttempt,
      isNew: true,
      xpEarned: attemptData.xpEarned,
    };
  }

  async updateProfile(updates: { name?: string; avatar?: string; avatarUrl?: string }): Promise<void> {
    const profileRef = ref(database, `users/${this.uid}/profile`);
    await update(profileRef, updates);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("gq_stats_updated"));
    }
  }
}
