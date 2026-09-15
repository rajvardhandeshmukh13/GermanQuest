/**
 * Derived Player Statistics Utility for GermanQuest
 *
 * Centralized calculation functions that derive all player stats directly from
 * completed quiz attempts and player profile.
 */

import * as React from "react";
import { QUIZZES, type Quiz } from "./quiz-data";
import { getQuizHistory, type QuizAttempt, INITIAL_DEMO_ATTEMPTS } from "./quiz-history";
import { getPlayerProfile, type PlayerProfile } from "./player-data";
import { getDynamicLeaderboard, type LeaderboardUser, type LeaderboardPeriod } from "./demo-leaderboard";

export interface LevelThreshold {
  level: number;
  xp: number;
}

export const LEVEL_THRESHOLDS: LevelThreshold[] = [
  { level: 1, xp: 0 },
  { level: 2, xp: 200 },
  { level: 3, xp: 500 },
  { level: 4, xp: 1000 },
  { level: 5, xp: 1750 },
  { level: 6, xp: 2750 },
  { level: 7, xp: 3750 },
  { level: 8, xp: 5000 },
  { level: 9, xp: 6500 },
  { level: 10, xp: 8250 },
  { level: 11, xp: 10250 },
  { level: 12, xp: 12500 },
  { level: 13, xp: 15000 },
  { level: 14, xp: 18000 },
  { level: 15, xp: 21500 },
  { level: 16, xp: 25500 },
  { level: 17, xp: 30000 },
  { level: 18, xp: 35000 },
  { level: 19, xp: 40500 },
  { level: 20, xp: 46500 },
];

export interface LevelInfo {
  level: number;
  currentLevelXp: number;
  /** Alias for currentLevelXp (start threshold of current level) */
  currentLevelXP: number;
  nextLevelXp: number;
  /** Alias for nextLevelXp (threshold of next level) */
  nextLevelXP: number;
  xpInLevel: number;
  xpNeededForNext: number;
  /** Alias for xpNeededForNext */
  xpRemaining: number;
  levelSpanXp: number;
  /** Alias for levelSpanXp (XP required within level) */
  nextLevelXPRequired: number;
  progressPercent: number;
}

export interface TopicProgress {
  quizId: string;
  title: string;
  subtitle: string;
  accuracy: number;
  progressPercent: number;
  completedAttempts: number;
  status: "completed" | "in_progress" | "not_started";
}

export interface FullPlayerStats {
  id: string;
  name: string;
  avatar: string;
  avatarUrl?: string;
  level: number;
  totalXP: number;
  /** Alias for totalXP */
  xp: number;
  currentLevelXp: number;
  nextLevelXp: number;
  currentStreak: number;
  /** Alias for currentStreak */
  streak: number;
  bestStreak: number;
  rank: number;
  rankWeeklyChange: number;
  accuracy: number;
  quizzesCompleted: number;
  totalQuizzes: number;
  questionsAnswered: number;
  correctAnswers: number;
  levelInfo: LevelInfo;
  topicProgress: TopicProgress[];
  recentAttempts: QuizAttempt[];
  nextChallenge: Quiz;
}

/**
 * Mathematically calculates level info and progress from total XP.
 * Single source of truth for current level, in-level XP, next level required XP,
 * XP remaining, and progress percentage.
 */
export function getPlayerLevelInfo(totalXp: number): LevelInfo {
  const safeXP = Math.max(0, totalXp || 0);
  let currentLevel = 1;
  let currentLevelXp = 0;
  let nextLevelXp = 200;

  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (safeXP >= LEVEL_THRESHOLDS[i].xp) {
      currentLevel = LEVEL_THRESHOLDS[i].level;
      currentLevelXp = LEVEL_THRESHOLDS[i].xp;
      nextLevelXp = LEVEL_THRESHOLDS[i + 1]?.xp ?? (currentLevelXp + 2500);
    } else {
      break;
    }
  }

  const levelSpanXp = Math.max(1, nextLevelXp - currentLevelXp);
  const xpInLevel = Math.max(0, safeXP - currentLevelXp);
  const xpNeededForNext = Math.max(0, nextLevelXp - safeXP);
  const progressPercent = Math.min(100, Math.max(0, Math.round((xpInLevel / levelSpanXp) * 100)));

  return {
    level: currentLevel,
    currentLevelXp,
    currentLevelXP: currentLevelXp,
    nextLevelXp,
    nextLevelXP: nextLevelXp,
    xpInLevel,
    xpNeededForNext,
    xpRemaining: xpNeededForNext,
    levelSpanXp,
    nextLevelXPRequired: levelSpanXp,
    progressPercent,
  };
}

/**
 * Shared alias function for retrieving level progress.
 */
export function getLevelProgress(totalXp: number): LevelInfo {
  return getPlayerLevelInfo(totalXp);
}

/* ── Individual Derived Stat Functions ──────────────────────────── */

export function getTotalXP(attempts: QuizAttempt[]): number {
  return attempts.reduce((sum, a) => sum + (a.xpEarned || a.score || 0), 0);
}

export function getLevel(totalXP: number): number {
  return getPlayerLevelInfo(totalXP).level;
}

export function getCorrectAnswers(attempts: QuizAttempt[]): number {
  return attempts.reduce((sum, a) => sum + (a.correctAnswers || 0), 0);
}

export function getQuestionsAnswered(attempts: QuizAttempt[]): number {
  return attempts.reduce((sum, a) => sum + (a.totalQuestions || 0), 0);
}

export function getAccuracy(attempts: QuizAttempt[]): number {
  const totalCorrect = getCorrectAnswers(attempts);
  const totalQuestions = getQuestionsAnswered(attempts);
  if (totalQuestions === 0) return 0;
  return Math.min(100, Math.max(0, Math.round((totalCorrect / totalQuestions) * 100)));
}

export function getQuizzesCompleted(attempts: QuizAttempt[]): number {
  const uniqueQuizIds = new Set(attempts.map((a) => a.quizId));
  return Math.min(QUIZZES.length, uniqueQuizIds.size);
}

export function getBestStreak(attempts: QuizAttempt[]): number {
  if (attempts.length === 0) return 0;
  return Math.max(0, ...attempts.map((a) => a.bestStreak || 0));
}

export function getCurrentStreak(profile: PlayerProfile): number {
  return profile.activityStreak;
}

export function getTopicProgress(attempts: QuizAttempt[]): TopicProgress[] {
  return QUIZZES.map((quiz) => {
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

    const totalCorrect = quizAttempts.reduce((sum, a) => sum + a.correctAnswers, 0);
    const totalQuestions = quizAttempts.reduce((sum, a) => sum + a.totalQuestions, 0);
    const accuracy =
      totalQuestions > 0
        ? Math.min(100, Math.max(0, Math.round((totalCorrect / totalQuestions) * 100)))
        : 0;

    return {
      quizId: quiz.id,
      title: quiz.title,
      subtitle: quiz.subtitle,
      accuracy,
      progressPercent: accuracy,
      completedAttempts: quizAttempts.length,
      status: "completed",
    };
  });
}

export function getNextChallenge(attempts: QuizAttempt[]): Quiz {
  const completedQuizIds = new Set(attempts.map((a) => a.quizId));
  // Find first uncompleted quiz
  const uncompleted = QUIZZES.find((q) => !completedQuizIds.has(q.id));
  if (uncompleted) return uncompleted;

  // Otherwise, find topic with lowest accuracy
  const topicStats = getTopicProgress(attempts);
  topicStats.sort((a, b) => a.accuracy - b.accuracy);
  const lowestQuizId = topicStats[0]?.quizId;
  const lowestQuiz = QUIZZES.find((q) => q.id === lowestQuizId);

  return lowestQuiz || QUIZZES[0];
}

/**
 * Calculates complete, verified FullPlayerStats snapshot.
 */
export function getCalculatedPlayerStats(useLocalStorage = true): FullPlayerStats {
  const profile = getPlayerProfile(useLocalStorage);
  const attempts = getQuizHistory(useLocalStorage);

  const totalXP = getTotalXP(attempts);
  const levelInfo = getPlayerLevelInfo(totalXP);
  const level = levelInfo.level;
  const correctAnswers = getCorrectAnswers(attempts);
  const questionsAnswered = getQuestionsAnswered(attempts);
  const accuracy = getAccuracy(attempts);
  const quizzesCompleted = getQuizzesCompleted(attempts);
  const totalQuizzes = QUIZZES.length;
  const bestStreak = getBestStreak(attempts);
  const currentStreak = profile.activityStreak;

  const { userRank } = getDynamicLeaderboard(
    {
      id: profile.id,
      name: profile.name,
      avatar: profile.avatar,
      level,
      totalXP,
      streak: currentStreak,
    },
    "week"
  );

  const topicProgress = getTopicProgress(attempts);
  const recentAttempts = attempts.slice(0, 3);
  const nextChallenge = getNextChallenge(attempts);

  // Validate bounds
  const validAccuracy = Math.min(100, Math.max(0, accuracy));
  const validQuestionsAnswered = Math.max(correctAnswers, questionsAnswered);

  const stats: FullPlayerStats = {
    id: profile.id,
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
    rankWeeklyChange: 2,
    accuracy: validAccuracy,
    quizzesCompleted,
    totalQuizzes,
    questionsAnswered: validQuestionsAnswered,
    correctAnswers,
    levelInfo,
    topicProgress,
    recentAttempts,
    nextChallenge,
  };

  return stats;
}

import { usePlayerStats as useAuthPlayerStats } from "@/components/auth/auth-provider";

/**
 * React Hook for real-time player statistics synchronization.
 * Delegates to AuthProvider to seamlessly return authenticated Firebase user stats or guest demo stats.
 */
export function usePlayerStats(): FullPlayerStats {
  return useAuthPlayerStats();
}
