"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Trophy, Zap, Target, Flame, Clock, ArrowRight, RotateCcw, Home } from "lucide-react";
import { GQButton } from "@/components/germanquest";
import { scaleIn } from "@/lib/motion";

export interface QuizResultData {
  quizId: string;
  quizTitle: string;
  totalXp: number;
  correctCount: number;
  totalQuestions: number;
  accuracy: number;
  bestStreak: number;
  totalTimeSeconds: number;
  userAnswers: {
    questionId: number;
    question: string;
    translation: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
  }[];
}

interface QuizCompletionModalProps {
  result: QuizResultData;
  onPlayAgain: () => void;
  onViewResults: () => void;
}

export function QuizCompletionModal({
  result,
  onPlayAgain,
  onViewResults,
}: QuizCompletionModalProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
      <motion.div
        variants={scaleIn}
        initial="hidden"
        animate="visible"
        className="w-full max-w-lg rounded-3xl p-8 bg-card border border-[#10233F]/12 shadow-2xl text-center space-y-6 relative overflow-hidden"
      >
        {/* Decorative background glow */}
        <div
          className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full opacity-25"
          style={{
            background:
              "radial-gradient(circle, oklch(0.65 0.14 195 / 30%) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />

        {/* Celebration Trophy Icon */}
        <div className="mx-auto w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-600 shadow-sm animate-pulse">
          <Trophy size={42} />
        </div>

        <div>
          <span className="px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-black uppercase tracking-widest text-primary">
            🎉 QUIZ COMPLETE!
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground mt-2 tracking-tight">
            {result.quizTitle}
          </h2>
          <p className="text-sm font-semibold text-muted-foreground mt-1">
            Great job! Your German skills are getting stronger.
          </p>
        </div>

        {/* Big XP Highlight */}
        <div className="py-4 px-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center gap-2">
          <Zap size={24} className="text-amber-500 fill-amber-500" />
          <span className="font-display text-4xl font-extrabold text-amber-800 tracking-tight">
            +{result.totalXp} XP
          </span>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 text-left">
          <div className="p-3.5 rounded-2xl bg-muted/50 border border-border/40">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Target size={14} className="text-primary" />
              <span>CORRECT</span>
            </div>
            <p className="font-display text-lg font-bold text-foreground mt-1">
              {result.correctCount} / {result.totalQuestions}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-muted/50 border border-border/40">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Trophy size={14} className="text-teal-600" />
              <span>ACCURACY</span>
            </div>
            <p className="font-display text-lg font-bold text-foreground mt-1">
              {result.accuracy}%
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-muted/50 border border-border/40">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Flame size={14} className="text-amber-500 fill-amber-500" />
              <span>BEST STREAK</span>
            </div>
            <p className="font-display text-lg font-bold text-foreground mt-1">
              {result.bestStreak}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-muted/50 border border-border/40">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Clock size={14} className="text-primary" />
              <span>TIME</span>
            </div>
            <p className="font-display text-lg font-bold text-foreground mt-1">
              {formatTime(result.totalTimeSeconds)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-2">
          <GQButton
            variant="teal"
            size="lg"
            onClick={onViewResults}
            fullWidthMobile
            icon={<ArrowRight size={18} />}
            className="w-full font-bold text-base shadow-md"
          >
            VIEW RESULTS
          </GQButton>

          <div className="flex items-center gap-3">
            <GQButton
              variant="outline"
              size="default"
              onClick={onPlayAgain}
              fullWidthMobile
              icon={<RotateCcw size={16} />}
              className="flex-1"
            >
              PLAY AGAIN
            </GQButton>

            <Link href="/quizzes" className="flex-1">
              <GQButton
                variant="ghost"
                size="default"
                fullWidthMobile
                icon={<Home size={16} />}
                className="w-full"
              >
                QUIZZES
              </GQButton>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
