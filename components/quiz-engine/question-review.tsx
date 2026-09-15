"use client";

import * as React from "react";
import { motion } from "motion/react";
import { CheckCircle2, XCircle } from "lucide-react";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import type { QuizResultData } from "./quiz-completion-modal";

interface QuestionReviewProps {
  answers: QuizResultData["userAnswers"];
}

export function QuestionReview({ answers }: QuestionReviewProps) {
  const [filter, setFilter] = React.useState<"all" | "incorrect">("all");
  const hasIncorrect = answers.some((a) => !a.isCorrect);

  const displayedAnswers = React.useMemo(() => {
    if (filter === "incorrect") {
      return answers.filter((a) => !a.isCorrect);
    }
    return answers;
  }, [answers, filter]);

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-display text-xl font-bold text-foreground">
            REVIEW YOUR ANSWERS
          </h3>
          <p className="text-xs text-muted-foreground font-medium">
            Inspect your answers and learn from explanations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasIncorrect && (
            <div className="flex items-center gap-1 p-1 bg-muted rounded-xl border border-border/50 text-xs font-bold">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  filter === "all"
                    ? "bg-card text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                ALL ({answers.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter("incorrect")}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  filter === "incorrect"
                    ? "bg-rose-500/15 text-rose-800 shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                MISSED ({answers.filter((a) => !a.isCorrect).length})
              </button>
            </div>
          )}

          <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-800 border border-emerald-500/20">
            ✓ {answers.filter((a) => a.isCorrect).length} / {answers.length} CORRECT
          </span>
        </div>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        {displayedAnswers.map((item, index) => (
          <motion.div
            key={item.questionId || index}
            variants={staggerItem}
            className={`p-4 md:p-5 rounded-2xl border transition-all ${
              item.isCorrect
                ? "bg-card border-emerald-500/30 text-foreground shadow-2xs"
                : "bg-card border-rose-500/30 text-foreground shadow-2xs"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                {item.isCorrect ? (
                  <CheckCircle2 size={20} className="text-emerald-600" />
                ) : (
                  <XCircle size={20} className="text-rose-600" />
                )}
              </div>

              <div className="flex-1 space-y-1.5 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h4 className="font-display text-lg font-bold text-foreground">
                    {item.question}
                  </h4>
                  <span className="text-xs font-black text-muted-foreground px-2 py-0.5 rounded-full bg-muted">
                    Q{index + 1}
                  </span>
                </div>

                {item.translation && (
                  <p className="text-xs font-semibold text-primary/90">
                    {item.translation}
                  </p>
                )}

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-2 text-xs font-medium border-t border-border/40">
                  <div>
                    <span className="text-muted-foreground font-semibold">Your Answer: </span>
                    <span
                      className={
                        item.isCorrect
                          ? "font-extrabold text-emerald-800"
                          : "font-extrabold text-rose-800"
                      }
                    >
                      {item.userAnswer ? `✓ ${item.userAnswer}` : "✕ (Time Expired)"}
                    </span>
                  </div>

                  {!item.isCorrect && (
                    <>
                      <span className="hidden sm:inline text-muted-foreground">·</span>
                      <div>
                        <span className="text-muted-foreground font-semibold">Correct Answer: </span>
                        <span className="font-extrabold text-emerald-800">
                          ✓ {item.correctAnswer}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {item.explanation && (
                  <p className="text-xs italic text-muted-foreground pt-1 leading-relaxed">
                    💡 {item.explanation}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
