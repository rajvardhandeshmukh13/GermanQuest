/**
 * Quiz History & Attempts Management for GermanQuest
 *
 * Centralized store for player quiz attempts with localStorage persistence.
 */

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  quizSubtitle: string;
  title?: string;
  subtitle?: string;
  topic: string;
  score: number;
  xpEarned: number;
  correctAnswers: number;
  totalQuestions: number;
  accuracy: number;
  bestStreak: number;
  timeTakenSeconds?: number;
  completedAt: string;
  timestamp: number;
}

export const INITIAL_DEMO_ATTEMPTS: QuizAttempt[] = [
  {
    id: "hist-1",
    quizId: "hallo",
    quizTitle: "Hallo!",
    quizSubtitle: "Greetings & Introductions",
    title: "Hallo!",
    subtitle: "Greetings & Introductions",
    topic: "Greetings",
    score: 270,
    xpEarned: 270,
    correctAnswers: 7,
    totalQuestions: 8,
    accuracy: 88,
    bestStreak: 6,
    timeTakenSeconds: 120,
    completedAt: "Completed today",
    timestamp: Date.now() - 3600000,
  },
  {
    id: "hist-2",
    quizId: "zahlen",
    quizTitle: "Zahlen",
    quizSubtitle: "Numbers & Time",
    title: "Zahlen",
    subtitle: "Numbers & Time",
    topic: "Numbers",
    score: 250,
    xpEarned: 250,
    correctAnswers: 6,
    totalQuestions: 8,
    accuracy: 75,
    bestStreak: 4,
    timeTakenSeconds: 140,
    completedAt: "Completed yesterday",
    timestamp: Date.now() - 86400000,
  },
  {
    id: "hist-3",
    quizId: "essen",
    quizTitle: "Essen",
    quizSubtitle: "Food & Drinks",
    title: "Essen",
    subtitle: "Food & Drinks",
    topic: "Dining",
    score: 200,
    xpEarned: 200,
    correctAnswers: 7,
    totalQuestions: 8,
    accuracy: 88,
    bestStreak: 5,
    timeTakenSeconds: 130,
    completedAt: "Completed 3 days ago",
    timestamp: Date.now() - 259200000,
  },
];

const STORAGE_KEY = "gq_quiz_attempts";

export function getQuizHistory(useLocalStorage = true, storageKeySuffix?: string): QuizAttempt[] {
  if (!useLocalStorage || typeof window === "undefined") {
    return storageKeySuffix ? [] : INITIAL_DEMO_ATTEMPTS;
  }

  const key = storageKeySuffix ? `gq_quiz_attempts_${storageKeySuffix}` : STORAGE_KEY;

  try {
    const item = localStorage.getItem(key);
    if (!item) {
      const initial = storageKeySuffix ? [] : INITIAL_DEMO_ATTEMPTS;
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(item);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return storageKeySuffix ? [] : INITIAL_DEMO_ATTEMPTS;
  } catch (error) {
    console.error("Failed to read quiz history from localStorage:", error);
    return storageKeySuffix ? [] : INITIAL_DEMO_ATTEMPTS;
  }
}

export function saveQuizAttempt(
  attemptData: Omit<QuizAttempt, "id" | "timestamp" | "completedAt"> & {
    id?: string;
    timestamp?: number;
    completedAt?: string;
  },
  storageKeySuffix?: string
): QuizAttempt {
  const timestamp = attemptData.timestamp || Date.now();
  const id = attemptData.id || `attempt-${timestamp}-${Math.floor(Math.random() * 1000)}`;
  const completedAt = attemptData.completedAt || "Completed just now";

  const newAttempt: QuizAttempt = {
    ...attemptData,
    id,
    timestamp,
    completedAt,
    title: attemptData.title || attemptData.quizTitle,
    subtitle: attemptData.subtitle || attemptData.quizSubtitle,
    score: attemptData.xpEarned,
  };

  if (typeof window !== "undefined") {
    try {
      const key = storageKeySuffix ? `gq_quiz_attempts_${storageKeySuffix}` : STORAGE_KEY;
      const currentHistory = getQuizHistory(true, storageKeySuffix);
      const updatedHistory = [newAttempt, ...currentHistory];
      localStorage.setItem(key, JSON.stringify(updatedHistory));
      window.dispatchEvent(new CustomEvent("gq_stats_updated"));
    } catch (error) {
      console.error("Failed to save quiz attempt to localStorage:", error);
    }
  }

  return newAttempt;
}

export function resetQuizHistory(): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_ATTEMPTS));
      window.dispatchEvent(new CustomEvent("gq_stats_updated"));
    } catch (error) {
      console.error("Failed to reset quiz history:", error);
    }
  }
}
