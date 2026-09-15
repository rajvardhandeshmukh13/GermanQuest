"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Trophy, TrendingUp, TrendingDown, ArrowRight, Zap, Flame } from "lucide-react";
import { GQButton } from "@/components/germanquest";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import type { LivePlayer } from "@/lib/live-game";

interface LiveLeaderboardViewProps {
  players: LivePlayer[];
  currentPlayerId?: string;
  isHost?: boolean;
  isLastQuestion?: boolean;
  onNext?: () => void;
}

export function LiveLeaderboardView({
  players,
  currentPlayerId,
  isHost = false,
  isLastQuestion = false,
  onNext,
}: LiveLeaderboardViewProps) {
  const rankedPlayers = [...players]
    .filter((p) => !p.isHost)
    .sort((a, b) => b.score - a.score);

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="space-y-6 w-full max-w-2xl mx-auto"
    >
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-800 text-xs font-black uppercase tracking-widest">
          <Trophy size={15} className="text-amber-500" />
          <span>LIVE STANDINGS</span>
        </div>

        <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground tracking-tight">
          SCOREBOARD
        </h2>

        <p className="text-sm font-semibold text-muted-foreground">
          Rankings update in real time after every question!
        </p>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        {rankedPlayers.map((player, index) => {
          const rank = index + 1;
          const isCurrent = player.id === currentPlayerId;
          const prevRank = player.previousRank ?? rank;
          const rankDelta = prevRank - rank; // positive means moved up!

          return (
            <motion.div
              key={player.id}
              variants={staggerItem}
              className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all shadow-xs ${
                isCurrent
                  ? "bg-card border-primary ring-2 ring-primary/20 shadow-md"
                  : "bg-card border-[#10233F]/10 hover:border-primary/30"
              }`}
            >
              <div className="flex items-center gap-3.5">
                {/* Rank Badge */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-display font-black text-sm shadow-2xs ${
                    rank === 1
                      ? "bg-amber-500 text-white"
                      : rank === 2
                      ? "bg-slate-300 text-slate-900"
                      : rank === 3
                      ? "bg-amber-700 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  #{rank}
                </div>

                {/* Avatar & Name */}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-base font-extrabold text-foreground">
                      {player.name}
                    </h3>

                    {isCurrent && (
                      <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary text-white">
                        YOU
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                    {player.currentStreak > 1 && (
                      <span className="text-amber-700 font-bold flex items-center gap-0.5">
                        <Flame size={12} className="fill-amber-500 text-amber-500" />
                        {player.currentStreak} streak
                      </span>
                    )}

                    {rankDelta > 0 && (
                      <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                        <TrendingUp size={12} /> +{rankDelta} rank
                      </span>
                    )}
                    {rankDelta < 0 && (
                      <span className="text-rose-700 font-bold flex items-center gap-0.5">
                        <TrendingDown size={12} /> {rankDelta} rank
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Score */}
              <div className="flex items-center gap-1 font-mono font-black text-base text-amber-800 shrink-0">
                <Zap size={16} className="text-amber-500 fill-amber-500" />
                <span>{player.score} XP</span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Host CTA */}
      {isHost && onNext && (
        <div className="text-center pt-2">
          <GQButton
            variant="teal"
            size="lg"
            onClick={onNext}
            icon={<ArrowRight size={18} />}
            className="px-8 shadow-md font-bold text-base"
          >
            {isLastQuestion ? "VIEW FINAL PODIUM 🏆" : "NEXT QUESTION →"}
          </GQButton>
        </div>
      )}
    </motion.div>
  );
}
