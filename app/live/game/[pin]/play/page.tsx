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
import { Play } from "lucide-react";
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
  const selectedAnswerIndex = currentPlayer?.selectedAnswerIndex;

  // Handlers
  const handleSelectAnswer = (index: number) => {
    if (isHost || selectedAnswerIndex !== undefined || !currentQuestion) return;
    submitLiveAnswer(
      pin,
      playerId,
      index,
      game.timeRemaining,
      correctAnswerIndex
    );
  };

  const handleTimeUp = () => {
    if (isHost && game.status === "question" && currentQuestion) {
      simulateDemoAnswers(pin, correctAnswerIndex);
      advanceLiveGameState(pin, "results");
    }
  };

  const handleHostEndQuestion = () => {
    if (isHost && currentQuestion) {
      simulateDemoAnswers(pin, correctAnswerIndex);
      advanceLiveGameState(pin, "results");
    }
  };

  const handleHostResultNext = () => {
    if (isHost) {
      if (isLastQuestion) {
        advanceLiveGameState(pin, "leaderboard");
      } else {
        advanceLiveGameState(pin, "question");
      }
    }
  };

  const handleHostNextQuestion = () => {
    if (isHost) {
      advanceLiveGameState(pin, "finished");
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
          game.status !== "finished" ? game.currentQuestionIndex + 1 : undefined
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
            {/* VIEW 1: QUESTION */}
            {game.status === "question" && currentQuestion && (
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
                  disabled={isHost}
                />

                {/* Host Control Action Bar */}
                {isHost && (
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-card border border-[#10233F]/10 shadow-2xs">
                    <span className="text-xs font-bold text-muted-foreground">
                      HOST CONTROL BAR: Answers Submitted (
                      {
                        game.players.filter(
                          (p) => !p.isHost && p.selectedAnswerIndex !== undefined
                        ).length
                      }{" "}
                      / {game.players.filter((p) => !p.isHost).length})
                    </span>

                    <GQButton
                      variant="gold"
                      size="sm"
                      onClick={handleHostEndQuestion}
                      icon={<Play size={14} />}
                    >
                      END QUESTION EARLY
                    </GQButton>
                  </div>
                )}
              </motion.div>
            )}

            {/* VIEW 2: QUESTION RESULTS */}
            {game.status === "results" && currentQuestion && (
              <LiveQuestionResults
                key="results"
                correctAnswerText={currentQuestion.correctAnswer}
                explanation={currentQuestion.explanation}
                players={game.players}
                currentPlayerId={playerId}
                isHost={isHost}
                isLastQuestion={isLastQuestion}
                onNext={handleHostResultNext}
              />
            )}

            {/* VIEW 3: LIVE LEADERBOARD */}
            {game.status === "leaderboard" && (
              <LiveLeaderboardView
                key="leaderboard"
                players={game.players}
                currentPlayerId={playerId}
                isHost={isHost}
                isLastQuestion={isLastQuestion}
                onNext={handleHostNextQuestion}
              />
            )}

            {/* VIEW 4: FINAL PODIUM */}
            {game.status === "finished" && (
              <FinalPodiumView
                key="finished"
                players={game.players}
                currentPlayerId={playerId}
                isHost={isHost}
                onPlayAgain={() => router.push(isHost ? "/live/host" : "/live/join")}
              />
            )}
          </AnimatePresence>
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
