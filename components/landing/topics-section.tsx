"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { SectionHeading, GQButton } from "@/components/germanquest";
import { QuizCardItem } from "@/components/quizzes/quiz-card-item";
import { QUIZZES } from "@/lib/quiz-data";
import { staggerContainer, fadeInUp } from "@/lib/motion";
import { BookOpen, Users, ArrowRight } from "lucide-react";

export function TopicsSection() {
  return (
    <section id="topics" className="gq-section" aria-label="German learning topics">
      <div className="gq-container space-y-12">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          <SectionHeading
            title="YOUR GERMAN JOURNEY"
            subtitle="Choose your mode, master essential A1 German topics, and earn XP to unlock advanced challenges."
            centered
          />
        </motion.div>

        {/* Quick Mode Info Banner */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto"
        >
          <div className="p-5 rounded-2xl bg-card border border-primary/20 flex items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-primary shrink-0">
                <BookOpen size={20} />
              </div>
              <div>
                <h4 className="font-display text-base font-bold text-foreground">
                  PRACTICE MODE
                </h4>
                <p className="text-xs text-muted-foreground font-medium">
                  Self-paced solo quizzes & XP unlocks.
                </p>
              </div>
            </div>
            <Link href="/quizzes">
              <GQButton variant="outline" size="sm">
                BROWSE
              </GQButton>
            </Link>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-amber-500/25 flex items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-700 shrink-0">
                <Users size={20} />
              </div>
              <div>
                <h4 className="font-display text-base font-bold text-foreground">
                  LIVE GAME MODE
                </h4>
                <p className="text-xs text-muted-foreground font-medium">
                  Join multiplayer games via Game PIN.
                </p>
              </div>
            </div>
            <Link href="/join">
              <GQButton variant="gold" size="sm" icon={<ArrowRight size={14} />}>
                JOIN LIVE
              </GQButton>
            </Link>
          </div>
        </motion.div>

        {/* Unified Quiz Cards Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          {QUIZZES.map((quiz) => (
            <QuizCardItem key={quiz.id} quiz={quiz} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
