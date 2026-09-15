import * as React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { NavBar, GQButton } from "@/components/germanquest";
import { Footer } from "@/components/landing";
import { BookOpen, Users, Trophy, Zap, Flame, Sparkles, ArrowRight, ShieldCheck, Target } from "lucide-react";
import { getMockPlayerProfile } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "GermanQuest — About the Platform",
  description: "Learn how GermanQuest turns German learning into an interactive game with solo quizzes and live classroom competitions.",
};

export default function AboutPage() {
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

      <main className="flex-1 bg-[#F7F5EF] py-12 md:py-16">
        <div className="gq-container max-w-4xl space-y-12">
          {/* Hero Container with German Alpine / Castle Backdrop */}
          <div className="rounded-3xl p-8 sm:p-12 md:p-16 bg-[#10233F] text-white shadow-[var(--gq-shadow-md)] relative overflow-hidden flex flex-col items-center text-center space-y-6">
            {/* Background Alpine / Castle Glow */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle at 70% 30%, #08AEB5 0%, transparent 60%), radial-gradient(circle at 20% 80%, #F5B82E 0%, transparent 50%)`,
              }}
            />

            {/* Sticker Quote */}
            <div className="absolute top-6 right-6 hidden sm:block">
              <span className="inline-block font-handwriting text-base text-amber-300 rotate-[3deg] bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-xl border border-white/20">
                Die Welt wartet auf dich. ♡
              </span>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-black uppercase tracking-widest text-teal-300">
              <Sparkles size={14} /> ABOUT GERMANQUEST
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight max-w-3xl">
              MORE THAN A LANGUAGE. <br className="hidden sm:inline" />
              <span className="text-teal-400">A JOURNEY.</span>
            </h1>

            <p className="text-body text-slate-300 text-base sm:text-lg font-medium leading-relaxed max-w-xl">
              GermanQuest turns German learning into an interactive adventure. Build your vocabulary, grammar, and confidence through quizzes, live challenges, and real progress tracking.
            </p>

            <div className="pt-4">
              <Link href="/quizzes">
                <GQButton variant="gold" size="lg" showArrow className="px-8 font-black text-base shadow-md">
                  Join the Journey
                </GQButton>
              </Link>
            </div>
          </div>

          {/* 4 Feature Cards Grid (Matching Panel 7) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="rounded-3xl p-6 bg-white border border-[#10233F]/10 shadow-[var(--gq-shadow-sm)] text-center space-y-3 flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-primary flex items-center justify-center font-bold">
                <BookOpen size={22} />
              </div>
              <h3 className="font-display text-base font-extrabold text-[#10233F]">
                Interactive Learning
              </h3>
              <p className="text-xs font-medium text-slate-500 leading-relaxed">
                Practice German at your own pace across curated topics.
              </p>
            </div>

            <div className="rounded-3xl p-6 bg-white border border-[#10233F]/10 shadow-[var(--gq-shadow-sm)] text-center space-y-3 flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
                <Trophy size={22} />
              </div>
              <h3 className="font-display text-base font-extrabold text-[#10233F]">
                Live Competitions
              </h3>
              <p className="text-xs font-medium text-slate-500 leading-relaxed">
                Compete live in group settings with real-time Game PINs.
              </p>
            </div>

            <div className="rounded-3xl p-6 bg-white border border-[#10233F]/10 shadow-[var(--gq-shadow-sm)] text-center space-y-3 flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-primary flex items-center justify-center font-bold">
                <Target size={22} />
              </div>
              <h3 className="font-display text-base font-extrabold text-[#10233F]">
                Track Progress
              </h3>
              <p className="text-xs font-medium text-slate-500 leading-relaxed">
                Earn XP, build daily streaks, and reach level milestones.
              </p>
            </div>

            <div className="rounded-3xl p-6 bg-white border border-[#10233F]/10 shadow-[var(--gq-shadow-sm)] text-center space-y-3 flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
                <Users size={22} />
              </div>
              <h3 className="font-display text-base font-extrabold text-[#10233F]">
                Join a Community
              </h3>
              <p className="text-xs font-medium text-slate-500 leading-relaxed">
                Compare achievements on global community leaderboards.
              </p>
            </div>
          </div>

          {/* Deep Dive Section */}
          <div className="rounded-3xl p-8 sm:p-10 bg-white border border-[#10233F]/10 shadow-[var(--gq-shadow-md)] space-y-6">
            <h2 className="font-display text-2xl sm:text-3xl font-black text-[#10233F] tracking-tight">
              WHY GAMIFIED GERMAN WORKS
            </h2>

            <div className="space-y-4 text-sm font-medium text-slate-600 leading-relaxed">
              <p>
                Traditional language learning often suffers from low engagement and monotonous repetition. GermanQuest transforms language acquisition by blending active recall with instant feedback, time-pressure scoring, and streak rewards.
              </p>
              <p>
                Whether you are preparing for an A1 exam, brushing up on daily travel phrases, or hosting a live classroom competition, GermanQuest provides immediate feedback that reinforces memory retention.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    TOPICS
                  </span>
                  <p className="font-display text-2xl font-black text-primary">6 Topics</p>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    MODES
                  </span>
                  <p className="font-display text-2xl font-black text-amber-800">Solo & Live</p>
                </div>
              </div>

              <Link href="/quizzes">
                <GQButton variant="teal" size="lg" showArrow className="font-bold text-sm">
                  EXPLORE ALL QUIZZES
                </GQButton>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
