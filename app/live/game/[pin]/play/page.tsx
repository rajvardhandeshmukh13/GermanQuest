"use client";

import * as React from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { NavBar, GQButton } from "@/components/germanquest";
import { Footer } from "@/components/landing";
import {
  getLiveGameByPin,
  subscribeToLiveGame,
  submitLiveAnswer,
  simulateDemoAnswers,
  advanceLiveGameState,
  terminateLiveGame,
  submitPlayerQuizEarly,
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

  const profile = usePlayerStats();
  const [game, setGame] = React.useState<LiveGame | null>(null);
  const [isMounted, setIsMounted] = React.useState(false);
  const [hasCheckedGame, setHasCheckedGame] = React.useState(false);
  const [optimisticAnswer, setOptimisticAnswer] = React.useState<number | null>(null);
  const [showTerminateConfirm, setShowTerminateConfirm] = React.useState(false);
  const [showSubmitEarlyConfirm, setShowSubmitEarlyConfirm] = React.useState(false);
  const [isTerminating, setIsTerminating] = React.useState(false);
  const [terminateError, setTerminateError] = React.useState<string | null>(null);

  const transitionInProgressRef = React.useRef(false);

  // Subscribe to real-time updates after hydration mount
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

  // Clear transition lock and optimistic answer state when moving to a new question or changing status
  React.useEffect(() => {
    setOptimisticAnswer(null);
    transitionInProgressRef.current = false;
  }, [game?.currentQuestionIndex, game?.status]);

  // Host-driven Automatic State Machine:
  // 1. QUESTION: Auto-finalize when all active (non-submitted) players have answered
  React.useEffect(() => {
    if (!game || role !== "host" || game.status !== "question") return;

    const activePlayers = game.players.filter((p) => !p.isHost && !p.hasSubmitted);
    const allActiveAnswered =
      activePlayers.length > 0 &&
      activePlayers.every((p) => typeof p.selectedAnswerIndex === "number" && p.selectedAnswerIndex >= 0);

    if (allActiveAnswered) {
      if (transitionInProgressRef.current) return;
      transitionInProgressRef.current = true;

      const questions = getQuestionsForQuiz(game.quizId);
      const currentQuestion = questions[game.currentQuestionIndex % questions.length];
      const correctAnswerIndex = currentQuestion
        ? Math.max(0, currentQuestion.options.indexOf(currentQuestion.correctAnswer))
        : 0;

      simulateDemoAnswers(pin, correctAnswerIndex);
    }
  }, [game, pin, role]);

  // 2. RESULTS -> LEADERBOARD: Auto-advance after 2.5 seconds delay
  React.useEffect(() => {
    if (!game || role !== "host" || game.status !== "results") return;

    const timer = setTimeout(async () => {
      if (transitionInProgressRef.current) return;
      transitionInProgressRef.current = true;
      await advanceLiveGameState(pin, "leaderboard");
    }, 2500);

    return () => clearTimeout(timer);
  }, [game?.status, game?.currentQuestionIndex, pin, role]);

  // 3. LEADERBOARD -> QUESTION / FINISHED: Auto-advance after 2.5 seconds delay
  React.useEffect(() => {
    if (!game || role !== "host" || game.status !== "leaderboard") return;

    const questions = getQuestionsForQuiz(game.quizId);
    const isLastQuestion = game.currentQuestionIndex >= questions.length - 1;

    const timer = setTimeout(async () => {
      if (transitionInProgressRef.current) return;
      transitionInProgressRef.current = true;

      if (isLastQuestion) {
        await advanceLiveGameState(pin, "finished");
      } else {
        await advanceLiveGameState(pin, "question");
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [game?.status, game?.currentQuestionIndex, game?.quizId, pin, role]);

  const handleTimeUp = React.useCallback(async () => {
    if (role === "host" && game?.status === "question") {
      if (transitionInProgressRef.current) return;
      transitionInProgressRef.current = true;

      const questions = getQuestionsForQuiz(game.quizId);
      const currentQuestion = questions[game.currentQuestionIndex % questions.length];
      const correctAnswerIndex = currentQuestion
        ? Math.max(0, currentQuestion.options.indexOf(currentQuestion.correctAnswer))
        : 0;

      await simulateDemoAnswers(pin, correctAnswerIndex);
    }
  }, [role, game?.status, game?.quizId, game?.currentQuestionIndex, pin]);

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

  // 1. Initial Loading State (rendered on SSR and first client hydration pass)
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

  // 2. Game Not Found State (rendered after mount if session doesn't exist)
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

  const isHost = role === "host";
  const quiz = getQuizById(game.quizId) || QUIZZES[0];
  const questions = getQuestionsForQuiz(game.quizId);
  const currentQuestion = questions[game.currentQuestionIndex % questions.length];
  const correctAnswerIndex = currentQuestion
    ? Math.max(0, currentQuestion.options.indexOf(currentQuestion.correctAnswer))
    : 0;

  const isLastQuestion = game.currentQuestionIndex >= questions.length - 1;
  const currentPlayer = game.players.find((p) => p.id === playerId);
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

  // Handlers
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
    submitLiveAnswer(
      pin,
      playerId,
      index,
      game.timeRemaining,
      correctAnswerIndex
    );
  };

  const handleHostEndQuestion = async () => {
    if (isHost && currentQuestion && game.status === "question") {
      if (transitionInProgressRef.current) return;
      transitionInProgressRef.current = true;

      await simulateDemoAnswers(pin, correctAnswerIndex);
    }
  };

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
      console.error("Terminate Quiz error:", err);
      setTerminateError("An error occurred while terminating the quiz.");
    } finally {
      setIsTerminating(false);
    }
  };

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

            {/* VIEW 2: PLAYER SUBMITTED EARLY WAITING VIEW */}
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

            {/* VIEW 3: QUESTION (for host or active player) */}
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

                  {/* Secondary Action: Player Submit Quiz Early */}
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

                  {/* Host Control Action Bar */}
                  {isHost && (
                    <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-[#10233F]/10 shadow-2xs">
                      <span className="text-xs font-bold text-muted-foreground">
                        HOST CONTROL BAR: Answers Submitted (
                        {answeredActiveCount} / {activePlayers.length})
                      </span>

                      <div className="flex items-center gap-2">
                        <GQButton
                          variant="gold"
                          size="sm"
                          onClick={handleHostEndQuestion}
                          icon={<Play size={14} />}
                        >
                          END QUESTION EARLY
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

          {/* Modal Dialog: Host Terminate Quiz Confirmation */}
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
                  This will end the live quiz for all players immediately and show the final leaderboard.
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
                    icon={isTerminating ? <Loader2 size={14} className="animate-spin" /> : undefined}
                  >
                    {isTerminating ? "Terminating..." : "Terminate Quiz"}
                  </GQButton>
                </div>
              </div>
            </div>
          )}

          {/* Modal Dialog: Player Submit Quiz Early Confirmation */}
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
                  You will leave the active quiz and receive your current personal result. You can wait for the final leaderboard afterward.
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
