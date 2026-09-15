import {
  ref,
  set,
  get,
  update,
  onValue,
  child,
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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
  } catch (err) {
    console.error("[LIVE] Firebase transition failed", err);
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

    await set(ref(database, `games/${gameId}/players/${playerId}`), player);
  }

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

  const updates: Record<string, unknown> = {
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
 * Writes the player's answer and checks for auto-advance.
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
  if (typeof player.selectedAnswerIndex === "number" && player.selectedAnswerIndex >= 0) {
    return true; // Already submitted
  }

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

  const updates: Record<string, unknown> = {
    [`games/${gameId}/players/${playerId}/selectedAnswerIndex`]: answerIndex,
    [`games/${gameId}/players/${playerId}/answerTimeSeconds`]: answerTime,
    [`games/${gameId}/players/${playerId}/isCorrect`]: isCorrect,
    [`games/${gameId}/players/${playerId}/xpEarnedLastQuestion`]: xpEarned,
    [`games/${gameId}/players/${playerId}/score`]: updatedScore,
    [`games/${gameId}/players/${playerId}/currentStreak`]: updatedStreak,
    [`games/${gameId}/players/${playerId}/bestStreak`]: updatedBestStreak,
  };

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

  // Auto-advance check using fresh Firebase data
  await checkAndAutoAdvanceQuestionIfAllAnswered(pin);

  return true;
}

/**
 * 6. Auto-advance check: checks if all active players have answered the current question.
 * If so, finalizes the question immediately.
 * Re-reads fresh game state from Firebase. Idempotent check on status === "question".
 */
export async function checkAndAutoAdvanceQuestionIfAllAnswered(
  pin: string
): Promise<boolean> {
  const gameId = await getFirebaseGameIdByPin(pin);
  if (!gameId) return false;

  const snap = await get(ref(database, `games/${gameId}`));
  if (!snap.exists()) return false;
  const rawGame = snap.val();

  if (rawGame.status !== "question") return false;

  const playersMap = rawGame.players || {};
  const playerList = Object.values(playersMap) as LivePlayer[];

  const activePlayers = playerList.filter((p) => !p.isHost && !p.hasSubmitted);
  if (activePlayers.length === 0) return false;

  const allAnswered = activePlayers.every(
    (p) => typeof p.selectedAnswerIndex === "number" && p.selectedAnswerIndex >= 0
  );

  if (!allAnswered) return false;

  console.log("[LIVE] All active players answered, auto-advancing question");
  const quizId = rawGame.quizId || "hallo";
  const { getQuestionsForQuiz } = await import("./quiz-questions-data");
  const questions = getQuestionsForQuiz(quizId);
  const currentIdx = rawGame.currentQuestionIndex || 0;
  const currentQuestion = questions[currentIdx % questions.length];
  const correctAnswerIndex = currentQuestion
    ? Math.max(0, currentQuestion.options.indexOf(currentQuestion.correctAnswer))
    : 0;

  return await finishCurrentFirebaseQuestion(pin, correctAnswerIndex);
}

/**
 * 7. Player Submits Quiz Early
 */
export async function submitPlayerQuizEarlyInFirebase(
  pin: string,
  playerId: string
): Promise<boolean> {
  const gameId = await getFirebaseGameIdByPin(pin);
  if (!gameId) return false;

  const playerRef = ref(database, `games/${gameId}/players/${playerId}`);
  const snap = await get(playerRef);
  if (!snap.exists()) return false;

  const updates: Record<string, unknown> = {
    [`games/${gameId}/players/${playerId}/hasSubmitted`]: true,
  };

  await update(ref(database), updates);

  await checkAndAutoAdvanceQuestionIfAllAnswered(pin);
  return true;
}

/**
 * 8. Host Terminates Live Quiz
 * Completely independent of question advancement.
 * Calculates final ranks and updates status = "terminated".
 */
export async function terminateFirebaseLiveGame(pin: string): Promise<boolean> {
  console.log("[LIVE] terminateFirebaseLiveGame START", { pin });
  const gameId = await getFirebaseGameIdByPin(pin);
  if (!gameId) {
    console.error("[LIVE] Firebase transition failed: Game ID not found for pin", pin);
    return false;
  }

  try {
    const gameSnap = await get(ref(database, `games/${gameId}`));
    if (!gameSnap.exists()) {
      console.error("[LIVE] Firebase transition failed: Game not found", gameId);
      return false;
    }

    const rawGame = gameSnap.val();
    const playerList = Object.values(rawGame.players || {}) as LivePlayer[];
    const rankedPlayers = calculateRanks(playerList);

    const updates: Record<string, unknown> = {
      [`games/${gameId}/status`]: "terminated",
      [`gamesByPin/${pin}/status`]: "terminated",
    };

    rankedPlayers.forEach((p) => {
      updates[`games/${gameId}/players/${p.id}/rank`] = p.rank;
      updates[`games/${gameId}/players/${p.id}/previousRank`] = p.previousRank;
    });

    await update(ref(database), updates);
    console.log("[LIVE] Game terminated successfully");
    return true;
  } catch (error) {
    console.error("[LIVE] Firebase transition failed", error);
    return false;
  }
}

/**
 * A. QUESTION → RESULTS
 * Exactly ONE function responsible for finalizing the current question:
 * finishCurrentFirebaseQuestion(pin, forceCorrectAnswerIndex?)
 *
 * It must:
 * - get gameId from gamesByPin/{pin}
 * - read games/{gameId}
 * - return false if game doesn't exist
 * - return true immediately if status is no longer "question" (idempotent)
 * - determine current question & calculate correct answer index
 * - finalize demo-player answers & unanswered human players
 * - calculate/update player scores, streaks and ranks
 * - write: games/{gameId}/status = "results", gamesByPin/{pin}/status = "results", player ranks
 * - NOT recursively call itself
 * - NOT wait for another Firebase listener
 * - NOT depend on React state
 * - resolve/reject normally and quickly
 */
export async function finishCurrentFirebaseQuestion(
  pin: string,
  forceCorrectAnswerIndex?: number
): Promise<boolean> {
  console.log("[LIVE] finish question START", { pin });

  const gameId = await getFirebaseGameIdByPin(pin);
  if (!gameId) {
    console.error("[LIVE] Firebase transition failed: Game ID not found for pin", pin);
    return false;
  }

  try {
    const gameSnap = await get(ref(database, `games/${gameId}`));
    if (!gameSnap.exists()) {
      console.error("[LIVE] Firebase transition failed: Game not found", gameId);
      return false;
    }

    const rawGame = gameSnap.val();
    console.log("[LIVE] current Firebase status", rawGame.status);

    // IDEMPOTENT GUARD: If status is not "question", return true immediately
    if (rawGame.status !== "question") {
      console.log("[LIVE] Question already finalized or status is not question:", rawGame.status);
      return true;
    }

    let correctAnswerIndex = 0;
    if (typeof forceCorrectAnswerIndex === "number") {
      correctAnswerIndex = forceCorrectAnswerIndex;
    } else {
      const quizId = rawGame.quizId || "hallo";
      const { getQuestionsForQuiz } = await import("./quiz-questions-data");
      const questions = getQuestionsForQuiz(quizId);
      const currentIdx = rawGame.currentQuestionIndex || 0;
      const currentQuestion = questions[currentIdx % questions.length];
      correctAnswerIndex = currentQuestion
        ? Math.max(0, currentQuestion.options.indexOf(currentQuestion.correctAnswer))
        : 0;
    }

    const playersMap = rawGame.players || {};
    const updates: Record<string, unknown> = {};

    Object.values(playersMap).forEach((p: unknown) => {
      const player = p as LivePlayer & { id: string };
      if (player.isHost) return;

      if (
        player.selectedAnswerIndex !== undefined &&
        player.selectedAnswerIndex !== null &&
        player.selectedAnswerIndex >= 0
      ) {
        // Real submitted answer — keep exact result
        return;
      }

      if (typeof player.id === "string" && player.id.startsWith("demo-")) {
        // DEMO BOT: simulate answer if unanswered
        const isCorrect = Math.random() < 0.7;
        const chosen = isCorrect
          ? correctAnswerIndex
          : (correctAnswerIndex + 1) % 4;
        const timeRemaining = Math.floor(Math.random() * 10) + 3;

        let score = player.score || 0;
        let streak = player.currentStreak || 0;
        let bestStreak = player.bestStreak || 0;
        let xp = 0;

        if (isCorrect) {
          xp = 100 + timeRemaining * 8 + streak * 10;
          score += xp;
          streak += 1;
          if (streak > bestStreak) bestStreak = streak;
        } else {
          streak = 0;
        }

        updates[`games/${gameId}/players/${player.id}/selectedAnswerIndex`] = chosen;
        updates[`games/${gameId}/players/${player.id}/isCorrect`] = isCorrect;
        updates[`games/${gameId}/players/${player.id}/xpEarnedLastQuestion`] = xp;
        updates[`games/${gameId}/players/${player.id}/score`] = score;
        updates[`games/${gameId}/players/${player.id}/currentStreak`] = streak;
        updates[`games/${gameId}/players/${player.id}/bestStreak`] = bestStreak;
      } else {
        // Real human participant unanswered: timed out
        updates[`games/${gameId}/players/${player.id}/selectedAnswerIndex`] = -1;
        updates[`games/${gameId}/players/${player.id}/isCorrect`] = false;
        updates[`games/${gameId}/players/${player.id}/xpEarnedLastQuestion`] = 0;
        updates[`games/${gameId}/players/${player.id}/currentStreak`] = 0;
      }
    });

    // Recalculate ranks
    const playerList = Object.values(playersMap) as LivePlayer[];
    const rankedPlayers = calculateRanks(playerList);
    rankedPlayers.forEach((p) => {
      updates[`games/${gameId}/players/${p.id}/rank`] = p.rank;
      updates[`games/${gameId}/players/${p.id}/previousRank`] = p.previousRank;
    });

    console.log("[LIVE] writing RESULTS");
    updates[`games/${gameId}/status`] = "results";
    updates[`gamesByPin/${pin}/status`] = "results";

    await update(ref(database), updates);
    console.log("[LIVE] RESULTS written");

    return true;
  } catch (error) {
    console.error("[LIVE] Firebase transition failed", error);
    throw error;
  }
}

/**
 * B. RESULTS → LEADERBOARD → NEXT QUESTION
 * advanceAfterQuestion(pin)
 *
 * Behavior:
 * - read current Firebase game
 * - if status !== "results", return false
 * - update status to "leaderboard"
 * - wait approximately 2500ms
 * - re-read Firebase
 * - if current question is last question: status = "finished", return true
 * - otherwise: increment currentQuestionIndex by 1, reset player fields, set status = "question"
 */
export async function advanceAfterQuestion(pin: string): Promise<boolean> {
  const gameId = await getFirebaseGameIdByPin(pin);
  if (!gameId) return false;

  try {
    let snap = await get(ref(database, `games/${gameId}`));
    if (!snap.exists()) return false;
    let rawGame = snap.val();

    if (rawGame.status !== "results") {
      console.log("[LIVE] advanceAfterQuestion skipped: status is not results:", rawGame.status);
      return false;
    }

    console.log("[LIVE] advancing to leaderboard");
    const playerList = Object.values(rawGame.players || {}) as LivePlayer[];
    const rankedPlayers = calculateRanks(playerList);
    const leadUpdates: Record<string, unknown> = {
      [`games/${gameId}/status`]: "leaderboard",
      [`gamesByPin/${pin}/status`]: "leaderboard",
    };
    rankedPlayers.forEach((p) => {
      leadUpdates[`games/${gameId}/players/${p.id}/rank`] = p.rank;
      leadUpdates[`games/${gameId}/players/${p.id}/previousRank`] = p.previousRank;
    });

    await update(ref(database), leadUpdates);

    // Wait ~2500ms on leaderboard
    await sleep(2500);

    // Re-read Firebase state
    snap = await get(ref(database, `games/${gameId}`));
    if (!snap.exists()) return false;
    rawGame = snap.val();

    if (rawGame.status !== "leaderboard") {
      console.log("[LIVE] advanceAfterQuestion skipped: status is no longer leaderboard:", rawGame.status);
      return false;
    }

    const quizId = rawGame.quizId || "hallo";
    const { getQuestionsForQuiz } = await import("./quiz-questions-data");
    const questions = getQuestionsForQuiz(quizId);
    const currentIdx = rawGame.currentQuestionIndex || 0;
    const isLastQuestion = currentIdx >= questions.length - 1;

    if (isLastQuestion) {
      console.log("[LIVE] advancing to finished");
      await update(ref(database), {
        [`games/${gameId}/status`]: "finished",
        [`gamesByPin/${pin}/status`]: "finished",
      });
      return true;
    } else {
      console.log("[LIVE] advancing to next question");
      const nextIdx = currentIdx + 1;
      const now = Date.now();
      const endsAt = now + 15000;
      const playersMap = rawGame.players || {};

      const nextQUpdates: Record<string, unknown> = {
        [`games/${gameId}/status`]: "question",
        [`gamesByPin/${pin}/status`]: "question",
        [`games/${gameId}/currentQuestionIndex`]: nextIdx,
        [`games/${gameId}/timeRemaining`]: 15,
        [`games/${gameId}/questionStartedAt`]: now,
        [`games/${gameId}/questionEndsAt`]: endsAt,
      };

      Object.keys(playersMap).forEach((pId) => {
        const p = playersMap[pId] as LivePlayer;
        if (!p.hasSubmitted) {
          nextQUpdates[`games/${gameId}/players/${pId}/selectedAnswerIndex`] = null;
          nextQUpdates[`games/${gameId}/players/${pId}/isCorrect`] = null;
          nextQUpdates[`games/${gameId}/players/${pId}/answerTimeSeconds`] = null;
          nextQUpdates[`games/${gameId}/players/${pId}/xpEarnedLastQuestion`] = null;
        }
      });

      await update(ref(database), nextQUpdates);
      return true;
    }
  } catch (error) {
    console.error("[LIVE] Firebase transition failed", error);
    return false;
  }
}

/**
 * 9. Realtime Listener Subscription for Firebase Game updates
 */
export function subscribeToFirebaseLiveGame(
  pin: string,
  callback: (game: LiveGame) => void
): () => void {
  let unsubscribed = false;
  let unsubscribeListener: (() => void) | null = null;

  getFirebaseGameIdByPin(pin).then((gameId) => {
    if (unsubscribed || !gameId) return;

    const activeGameRef = ref(database, `games/${gameId}`);

    unsubscribeListener = onValue(
      activeGameRef,
      (snapshot) => {
        if (unsubscribed || !snapshot.exists()) return;
        const raw = snapshot.val();

        const playersMap = raw.players || {};
        const playerList = calculateRanks(Object.values(playersMap) as LivePlayer[]);

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
      },
      (error) => {
        console.error("Firebase live game listener error:", error);
      }
    );
  });

  return () => {
    unsubscribed = true;
    if (unsubscribeListener) {
      unsubscribeListener();
      unsubscribeListener = null;
    }
  };
}

