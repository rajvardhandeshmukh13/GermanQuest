"use client";

import * as React from "react";
import { motion } from "motion/react";
import { BarChart3 } from "lucide-react";
import { usePlayerStats } from "@/lib/mock-data";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";

export function LearningProgressCard() {
  const profile = usePlayerStats();
  const topicProgress = profile.topicProgress;

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="rounded-3xl p-6 sm:p-8 bg-card border border-[#10233F]/10 shadow-[var(--gq-shadow-md)] space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <BarChart3 size={18} />
          </div>
          <h3 className="font-display text-xl font-extrabold text-foreground tracking-tight">
            LEARNING PROGRESS
          </h3>
        </div>
        <p className="text-xs sm:text-sm font-medium text-muted-foreground">
          See how you&apos;re performing across different German topics.
        </p>
      </div>

      {/* Topics list */}
      <motion.div
        className="space-y-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {topicProgress.map((topic) => (
          <motion.div
            key={topic.quizId}
            variants={staggerItem}
            className="space-y-1.5 p-3 sm:p-3.5 rounded-2xl bg-muted/40 border border-[#10233F]/5 hover:border-primary/20 transition-all"
          >
            <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
              <div>
                <span className="text-foreground font-display font-extrabold mr-1.5">
                  {topic.title}
                </span>
                <span className="text-muted-foreground font-medium text-xs">
                  {topic.subtitle}
                </span>
              </div>
              <span className="font-mono text-primary font-extrabold">
                {topic.status === "not_started" ? "Not attempted" : `${topic.accuracy}%`}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden p-0.5 border border-border/40">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${topic.accuracy}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-primary to-teal-400"
              />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
