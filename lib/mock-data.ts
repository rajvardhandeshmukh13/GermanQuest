/**
 * Centralized Data Architecture for GermanQuest
 *
 * Re-exports static quiz data, player profile data, quiz attempt history,
 * derived player statistics, and dynamic leaderboard rankings.
 */

import { getCalculatedPlayerStats, getPlayerLevelInfo, usePlayerStats } from "./player-stats";
import { getQuizHistory, type QuizAttempt } from "./quiz-history";
import { getPlayerProfile } from "./player-data";
import { getDynamicLeaderboard, type LeaderboardPeriod, type LeaderboardUser } from "./demo-leaderboard";

export type { PlayerProfile } from "./player-data";
export type { QuizAttempt as QuizHistoryItem, QuizAttempt } from "./quiz-history";
export type { LeaderboardUser, LeaderboardPeriod } from "./demo-leaderboard";
export type { LevelThreshold, LevelInfo, TopicProgress, FullPlayerStats } from "./player-stats";
export { LEVEL_THRESHOLDS, getPlayerLevelInfo, usePlayerStats } from "./player-stats";

export { saveQuizAttempt, resetQuizHistory, getQuizHistory } from "./quiz-history";
export { getPlayerProfile, updatePlayerProfile } from "./player-data";
export { getCalculatedPlayerStats } from "./player-stats";

/**
 * Backward-compatible getter for player profile & derived statistics.
 * Returns dynamic stats snapshot derived from actual quiz history.
 */
export function getMockPlayerProfile() {
  return getCalculatedPlayerStats(false);
}

/**
 * Backward-compatible getter for leaderboard entries.
 * Sarah's XP and rank are dynamically calculated based on her actual performance.
 */
export function getMockLeaderboard(period: LeaderboardPeriod = "week"): LeaderboardUser[] {
  const stats = getCalculatedPlayerStats(typeof window !== "undefined");
  const { users } = getDynamicLeaderboard(
    {
      id: stats.id,
      name: stats.name,
      avatar: stats.avatar,
      level: stats.level,
      totalXP: stats.totalXP,
      streak: stats.currentStreak,
    },
    period
  );
  return users;
}

/**
 * Backward-compatible getter for quiz history.
 */
export function getMockQuizHistory(): QuizAttempt[] {
  return getQuizHistory(typeof window !== "undefined");
}

/**
 * Backward-compatible getter for topic progress.
 */
export function getMockTopicProgress() {
  return getCalculatedPlayerStats(typeof window !== "undefined").topicProgress;
}
