"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { BookOpen, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { GQButton } from "@/components/germanquest";
import type { QuizResultData } from "./quiz-completion-modal";

interface LearningInsightsProps {
  answers: QuizResultData["userAnswers"];
  quizTitle: string;
}

export function LearningInsights({ answers, quizTitle }: LearningInsightsProps) {
  const incorrectAnswers = answers.filter((a) => !a.isCorrect);

  // Extract unique topic recommendations from missed questions
  const missedTopics = React.useMemo(() => {
    if (incorrectAnswers.length === 0) return [];
    
    // Derive realistic topic tags from missed question contents
    const topicsSet = new Set<string>();
    incorrectAnswers.forEach((item) => {
      const qText = item.question.toLowerCase();
      if (qText.includes("wie") || qText.includes("woher") || qText.includes("wo")) {
        topicsSet.add("Question Words & Sentence Structure");
      } else if (qText.includes("hallo") || qText.includes("guten") || qText.includes("tschüss")) {
        topicsSet.add("German Greetings & Formality");
      } else if (qText.includes("ich") || qText.includes("mein") || qText.includes("du")) {
        topicsSet.add("Personal Pronouns & Introductions");
      } else if (/\d/.test(qText) || qText.includes("uhr") || qText.includes("eins")) {
        topicsSet.add("Numbers, Time & Counting");
      } else {
        topicsSet.add("A1 Core Vocabulary & Phrases");
      }
    });

    return Array.from(topicsSet);
  }, [incorrectAnswers]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-3xl p-6 sm:p-8 bg-card border border-[#10233F]/10 shadow-[var(--gq-shadow-md)] space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-primary shrink-0">
            <BookOpen size={18} />
          </div>
          <h3 className="font-display text-xl font-bold text-foreground">
            WHAT TO PRACTICE NEXT
          </h3>
        </div>

        <span className="px-3 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-black text-primary uppercase tracking-wider">
          LEARNING INSIGHTS
        </span>
      </div>

      {incorrectAnswers.length === 0 ? (
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sparkles size={24} className="text-emerald-600 shrink-0" />
            <div>
              <h4 className="font-display text-lg font-bold text-emerald-950">
                PERFECT SCORE ON {quizTitle.toUpperCase()}!
              </h4>
              <p className="text-xs font-medium text-emerald-900/80">
                You didn't miss a single question. Ready for a harder German challenge?
              </p>
            </div>
          </div>
          <Link href="/quizzes">
            <GQButton variant="teal" size="sm" icon={<ArrowRight size={14} />}>
              EXPLORE HARDER QUIZZES
            </GQButton>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-muted-foreground">
            Based on your answers, focusing on these topics will boost your score next time:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {missedTopics.map((topic) => (
              <div
                key={topic}
                className="p-3.5 rounded-2xl bg-muted/40 border border-border/50 flex items-center gap-2.5 text-xs font-bold text-foreground"
              >
                <CheckCircle2 size={16} className="text-primary shrink-0" />
                <span>{topic}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
