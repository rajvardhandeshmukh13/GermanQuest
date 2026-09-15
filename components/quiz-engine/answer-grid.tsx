"use client";

import * as React from "react";
import { motion } from "motion/react";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "cn";
import { shakeVariant, springTransition } from "@/lib/motion";

interface AnswerGridProps {
  options: string[];
  selectedAnswer: string | null;
  correctAnswer: string;
  isSubmitted: boolean;
  onSelectOption: (option: string) => void;
}

const optionLabels = ["A", "B", "C", "D"];

export function AnswerGrid({
  options,
  selectedAnswer,
  correctAnswer,
  isSubmitted,
  onSelectOption,
}: AnswerGridProps) {
  // Keyboard shortcut listener (1-4 or A-D)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSubmitted) return;

      const key = e.key.toUpperCase();
      let index = -1;

      if (key === "1" || key === "A") index = 0;
      if (key === "2" || key === "B") index = 1;
      if (key === "3" || key === "C") index = 2;
      if (key === "4" || key === "D") index = 3;

      if (index >= 0 && index < options.length) {
        onSelectOption(options[index]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSubmitted, options, onSelectOption]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
      {options.map((option, index) => {
        const label = optionLabels[index] || `${index + 1}`;
        const isSelected = selectedAnswer === option;
        const isCorrect = option === correctAnswer;
        const isIncorrectSelection = isSubmitted && isSelected && !isCorrect;

        let stateStyle =
          "bg-card border-border hover:border-primary/50 hover:shadow-[var(--gq-shadow-sm)] text-foreground cursor-pointer";
        let badgeStyle = "bg-muted text-muted-foreground border-border";

        if (isSubmitted) {
          if (isCorrect) {
            stateStyle =
              "bg-emerald-500/10 border-2 border-emerald-500 text-emerald-950 font-bold shadow-sm";
            badgeStyle = "bg-emerald-500 text-white border-emerald-600 font-bold";
          } else if (isSelected && !isCorrect) {
            stateStyle =
              "bg-rose-500/10 border-2 border-rose-500 text-rose-950 font-bold shadow-sm";
            badgeStyle = "bg-rose-500 text-white border-rose-600 font-bold";
          } else {
            stateStyle = "bg-card/40 border-border/40 text-muted-foreground/50 opacity-60 cursor-default";
          }
        }

        return (
          <motion.button
            key={option}
            type="button"
            disabled={isSubmitted}
            onClick={() => onSelectOption(option)}
            variants={shakeVariant}
            animate={isIncorrectSelection ? "shake" : "idle"}
            whileHover={isSubmitted ? undefined : { y: -2 }}
            whileTap={isSubmitted ? undefined : { scale: 0.98 }}
            transition={springTransition}
            className={cn(
              "relative w-full min-h-[72px] p-4 rounded-2xl border text-left flex items-center gap-3.5 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              stateStyle
            )}
          >
            {/* Option Key Badge (A, B, C, D) */}
            <span
              className={cn(
                "w-8 h-8 rounded-xl border font-bold text-xs flex items-center justify-center shrink-0 transition-colors",
                badgeStyle
              )}
            >
              {label}
            </span>

            {/* Option Text */}
            <span className="flex-1 font-sans text-base sm:text-lg font-semibold leading-tight">
              {option}
            </span>

            {/* Selection Icons with Micro Reveal */}
            {isSubmitted && isCorrect && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.2, 1], opacity: 1 }}
                transition={{ duration: 0.25 }}
              >
                <CheckCircle2 size={22} className="text-emerald-600 shrink-0" />
              </motion.div>
            )}
            {isSubmitted && isSelected && !isCorrect && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.2, 1], opacity: 1 }}
                transition={{ duration: 0.25 }}
              >
                <XCircle size={22} className="text-rose-600 shrink-0" />
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
