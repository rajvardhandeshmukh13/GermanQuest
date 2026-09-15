"use client";

import * as React from "react";
import { motion } from "motion/react";
import { fadeInUp } from "@/lib/motion";

interface QuestionCardProps {
  question: string;
  contextPrompt?: string;
  translation?: string; // backwards compatibility
  correctAnswer?: string;
  questionIndex: number;
  totalQuestions: number;
}

export function QuestionCard({
  question,
  contextPrompt,
  translation,
  correctAnswer,
  questionIndex,
  totalQuestions,
}: QuestionCardProps) {
  // Determine subtext to display below question
  const subtext = contextPrompt || translation || "";

  // SYSTEM-LEVEL ANTI-LEAK GUARD:
  // If subtext or prompt contains the exact correct answer (case-insensitive), suppress it.
  const isLeakingAnswer =
    Boolean(correctAnswer) &&
    Boolean(subtext) &&
    correctAnswer!.trim().length > 0 &&
    subtext.toLowerCase().includes(correctAnswer!.toLowerCase().trim());

  const safeSubtext = isLeakingAnswer ? "Select the correct option" : subtext;

  return (
    <motion.div
      key={questionIndex}
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="w-full rounded-3xl p-8 md:p-10 bg-card border border-[#10233F]/10 shadow-[var(--gq-shadow-md)] text-center flex flex-col items-center justify-center relative overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          background:
            "radial-gradient(circle at 50% 30%, oklch(0.65 0.14 195 / 15%) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col items-center max-w-xl">
        <span className="px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-black uppercase tracking-widest text-primary mb-4">
          QUESTION {questionIndex + 1} OF {totalQuestions}
        </span>

        {/* Primary Question Text */}
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight leading-tight mb-2 whitespace-pre-line">
          {question}
        </h2>

        {/* Safe Context Subtext */}
        {safeSubtext && (
          <p className="text-base sm:text-lg font-semibold text-primary/90 leading-relaxed mt-1">
            {safeSubtext}
          </p>
        )}
      </div>
    </motion.div>
  );
}
