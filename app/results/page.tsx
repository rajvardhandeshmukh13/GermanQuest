"use client";

import * as React from "react";
import Link from "next/link";
import { NavBar, GQButton } from "@/components/germanquest";
import { Footer } from "@/components/landing";
import { XPCountUp } from "@/components/quiz-engine/xp-count-up";
import { AccuracyRing } from "@/components/quiz-engine/accuracy-ring";
import { LearningInsights } from "@/components/quiz-engine/learning-insights";
import { QuestionReview } from "@/components/quiz-engine/question-review";
import type { QuizResultData } from "@/components/quiz-engine/quiz-completion-modal";
import { Trophy, Zap, Target, Flame, Clock, ArrowRight, RotateCcw, Home, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";

// Fallback result data if page accessed directly
const FALLBACK_RESULT: QuizResultData = {
  quizId: "hallo",
  quizTitle: "Hallo!",
  totalXp: 720,
  correctCount: 7,
  totalQuestions: 8,
  accuracy: 87,
  bestStreak: 4,
  totalTimeSeconds: 134,
  userAnswers: [
    {
      questionId: 1,
      question: "Wie heißt du?",
      translation: "Select the English meaning",
      userAnswer: "What is your name?",
      correctAnswer: "What is your name?",
      isCorrect: true,
      explanation: '"Wie heißt du?" translates to "What is your name?".',
    },
    {
      questionId: 2,
      question: "Guten Morgen!",
      translation: "Select the English meaning",
      userAnswer: "Good morning!",
      correctAnswer: "Good morning!",
      isCorrect: true,
      explanation: '"Guten Morgen" is used to greet someone in the morning.',
    },
    {
      questionId: 3,
      question: "Ich heiße Anna.",
      translation: "Select the English meaning",
      userAnswer: "My name is Anna.",
      correctAnswer: "My name is Anna.",
      isCorrect: true,
      explanation: '"Ich heiße..." translates to "My name is...".',
    },
    {
      questionId: 4,
      question: "Wie geht es dir?",
      translation: "Select the English meaning",
      userAnswer: "Where are you going?",
      correctAnswer: "How are you?",
      isCorrect: false,
      explanation: '"Wie geht es dir?" asks how someone is doing.',
    },
    {
      questionId: 5,
      question: "Auf Wiedersehen!",
      translation: "Select the English meaning",
      userAnswer: "Goodbye!",
      correctAnswer: "Goodbye!",
      isCorrect: true,
      explanation: '"Auf Wiedersehen" is the formal way to say "Goodbye".',
    },
    {
      questionId: 6,
      question: "Danke schön!",
      translation: "Select the English meaning",
      userAnswer: "Thank you very much!",
      correctAnswer: "Thank you very much!",
      isCorrect: true,
      explanation: '"Danke schön" means "Thank you very much".',
    },
    {
      questionId: 7,
      question: "Woher kommst du?",
      translation: "Select the English meaning",
      userAnswer: "Where are you from?",
      correctAnswer: "Where are you from?",
      isCorrect: true,
      explanation: '"Woher kommst du?" asks for origin.',
    },
    {
      questionId: 8,
      question: "Tschüss!",
      translation: "Select the English meaning",
      userAnswer: "Bye!",
      correctAnswer: "Bye!",
      isCorrect: true,
      explanation: '"Tschüss" is the friendly informal way to say "Bye!".',
    },
  ],
};

import { usePlayerStats } from "@/lib/mock-data";
import { useAuth } from "@/components/auth/auth-provider";

export default function ResultsPage() {
  const profile = usePlayerStats();
  const { isAuthenticated } = useAuth();
  const [result, setResult] = React.useState<QuizResultData>(FALLBACK_RESULT);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("gq_last_quiz_result");
      if (stored) {
        try {
          setResult(JSON.parse(stored));
        } catch {
          // ignore parsing error
        }
      }
    }
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Dynamic German motivational messaging based on accuracy
  let motivationalGerman = "";
  let motivationalSub = "";
  if (result.accuracy >= 90) {
    motivationalGerman = "Ausgezeichnet! Dein Deutsch wird immer stärkеr.";
    motivationalSub = "Outstanding performance! You mastered this challenge with high accuracy.";
  } else if (result.accuracy >= 70) {
    motivationalGerman = "Sehr gut! Du bist auf dem richtigen Weg.";
    motivationalSub = "Great job! You are making steady progress in German.";
  } else if (result.accuracy >= 50) {
    motivationalGerman = "Gut gemacht! Weiter üben und du wirst noch stärkеr.";
    motivationalSub = "Good effort! Keep practicing to build confidence and vocabulary.";
  } else {
    motivationalGerman = "Weiter üben! Jeder Versuch macht dein Deutsch stärkеr.";
    motivationalSub = "Every attempt helps you learn. Review your answers and try again!";
  }

  return (
    <>
      <NavBar
        links={[
          { label: "Explore", href: "/" },
          { label: "Quizzes", href: "/quizzes" },
          { label: "Leaderboard", href: "/leaderboard" },
          { label: "About", href: "/about" },
        ]}
      />

      <main className="flex-1 bg-[#F7F5EF] py-12 md:py-16 relative overflow-hidden">
        {/* Background Decorative Accents */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#10233F_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="gq-container max-w-3xl relative z-10 space-y-8">
          {/* Header & Celebration */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-3 text-center items-center relative"
          >
            {/* Golden Trophy Icon */}
            <div className="w-20 h-20 rounded-full bg-amber-500/15 border-4 border-amber-400 shadow-md flex items-center justify-center text-amber-500 mb-2">
              <Trophy size={40} className="fill-amber-400 animate-bounce" />
            </div>

            <h1 className="font-display text-4xl sm:text-5xl font-black text-[#10233F] tracking-tight">
              Quiz Complete!
            </h1>

            <p className="font-display text-2xl sm:text-3xl font-black text-teal-600">
              Sehr gut!
            </p>

            <p className="text-body text-slate-500 max-w-md text-sm sm:text-base font-medium">
              You completed <span className="text-[#10233F] font-bold">{result.quizTitle}</span>. Here is how you performed:
            </p>
          </motion.div>

          {/* 3 Focal Summary Cards (Matching Panel 9: Accuracy, Correct, XP Earned) */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-3 gap-3 sm:gap-6"
          >
            <motion.div
              variants={staggerItem}
              className="p-4 sm:p-6 rounded-3xl bg-white border border-[#10233F]/10 shadow-[var(--gq-shadow-md)] text-center space-y-1"
            >
              <p className="font-display text-3xl sm:text-4xl font-black text-[#10233F] tracking-tight">
                {result.accuracy}%
              </p>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Accuracy
              </p>
            </motion.div>

            <motion.div
              variants={staggerItem}
              className="p-4 sm:p-6 rounded-3xl bg-white border border-[#10233F]/10 shadow-[var(--gq-shadow-md)] text-center space-y-1"
            >
              <p className="font-display text-3xl sm:text-4xl font-black text-[#10233F] tracking-tight">
                {result.correctCount} / {result.totalQuestions}
              </p>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Correct
              </p>
            </motion.div>

            <motion.div
              variants={staggerItem}
              className="p-4 sm:p-6 rounded-3xl bg-white border border-[#10233F]/10 shadow-[var(--gq-shadow-md)] text-center space-y-1"
            >
              <p className="font-display text-3xl sm:text-4xl font-black text-amber-800 tracking-tight flex items-center justify-center gap-1">
                +{result.totalXp} <span className="text-xs font-black text-amber-600">XP</span>
              </p>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Earned
              </p>
            </motion.div>
          </motion.div>

          {/* Action CTAs (Matching Panel 9: Next Challenge -> & View Profile) */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center gap-4 pt-2"
          >
            <Link href="/quizzes" className="w-full sm:w-80">
              <GQButton
                variant="gold"
                size="lg"
                showArrow
                fullWidthMobile
                className="w-full font-black text-base py-6 shadow-md"
              >
                Next Challenge
              </GQButton>
            </Link>

            <Link href="/profile" className="w-full sm:w-80">
              <GQButton
                variant="outline"
                size="lg"
                fullWidthMobile
                className="w-full font-bold text-sm"
              >
                View Profile
              </GQButton>
            </Link>
          </motion.div>

          {/* Question Review Accordion/Section */}
          <div className="pt-4">
            <QuestionReview answers={result.userAnswers} />
          </div>

          {/* Bottom German Sticker Quote Accent */}
          <div className="text-right pt-2">
            <span className="inline-block font-handwriting text-xl text-rose-600 rotate-[3deg] bg-white px-5 py-2 rounded-2xl shadow-xs border border-rose-200">
              Weiter so! ♡
            </span>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
