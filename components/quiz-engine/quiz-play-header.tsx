"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Flame, Zap, X } from "lucide-react";
import { cn } from "cn";

interface QuizPlayHeaderProps {
  currentIndex: number;
  totalQuestions: number;
  currentXp: number;
  streak: number;
  quizId: string;
}

export function QuizPlayHeader({
  currentIndex,
  totalQuestions,
  currentXp,
  streak,
  quizId,
}: QuizPlayHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full gq-glass border-b border-border">
      <div className="gq-container flex h-14 items-center justify-between gap-4">
        {/* Brand & Exit button */}
        <div className="flex items-center gap-3">
          <Link
            href={`/quizzes/${quizId}`}
            className="p-1.5 rounded-full hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
            title="Exit quiz"
            aria-label="Exit quiz"
          >
            <X size={18} />
          </Link>
          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-1 font-display text-base font-bold text-foreground"
          >
            <span>German</span>
            <span className="text-primary">Quest</span>
          </Link>
        </div>

        {/* Center: Question Counter */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-card border border-[#10233F]/10 shadow-2xs text-xs font-extrabold text-foreground">
          <span className="text-muted-foreground uppercase tracking-wider">
            QUESTION
          </span>
          <span className="text-primary font-black">
            {currentIndex + 1} / {totalQuestions}
          </span>
        </div>

        {/* Right: XP & Streak Indicators */}
        <div className="flex items-center gap-3">
          {/* Streak indicator */}
          <div
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold transition-all",
              streak > 0
                ? "bg-amber-500/15 text-amber-700 border border-amber-500/30 shadow-xs"
                : "bg-muted text-muted-foreground/60"
            )}
          >
            <motion.div
              animate={streak > 0 ? { scale: [1, 1.25, 1] } : {}}
              transition={{ duration: 0.4 }}
              key={streak}
            >
              <Flame
                size={14}
                className={cn(
                  streak > 0
                    ? "text-amber-500 fill-amber-500"
                    : "text-muted-foreground/40"
                )}
              />
            </motion.div>
            <span>{streak} STREAK</span>
          </div>

          {/* XP Indicator */}
          <div className="relative flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-500/10 text-primary border border-teal-500/20 text-xs font-extrabold shadow-xs">
            <motion.div
              key={currentXp}
              animate={currentXp > 0 ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-1"
            >
              <Zap size={14} className="text-primary fill-primary" />
              <span>{currentXp} XP</span>
            </motion.div>
          </div>
        </div>
      </div>
    </header>
  );
}
