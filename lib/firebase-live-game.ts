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
 * After writing answer to Firebase, check if all active players have answered
 * and auto-advance the question if so.
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
  if (typeof player.selectedAnswerIndex === "number") return true; // Already submitted

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

  // BUG FIX: After writing answer, check if ALL active players have answered.
  // Re-read fresh game state from Firebase — do NOT use stale local state.
  await checkAndAutoAdvanceQuestionIfAllAnswered(pin);

  return true;
}

/**
 * 6. Advance Game State (used internally, or for simple lobby->question transitions).
 * For question->results transitions, use finishCurrentFirebaseQuestion() instead.
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
  const updates: Record<string, unknown> = {
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

    // Reset choices for next question (only for active, non-submitted players)
    const playersMap = rawGame.players || {};
    Object.keys(playersMap).forEach((pId) => {
      const p = playersMap[pId];
      if (!p.hasSubmitted) {
        updates[`games/${gameId}/players/${pId}/selectedAnswerIndex`] = null;
        updates[`games/${gameId}/players/${pId}/isCorrect`] = null;
        updates[`games/${gameId}/players/${pId}/answerTimeSeconds`] = null;
        updates[`games/${gameId}/players/${pId}/xpEarnedLastQuestion`] = null;
      }
    });
  } else if (
    nextStatus === "results" ||
    nextStatus === "leaderboard" ||
    nextStatus === "finished" ||
    nextStatus === "terminated"
  ) {
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
 * Auto-advance helper: checks if all active players have answered the current question.
 * If so, finalizes the question immediately without waiting for the timer.
 * Always re-reads fresh game state from Firebase.
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

  // Active players: non-host contestants who haven't submitted the entire quiz early
  const activePlayers = playerList.filter((p) => !p.isHost && !p.hasSubmitted);

  if (activePlayers.length === 0) return false;

  const allAnswered = activePlayers.every(
    (p) => typeof p.selectedAnswerIndex === "number"
  );

  if (!allAnswered) return false;

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
 * Player Submits Quiz Early
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

  // Check if all remaining active players have answered
  await checkAndAutoAdvanceQuestionIfAllAnswered(pin);
  return true;
}

/**
 * Host Terminates Live Quiz
 * Atomically writes terminated status + final ranks.
 * Firebase onValue listener drives UI update — no local state mutation needed.
 */
export async function terminateFirebaseLiveGame(pin: string): Promise<boolean> {
  const gameId = await getFirebaseGameIdByPin(pin);
  if (!gameId) return false;

  const gameSnap = await get(ref(database, `games/${gameId}`));
  if (!gameSnap.exists()) return false;

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
  return true;
}

/**
 * Finalizes the current question.
 * This is the SINGLE authoritative function for transitioning question -> results.
 *
 * It:
 * 1. Re-reads the latest game from Firebase (not stale React state).
 * 2. Guards with status === "question" (idempotent — only the first caller wins).
 * 3. Preserves real submitted answers.
 * 4. Simulates demo bot answers.
 * 5. Marks unanswered human players as timed out.
 * 6. Recalculates ranks.
 * 7. Atomically writes status = "results" + all player updates to Firebase.
 *
 * Does NOT touch localStorage. Firebase onValue drives all UI updates.
 */
export async function finishCurrentFirebaseQuestion(
  pin: string,
  correctAnswerIndex: number
): Promise<boolean> {
  const gameId = await getFirebaseGameIdByPin(pin);
  if (!gameId) return false;

  const gameSnap = await get(ref(database, `games/${gameId}`));
  if (!gameSnap.exists()) return false;

  const rawGame = gameSnap.val();

  // IDEMPOTENT GUARD: Only transition if currently in "question" state.
  // This prevents double-fires from timer + auto-advance + host button.
  if (rawGame.status !== "question") return false;

  const playersMap = rawGame.players || {};
  const updates: Record<string, unknown> = {};

  Object.values(playersMap).forEach((p: unknown) => {
    const player = p as LivePlayer & { id: string };
    if (player.isHost) return;

    if (
      player.selectedAnswerIndex !== undefined &&
      player.selectedAnswerIndex !== null
    ) {
      // Real submitted answer — keep exact result, do not overwrite
      return;
    }

    if (typeof player.id === "string" && player.id.startsWith("demo-")) {
      // DEMO BOT: simulate a bot choice if unanswered
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
      // Real human participant who did not answer in time:
      // -1 = timed out / unanswered; streak reset; score unchanged
      updates[`games/${gameId}/players/${player.id}/selectedAnswerIndex`] = -1;
      updates[`games/${gameId}/players/${player.id}/isCorrect`] = false;
      updates[`games/${gameId}/players/${player.id}/xpEarnedLastQuestion`] = 0;
      updates[`games/${gameId}/players/${player.id}/currentStreak`] = 0;
    }
  });

  // Recalculate ranks based on current scores (before committing the update)
  const playerList = Object.values(playersMap) as LivePlayer[];
  const rankedPlayers = calculateRanks(playerList);
  rankedPlayers.forEach((p) => {
    updates[`games/${gameId}/players/${p.id}/rank`] = p.rank;
    updates[`games/${gameId}/players/${p.id}/previousRank`] = p.previousRank;
  });

  // Atomically set status = "results"
  updates[`games/${gameId}/status`] = "results";
  updates[`gamesByPin/${pin}/status`] = "results";

  await update(ref(database), updates);

  // Kick off the automatic post-question flow (results -> leaderboard -> next/finished)
  // Run this without awaiting so it doesn't block the caller.
  advanceAfterQuestion(pin).catch((err) =>
    console.error("advanceAfterQuestion error:", err)
  );

  return true;
}

/**
 * HOST TRANSITION CONTROLLER
 *
 * After a question is finalized (status = "results"), this function drives the
 * authoritative state machine:
 *
 *   results  --[2s]--> leaderboard --[2s]--> question(+1) OR finished
 *
 * This is the SINGLE source of automatic transitions. React effects in the UI
 * must NOT independently advance these states.
 *
 * Does NOT touch localStorage. Firebase onValue drives all UI updates.
 */
export async function advanceAfterQuestion(pin: string): Promise<void> {
  const gameId = await getFirebaseGameIdByPin(pin);
  if (!gameId) return;

  // Step 1: Wait 2 seconds on "results"
  await sleep(2000);

  // Step 2: Re-read Firebase — bail if game was terminated/finished by host
  let snap = await get(ref(database, `games/${gameId}`));
  if (!snap.exists()) return;
  let rawGame = snap.val();
  if (rawGame.status !== "results") return; // Host may have terminated

  // Step 3: Advance to leaderboard
  {
    const rankUpdates: Record<string, unknown> = {
      [`games/${gameId}/status`]: "leaderboard",
      [`gamesByPin/${pin}/status`]: "leaderboard",
    };
    const playerList = Object.values(rawGame.players || {}) as LivePlayer[];
    const rankedPlayers = calculateRanks(playerList);
    rankedPlayers.forEach((p) => {
      rankUpdates[`games/${gameId}/players/${p.id}/rank`] = p.rank;
      rankUpdates[`games/${gameId}/players/${p.id}/previousRank`] = p.previousRank;
    });
    await update(ref(database), rankUpdates);
  }

  // Step 4: Wait 2 seconds on "leaderboard"
  await sleep(2000);

  // Step 5: Re-read Firebase — bail if terminated/finished
  snap = await get(ref(database, `games/${gameId}`));
  if (!snap.exists()) return;
  rawGame = snap.val();
  if (rawGame.status !== "leaderboard") return; // Host may have terminated

  // Step 6: Determine if this was the last question
  const quizId = rawGame.quizId || "hallo";
  const { getQuestionsForQuiz } = await import("./quiz-questions-data");
  const questions = getQuestionsForQuiz(quizId);
  const currentIdx = rawGame.currentQuestionIndex || 0;
  const isLastQuestion = currentIdx >= questions.length - 1;

  if (isLastQuestion) {
    // Game Over — show final podium
    const finalUpdates: Record<string, unknown> = {
      [`games/${gameId}/status`]: "finished",
      [`gamesByPin/${pin}/status`]: "finished",
    };
    await update(ref(database), finalUpdates);
  } else {
    // Advance to next question
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

    // Reset per-question answer fields for active (non-submitted) players only
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
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 7. Realtime Listener Subscription for Firebase Game updates
 * Uses the unsubscribe function returned by onValue() — NOT off().
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

    // onValue() returns an unsubscribe function — store and call it on cleanup
    unsubscribeListener = onValue(
      activeGameRef,
      (snapshot) => {
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
