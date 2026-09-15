"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Target } from "lucide-react";

interface AccuracyRingProps {
  accuracy: number; // 0 - 100
}

export function AccuracyRing({ accuracy }: AccuracyRingProps) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (accuracy / 100) * circumference;

  let message = "";
  if (accuracy >= 90) {
    message = "Excellent work! You've mastered this challenge.";
  } else if (accuracy >= 70) {
    message = "Great work! A little more practice and you'll be even stronger.";
  } else if (accuracy >= 50) {
    message = "Good start! Review the tricky questions and try again.";
  } else {
    message = "Keep practicing! Every attempt makes your German stronger.";
  }

  return (
    <div className="rounded-3xl p-6 sm:p-8 bg-card border border-[#10233F]/10 shadow-[var(--gq-shadow-md)] flex flex-col sm:flex-row items-center justify-between gap-6">
      {/* SVG Circular Ring */}
      <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 110 110">
          {/* Background circle track */}
          <circle
            cx="55"
            cy="55"
            r={radius}
            className="text-muted/60 stroke-current"
            strokeWidth="10"
            fill="transparent"
          />
          {/* Animated progress circle */}
          <motion.circle
            cx="55"
            cy="55"
            r={radius}
            className="text-primary stroke-current"
            strokeWidth="10"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Center Percentage Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-display text-2xl sm:text-3xl font-black text-foreground tracking-tight leading-none">
            {accuracy}%
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground pt-0.5">
            ACCURACY
          </span>
        </div>
      </div>

      {/* Performance Message */}
      <div className="space-y-2 text-center sm:text-left flex-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-black uppercase tracking-widest text-primary">
          <Target size={13} /> PERFORMANCE ANALYSIS
        </div>
        <p className="text-body text-foreground text-base sm:text-lg font-bold leading-relaxed">
          "{message}"
        </p>
        <p className="text-xs font-medium text-muted-foreground">
          Accuracy is calculated based on correct first-attempt selections during this quiz.
        </p>
      </div>
    </div>
  );
}
