"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Check, Lock, ShieldCheck } from "lucide-react";
import { cn } from "cn";

interface LiveAnswerGridProps {
  options: string[];
  selectedIndex?: number;
  onSelectOption?: (index: number) => void;
  disabled?: boolean;
  showCorrect?: boolean;
  correctIndex?: number;
}

const OPTION_STYLES = [
  {
    bg: "bg-teal-500/10 border-teal-500/40 text-teal-950 hover:bg-teal-500/20 hover:border-teal-500",
    activeBg: "bg-teal-600 border-teal-700 text-white shadow-md ring-4 ring-teal-500/20",
    badge: "▲",
    badgeColor: "bg-teal-500/25 text-teal-800",
  },
  {
    bg: "bg-amber-500/10 border-amber-500/40 text-amber-950 hover:bg-amber-500/20 hover:border-amber-500",
    activeBg: "bg-amber-600 border-amber-700 text-white shadow-md ring-4 ring-amber-500/20",
    badge: "◆",
    badgeColor: "bg-amber-500/25 text-amber-800",
  },
  {
    bg: "bg-indigo-500/10 border-indigo-500/40 text-indigo-950 hover:bg-indigo-500/20 hover:border-indigo-500",
    activeBg: "bg-indigo-600 border-indigo-700 text-white shadow-md ring-4 ring-indigo-500/20",
    badge: "●",
    badgeColor: "bg-indigo-500/25 text-indigo-800",
  },
  {
    bg: "bg-rose-500/10 border-rose-500/40 text-rose-950 hover:bg-rose-500/20 hover:border-rose-500",
    activeBg: "bg-rose-600 border-rose-700 text-white shadow-md ring-4 ring-rose-500/20",
    badge: "■",
    badgeColor: "bg-rose-500/25 text-rose-800",
  },
];

export function LiveAnswerGrid({
  options,
  selectedIndex,
  onSelectOption,
  disabled = false,
  showCorrect = false,
  correctIndex,
}: LiveAnswerGridProps) {
  const isLocked = selectedIndex !== undefined;

  return (
    <div className="space-y-4 w-full">
      {isLocked && !showCorrect && (
        <div className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-900 text-sm font-extrabold shadow-2xs animate-fade-in">
          <ShieldCheck size={18} className="text-amber-600" />
          <span>ANSWER LOCKED — WAITING FOR OTHER PLAYERS...</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        {options.map((optionText, idx) => {
          const style = OPTION_STYLES[idx % OPTION_STYLES.length];
          const isSelected = selectedIndex === idx;
          const isCorrectOption = showCorrect && correctIndex === idx;
          const isWrongOption = showCorrect && isSelected && correctIndex !== idx;

          return (
            <motion.button
              key={idx}
              type="button"
              whileHover={disabled || isLocked ? {} : { scale: 1.015, y: -2 }}
              whileTap={disabled || isLocked ? {} : { scale: 0.98 }}
              disabled={disabled || isLocked}
              onClick={() => onSelectOption && onSelectOption(idx)}
              className={cn(
                "relative rounded-2xl p-5 border-2 text-left flex items-center justify-between transition-all min-h-[72px] sm:min-h-[84px] cursor-pointer disabled:cursor-not-allowed",
                isSelected
                  ? style.activeBg
                  : style.bg,
                isCorrectOption && "bg-emerald-600 border-emerald-700 text-white shadow-lg ring-4 ring-emerald-500/30",
                isWrongOption && "bg-rose-600 border-rose-700 text-white opacity-90"
              )}
            >
              <div className="flex items-center gap-3.5 pr-4">
                <span
                  className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black shrink-0 shadow-2xs",
                    isSelected || isCorrectOption || isWrongOption
                      ? "bg-white/20 text-white"
                      : style.badgeColor
                  )}
                >
                  {style.badge}
                </span>

                <span className="font-display text-base sm:text-lg font-extrabold tracking-tight leading-snug">
                  {optionText}
                </span>
              </div>

              {/* Status Icons */}
              {isSelected && !showCorrect && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/25 text-white text-xs font-black shrink-0">
                  <Lock size={13} /> LOCKED
                </div>
              )}

              {isCorrectOption && (
                <div className="w-8 h-8 rounded-full bg-white text-emerald-700 flex items-center justify-center font-black shadow-md shrink-0">
                  <Check size={18} />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
