"use client";

import * as React from "react";
import { motion } from "motion/react";
import { CheckCircle2, Trophy, ArrowRight, Zap, Flame, Clock } from "lucide-react";
import { GQButton } from "@/components/germanquest";
import { fadeInUp } from "@/lib/motion";
import type { LivePlayer } from "@/lib/live-game";

interface LiveQuestionResultsProps {
  correctAnswerText: string;
  explanation?: string;
  players: LivePlayer[];
  currentPlayerId?: string;
  isHost?: boolean;
  isLastQuestion?: boolean;
  onNext?: () => void;
}

export function LiveQuestionResults({
  correctAnswerText,
  explanation,
  players,
  currentPlayerId,
  isHost = false,
  isLastQuestion = false,
  onNext,
}: LiveQuestionResultsProps) {
  const nonHostPlayers = players.filter((p) => !p.isHost);
  const totalResponded = nonHostPlayers.filter(
    (p) => p.selectedAnswerIndex !== undefined && p.selectedAnswerIndex !== null && p.selectedAnswerIndex !== -1
  ).length;

  const totalCorrect = nonHostPlayers.filter((p) => p.isCorrect).length;
  const accuracyPercent =
    nonHostPlayers.length > 0 ? Math.round((totalCorrect / nonHostPlayers.length) * 100) : 0;

  const currentPlayer = nonHostPlayers.find((p) => p.id === currentPlayerId);
  const isUnanswered =
    !currentPlayer ||
    currentPlayer.selectedAnswerIndex === undefined ||
    currentPlayer.selectedAnswerIndex === null ||
    currentPlayer.selectedAnswerIndex === -1;

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="space-y-6 w-full max-w-3xl mx-auto text-center"
    >
      {/* Result Status Banner for Player */}
      {!isHost && currentPlayer && (
        <div
          className={`p-6 rounded-3xl border-2 text-center shadow-[var(--gq-shadow-md)] space-y-2 ${
            currentPlayer.isCorrect
              ? "bg-emerald-500/10 border-emerald-500 text-emerald-950"
              : isUnanswered
              ? "bg-amber-500/10 border-amber-500 text-amber-950"
              : "bg-rose-500/10 border-rose-500 text-rose-950"
          }`}
        >
          <span className="text-xs font-black uppercase tracking-widest px-3.5 py-1 rounded-full bg-white/70 border border-current">
            {currentPlayer.isCorrect
              ? "🎉 CORRECT ANSWER!"
              : isUnanswered
              ? "⏱️ TIME'S UP / UNANSWERED"
              : "❌ INCORRECT"}
          </span>

          <h2 className="font-display text-3xl font-black tracking-tight">
            {currentPlayer.isCorrect
              ? `+${currentPlayer.xpEarnedLastQuestion ?? 100} XP EARNED!`
              : "+0 XP"}
          </h2>

          {currentPlayer.isCorrect && currentPlayer.currentStreak > 1 && (
            <p className="text-xs font-bold text-amber-700 flex items-center justify-center gap-1">
              <Flame size={14} className="fill-amber-500 text-amber-500" />
              <span>{currentPlayer.currentStreak} QUESTION STREAK!</span>
            </p>
          )}
        </div>
      )}

      {/* Correct Answer Reveal Box */}
      <div className="rounded-3xl p-6 sm:p-8 bg-card border border-[#10233F]/10 shadow-[var(--gq-shadow-md)] space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 text-xs font-black uppercase tracking-widest">
          <CheckCircle2 size={15} className="text-emerald-600" />
          <span>CORRECT ANSWER</span>
        </div>

        <h3 className="font-display text-2xl sm:text-3xl font-black text-foreground tracking-tight">
          &quot;{correctAnswerText}&quot;
        </h3>

        {explanation && (
          <p className="text-sm font-semibold text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {explanation}
          </p>
        )}

        {/* Aggregate Stats */}
        <div className="pt-4 border-t border-border/40 flex items-center justify-center gap-8">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              ACCURACY
            </span>
            <p className="font-display text-2xl font-black text-emerald-700">
              {accuracyPercent}%
            </p>
          </div>

          <div className="h-8 w-px bg-border/40" />

          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              CORRECT PLAYERS
            </span>
            <p className="font-display text-2xl font-black text-foreground">
              {totalCorrect} / {nonHostPlayers.length}
            </p>
          </div>
        </div>
      </div>

      {/* Host CTA */}
      {isHost && onNext && (
        <div className="pt-2">
          <GQButton
            variant="teal"
            size="lg"
            onClick={onNext}
            icon={<ArrowRight size={18} />}
            className="px-8 shadow-md font-bold text-base"
          >
            {isLastQuestion ? "SHOW FINAL LEADERBOARD 🏆" : "NEXT QUESTION →"}
          </GQButton>
        </div>
      )}
    </motion.div>
  );
}
