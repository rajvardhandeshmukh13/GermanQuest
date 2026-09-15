"use client";

import * as React from "react";
import { NavBar } from "@/components/germanquest";
import { Footer } from "@/components/landing";
import { QuizSelectionHeader } from "@/components/quizzes/quiz-selection-header";
import { ModeSelector } from "@/components/quizzes/mode-selector";
import { QuizCardItem } from "@/components/quizzes/quiz-card-item";
import { QUIZZES } from "@/lib/quiz-data";
import { usePlayerStats } from "@/lib/mock-data";

export default function QuizzesPage() {
  const profile = usePlayerStats();
  const completedQuizIds = new Set(
    profile.topicProgress
      .filter((t) => t.status === "completed" || t.completedAttempts > 0)
      .map((t) => t.quizId)
  );

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

      <main className="flex-1 bg-[#F7F5EF] py-12 md:py-16">
        <div className="gq-container space-y-10 md:space-y-12">
          {/* Header area with player stats */}
          <QuizSelectionHeader />

          {/* Mode choice cards */}
          <ModeSelector />

          {/* Quiz Grid Section */}
          <section id="quiz-grid" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl font-black text-[#10233F]">
                  AVAILABLE CHALLENGES
                </h2>
                <p className="text-sm text-slate-600 font-medium">
                  Select a topic to start testing your German skills.
                </p>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full bg-white text-slate-600 border border-[#10233F]/10 shadow-2xs">
                6 TOPICS AVAILABLE
              </span>
            </div>

            {/* Grid layout: 3-column desktop, 2-column tablet, 1-column mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {QUIZZES.map((quiz) => (
                <QuizCardItem
                  key={quiz.id}
                  quiz={quiz}
                  isCompleted={completedQuizIds.has(quiz.id)}
                />
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
