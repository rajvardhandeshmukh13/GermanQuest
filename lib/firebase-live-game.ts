import {
  ref,
  set,
  get,
  update,
  onValue,
  off,
  child,
  serverTimestamp,
} from "firebase/database";
import { database } from "./firebase";
import { getQuizById, QUIZZES } from "./quiz-data";
import type { LiveGame, LivePlayer, LiveGameStatus } from "./live-game";

export interface LiveAnswerData {
  playerId: string;
  answerIndex: number;
  answeredAt: number;
  isCorrect: boolean;
  xpEarned: number;
}

const PIN_STORAGE_KEY_PREFIX = "gq_session_player_";

function getRandomPin(): string {
  const num = Math.floor(100000 + Math.random() * 900000);
  return num.toString();
}

function getInitials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "P"
  );
}

/**
 * Recalculate ranks among players based on score descending.
 */
export function calculateRanks(playersRecord: Record<string, LivePlayer> | LivePlayer[]): LivePlayer[] {
  const playerList = Array.isArray(playersRecord)
    ? playersRecord
    : Object.values(playersRecord || {});

  const contestants = playerList.filter((p) => !p.isHost);
  const hosts = playerList.filter((p) => p.isHost);

  contestants.sort((a, b) => b.score - a.score);

  contestants.forEach((p, idx) => {
    const newRank = idx + 1;
    p.previousRank = p.rank || newRank;
    p.rank = newRank;
  });

  return [...hosts, ...contestants];
}

/**
 * 1. Create a Live Game in Firebase Realtime Database
 */
export async function createFirebaseLiveGame(
  quizId: string = "hallo"
): Promise<LiveGame> {
  const quiz = getQuizById(quizId) || QUIZZES[0];
  let pin = getRandomPin();

  // Check PIN collisions in gamesByPin index (up to 10 attempts)
  let attempts = 0;
  while (attempts < 10) {
    try {
      const pinSnap = await get(child(ref(database), `gamesByPin/${pin}`));
      if (!pinSnap.exists()) break;
    } catch (err) {
      console.warn("PIN collision check warning:", err);
    }
    pin = getRandomPin();
    attempts++;
  }

  const gameId = `game_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  const hostPlayer: LivePlayer = {
    id: "host-user",
    name: "Host Teacher",
    avatar: "HT",
    score: 0,
    currentStreak: 0,
    bestStreak: 0,
    isHost: true,
    rank: 1,
  };

  const game: LiveGame = {
    gameId,
    pin,
    hostId: hostPlayer.id,
    quizId: quiz.id,
    status: "lobby",
    currentQuestionIndex: 0,
    totalQuestions: quiz.questionCount || 8,
    timeRemaining: 15,
    players: [hostPlayer],
    createdAt: Date.now(),
  };

  // Write PIN lookup index and Game object to Firebase RTDB
  await set(ref(database, `gamesByPin/${pin}`), {
    gameId,
    status: "lobby",
    createdAt: Date.now(),
  });

  await set(ref(database, `games/${gameId}`), {
    ...game,
    players: {
      [hostPlayer.id]: hostPlayer,
    },
  });

  return game;
}

/**
 * 2. Lookup Game by 6-digit PIN
 */
export async function getFirebaseGameIdByPin(pin: string): Promise<string | null> {
  try {
    const snap = await get(ref(database, `gamesByPin/${pin}`));
    if (!snap.exists()) return null;
    const val = snap.val();
    return val.gameId || null;
  } catch {
    return null;
  }
}

/**
 * 3. Join a Live Game by PIN
 */
export async function joinFirebaseLiveGame(
  pin: string,
  nickname: string
): Promise<{ game: LiveGame; player: LivePlayer } | null> {
  const gameId = await getFirebaseGameIdByPin(pin);
  if (!gameId) return null;

  const gameRef = ref(database, `games/${gameId}`);
  const snap = await get(gameRef);
  if (!snap.exists()) return null;

  const rawGame = snap.val();
  if (rawGame.status !== "lobby" && rawGame.status !== "question") return null;

  const trimmedName = nickname.trim().slice(0, 16) || "Player";

  // Check for session player ID
  let playerId = "";
  if (typeof window !== "undefined") {
    playerId = sessionStorage.getItem(`${PIN_STORAGE_KEY_PREFIX}${pin}`) || "";
  }

  const existingPlayersRecord = rawGame.players || {};
  let player = playerId ? existingPlayersRecord[playerId] : undefined;

  if (!player) {
    playerId = `player_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    if (typeof window !== "undefined") {
      sessionStorage.setItem(`${PIN_STORAGE_KEY_PREFIX}${pin}`, playerId);
    }

    const currentCount = Object.keys(existingPlayersRecord).length;
    player = {
      id: playerId,
      name: trimmedName,
      avatar: getInitials(trimmedName),
      score: 0,
      currentStreak: 0,
      bestStreak: 0,
      isHost: false,
      rank: currentCount + 1,
    };

    // Write new player to Firebase
    await set(ref(database, `games/${gameId}/players/${playerId}`), player);
  }

  // Construct normalized game with updated players record
  const updatedPlayersRecord = {
    ...existingPlayersRecord,
    [player.id]: player,
  };
  const playersList = calculateRanks(updatedPlayersRecord);
  const normalizedGame: LiveGame = {
    ...rawGame,
    players: playersList,
  };

  return { game: normalizedGame, player };
}

/**
 * 4. Host Starts Live Game
 */
export async function startFirebaseLiveGame(
  pin: string,
  durationSeconds: number = 15
): Promise<boolean> {
  const gameId = await getFirebaseGameIdByPin(pin);
  if (!gameId) return false;

  const now = Date.now();
  const endsAt = now + durationSeconds * 1000;

  const updates: Record<string, any> = {
    [`games/${gameId}/status`]: "question",
    [`games/${gameId}/currentQuestionIndex`]: 0,
    [`games/${gameId}/timeRemaining`]: durationSeconds,
    [`games/${gameId}/questionStartedAt`]: now,
    [`games/${gameId}/questionEndsAt`]: endsAt,
    [`gamesByPin/${pin}/status`]: "question",
  };

  await update(ref(database), updates);
  return true;
}

/**
 * 5. Player Submits Answer
 */
export async function submitFirebaseLiveAnswer(
  pin: string,
  playerId: string,
  answerIndex: number,
  timeRemainingSeconds: number,
  correctAnswerIndex: number
): Promise<boolean> {
  const gameId = await getFirebaseGameIdByPin(pin);
  if (!gameId) return false;

  const playerRef = ref(database, `games/${gameId}/players/${playerId}`);
  const snap = await get(playerRef);
  if (!snap.exists()) return false;

  const player: LivePlayer = snap.val();
  if (typeof player.selectedAnswerIndex === "number") return true; // Already submitted or timed out

  const isCorrect = answerIndex === correctAnswerIndex;
  const answerTime = 15 - Math.max(0, timeRemainingSeconds);

  let updatedScore = player.score;
  let updatedStreak = player.currentStreak;
  let updatedBestStreak = player.bestStreak;
  let xpEarned = 0;

  if (isCorrect) {
    const baseXP = 100;
    const speedBonus = Math.round(timeRemainingSeconds * 10);
    const streakBonus = updatedStreak * 15;
    xpEarned = baseXP + speedBonus + streakBonus;

    updatedScore += xpEarned;
    updatedStreak += 1;
    if (updatedStreak > updatedBestStreak) {
      updatedBestStreak = updatedStreak;
    }
  } else {
    updatedStreak = 0;
  }

  const updates: Record<string, any> = {
    [`games/${gameId}/players/${playerId}/selectedAnswerIndex`]: answerIndex,
    [`games/${gameId}/players/${playerId}/answerTimeSeconds`]: answerTime,
    [`games/${gameId}/players/${playerId}/isCorrect`]: isCorrect,
    [`games/${gameId}/players/${playerId}/xpEarnedLastQuestion`]: xpEarned,
    [`games/${gameId}/players/${playerId}/score`]: updatedScore,
    [`games/${gameId}/players/${playerId}/currentStreak`]: updatedStreak,
    [`games/${gameId}/players/${playerId}/bestStreak`]: updatedBestStreak,
  };

  // Record answer audit log
  const questionSnap = await get(ref(database, `games/${gameId}/currentQuestionIndex`));
  const currentIdx = questionSnap.val() || 0;

  updates[`games/${gameId}/answers/${currentIdx}/${playerId}`] = {
    playerId,
    answerIndex,
    answeredAt: Date.now(),
    isCorrect,
    xpEarned,
  };

  await update(ref(database), updates);
  return true;
}

/**
 * 6. Advance Game State (question -> results -> leaderboard -> next question -> finished)
 */
export async function advanceFirebaseLiveGameState(
  pin: string,
  nextStatus: LiveGameStatus,
  durationSeconds: number = 15
): Promise<boolean> {
  const gameId = await getFirebaseGameIdByPin(pin);
  if (!gameId) return false;

  const gameSnap = await get(ref(database, `games/${gameId}`));
  if (!gameSnap.exists()) return false;

  const rawGame = gameSnap.val();
  const currentIdx = rawGame.currentQuestionIndex || 0;
  const updates: Record<string, any> = {
    [`games/${gameId}/status`]: nextStatus,
    [`gamesByPin/${pin}/status`]: nextStatus,
  };

  if (nextStatus === "question") {
    const nextIdx = currentIdx + 1;
    const now = Date.now();
    const endsAt = now + durationSeconds * 1000;

    updates[`games/${gameId}/currentQuestionIndex`] = nextIdx;
    updates[`games/${gameId}/timeRemaining`] = durationSeconds;
    updates[`games/${gameId}/questionStartedAt`] = now;
    updates[`games/${gameId}/questionEndsAt`] = endsAt;

    // Reset choices for next question
    const playersMap = rawGame.players || {};
    Object.keys(playersMap).forEach((pId) => {
      updates[`games/${gameId}/players/${pId}/selectedAnswerIndex`] = null;
      updates[`games/${gameId}/players/${pId}/isCorrect`] = null;
      updates[`games/${gameId}/players/${pId}/answerTimeSeconds`] = null;
      updates[`games/${gameId}/players/${pId}/xpEarnedLastQuestion`] = null;
    });
  } else if (nextStatus === "results" || nextStatus === "leaderboard" || nextStatus === "finished") {
    // Recalculate ranks across players
    const playerList = Object.values(rawGame.players || {}) as LivePlayer[];
    const rankedPlayers = calculateRanks(playerList);
    rankedPlayers.forEach((p) => {
      updates[`games/${gameId}/players/${p.id}/rank`] = p.rank;
      updates[`games/${gameId}/players/${p.id}/previousRank`] = p.previousRank;
    });
  }

  await update(ref(database), updates);
  return true;
}

/**
 * Finalizes question results when time expires or host ends question early.
 * Preserves real participant answers, simulates only demo bots, and marks unanswered human players as incorrect (0 XP).
 */
export async function finalizeFirebaseQuestionResults(
  pin: string,
  correctAnswerIndex: number
): Promise<boolean> {
  const gameId = await getFirebaseGameIdByPin(pin);
  if (!gameId) return false;

  const gameSnap = await get(ref(database, `games/${gameId}`));
  if (!gameSnap.exists()) return false;

  const rawGame = gameSnap.val();
  const playersMap = rawGame.players || {};
  const updates: Record<string, any> = {};

  Object.values(playersMap).forEach((p: any) => {
    if (p.isHost) return;

    if (p.selectedAnswerIndex !== undefined && p.selectedAnswerIndex !== null) {
      // Player already submitted their real answer. Keep their real results!
      return;
    }

    if (typeof p.id === "string" && p.id.startsWith("demo-")) {
      // DEMO BOT: simulate a bot choice if un-answered
      const isCorrect = Math.random() < 0.7;
      const chosen = isCorrect
        ? correctAnswerIndex
        : (correctAnswerIndex + 1) % 4;
      const timeRemaining = Math.floor(Math.random() * 10) + 3;

      let score = p.score || 0;
      let streak = p.currentStreak || 0;
      let bestStreak = p.bestStreak || 0;
      let xp = 0;

      if (isCorrect) {
        xp = 100 + timeRemaining * 8 + streak * 10;
        score += xp;
        streak += 1;
        if (streak > bestStreak) bestStreak = streak;
      } else {
        streak = 0;
      }

      updates[`games/${gameId}/players/${p.id}/selectedAnswerIndex`] = chosen;
      updates[`games/${gameId}/players/${p.id}/isCorrect`] = isCorrect;
      updates[`games/${gameId}/players/${p.id}/xpEarnedLastQuestion`] = xp;
      updates[`games/${gameId}/players/${p.id}/score`] = score;
      updates[`games/${gameId}/players/${p.id}/currentStreak`] = streak;
      updates[`games/${gameId}/players/${p.id}/bestStreak`] = bestStreak;
    } else {
      // REAL HUMAN PARTICIPANT who did not submit an answer in time:
      // Mark unanswered / incorrect (0 XP earned, reset streak, keep score unchanged)
      updates[`games/${gameId}/players/${p.id}/selectedAnswerIndex`] = -1; // -1 indicates unanswered timeout
      updates[`games/${gameId}/players/${p.id}/isCorrect`] = false;
      updates[`games/${gameId}/players/${p.id}/xpEarnedLastQuestion`] = 0;
      updates[`games/${gameId}/players/${p.id}/currentStreak`] = 0;
    }
  });

  // Advance status to results
  updates[`games/${gameId}/status`] = "results";
  updates[`gamesByPin/${pin}/status`] = "results";

  // Recalculate ranks across players
  const playerList = Object.values(playersMap) as LivePlayer[];
  const rankedPlayers = calculateRanks(playerList);
  rankedPlayers.forEach((p) => {
    updates[`games/${gameId}/players/${p.id}/rank`] = p.rank;
    updates[`games/${gameId}/players/${p.id}/previousRank`] = p.previousRank;
  });

  await update(ref(database), updates);
  return true;
}

/**
 * 7. Realtime Listener Subscription for Firebase Game updates
 */
export function subscribeToFirebaseLiveGame(
  pin: string,
  callback: (game: LiveGame) => void
): () => void {
  let unsubscribed = false;
  let activeGameRef: any = null;
  let listenerHandle: any = null;

  getFirebaseGameIdByPin(pin).then((gameId) => {
    if (unsubscribed || !gameId) return;

    activeGameRef = ref(database, `games/${gameId}`);

    listenerHandle = onValue(activeGameRef, (snapshot) => {
      if (unsubscribed || !snapshot.exists()) return;
      const raw = snapshot.val();

      const playersMap = raw.players || {};
      const playerList = calculateRanks(Object.values(playersMap) as LivePlayer[]);

      // Compute client-side remaining time based on server timestamps
      let timeRemaining = raw.timeRemaining || 15;
      if (raw.status === "question" && raw.questionEndsAt) {
        const remainingMs = raw.questionEndsAt - Date.now();
        timeRemaining = Math.max(0, Math.ceil(remainingMs / 1000));
      }

      const game: LiveGame = {
        gameId: raw.gameId || gameId,
        pin: raw.pin || pin,
        hostId: raw.hostId || "host-user",
        quizId: raw.quizId || "hallo",
        status: raw.status || "lobby",
        currentQuestionIndex: raw.currentQuestionIndex || 0,
        totalQuestions: raw.totalQuestions || 8,
        timeRemaining,
        questionStartTime: raw.questionStartedAt,
        players: playerList,
        createdAt: raw.createdAt || Date.now(),
      };

      callback(game);
    });
  });

  return () => {
    unsubscribed = true;
    if (activeGameRef && listenerHandle) {
      off(activeGameRef, "value", listenerHandle);
    }
  };
}
