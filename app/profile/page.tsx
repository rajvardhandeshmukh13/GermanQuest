"use client";

import * as React from "react";
import Link from "next/link";
import { NavBar, GQButton } from "@/components/germanquest";
import { Footer } from "@/components/landing";
import { LearningProgressCard } from "@/components/profile/learning-progress-card";
import {
  getMockPlayerProfile,
  getMockQuizHistory,
  getPlayerLevelInfo,
} from "@/lib/mock-data";
import {
  Zap,
  Flame,
  Trophy,
  Target,
  FileText,
  HelpCircle,
  Clock,
  ChevronRight,
  User,
  Sparkles,
  BarChart3,
} from "lucide-react";
import { motion } from "motion/react";
import {
  usePlayerStats,
  type QuizAttempt,
} from "@/lib/mock-data";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";

import { useAuth } from "@/components/auth/auth-provider";
import { LogOut, Edit3, Check } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile: authProfile, isAuthenticated, signOutUser, repository } = useAuth();
  const localStats = usePlayerStats();

  const profile = isAuthenticated && authProfile ? authProfile : localStats;
  const history = profile.recentAttempts || [];
  const levelInfo = profile.levelInfo;

  const [isEditing, setIsEditing] = React.useState(false);
  const [editName, setEditName] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (profile?.name) {
      setEditName(profile.name);
    }
  }, [profile?.name]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    try {
      setIsSaving(true);
      await repository.updateProfile({ name: editName.trim() });
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogOut = async () => {
    await signOutUser();
    router.push("/");
  };

  const initials = profile.avatar || profile.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2);

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
        <div className="gq-container max-w-6xl space-y-10">
          {/* Header */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-2 text-center items-center"
          >
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-black uppercase tracking-widest text-primary">
              <User size={14} /> {isAuthenticated ? "PLAYER PROFILE" : "GUEST PROFILE"}
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-[#10233F] tracking-tight">
              {isAuthenticated ? "YOUR PROGRESS & DASHBOARD" : "GUEST DASHBOARD"}
            </h1>

            <p className="text-body text-slate-600 max-w-lg text-base font-medium">
              {isAuthenticated
                ? "Track your progress, stats, achievements, and quiz history."
                : "View your local quiz stats or log in to sync your progress to the cloud."}
            </p>
          </motion.div>

          {/* Guest Login Callout Banner */}
          {!isAuthenticated && (
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="rounded-2xl p-5 bg-amber-500/10 border border-amber-500/25 text-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs"
            >
              <div>
                <h3 className="font-display font-extrabold text-base text-[#10233F]">
                  You are currently playing as a Guest
                </h3>
                <p className="text-xs font-medium text-slate-600 mt-0.5">
                  Sign in or create a free account to save your XP, track streaks, and climb the community leaderboard.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link href="/login">
                  <GQButton variant="outline" size="sm" className="text-xs font-extrabold px-4">
                    LOG IN
                  </GQButton>
                </Link>
                <Link href="/signup">
                  <GQButton variant="teal" size="sm" className="text-xs font-extrabold px-4">
                    CREATE ACCOUNT
                  </GQButton>
                </Link>
              </div>
            </motion.div>
          )}

          {/* 2-Column Responsive Layout (Desktop: Left 5 cols, Right 7 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: Profile, Level, Learning Stats */}
            <div className="lg:col-span-5 space-y-6">
              {/* Profile Card */}
              <motion.div
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className="rounded-3xl p-8 bg-white border border-[#10233F]/10 shadow-[var(--gq-shadow-md)] text-center flex flex-col items-center justify-center relative overflow-hidden"
              >
                {/* Sticker Quote */}
                <div className="absolute top-4 right-4">
                  <span className="inline-block font-handwriting text-xs text-rose-600 rotate-[4deg] bg-rose-50/80 px-2.5 py-1 rounded-lg border border-rose-200">
                    Disziplin führt zum Erfolg. ♡
                  </span>
                </div>

                <div className="w-24 h-24 rounded-full border-4 border-primary/20 shadow-md mb-4 flex items-center justify-center bg-teal-500/10 text-primary font-black text-3xl font-display relative">
                  {isAuthenticated ? initials : "GL"}
                </div>

                {isEditing ? (
                  <form onSubmit={handleSaveProfile} className="flex items-center gap-2 mb-2 w-full max-w-xs">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-primary text-sm font-bold text-center text-[#10233F] w-full focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="p-2 rounded-lg bg-primary text-white hover:opacity-90 transition-opacity"
                    >
                      <Check size={16} />
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-display text-3xl font-black text-[#10233F] tracking-tight">
                      {isAuthenticated ? profile.name : "Guest Learner"}
                    </h2>
                    {isAuthenticated && (
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="text-slate-400 hover:text-primary transition-colors p-1"
                        title="Edit nickname"
                      >
                        <Edit3 size={16} />
                      </button>
                    )}
                  </div>
                )}

                <p className="text-xs font-black uppercase tracking-widest text-primary mt-1 mb-4">
                  LEVEL {profile.level} LEARNER {isAuthenticated ? "• VERIFIED ACCOUNT" : "• GUEST MODE"}
                </p>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-800 text-xs font-black shadow-2xs">
                    <Zap size={14} className="text-amber-500 fill-amber-500" />
                    <span>{profile.totalXP} XP</span>
                  </div>

                  <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-800 text-xs font-black shadow-2xs">
                    <Flame size={14} className="text-amber-500 fill-amber-500" />
                    <span>{profile.currentStreak} DAY STREAK</span>
                  </div>
                </div>

                {/* Log Out button for authenticated user */}
                {isAuthenticated && (
                  <button
                    type="button"
                    onClick={handleLogOut}
                    className="mt-6 flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-rose-600 transition-colors pt-4 border-t border-slate-100 w-full justify-center"
                  >
                    <LogOut size={14} /> LOG OUT
                  </button>
                )}
              </motion.div>

              {/* Level Progress Card */}
              <motion.div
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className="rounded-3xl p-6 sm:p-7 bg-white border border-[#10233F]/10 shadow-[var(--gq-shadow-md)] space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      CURRENT LEVEL
                    </span>
                    <h3 className="font-display text-xl font-black text-[#10233F]">
                      LEVEL {profile.level}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      NEXT LEVEL
                    </span>
                    <h4 className="font-display text-base font-bold text-primary">
                      LEVEL {profile.level + 1}
                    </h4>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-500">Progress</span>
                    <span className="font-mono text-[#10233F]">
                      {levelInfo.xpInLevel.toLocaleString()} / {levelInfo.levelSpanXp.toLocaleString()} XP ({levelInfo.progressPercent}%)
                    </span>
                  </div>

                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-0.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${levelInfo.progressPercent}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full bg-primary"
                    />
                  </div>

                  <p className="text-xs font-medium text-slate-600 pt-1">
                    ⚡ <span className="font-bold text-[#10233F]">{levelInfo.xpNeededForNext.toLocaleString()} XP</span> remaining to reach Level {levelInfo.level + 1}.
                  </p>
                </div>
              </motion.div>

              {/* Learning Stats Grid */}
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-extrabold text-[#10233F] uppercase tracking-wider flex items-center gap-1.5">
                    <BarChart3 size={16} className="text-primary" /> LEARNING STATS
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <motion.div
                    variants={staggerItem}
                    className="p-4 rounded-2xl bg-white border border-[#10233F]/8 shadow-2xs space-y-1"
                  >
                    <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-400 uppercase">
                      <FileText size={14} className="text-teal-600" /> QUIZZES COMPLETED
                    </div>
                    <p className="font-display text-2xl font-black text-[#10233F] tracking-tight">
                      {profile.quizzesCompleted}
                    </p>
                  </motion.div>

                  <motion.div
                    variants={staggerItem}
                    className="p-4 rounded-2xl bg-white border border-[#10233F]/8 shadow-2xs space-y-1"
                  >
                    <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-400 uppercase">
                      <HelpCircle size={14} className="text-sky-600" /> QUESTIONS ANSWERED
                    </div>
                    <p className="font-display text-2xl font-black text-[#10233F] tracking-tight">
                      {profile.questionsAnswered}
                    </p>
                  </motion.div>

                  <motion.div
                    variants={staggerItem}
                    className="p-4 rounded-2xl bg-white border border-[#10233F]/8 shadow-2xs space-y-1"
                  >
                    <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-400 uppercase">
                      <Target size={14} className="text-rose-500" /> ACCURACY RATE
                    </div>
                    <p className="font-display text-2xl font-black text-[#10233F] tracking-tight">
                      {profile.accuracy}%
                    </p>
                  </motion.div>

                  <motion.div
                    variants={staggerItem}
                    className="p-4 rounded-2xl bg-white border border-[#10233F]/8 shadow-2xs space-y-1"
                  >
                    <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-400 uppercase">
                      <Flame size={14} className="text-amber-500 fill-amber-500" /> BEST STREAK
                    </div>
                    <p className="font-display text-2xl font-black text-[#10233F] tracking-tight">
                      {profile.bestStreak}
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* RIGHT COLUMN: Recent Quizzes, Learning Progress, Keep Going CTA */}
            <div className="lg:col-span-7 space-y-6">
              {/* Recent Quizzes Card */}
              <motion.div
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className="rounded-3xl p-6 sm:p-8 bg-white border border-[#10233F]/10 shadow-[var(--gq-shadow-md)] space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl font-black text-[#10233F]">
                    RECENT QUIZZES
                  </h3>
                  <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                    LAST 3 COMPLETED
                  </span>
                </div>

                <div className="space-y-3">
                  {history.length > 0 ? (
                    history.map((item: QuizAttempt) => (
                      <Link
                        key={item.id}
                        href={`/quizzes/${item.quizId}`}
                        className="p-4 rounded-2xl border border-slate-100 bg-white flex items-center justify-between gap-4 shadow-2xs hover:border-primary/40 hover:shadow-sm transition-all group"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <h4 className="font-display text-base font-extrabold text-[#10233F] group-hover:text-primary transition-colors">
                              {item.title || item.quizTitle}
                            </h4>
                            <span className="text-xs font-semibold text-primary">
                              {item.subtitle || item.quizSubtitle}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
                            <Clock size={12} /> {item.completedAt}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            {item.accuracy}% ACCURACY
                          </span>
                          <div className="flex items-center gap-1 text-xs font-extrabold text-amber-600">
                            <Zap size={13} className="text-amber-500 fill-amber-500" />
                            <span>+{item.xpEarned} XP</span>
                          </div>
                          <ChevronRight size={16} className="text-slate-400 group-hover:text-primary transition-colors" />
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                      <FileText size={28} className="mx-auto text-slate-400" />
                      <h4 className="font-display text-base font-bold text-[#10233F]">NO QUIZZES COMPLETED YET</h4>
                      <p className="text-xs font-medium text-slate-500 max-w-sm mx-auto">
                        Your first German challenge is waiting! Complete a quiz to start building your stats and earning XP.
                      </p>
                      <div className="pt-2">
                        <Link href="/quizzes">
                          <GQButton variant="teal" size="sm" showArrow className="font-bold text-xs">
                            BROWSE QUIZZES
                          </GQButton>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Learning Progress Card (Topic Progress Breakdown) */}
              <LearningProgressCard />

              {/* Keep Going / Recommended Next Challenge Card */}
              <motion.div
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-teal-500/10 via-white to-amber-500/10 border-2 border-primary/20 shadow-[var(--gq-shadow-md)] flex flex-col sm:flex-row items-center justify-between gap-6"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 text-amber-500">
                    <Trophy size={20} className="fill-amber-400" />
                    <h3 className="font-display text-xl font-black text-[#10233F]">
                      RECOMMENDED NEXT CHALLENGE
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-[#10233F]">
                    {profile.nextChallenge.title} <span className="text-slate-600 font-normal">· {profile.nextChallenge.subtitle}</span>
                  </p>
                </div>

                <Link href={`/quizzes/${profile.nextChallenge.id}`} className="shrink-0 w-full sm:w-auto">
                  <GQButton
                    variant="teal"
                    size="lg"
                    showArrow
                    fullWidthMobile
                    className="px-6 font-bold text-sm shadow-md"
                  >
                    START QUIZ
                  </GQButton>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
