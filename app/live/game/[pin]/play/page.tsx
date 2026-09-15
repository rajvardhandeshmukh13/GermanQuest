"use client";

import * as React from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { NavBar, GQButton } from "@/components/germanquest";
import { Footer } from "@/components/landing";
import {
  getLiveGameByPin,
  subscribeToLiveGame,
  submitLiveAnswer,
  terminateLiveGame,
  submitPlayerQuizEarly,
  finishCurrentFirebaseQuestion,
  advanceAfterQuestion,
  type LiveGame,
} from "@/lib/live-game";
import { getQuizById, QUIZZES } from "@/lib/quiz-data";
import { getQuestionsForQuiz } from "@/lib/quiz-questions-data";
import { usePlayerStats } from "@/lib/player-stats";
import { LiveHeader } from "@/components/live/live-header";
import { LiveAnswerGrid } from "@/components/live/live-answer-grid";
import { LiveQuestionResults } from "@/components/live/live-question-results";
import { LiveLeaderboardView } from "@/components/live/live-leaderboard-view";
import { FinalPodiumView } from "@/components/live/final-podium-view";
import { Play, Square, LogOut, AlertTriangle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { fadeInUp } from "@/lib/motion";

function LiveGamePlayContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const pin = (params?.pin as string) || "";
  const role = (searchParams?.get("role") as "host" | "player") || "player";
  const playerId = searchParams?.get("playerId") || "";

  // ── All hooks declared unconditionally at the top (Rules of Hooks) ─────────
  const profile = usePlayerStats();
  const [game, setGame] = React.useState<LiveGame | null>(null);
  const [isMounted, setIsMounted] = React.useState(false);
  const [hasCheckedGame, setHasCheckedGame] = React.useState(false);
  const [optimisticAnswer, setOptimisticAnswer] = React.useState<number | null>(null);
  const [showTerminateConfirm, setShowTerminateConfirm] = React.useState(false);
  const [showSubmitEarlyConfirm, setShowSubmitEarlyConfirm] = React.useState(false);
  const [isTerminating, setIsTerminating] = React.useState(false);
  const [isEndingQuestion, setIsEndingQuestion] = React.useState(false);
  const [endingError, setEndingError] = React.useState<string | null>(null);
  const [terminateError, setTerminateError] = React.useState<string | null>(null);

  /**
   * Prevent double-firing of host transition triggers.
   * Reset whenever the Firebase status/question changes.
   */
  const transitionInProgressRef = React.useRef(false);
  const advancingResultsRef = React.useRef<string | null>(null);

  // ── Mount + Firebase subscription ─────────────────────────────────────────
  React.useEffect(() => {
    setIsMounted(true);
    if (!pin) {
      setHasCheckedGame(true);
      return;
    }

    const initial = getLiveGameByPin(pin);
    if (initial) {
      setGame(initial);
    }
    setHasCheckedGame(true);

    const unsubscribe = subscribeToLiveGame(pin, (updatedGame) => {
      setGame(updatedGame);
      setHasCheckedGame(true);
    });

    return () => unsubscribe();
  }, [pin]);

  // ── Reset transition lock when Firebase delivers a new status or question ──
  React.useEffect(() => {
    setOptimisticAnswer(null);
    transitionInProgressRef.current = false;
    setIsEndingQuestion(false);
  }, [game?.currentQuestionIndex, game?.status]);

  // ── Host-controlled automatic transition: RESULTS -> LEADERBOARD -> NEXT QUESTION / FINISHED ──
  React.useEffect(() => {
    if (role !== "host" || !game || game.status !== "results") return;

    const key = `${game.currentQuestionIndex}_results`;
    if (advancingResultsRef.current === key) return;
    advancingResultsRef.current = key;

    console.log("[LIVE] host detected RESULTS status, triggering advanceAfterQuestion", {
      pin,
      questionIndex: game.currentQuestionIndex,
    });

    advanceAfterQuestion(pin).catch((err) => {
      console.error("[LIVE] advanceAfterQuestion failed", err);
    });
  }, [role, game?.status, game?.currentQuestionIndex, pin]);

  // ── Host: timer reached zero ───────────────────────────────────────────────
  // Declared here (before any conditional return) to satisfy Rules of Hooks.
  // Uses optional chaining because game may be null on first render.
  const handleTimeUp = React.useCallback(async () => {
    if (role !== "host" || game?.status !== "question") return;
    if (transitionInProgressRef.current) return;
    transitionInProgressRef.current = true;

    try {
      const qs = getQuestionsForQuiz(game!.quizId);
      const q = qs[game!.currentQuestionIndex % qs.length];
      const correctIdx = q
        ? Math.max(0, q.options.indexOf(q.correctAnswer))
        : 0;

      console.log("[LIVE] Timer reached zero, calling finishCurrentFirebaseQuestion");
      const success = await finishCurrentFirebaseQuestion(pin, correctIdx);
      if (!success) {
        console.error("[LIVE] finishCurrentFirebaseQuestion returned false on timer expiry");
      }
    } catch (err) {
      console.error("[LIVE] Firebase transition failed", err);
    } finally {
      transitionInProgressRef.current = false;
    }
  }, [role, game?.status, game?.quizId, game?.currentQuestionIndex, pin]);

  // ── NavBar element (shared across all render branches) ────────────────────
  const navBarElement = (
    <NavBar
      links={[
        { label: "Explore", href: "/#journey" },
        { label: "Quizzes", href: "/quizzes" },
        { label: "Leaderboard", href: "/leaderboard" },
        { label: "About", href: "/#how-it-works" },
      ]}
    />
  );

  // ── 1. SSR / pre-hydration loading state ──────────────────────────────────
  if (!isMounted || (!hasCheckedGame && !game)) {
    return (
      <>
        {navBarElement}
        <main className="flex-1 bg-background py-16 flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-muted-foreground">
              Loading Live Game session...
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ── 2. Game not found ──────────────────────────────────────────────────────
  if (!game) {
    return (
      <>
        {navBarElement}
        <main className="flex-1 bg-background py-16 flex items-center justify-center min-h-[60vh] p-6">
          <div className="max-w-md w-full text-center space-y-4 rounded-3xl p-8 bg-card border-2 border-border shadow-md">
            <h2 className="font-display text-2xl font-black text-foreground">
              Game Not Found
            </h2>
            <p className="text-sm font-semibold text-muted-foreground">
              The requested live game session does not exist or has expired.
            </p>
            <GQButton variant="teal" onClick={() => router.push("/live")}>
              BACK TO LIVE HUB
            </GQButton>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ── Derived values (computed from authoritative Firebase game state) ────────
  const isHost = role === "host";
  const questions = getQuestionsForQuiz(game.quizId);
  const currentQuestion = questions[game.currentQuestionIndex % questions.length];
  const correctAnswerIndex = currentQuestion
    ? Math.max(0, currentQuestion.options.indexOf(currentQuestion.correctAnswer))
    : 0;

  const isLastQuestion = game.currentQuestionIndex >= questions.length - 1;
  const currentPlayer = game.players.find((p) => p.id === playerId);

  // Merge optimistic UI answer with authoritative server answer
  const serverAnswer = currentPlayer?.selectedAnswerIndex;
  const selectedAnswerIndex =
    typeof serverAnswer === "number" && serverAnswer >= 0
      ? serverAnswer
      : optimisticAnswer !== null
      ? optimisticAnswer
      : serverAnswer;

  const activePlayers = game.players.filter((p) => !p.isHost && !p.hasSubmitted);
  const answeredActiveCount = activePlayers.filter(
    (p) => typeof p.selectedAnswerIndex === "number" && p.selectedAnswerIndex >= 0
  ).length;

  // ── Player answer handler ──────────────────────────────────────────────────
  const handleSelectAnswer = (index: number) => {
    if (
      isHost ||
      currentPlayer?.hasSubmitted ||
      typeof selectedAnswerIndex === "number" ||
      !currentQuestion ||
      game.timeRemaining <= 0
    )
      return;

    setOptimisticAnswer(index);
    submitLiveAnswer(pin, playerId, index, game.timeRemaining, correctAnswerIndex);
  };

  // ── Host: END QUESTION EARLY ──────────────────────────────────────────────
  const handleHostEndQuestion = async () => {
    if (!isHost || !currentQuestion || game.status !== "question") return;
    if (transitionInProgressRef.current || isEndingQuestion) return;

    transitionInProgressRef.current = true;
    setIsEndingQuestion(true);
    setEndingError(null);

    try {
      console.log("[LIVE] Host clicked END QUESTION EARLY");
      const success = await finishCurrentFirebaseQuestion(pin, correctAnswerIndex);
      if (!success) {
        setEndingError("Failed to end question early in Firebase.");
      }
    } catch (err) {
      console.error("[LIVE] Firebase transition failed", err);
      setEndingError("Error ending question. Please check network connection.");
    } finally {
      setIsEndingQuestion(false);
      transitionInProgressRef.current = false;
    }
  };

  // ── Host: terminate quiz ───────────────────────────────────────────────────
  const handleHostTerminateQuiz = async () => {
    setIsTerminating(true);
    setTerminateError(null);
    try {
      const success = await terminateLiveGame(pin);
      if (!success) {
        setTerminateError("Failed to terminate game in Firebase. Please check network connection.");
      } else {
        setShowTerminateConfirm(false);
      }
    } catch (err) {
      console.error("[LIVE] Firebase transition failed", err);
      setTerminateError("An error occurred while terminating the quiz.");
    } finally {
      setIsTerminating(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <NavBar
        links={[
          { label: "Explore", href: "/#journey" },
          { label: "Quizzes", href: "/quizzes" },
          { label: "Leaderboard", href: "/leaderboard" },
          { label: "About", href: "/#how-it-works" },
        ]}
      />

      <LiveHeader
        pin={pin}
        currentQuestion={
          game.status !== "finished" && game.status !== "terminated"
            ? game.currentQuestionIndex + 1
            : undefined
        }
        totalQuestions={questions.length}
        playerCount={game.players.filter((p) => !p.isHost).length}
        showTimer={game.status === "question"}
        timeRemaining={game.timeRemaining}
        onTimeUp={handleTimeUp}
        role={role}
      />

      <main className="flex-1 bg-background py-10 md:py-16">
        <div className="gq-container max-w-4xl">
          <AnimatePresence mode="wait">

            {/* VIEW 1: FINISHED OR TERMINATED */}
            {(game.status === "finished" || game.status === "terminated") && (
              <div key="final-view" className="space-y-6">
                {game.status === "terminated" && (
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-900 text-xs font-black uppercase tracking-widest text-center">
                    🛑 LIVE QUIZ WAS TERMINATED BY THE HOST
                  </div>
                )}
                <FinalPodiumView
                  key="final-podium"
                  players={game.players}
                  currentPlayerId={playerId}
                  isHost={isHost}
                  gameId={game.gameId}
                  quizId={game.quizId}
                  totalQuestions={questions.length}
                  onPlayAgain={() => router.push(isHost ? "/live/host" : "/live/join")}
                />
              </div>
            )}

            {/* VIEW 2: PLAYER SUBMITTED EARLY — waiting for final results */}
            {game.status !== "finished" &&
              game.status !== "terminated" &&
              !isHost &&
              currentPlayer?.hasSubmitted && (
                <motion.div
                  key="player-submitted-early"
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  className="space-y-6 max-w-3xl mx-auto text-center"
                >
                  <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-900 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
                    <LogOut size={16} className="text-amber-600" />
                    <span>QUIZ SUBMITTED — WAITING FOR FINAL LEADERBOARD...</span>
                  </div>

                  <FinalPodiumView
                    key="early-podium-preview"
                    players={game.players}
                    currentPlayerId={playerId}
                    isHost={false}
                    gameId={game.gameId}
                    quizId={game.quizId}
                    totalQuestions={questions.length}
                  />
                </motion.div>
              )}

            {/* VIEW 3: ACTIVE QUESTION (host or non-submitted player) */}
            {game.status === "question" &&
              currentQuestion &&
              (isHost || !currentPlayer?.hasSubmitted) && (
                <motion.div
                  key={`question-${game.currentQuestionIndex}`}
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, y: -12 }}
                  className="space-y-8"
                >
                  {/* Question Prompt Card */}
                  <div className="rounded-3xl p-6 sm:p-10 bg-card border-2 border-primary/30 shadow-[var(--gq-shadow-md)] text-center space-y-3">
                    <span className="text-xs font-black uppercase tracking-widest text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                      GERMAN QUESTION
                    </span>

                    <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight leading-tight">
                      {currentQuestion.question}
                    </h2>

                    {currentQuestion.contextPrompt && (
                      <p className="text-sm font-semibold text-muted-foreground">
                        {currentQuestion.contextPrompt}
                      </p>
                    )}
                  </div>

                  {/* Answer Option Grid */}
                  <LiveAnswerGrid
                    options={currentQuestion.options}
                    selectedIndex={selectedAnswerIndex}
                    onSelectOption={handleSelectAnswer}
                    disabled={isHost || currentPlayer?.hasSubmitted}
                  />

                  {/* Player: Submit Quiz Early */}
                  {!isHost && !currentPlayer?.hasSubmitted && (
                    <div className="flex justify-center pt-2">
                      <GQButton
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSubmitEarlyConfirm(true)}
                        icon={<LogOut size={14} className="text-amber-700" />}
                        className="text-xs font-extrabold text-amber-800 border-amber-300 bg-amber-500/5 hover:bg-amber-500/15"
                      >
                        SUBMIT QUIZ EARLY
                      </GQButton>
                    </div>
                  )}

                  {/* Host Control Bar */}
                  {isHost && (
                    <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-[#10233F]/10 shadow-2xs">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground">
                          HOST CONTROL BAR: Answers Submitted (
                          {answeredActiveCount} / {activePlayers.length})
                        </span>
                        {endingError && (
                          <span className="text-xs font-bold text-rose-600">
                            ({endingError})
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <GQButton
                          variant="gold"
                          size="sm"
                          onClick={handleHostEndQuestion}
                          disabled={isEndingQuestion}
                          icon={
                            isEndingQuestion ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Play size={14} />
                            )
                          }
                        >
                          {isEndingQuestion ? "ENDING..." : "END QUESTION EARLY"}
                        </GQButton>

                        <GQButton
                          variant="outline"
                          size="sm"
                          onClick={() => setShowTerminateConfirm(true)}
                          icon={<Square size={14} className="text-rose-600" />}
                          className="border-rose-300 text-rose-700 hover:bg-rose-50 font-bold"
                        >
                          TERMINATE QUIZ
                        </GQButton>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

            {/* VIEW 4: QUESTION RESULTS */}
            {game.status === "results" &&
              currentQuestion &&
              (isHost || !currentPlayer?.hasSubmitted) && (
                <div className="space-y-6">
                  <LiveQuestionResults
                    key="results"
                    correctAnswerText={currentQuestion.correctAnswer}
                    explanation={currentQuestion.explanation}
                    players={game.players}
                    currentPlayerId={playerId}
                    isHost={isHost}
                    isLastQuestion={isLastQuestion}
                  />

                  {isHost && (
                    <div className="flex justify-center pt-2">
                      <GQButton
                        variant="outline"
                        size="sm"
                        onClick={() => setShowTerminateConfirm(true)}
                        icon={<Square size={14} className="text-rose-600" />}
                        className="border-rose-300 text-rose-700 hover:bg-rose-50 font-bold text-xs"
                      >
                        TERMINATE QUIZ
                      </GQButton>
                    </div>
                  )}
                </div>
              )}

            {/* VIEW 5: LIVE LEADERBOARD */}
            {game.status === "leaderboard" &&
              (isHost || !currentPlayer?.hasSubmitted) && (
                <div className="space-y-6">
                  <LiveLeaderboardView
                    key="leaderboard"
                    players={game.players}
                    currentPlayerId={playerId}
                    isHost={isHost}
                    isLastQuestion={isLastQuestion}
                  />

                  {isHost && (
                    <div className="flex justify-center pt-2">
                      <GQButton
                        variant="outline"
                        size="sm"
                        onClick={() => setShowTerminateConfirm(true)}
                        icon={<Square size={14} className="text-rose-600" />}
                        className="border-rose-300 text-rose-700 hover:bg-rose-50 font-bold text-xs"
                      >
                        TERMINATE QUIZ
                      </GQButton>
                    </div>
                  )}
                </div>
              )}
          </AnimatePresence>

          {/* Modal: Host Terminate Quiz Confirmation */}
          {showTerminateConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
              <div className="max-w-md w-full rounded-3xl p-6 bg-card border-2 border-rose-500/30 shadow-2xl space-y-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 flex items-center justify-center mx-auto">
                  <AlertTriangle size={24} />
                </div>

                <h3 className="font-display text-xl font-black text-foreground">
                  Terminate Quiz?
                </h3>

                <p className="text-sm font-semibold text-muted-foreground leading-relaxed">
                  This will end the live quiz for all players immediately and show
                  the final leaderboard.
                </p>

                {terminateError && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-900 text-xs font-bold">
                    {terminateError}
                  </div>
                )}

                <div className="flex items-center justify-center gap-3 pt-2">
                  <GQButton
                    variant="outline"
                    size="sm"
                    disabled={isTerminating}
                    onClick={() => {
                      setTerminateError(null);
                      setShowTerminateConfirm(false);
                    }}
                  >
                    Cancel
                  </GQButton>
                  <GQButton
                    variant="gold"
                    size="sm"
                    disabled={isTerminating}
                    className="bg-rose-600 hover:bg-rose-700 border-rose-700 text-white font-bold"
                    onClick={handleHostTerminateQuiz}
                    icon={
                      isTerminating ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : undefined
                    }
                  >
                    {isTerminating ? "Terminating..." : "Terminate Quiz"}
                  </GQButton>
                </div>
              </div>
            </div>
          )}

          {/* Modal: Player Submit Quiz Early Confirmation */}
          {showSubmitEarlyConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
              <div className="max-w-md w-full rounded-3xl p-6 bg-card border-2 border-amber-500/30 shadow-2xl space-y-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center mx-auto">
                  <LogOut size={24} />
                </div>

                <h3 className="font-display text-xl font-black text-foreground">
                  Submit Quiz?
                </h3>

                <p className="text-sm font-semibold text-muted-foreground leading-relaxed">
                  You will leave the active quiz and receive your current personal
                  result. You can wait for the final leaderboard afterward.
                </p>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <GQButton
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSubmitEarlyConfirm(false)}
                  >
                    Continue Quiz
                  </GQButton>
                  <GQButton
                    variant="teal"
                    size="sm"
                    className="font-bold"
                    onClick={async () => {
                      setShowSubmitEarlyConfirm(false);
                      if (playerId) {
                        await submitPlayerQuizEarly(pin, playerId);
                      }
                    }}
                  >
                    Submit Quiz
                  </GQButton>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

export default function LiveGamePlayPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-sm">Loading live game...</div>}>
      <LiveGamePlayContent />
    </React.Suspense>
  );
}
