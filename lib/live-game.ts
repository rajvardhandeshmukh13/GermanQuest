/**
 * Live Multiplayer Realtime Engine for GermanQuest
 *
 * Provides typed state management for Live Kahoot-style classroom games.
 * Backed by Firebase Realtime Database for true cross-device realtime synchronization,
 * with automatic fallback to BroadcastChannel/localStorage for offline/dev resiliency.
 */

import { getQuizById, QUIZZES } from "@/lib/quiz-data";
import {
  createFirebaseLiveGame,
  getFirebaseGameIdByPin,
  joinFirebaseLiveGame,
  startFirebaseLiveGame,
  submitFirebaseLiveAnswer,
  advanceFirebaseLiveGameState,
  subscribeToFirebaseLiveGame,
  calculateRanks,
  finalizeFirebaseQuestionResults,
  terminateFirebaseLiveGame,
  submitPlayerQuizEarlyInFirebase,
} from "./firebase-live-game";

export type LiveGameStatus =
  | "lobby"
  | "question"
  | "results"
  | "leaderboard"
  | "finished"
  | "terminated";

export interface LivePlayer {
  id: string;
  name: string;
  avatar: string;
  score: number;
  currentStreak: number;
  bestStreak: number;
  isHost: boolean;
  selectedAnswerIndex?: number;
  answerTimeSeconds?: number;
  isCorrect?: boolean;
  xpEarnedLastQuestion?: number;
  rank: number;
  previousRank?: number;
  hasSubmitted?: boolean;
}

export interface LiveGame {
  gameId: string;
  pin: string;
  hostId: string;
  quizId: string;
  status: LiveGameStatus;
  currentQuestionIndex: number;
  totalQuestions: number;
  timeRemaining: number;
  questionStartTime?: number;
  players: LivePlayer[];
  createdAt: number;
}

const STORAGE_PREFIX = "gq_live_game_";
const CHANNEL_NAME = "gq_live_game_channel";

/* ── Local Helper Functions ────────────────────────────────────────── */

function getRandomPin(): string {
  const num = Math.floor(100000 + Math.random() * 900000);
  return num.toString();
}

function getInitials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "P"
  );
}

function getStorageKey(pin: string): string {
  return `${STORAGE_PREFIX}${pin}`;
}

function broadcastLocalUpdate(pin: string, game: LiveGame) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getStorageKey(pin), JSON.stringify(game));
    if ("BroadcastChannel" in window) {
      const bc = new BroadcastChannel(CHANNEL_NAME);
      bc.postMessage({ pin, game });
      bc.close();
    }
  } catch {
    // Ignore storage quota errors
  }
}

/* ── Live Engine API (Firebase + Local Fallback Sync) ─────────────── */

export async function createLiveGame(quizId: string = "hallo"): Promise<LiveGame> {
  const fbGame = await createFirebaseLiveGame(quizId);
  broadcastLocalUpdate(fbGame.pin, fbGame);
  return fbGame;
}

export function getLiveGameByPin(pin: string): LiveGame | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(getStorageKey(pin));
  if (!stored) return null;
  try {
    return JSON.parse(stored) as LiveGame;
  } catch {
    return null;
  }
}

export async function joinLiveGame(
  pin: string,
  nickname: string
): Promise<{ game: LiveGame; player: LivePlayer } | null> {
  const trimmedName = nickname.trim().slice(0, 16) || "Player";

  try {
    const firebaseResult = await joinFirebaseLiveGame(pin, trimmedName);
    if (firebaseResult) {
      broadcastLocalUpdate(pin, firebaseResult.game);
      return firebaseResult;
    }
  } catch (error) {
    console.error("Firebase live join failed:", error);
  }

  // Local fallback for same-device / offline development
  const localGame = getLiveGameByPin(pin);
  if (!localGame) {
    return null;
  }

  let player = localGame.players.find(
    (p) => p.name.toLowerCase() === trimmedName.toLowerCase()
  );

  if (!player) {
    player = {
      id: `player-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: trimmedName,
      avatar: getInitials(trimmedName),
      score: 0,
      currentStreak: 0,
      bestStreak: 0,
      isHost: false,
      rank: localGame.players.length + 1,
    };
    localGame.players.push(player);
    broadcastLocalUpdate(pin, localGame);
  }

  return { game: localGame, player };
}

export function addDemoPlayers(pin: string, count: number = 5): LiveGame | null {
  const game = getLiveGameByPin(pin);
  if (!game) return null;

  const demoNames = ["Aarav", "Sarah M", "Riya", "Neha", "Kabir", "Arjun K", "Maya R"];
  let addedCount = 0;

  for (const name of demoNames) {
    if (addedCount >= count) break;
    const exists = game.players.some((p) => p.name.toLowerCase() === name.toLowerCase());
    if (!exists) {
      const demoPlayer: LivePlayer = {
        id: `demo-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name,
        avatar: getInitials(name),
        score: 0,
        currentStreak: 0,
        bestStreak: 0,
        isHost: false,
        rank: game.players.length + 1,
      };
      game.players.push(demoPlayer);
      addedCount++;
    }
  }

  broadcastLocalUpdate(pin, game);

  // Sync demo players to Firebase
  game.players.forEach((p) => {
    if (!p.isHost && p.id.startsWith("demo-")) {
      joinFirebaseLiveGame(pin, p.name).catch(() => {});
    }
  });

  return game;
}

export async function startLiveGame(pin: string): Promise<LiveGame | null> {
  const game = getLiveGameByPin(pin);

  try {
    await startFirebaseLiveGame(pin);
  } catch (err) {
    console.warn("startFirebaseLiveGame warning:", err);
  }

  if (!game) return null;

  game.status = "question";
  game.currentQuestionIndex = 0;
  game.timeRemaining = 15;
  game.questionStartTime = Date.now();

  game.players.forEach((p) => {
    p.selectedAnswerIndex = undefined;
    p.isCorrect = undefined;
    p.answerTimeSeconds = undefined;
    p.xpEarnedLastQuestion = undefined;
  });

  broadcastLocalUpdate(pin, game);
  return game;
}

export async function submitLiveAnswer(
  pin: string,
  playerId: string,
  answerIndex: number,
  timeRemainingSeconds: number,
  correctAnswerIndex: number
): Promise<LiveGame | null> {
  try {
    await submitFirebaseLiveAnswer(
      pin,
      playerId,
      answerIndex,
      timeRemainingSeconds,
      correctAnswerIndex
    );
  } catch (err) {
    console.warn("submitFirebaseLiveAnswer warning:", err);
  }

  const game = getLiveGameByPin(pin);
  if (!game) return null;

  const player = game.players.find((p) => p.id === playerId);
  if (!player || typeof player.selectedAnswerIndex === "number") return game;

  const isCorrect = answerIndex === correctAnswerIndex;
  player.selectedAnswerIndex = answerIndex;
  player.answerTimeSeconds = 15 - Math.max(0, timeRemainingSeconds);
  player.isCorrect = isCorrect;

  if (isCorrect) {
    const baseXP = 100;
    const speedBonus = Math.round(timeRemainingSeconds * 10);
    const streakBonus = player.currentStreak * 15;
    const xpEarned = baseXP + speedBonus + streakBonus;

    player.score += xpEarned;
    player.xpEarnedLastQuestion = xpEarned;
    player.currentStreak += 1;
    if (player.currentStreak > player.bestStreak) {
      player.bestStreak = player.currentStreak;
    }
  } else {
    player.xpEarnedLastQuestion = 0;
    player.currentStreak = 0;
  }

  broadcastLocalUpdate(pin, game);
  return game;
}

export async function simulateDemoAnswers(pin: string, correctAnswerIndex: number): Promise<LiveGame | null> {
  try {
    await finalizeFirebaseQuestionResults(pin, correctAnswerIndex);
  } catch (err) {
    console.warn("finalizeFirebaseQuestionResults warning:", err);
  }

  const game = getLiveGameByPin(pin);
  if (!game) return null;

  game.players.forEach((p) => {
    if (p.isHost) return;

    if (p.selectedAnswerIndex !== undefined && p.selectedAnswerIndex !== null) {
      // Real submitted answer -- keep exact result
      return;
    }

    if (p.id.startsWith("demo-")) {
      // Demo Bot simulation
      const isCorrect = Math.random() < 0.7;
      const chosen = isCorrect
        ? correctAnswerIndex
        : (correctAnswerIndex + 1) % 4;

      const timeRemaining = Math.floor(Math.random() * 10) + 3;
      p.selectedAnswerIndex = chosen;
      p.isCorrect = isCorrect;

      if (isCorrect) {
        const xp = 100 + timeRemaining * 8 + p.currentStreak * 10;
        p.score += xp;
        p.xpEarnedLastQuestion = xp;
        p.currentStreak += 1;
        if (p.currentStreak > p.bestStreak) {
          p.bestStreak = p.currentStreak;
        }
      } else {
        p.xpEarnedLastQuestion = 0;
        p.currentStreak = 0;
      }
    } else {
      // Real human participant timeout / unanswered: 0 points, streak reset
      p.selectedAnswerIndex = -1;
      p.isCorrect = false;
      p.xpEarnedLastQuestion = 0;
      p.currentStreak = 0;
    }
  });

  recalculateRanks(game);
  broadcastLocalUpdate(pin, game);
  return game;
}

export function recalculateRanks(game: LiveGame) {
  const sorted = [...game.players]
    .filter((p) => !p.isHost)
    .sort((a, b) => b.score - a.score);

  sorted.forEach((player, idx) => {
    const newRank = idx + 1;
    player.previousRank = player.rank || newRank;
    player.rank = newRank;
  });
}

export async function advanceLiveGameState(
  pin: string,
  nextStatus: LiveGameStatus
): Promise<LiveGame | null> {
  try {
    await advanceFirebaseLiveGameState(pin, nextStatus);
  } catch (err) {
    console.warn("advanceFirebaseLiveGameState warning:", err);
  }

  const game = getLiveGameByPin(pin);
  if (!game) return null;

  game.status = nextStatus;

  if (nextStatus === "question") {
    game.currentQuestionIndex += 1;
    game.timeRemaining = 15;
    game.questionStartTime = Date.now();

    game.players.forEach((p) => {
      p.selectedAnswerIndex = undefined;
      p.isCorrect = undefined;
      p.answerTimeSeconds = undefined;
      p.xpEarnedLastQuestion = undefined;
    });
  } else if (nextStatus === "results" || nextStatus === "leaderboard" || nextStatus === "terminated") {
    recalculateRanks(game);
  }

  broadcastLocalUpdate(pin, game);
  return game;
}

export async function terminateLiveGame(pin: string): Promise<LiveGame | null> {
  try {
    await terminateFirebaseLiveGame(pin);
  } catch (err) {
    console.warn("terminateFirebaseLiveGame warning:", err);
  }

  const game = getLiveGameByPin(pin);
  if (!game) return null;

  game.status = "terminated";
  recalculateRanks(game);
  broadcastLocalUpdate(pin, game);
  return game;
}

export async function submitPlayerQuizEarly(
  pin: string,
  playerId: string
): Promise<LiveGame | null> {
  try {
    await submitPlayerQuizEarlyInFirebase(pin, playerId);
  } catch (err) {
    console.warn("submitPlayerQuizEarlyInFirebase warning:", err);
  }

  const game = getLiveGameByPin(pin);
  if (!game) return null;

  const player = game.players.find((p) => p.id === playerId);
  if (player) {
    player.hasSubmitted = true;
  }

  broadcastLocalUpdate(pin, game);
  return game;
}

export function subscribeToLiveGame(
  pin: string,
  callback: (game: LiveGame) => void
): () => void {
  if (typeof window === "undefined") return () => {};

  let hasReceivedFirebaseUpdate = false;

  // Subscribe to Firebase Realtime Database (Authoritative)
  const unsubFirebase = subscribeToFirebaseLiveGame(pin, (fbGame) => {
    hasReceivedFirebaseUpdate = true;
    broadcastLocalUpdate(pin, fbGame);
    callback(fbGame);
  });

  // Local BroadcastChannel / storage listener (Only fallback if Firebase hasn't fired)
  const handleStorage = (e: StorageEvent) => {
    if (!hasReceivedFirebaseUpdate && e.key === getStorageKey(pin) && e.newValue) {
      try {
        callback(JSON.parse(e.newValue));
      } catch {
        // ignore
      }
    }
  };

  window.addEventListener("storage", handleStorage);

  let bc: BroadcastChannel | null = null;
  if ("BroadcastChannel" in window) {
    bc = new BroadcastChannel(CHANNEL_NAME);
    bc.onmessage = (e) => {
      if (!hasReceivedFirebaseUpdate && e.data?.pin === pin && e.data?.game) {
        callback(e.data.game);
      }
    };
  }

  return () => {
    unsubFirebase();
    window.removeEventListener("storage", handleStorage);
    if (bc) {
      bc.close();
    }
  };
}
