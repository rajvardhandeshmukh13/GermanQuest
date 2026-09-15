"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Flame, Zap, Trophy, CheckCircle2 } from "lucide-react";
import { usePlayerStats } from "@/lib/mock-data";
import { fadeInUp } from "@/lib/motion";

export function QuizSelectionHeader() {
  const profile = usePlayerStats();

  return (
    <motion.div
      className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-8 rounded-3xl bg-white border border-[#10233F]/10 shadow-[var(--gq-shadow-md)] overflow-hidden"
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
    >
      {/* Background castle silhouette accent */}
      <div className="absolute right-4 bottom-0 opacity-15 pointer-events-none text-8xl hidden lg:block select-none">
        🏰 🇩🇪
      </div>

      {/* Left Title Block */}
      <div className="flex flex-col gap-2 max-w-2xl relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#08AEB5]/10 border border-[#08AEB5]/20 text-xs font-black uppercase tracking-widest text-[#08AEB5] w-fit">
          <span>🎮 6 TOPICS</span>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-[#10233F] tracking-normal">
          CHOOSE YOUR GERMAN CHALLENGE
        </h1>

        <p className="text-body text-slate-600 text-base sm:text-lg leading-relaxed font-semibold">
          Explore different topics, earn XP, and improve your German skills.
        </p>

        {/* Gamification Status Bar */}
        <div className="flex flex-wrap items-center gap-3 pt-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-800 text-sm font-extrabold shadow-2xs">
            <Flame size={16} className="text-amber-500 fill-amber-500" />
            <span>{profile.currentStreak} day streak</span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-800 text-sm font-extrabold shadow-2xs">
            <Zap size={16} className="text-amber-500 fill-amber-500" />
            <span>{profile.totalXP.toLocaleString()} XP</span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#08AEB5]/10 border border-[#08AEB5]/25 text-[#08AEB5] text-sm font-extrabold shadow-2xs">
            <Trophy size={16} className="text-[#08AEB5]" />
            <span>Level {profile.level}</span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-[#10233F]/10 text-[#10233F] text-sm font-extrabold shadow-2xs">
            <CheckCircle2 size={16} className="text-[#08AEB5]" />
            <span>{profile.quizzesCompleted} / {profile.totalQuizzes} completed</span>
          </div>
        </div>
      </div>

      {/* Right Cursive Sticker Accent */}
      <div className="hidden lg:flex flex-col items-end relative z-10 shrink-0">
        <div className="px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-sm font-bold shadow-xs rotate-2">
          Kleine Schritte, große Ziele. 🇩🇪
        </div>
      </div>
    </motion.div>
  );
}
