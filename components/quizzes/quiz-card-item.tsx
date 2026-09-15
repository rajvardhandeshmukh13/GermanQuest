"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  MessageCircle,
  Hash,
  Users,
  UtensilsCrossed,
  BookOpen,
  Bus,
  Lock,
  Zap,
  Play,
  UserCheck,
  BookMarked,
  BarChart2,
  Users2,
  Gamepad2,
  CheckCircle2,
} from "lucide-react";
import { GQButton } from "@/components/germanquest";
import { springTransition, staggerItem } from "@/lib/motion";
import type { Quiz } from "@/lib/quiz-data";
import { cn } from "cn";

interface QuizCardItemProps {
  quiz: Quiz;
  isCompleted?: boolean;
}

export function QuizCardItem({ quiz, isCompleted }: QuizCardItemProps) {
  const isLocked = false;

  // Custom icon rendering based on quiz ID for visual match
  const renderIcon = () => {
    switch (quiz.id) {
      case "hallo":
        return <MessageCircle size={24} className="text-[#08AEB5]" />;
      case "zahlen":
        return <span className="font-display font-black text-xl text-sky-600">123</span>;
      case "meine-welt":
        return <Users size={24} className="text-amber-600" />;
      case "essen":
        return <UtensilsCrossed size={24} className="text-rose-500" />;
      case "deutschland":
        return <BookOpen size={24} className="text-indigo-600" />;
      case "unterwegs":
        return <Bus size={24} className="text-sky-600" />;
      default:
        return <MessageCircle size={24} className="text-[#08AEB5]" />;
    }
  };

  const difficultyLabel =
    quiz.difficulty === "easy"
      ? "Beginner"
      : quiz.difficulty === "medium"
      ? "Beginner"
      : "Intermediate";

  return (
    <motion.div
      variants={staggerItem}
      className="h-full"
    >
      <div
        className="h-full flex flex-col rounded-3xl p-6 bg-white border border-[#10233F]/10 shadow-[var(--gq-shadow-card)] hover:shadow-[var(--gq-shadow-card-hover)] transition-all duration-300 relative overflow-hidden"
      >
        {/* Top Header: Big Icon + Title + Subtitle */}
        <div className="flex items-start gap-4 mb-4">
          <div
            className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center border shrink-0 shadow-2xs",
              quiz.accentBg || "bg-teal-50 border-teal-200/60"
            )}
          >
            {renderIcon()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1.5">
              <h3 className="font-display text-xl sm:text-2xl font-black text-[#10233F] tracking-tight">
                {quiz.title}
              </h3>
              {isCompleted && (
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/60 shrink-0">
                  <CheckCircle2 size={12} className="text-primary" /> Completed
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 truncate">
              {quiz.subtitle}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6 flex-1 font-normal">
          {quiz.description}
        </p>

        {/* Metadata Row: Questions, XP, Difficulty */}
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 py-3 border-t border-slate-100 mb-5">
          <div className="flex items-center gap-1.5">
            <BookMarked size={14} className="text-slate-400" />
            <span>{quiz.questionCount} Questions</span>
          </div>

          <div className="flex items-center gap-1.5 text-amber-600">
            <Zap size={14} className="text-amber-500 fill-amber-500" />
            <span>+{quiz.xp} XP</span>
          </div>

          <div className="flex items-center gap-1.5">
            <BarChart2 size={14} className="text-teal-600" />
            <span>{difficultyLabel}</span>
          </div>
        </div>

        {/* Dual CTA Buttons: PRACTICE & LIVE CHALLENGE */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <Link href={`/quizzes/${quiz.id}`} className="w-full">
            <GQButton
              variant="teal"
              size="sm"
              fullWidthMobile
              className="w-full flex items-center justify-center gap-1.5 font-bold text-xs py-2.5 shadow-xs"
            >
              <Play size={13} className="fill-current" />
              <span>PRACTICE</span>
            </GQButton>
          </Link>

          <Link href="/live" className="w-full">
            <GQButton
              variant="outline"
              size="sm"
              fullWidthMobile
              className="w-full flex items-center justify-center gap-1.5 font-bold text-xs py-2.5 bg-amber-50/50 hover:bg-amber-100/60 text-amber-800 border-amber-300/70"
            >
              <Users2 size={13} className="text-amber-700" />
              <span>LIVE CHALLENGE</span>
            </GQButton>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
