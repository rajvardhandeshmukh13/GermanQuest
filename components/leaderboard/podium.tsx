"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Trophy, Medal, Crown, Flame, Zap } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { LeaderboardUser } from "@/lib/mock-data";

interface PodiumProps {
  topThree: LeaderboardUser[];
}

export function Podium({ topThree }: PodiumProps) {
  if (topThree.length < 3) return null;

  const first = topThree[0];
  const second = topThree[1];
  const third = topThree[2];

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2);

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-6 items-end pt-4 pb-2 max-w-2xl mx-auto">
      {/* 2nd Place - SILVER (Left) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="flex flex-col items-center"
      >
        <div className="relative mb-3 flex flex-col items-center text-center">
          <div className="w-7 h-7 rounded-full bg-slate-200 border border-slate-300 text-slate-700 flex items-center justify-center text-xs font-black mb-1 shadow-xs">
            🥈 2
          </div>
          <Avatar className="w-14 h-14 sm:w-16 sm:h-16 border-2 border-slate-300 shadow-sm">
            <AvatarFallback className="bg-slate-100 text-slate-800 font-bold text-base sm:text-lg">
              {getInitials(second.name)}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="w-full rounded-2xl p-4 sm:p-5 bg-card border border-slate-200 shadow-[var(--gq-shadow-sm)] text-center space-y-1">
          <p className="font-display text-sm sm:text-base font-extrabold text-foreground truncate">
            {second.name}
          </p>
          <span className="inline-block px-2 py-0.5 rounded-full bg-muted text-[10px] font-extrabold text-muted-foreground uppercase">
            Lv {second.level}
          </span>
          <div className="pt-1 flex items-center justify-center gap-1 text-xs font-black text-amber-700">
            <Zap size={13} className="text-amber-500 fill-amber-500" />
            <span>{second.xp.toLocaleString()} XP</span>
          </div>
        </div>
      </motion.div>

      {/* 1st Place - GOLD (Center Elevated) */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center -mt-4"
      >
        <div className="relative mb-3 flex flex-col items-center text-center">
          <Crown size={24} className="text-amber-500 fill-amber-400 animate-bounce mb-0.5" />
          <div className="w-8 h-8 rounded-full bg-amber-500 text-amber-950 flex items-center justify-center text-sm font-black mb-1 shadow-md">
            🥇 1
          </div>
          <Avatar className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-amber-400 shadow-md ring-4 ring-amber-400/20">
            <AvatarFallback className="bg-amber-100 text-amber-900 font-extrabold text-lg sm:text-xl">
              {getInitials(first.name)}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="w-full rounded-2xl p-5 sm:p-6 bg-card border-2 border-amber-400/60 shadow-[var(--gq-shadow-md)] text-center space-y-1 relative">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-amber-500 text-amber-950 font-black text-[10px] uppercase tracking-widest shadow-2xs">
            CHAMPION
          </span>

          <p className="font-display text-base sm:text-lg font-black text-foreground tracking-tight truncate pt-1">
            {first.name}
          </p>
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-500/10 text-[10px] font-extrabold text-amber-800 border border-amber-500/20 uppercase">
            Lv {first.level}
          </span>
          <div className="pt-1.5 flex items-center justify-center gap-1 text-sm font-black text-amber-800">
            <Zap size={15} className="text-amber-500 fill-amber-500" />
            <span>{first.xp.toLocaleString()} XP</span>
          </div>
        </div>
      </motion.div>

      {/* 3rd Place - BRONZE (Right) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="flex flex-col items-center"
      >
        <div className="relative mb-3 flex flex-col items-center text-center">
          <div className="w-7 h-7 rounded-full bg-amber-700/20 border border-amber-700/30 text-amber-900 flex items-center justify-center text-xs font-black mb-1 shadow-xs">
            🥉 3
          </div>
          <Avatar className="w-14 h-14 sm:w-16 sm:h-16 border-2 border-amber-700/30 shadow-sm">
            <AvatarFallback className="bg-amber-50 text-amber-900 font-bold text-base sm:text-lg">
              {getInitials(third.name)}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="w-full rounded-2xl p-4 sm:p-5 bg-card border border-amber-700/20 shadow-[var(--gq-shadow-sm)] text-center space-y-1">
          <p className="font-display text-sm sm:text-base font-extrabold text-foreground truncate">
            {third.name}
          </p>
          <span className="inline-block px-2 py-0.5 rounded-full bg-muted text-[10px] font-extrabold text-muted-foreground uppercase">
            Lv {third.level}
          </span>
          <div className="pt-1 flex items-center justify-center gap-1 text-xs font-black text-amber-700">
            <Zap size={13} className="text-amber-500 fill-amber-500" />
            <span>{third.xp.toLocaleString()} XP</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
