"use client";

import * as React from "react";
import { motion } from "motion/react";
import { CheckCircle2, XCircle, Zap, ArrowRight } from "lucide-react";
import { GQButton } from "@/components/germanquest";
import { fadeInUp } from "@/lib/motion";
import { cn } from "cn";

interface AnswerFeedbackProps {
  isCorrect: boolean;
  explanation: string;
  earnedXp: number;
  isLastQuestion: boolean;
  onNext: () => void;
}

export function AnswerFeedback({
  isCorrect,
  explanation,
  earnedXp,
  isLastQuestion,
  onNext,
}: AnswerFeedbackProps) {
  // Keyboard listener for Enter / Space to advance
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onNext]);

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className={cn(
        "w-full rounded-3xl p-6 md:p-8 border shadow-[var(--gq-shadow-md)] flex flex-col md:flex-row items-center justify-between gap-6 transition-colors",
        isCorrect
          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950"
          : "bg-rose-500/10 border-rose-500/30 text-rose-950"
      )}
    >
      <div className="flex items-start gap-4 flex-1">
        {/* Status Icon */}
        <div
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs",
            isCorrect
              ? "bg-emerald-500 text-white"
              : "bg-rose-500 text-white"
          )}
        >
          {isCorrect ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
        </div>

        {/* Feedback text & explanation */}
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h3 className="font-display text-2xl font-black tracking-tight">
              {isCorrect ? "Richtig!" : "Nicht ganz!"}
            </h3>
            {isCorrect && earnedXp > 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-amber-500 text-amber-950 font-black text-xs shadow-xs animate-bounce">
                <Zap size={13} className="fill-amber-950" />+{earnedXp} XP
              </span>
            )}
          </div>
          <p className="text-sm font-medium leading-relaxed opacity-90">
            {explanation}
          </p>
        </div>
      </div>

      {/* Next Button */}
      <div className="w-full md:w-auto shrink-0">
        <GQButton
          variant={isCorrect ? "teal" : "navy"}
          size="lg"
          onClick={onNext}
          fullWidthMobile
          icon={<ArrowRight size={18} />}
          className="font-bold text-base px-8 shadow-md"
        >
          {isLastQuestion ? "COMPLETE QUIZ" : "NEXT"}
        </GQButton>
      </div>
    </motion.div>
  );
}
