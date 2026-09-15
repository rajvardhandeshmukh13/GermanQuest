"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  MessageCircle,
  Hash,
  Users,
  UtensilsCrossed,
  Landmark,
  Navigation,
  Lock,
  AlertCircle,
  Clock,
  Zap,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import { GQButton, DifficultyBadge } from "@/components/germanquest";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import type { Quiz } from "@/lib/quiz-data";
import { cn } from "cn";

const iconMap = {
  MessageCircle,
  Hash,
  Users,
  UtensilsCrossed,
  Landmark,
  Navigation,
};

interface QuizReadyProps {
  quiz: Quiz;
}

export function QuizReady({ quiz }: QuizReadyProps) {
  const IconComponent = iconMap[quiz.iconName] || MessageCircle;

  return (
    <div className="gq-container py-12 md:py-16">
      {/* Back button link */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <Link
          href="/quizzes"
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-full bg-card border border-[#10233F]/8 shadow-xs w-fit"
        >
          <ArrowLeft size={16} /> Back to Quizzes
        </Link>
      </motion.div>

      {/* Main Ready Card */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-2xl mx-auto rounded-3xl p-8 md:p-10 bg-card border border-[#10233F]/10 shadow-[var(--gq-shadow-lg)] relative overflow-hidden"
      >
        {/* Decorative background glow */}
        <div
          className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(circle, oklch(0.65 0.14 195 / 25%) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Large Topic Visual Container */}
          <motion.div
            variants={staggerItem}
            className={cn(
              "w-20 h-20 rounded-3xl border flex items-center justify-center mb-6 shadow-sm relative",
              quiz.accentBg
            )}
          >
            <IconComponent size={40} className={quiz.iconColor} />
          </motion.div>

          {/* Titles */}
          <motion.div variants={staggerItem} className="mb-2">
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">
              {quiz.title}
            </h1>
            <p className="text-lg font-semibold text-primary mt-1">
              {quiz.subtitle}
            </p>
          </motion.div>

          {/* Challenge Hook */}
          <motion.div
            variants={staggerItem}
            className="my-4 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-extrabold uppercase tracking-widest text-primary"
          >
            READY FOR THE CHALLENGE?
          </motion.div>

          <motion.p
            variants={staggerItem}
            className="text-body text-muted-foreground max-w-lg mb-6 leading-relaxed"
          >
            {quiz.description}
          </motion.p>

          {/* Key Metrics Bar */}
          <motion.div
            variants={staggerItem}
            className="w-full flex flex-wrap items-center justify-center gap-4 py-4 px-6 rounded-2xl bg-muted/50 border border-border/50 mb-8"
          >
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <BookOpen size={16} className="text-primary" />
              <span>{quiz.questionCount} Questions</span>
            </div>

            <span className="text-border">|</span>

            <div className="flex items-center gap-2 text-sm font-bold">
              <DifficultyBadge difficulty={quiz.difficulty} />
            </div>

            <span className="text-border">|</span>

            <div className="flex items-center gap-1.5 text-sm font-bold text-amber-700">
              <Zap size={16} className="text-amber-500 fill-amber-500" />
              <span>+{quiz.xp} XP</span>
            </div>
          </motion.div>

          {/* Topics Covered & Estimated Time */}
          <motion.div
            variants={staggerItem}
            className="w-full text-left space-y-4 mb-8 p-5 rounded-2xl border border-border/40 bg-card/60"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                Topics Covered
              </h3>
              <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                <Clock size={13} className="text-primary" />
                <span>Est. time: {quiz.estimatedTime}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {quiz.topics.map((t) => (
                <div
                  key={t}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-background border border-border text-xs font-semibold text-foreground shadow-2xs"
                >
                  <CheckCircle2 size={13} className="text-primary" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Action CTAs */}
          <motion.div
            variants={staggerItem}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full"
          >
            <Link href={`/quizzes/${quiz.id}/play`} className="w-full sm:w-auto">
              <GQButton
                variant="teal"
                size="lg"
                showArrow
                fullWidthMobile
                className="px-8 font-bold text-base"
              >
                START QUIZ
              </GQButton>
            </Link>

            <Link href="/quizzes" className="w-full sm:w-auto">
              <GQButton
                variant="outline"
                size="lg"
                fullWidthMobile
                className="w-full"
              >
                ← BACK TO QUIZZES
              </GQButton>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
