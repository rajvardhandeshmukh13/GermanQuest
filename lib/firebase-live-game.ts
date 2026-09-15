import {
  ref,
  set,
  get,
  update,
  onValue,
  child,
  runTransaction,
} from "firebase/database";
import { database } from "./firebase";
import { getQuizById, QUIZZES } from "./quiz-data";
import { getQuestionsForQuiz } from "./quiz-questions-data";
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
  } catch (err: any) {
    console.error("[LIVE] FIREBASE ERROR", {
      operation: "getFirebaseGameIdByPin",
      pin,
      error: err?.message || err,
    });
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

  // Check for auto-advance using fresh Firebase data
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
  const answeredPlayers = activePlayers.filter(
    (p) => typeof p.selectedAnswerIndex === "number" && p.selectedAnswerIndex >= 0
  );

  console.log("[LIVE] AUTO ADVANCE CHECK", {
    pin,
    activePlayersCount: activePlayers.length,
    answeredPlayersCount: answeredPlayers.length,
  });

  if (activePlayers.length === 0) return false;

  const allAnswered = activePlayers.every(
    (p) => typeof p.selectedAnswerIndex === "number" && p.selectedAnswerIndex >= 0
  );

  if (!allAnswered) return false;

  console.log("[LIVE] All active players answered, triggering finishCurrentFirebaseQuestion");
  const quizId = rawGame.quizId || "hallo";
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
  console.log("[LIVE] SUBMIT QUIZ EARLY START", { pin, playerId });
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
 * Atomic transaction transition to "terminated".
 * Completely independent of question advancement.
 */
export async function terminateFirebaseLiveGame(pin: string): Promise<boolean> {
  console.log("[LIVE] TERMINATE START", { pin });
  const gameId = await getFirebaseGameIdByPin(pin);
  if (!gameId) {
    const err = new Error(`Game ID not found for pin ${pin}`);
    console.error("[LIVE] FIREBASE ERROR", {
      operation: "terminateFirebaseLiveGame",
      pin,
      error: err.message,
    });
    return false;
  }

  const gameRef = ref(database, `games/${gameId}`);

  try {
    const result = await runTransaction(gameRef, (currentData) => {
      if (!currentData) return currentData;

      if (currentData.status === "finished" || currentData.status === "terminated") {
        return undefined; // Already finished or terminated
      }

      const playerList = Object.values(currentData.players || {}) as LivePlayer[];
      const rankedPlayers = calculateRanks(playerList);
      const updatedPlayersMap: Record<string, LivePlayer> = {};
      rankedPlayers.forEach((p) => {
        updatedPlayersMap[p.id] = p;
      });
      currentData.players = updatedPlayersMap;

      currentData.status = "terminated";
      return currentData;
    });

    if (result.committed) {
      console.log("[LIVE] TERMINATE SUCCESS");
      await set(ref(database, `gamesByPin/${pin}/status`), "terminated");
      return true;
    } else {
      console.log("[LIVE] Terminate skipped (already finished or terminated)");
      return false;
    }
  } catch (error: any) {
    console.error("[LIVE] FIREBASE ERROR", {
      operation: "terminateFirebaseLiveGame",
      pin,
      gameId,
      error: error?.message || error,
    });
    return false;
  }
}

/**
 * A. QUESTION → RESULTS
 * Exactly ONE function responsible for finalizing the current question.
 *
 * Uses ATOMIC Firebase runTransaction compare-and-set:
 * - Only ONE caller wins the race condition (question -> results)
 * - Idempotent: returns true if game is already no longer in "question" state.
 * - Updates scores, streaks, bot answers, unanswered human timeouts, and player ranks atomically.
 */
export async function finishCurrentFirebaseQuestion(
  pin: string,
  forceCorrectAnswerIndex?: number
): Promise<boolean> {
  console.log("[LIVE] FINISH QUESTION START", { pin });

  const gameId = await getFirebaseGameIdByPin(pin);
  if (!gameId) {
    const err = new Error(`Game ID not found for pin ${pin}`);
    console.error("[LIVE] FIREBASE ERROR", {
      operation: "finishCurrentFirebaseQuestion",
      pin,
      error: err.message,
    });
    throw err;
  }

  const gameRef = ref(database, `games/${gameId}`);

  try {
    let wasAlreadyFinalized = false;

    const result = await runTransaction(gameRef, (currentData) => {
      if (!currentData) {
        return currentData;
      }

      console.log("[LIVE] GAME STATE inside transaction", {
        gameId,
        pin,
        status: currentData.status,
        currentQuestionIndex: currentData.currentQuestionIndex,
      });

      // IDEMPOTENT GUARD: Only transition if currently in "question" status
      if (currentData.status !== "question") {
        wasAlreadyFinalized = true;
        return undefined; // Abort transaction
      }

      let correctAnswerIndex = 0;
      if (typeof forceCorrectAnswerIndex === "number") {
        correctAnswerIndex = forceCorrectAnswerIndex;
      } else {
        const quizId = currentData.quizId || "hallo";
        const questions = getQuestionsForQuiz(quizId);
        const currentIdx = currentData.currentQuestionIndex || 0;
        const currentQuestion = questions[currentIdx % questions.length];
        correctAnswerIndex = currentQuestion
          ? Math.max(0, currentQuestion.options.indexOf(currentQuestion.correctAnswer))
          : 0;
      }

      const playersMap = currentData.players || {};

      Object.keys(playersMap).forEach((pId) => {
        const player = playersMap[pId] as LivePlayer;
        if (player.isHost) return;

        if (
          player.selectedAnswerIndex !== undefined &&
          player.selectedAnswerIndex !== null &&
          player.selectedAnswerIndex >= 0
        ) {
          // Real submitted answer — keep exact result
          return;
        }

        if (pId.startsWith("demo-")) {
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

          player.selectedAnswerIndex = chosen;
          player.isCorrect = isCorrect;
          player.xpEarnedLastQuestion = xp;
          player.score = score;
          player.currentStreak = streak;
          player.bestStreak = bestStreak;
        } else {
          // Real human participant unanswered: timed out (-1)
          player.selectedAnswerIndex = -1;
          player.isCorrect = false;
          player.xpEarnedLastQuestion = 0;
          player.currentStreak = 0;
        }
      });

      // Recalculate ranks based on current scores
      const playerList = Object.values(playersMap) as LivePlayer[];
      const rankedPlayers = calculateRanks(playerList);

      const updatedPlayersMap: Record<string, LivePlayer> = {};
      rankedPlayers.forEach((p) => {
        updatedPlayersMap[p.id] = p;
      });
      currentData.players = updatedPlayersMap;

      currentData.status = "results";

      return currentData;
    });

    if (wasAlreadyFinalized) {
      console.log("[LIVE] Question was already finalized (idempotent exit)");
      return true;
    }

    if (result.committed) {
      console.log("[LIVE] FINISH QUESTION SUCCESS");
      await set(ref(database, `gamesByPin/${pin}/status`), "results");
      return true;
    } else {
      console.log("[LIVE] Transaction not committed (another client finalized first)");
      return false;
    }
  } catch (error: any) {
    console.error("[LIVE] FIREBASE ERROR", {
      operation: "finishCurrentFirebaseQuestion",
      pin,
      gameId,
      error: error?.message || error,
    });
    throw error;
  }
}

/**
 * B. RESULTS → LEADERBOARD → NEXT QUESTION / FINISHED
 * advanceAfterQuestion(pin)
 *
 * Uses ATOMIC Firebase runTransaction compare-and-set:
 * - Step 1: atomic transition from "results" -> "leaderboard"
 * - Waits ~2500ms
 * - Step 2: atomic transition from "leaderboard" -> "question" (+1 index) OR "finished"
 */
export async function advanceAfterQuestion(pin: string): Promise<boolean> {
  console.log("[LIVE] ADVANCE RESULTS -> LEADERBOARD START", { pin });
  const gameId = await getFirebaseGameIdByPin(pin);
  if (!gameId) return false;

  const gameRef = ref(database, `games/${gameId}`);

  try {
    // STEP 1: Transition results -> leaderboard
    const step1Result = await runTransaction(gameRef, (currentData) => {
      if (!currentData || currentData.status !== "results") {
        return undefined; // Abort if not in results state
      }

      currentData.status = "leaderboard";
      const playerList = Object.values(currentData.players || {}) as LivePlayer[];
      const rankedPlayers = calculateRanks(playerList);
      const updatedPlayersMap: Record<string, LivePlayer> = {};
      rankedPlayers.forEach((p) => {
        updatedPlayersMap[p.id] = p;
      });
      currentData.players = updatedPlayersMap;

      return currentData;
    });

    if (!step1Result.committed) {
      console.log("[LIVE] advanceAfterQuestion: results -> leaderboard transaction skipped (not in results state)");
      return false;
    }

    console.log("[LIVE] ADVANCE RESULTS -> LEADERBOARD SUCCESS");
    await set(ref(database, `gamesByPin/${pin}/status`), "leaderboard");

    // STEP 2: Wait ~2500ms on leaderboard
    await sleep(2500);

    // STEP 3: Transition leaderboard -> question OR leaderboard -> finished
    console.log("[LIVE] ADVANCE LEADERBOARD -> NEXT/FINISHED START", { pin });

    let isFinished = false;

    const step2Result = await runTransaction(gameRef, (currentData) => {
      if (!currentData || currentData.status !== "leaderboard") {
        return undefined; // Abort if host terminated or state changed
      }

      const quizId = currentData.quizId || "hallo";
      const questions = getQuestionsForQuiz(quizId);
      const currentIdx = currentData.currentQuestionIndex || 0;
      const isLast = currentIdx >= questions.length - 1;

      if (isLast) {
        currentData.status = "finished";
        isFinished = true;
      } else {
        const nextIdx = currentIdx + 1;
        const now = Date.now();
        const endsAt = now + 15000;

        currentData.status = "question";
        currentData.currentQuestionIndex = nextIdx;
        currentData.timeRemaining = 15;
        currentData.questionStartedAt = now;
        currentData.questionEndsAt = endsAt;

        // Reset per-question answer fields for active (non-submitted) players
        const playersMap = currentData.players || {};
        Object.keys(playersMap).forEach((pId) => {
          const p = playersMap[pId] as LivePlayer;
          if (!p.hasSubmitted) {
            p.selectedAnswerIndex = undefined;
            p.isCorrect = undefined;
            p.answerTimeSeconds = undefined;
            p.xpEarnedLastQuestion = undefined;
          }
        });
      }

      return currentData;
    });

    if (!step2Result.committed) {
      console.log("[LIVE] advanceAfterQuestion: leaderboard -> next transaction skipped");
      return false;
    }

    const finalStatus = isFinished ? "finished" : "question";
    await set(ref(database, `gamesByPin/${pin}/status`), finalStatus);

    if (isFinished) {
      console.log("[LIVE] ADVANCE LEADERBOARD -> FINISHED SUCCESS");
    } else {
      console.log("[LIVE] ADVANCE LEADERBOARD -> QUESTION SUCCESS");
    }

    return true;
  } catch (error: any) {
    console.error("[LIVE] FIREBASE ERROR", {
      operation: "advanceAfterQuestion",
      pin,
      gameId,
      error: error?.message || error,
    });
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


