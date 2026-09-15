"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { NavBar, GQButton } from "@/components/germanquest";
import { Footer } from "@/components/landing";
import { QUIZZES, Quiz } from "@/lib/quiz-data";
import { createLiveGame } from "@/lib/live-game";
import { usePlayerStats } from "@/lib/player-stats";
import { Gamepad2, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";

export default function HostGamePage() {
  const router = useRouter();
  const profile = usePlayerStats();
  const [selectedQuiz, setSelectedQuiz] = React.useState<Quiz>(QUIZZES[0]);

  const handleCreateGame = () => {
    const game = createLiveGame(selectedQuiz.id);
    router.push(`/live/game/${game.pin}/lobby?role=host`);
  };

  return (
    <>
      <NavBar
        links={[
          { label: "Explore", href: "/" },
          { label: "Quizzes", href: "/quizzes" },
          { label: "Leaderboard", href: "/leaderboard" },
          { label: "About", href: "/about" },
        ]}
      />

      <main className="flex-1 bg-background py-12 md:py-16">
        <div className="gq-container max-w-5xl space-y-10">
          {/* Header */}
          <div className="text-center space-y-3 max-w-xl mx-auto flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-black uppercase tracking-widest text-primary">
              <Gamepad2 size={15} /> HOST A LIVE GAME
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-normal">
              CREATE LIVE GAME
            </h1>

            <p className="text-body text-muted-foreground text-base font-semibold">
              Select a quiz topic to generate a 6-digit PIN and open the live classroom lobby.
            </p>
          </div>

          {/* Quiz Selection Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 7 cols: Quiz cards list */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {QUIZZES.map((quiz) => {
                const isSelected = selectedQuiz.id === quiz.id;

                return (
                  <motion.div
                    key={quiz.id}
                    variants={staggerItem}
                    onClick={() => setSelectedQuiz(quiz)}
                    className={`rounded-2xl p-5 border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                      isSelected
                        ? "bg-card border-primary ring-2 ring-primary/20 shadow-md"
                        : "bg-card border-[#10233F]/10 hover:border-primary/40 shadow-2xs"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                        {quiz.difficulty}
                      </span>

                      {isSelected && (
                        <CheckCircle2 size={20} className="text-primary" />
                      )}
                    </div>

                    <div>
                      <h3 className="font-display text-xl font-black text-foreground tracking-tight">
                        {quiz.title}
                      </h3>
                      <p className="text-xs font-semibold text-muted-foreground mt-0.5">
                        {quiz.subtitle}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold text-muted-foreground pt-2 border-t border-border/40">
                      <span>{quiz.questionCount} Questions</span>
                      <span>+{quiz.xp} XP</span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Right 5 cols: Selected Quiz Preview & Create Game Button */}
            <div className="lg:col-span-5 space-y-6 sticky top-24">
              <div className="rounded-3xl p-6 sm:p-8 bg-card border-2 border-primary/30 shadow-[var(--gq-shadow-md)] space-y-6">
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                    SELECTED QUIZ
                  </span>

                  <h2 className="font-display text-3xl font-black text-foreground tracking-tight">
                    {selectedQuiz.title}
                  </h2>

                  <p className="text-sm font-semibold text-primary">
                    {selectedQuiz.subtitle}
                  </p>

                  <p className="text-xs font-medium text-muted-foreground leading-relaxed pt-1">
                    {selectedQuiz.description}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-border/40 text-xs font-semibold text-muted-foreground">
                  <div className="flex justify-between py-1 border-b border-border/30">
                    <span>Questions</span>
                    <span className="font-bold text-foreground">
                      {selectedQuiz.questionCount} Questions
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/30">
                    <span>Difficulty</span>
                    <span className="font-bold text-foreground">
                      {selectedQuiz.difficulty}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/30">
                    <span>Est. Time</span>
                    <span className="font-bold text-foreground">
                      {selectedQuiz.estimatedTime}
                    </span>
                  </div>
                </div>

                <GQButton
                  variant="teal"
                  size="lg"
                  onClick={handleCreateGame}
                  icon={<ArrowRight size={18} />}
                  className="w-full font-bold text-base shadow-md mt-2"
                >
                  CREATE GAME
                </GQButton>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
