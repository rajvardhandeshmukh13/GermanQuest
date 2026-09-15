"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Trophy, Medal, Sparkles, Flame, Zap, RotateCcw, Home } from "lucide-react";
import { GQButton } from "@/components/germanquest";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import type { LivePlayer } from "@/lib/live-game";

interface FinalPodiumViewProps {
  players: LivePlayer[];
  currentPlayerId?: string;
  isHost?: boolean;
  onPlayAgain?: () => void;
}

export function FinalPodiumView({
  players,
  currentPlayerId,
  isHost = false,
  onPlayAgain,
}: FinalPodiumViewProps) {
  const rankedPlayers = [...players]
    .filter((p) => !p.isHost)
    .sort((a, b) => b.score - a.score);

  const gold = rankedPlayers[0];
  const silver = rankedPlayers[1];
  const bronze = rankedPlayers[2];

  const currentPlayer = rankedPlayers.find((p) => p.id === currentPlayerId);

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="space-y-8 w-full max-w-3xl mx-auto text-center"
    >
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-800 text-xs font-black uppercase tracking-widest shadow-2xs">
          <Sparkles size={16} className="text-amber-500" />
          <span>CHAMPIONSHIP PODIUM</span>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl font-black text-foreground tracking-tight">
          LIVE CHALLENGE COMPLETE!
        </h1>

        <p className="text-base font-semibold text-muted-foreground">
          Outstanding effort by all GermanQuest players!
        </p>
      </div>

      {/* 3D-Style Podium Display (2nd | 1st | 3rd) */}
      <div className="pt-6 pb-2 flex items-end justify-center gap-3 sm:gap-6 min-h-[300px]">
        {/* 2nd Place (Silver) */}
        {silver && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex-1 max-w-[180px] flex flex-col items-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-200 border-2 border-slate-400 text-slate-800 font-display text-lg font-black flex items-center justify-center shadow-md mb-2">
              {silver.avatar || "2"}
            </div>
            <p className="font-display font-extrabold text-sm text-foreground truncate w-full">
              {silver.name}
            </p>
            <p className="font-mono text-xs font-black text-amber-800 mb-3">
              {silver.score} XP
            </p>

            <div className="w-full h-36 bg-gradient-to-t from-slate-300 to-slate-200 border-2 border-slate-400 rounded-t-3xl flex flex-col items-center justify-start pt-3 shadow-md">
              <span className="font-display text-2xl font-black text-slate-700">
                🥈 2ND
              </span>
            </div>
          </motion.div>
        )}

        {/* 1st Place (Gold) */}
        {gold && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex-1 max-w-[200px] flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-amber-400 border-4 border-amber-300 text-amber-950 font-display text-xl font-black flex items-center justify-center shadow-lg mb-2 ring-4 ring-amber-500/20">
              <Trophy size={28} className="text-amber-900" />
            </div>
            <p className="font-display font-black text-base text-foreground truncate w-full">
              {gold.name}
            </p>
            <p className="font-mono text-sm font-black text-amber-700 mb-3">
              {gold.score} XP
            </p>

            <div className="w-full h-48 bg-gradient-to-t from-amber-400 to-amber-300 border-2 border-amber-500 rounded-t-3xl flex flex-col items-center justify-start pt-4 shadow-xl">
              <span className="font-display text-3xl font-black text-amber-950">
                👑 1ST
              </span>
            </div>
          </motion.div>
        )}

        {/* 3rd Place (Bronze) */}
        {bronze && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="flex-1 max-w-[180px] flex flex-col items-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-700 border-2 border-amber-600 text-white font-display text-lg font-black flex items-center justify-center shadow-md mb-2">
              {bronze.avatar || "3"}
            </div>
            <p className="font-display font-extrabold text-sm text-foreground truncate w-full">
              {bronze.name}
            </p>
            <p className="font-mono text-xs font-black text-amber-800 mb-3">
              {bronze.score} XP
            </p>

            <div className="w-full h-28 bg-gradient-to-t from-amber-800 to-amber-700 border-2 border-amber-900 rounded-t-3xl flex flex-col items-center justify-start pt-3 shadow-md text-white">
              <span className="font-display text-xl font-black">🥉 3RD</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Player Personal Summary Card */}
      {!isHost && currentPlayer && (
        <motion.div
          variants={fadeInUp}
          className="rounded-3xl p-6 bg-card border-2 border-primary/30 shadow-[var(--gq-shadow-md)] flex flex-wrap items-center justify-around gap-4"
        >
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              YOUR FINAL RANK
            </span>
            <p className="font-display text-3xl font-black text-primary">
              #{currentPlayer.rank}
            </p>
          </div>

          <div className="h-10 w-px bg-border/50 hidden sm:block" />

          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              TOTAL XP EARNED
            </span>
            <p className="font-display text-3xl font-black text-amber-700 flex items-center justify-center gap-1">
              <Zap size={22} className="fill-amber-500 text-amber-500" />
              +{currentPlayer.score}
            </p>
          </div>

          <div className="h-10 w-px bg-border/50 hidden sm:block" />

          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              BEST STREAK
            </span>
            <p className="font-display text-3xl font-black text-amber-600 flex items-center justify-center gap-1">
              <Flame size={22} className="fill-amber-500 text-amber-500" />
              {currentPlayer.bestStreak}
            </p>
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        {onPlayAgain && (
          <GQButton
            variant="teal"
            size="lg"
            onClick={onPlayAgain}
            icon={<RotateCcw size={18} />}
            className="px-6 font-bold shadow-md"
          >
            PLAY AGAIN
          </GQButton>
        )}

        <Link href="/quizzes">
          <GQButton
            variant="outline"
            size="lg"
            icon={<Home size={18} />}
            className="px-6 font-bold shadow-sm"
          >
            BACK TO QUIZZES
          </GQButton>
        </Link>
      </div>
    </motion.div>
  );
}
