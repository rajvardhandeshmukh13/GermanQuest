"use client";

import * as React from "react";
import type { Metadata } from "next";
import { NavBar } from "@/components/germanquest";
import { Footer } from "@/components/landing";
import { Podium } from "@/components/leaderboard/podium";
import { LeaderboardList } from "@/components/leaderboard/leaderboard-list";
import {
  getMockLeaderboard,
  usePlayerStats,
  type LeaderboardPeriod,
  type LeaderboardUser,
} from "@/lib/mock-data";
import { fetchFirebaseLeaderboardUsers } from "@/lib/demo-leaderboard";
import { useAuth } from "@/components/auth/auth-provider";
import { Trophy, TrendingUp, Calendar, Zap, Flame } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { fadeInUp } from "@/lib/motion";
import { cn } from "cn";

export default function LeaderboardPage() {
  const [period, setPeriod] = React.useState<LeaderboardPeriod>("week");
  const { user, profile: authProfile, isAuthenticated } = useAuth();
  const localStats = usePlayerStats();
  const playerProfile = isAuthenticated && authProfile ? authProfile : localStats;

  const [leaderboardUsers, setLeaderboardUsers] = React.useState<LeaderboardUser[]>(() =>
    getMockLeaderboard(period)
  );
  const [calculatedRank, setCalculatedRank] = React.useState<number>(playerProfile.rank || 7);

  React.useEffect(() => {
    let isMounted = true;
    const loadLeaderboard = () => {
      fetchFirebaseLeaderboardUsers(
        {
          id: user?.uid || playerProfile.id,
          name: playerProfile.name,
          avatar: playerProfile.avatar,
          level: playerProfile.level,
          totalXP: playerProfile.totalXP,
          streak: playerProfile.currentStreak || playerProfile.streak,
        },
        period
      ).then(({ users, currentUserRank }) => {
        if (isMounted) {
          setLeaderboardUsers(users);
          setCalculatedRank(currentUserRank);
        }
      });
    };

    loadLeaderboard();
    window.addEventListener("gq_stats_updated", loadLeaderboard);

    return () => {
      isMounted = false;
      window.removeEventListener("gq_stats_updated", loadLeaderboard);
    };
  }, [user?.uid, playerProfile.id, playerProfile.totalXP, playerProfile.level, playerProfile.name, period]);

  const topThree = leaderboardUsers.slice(0, 3);
  const restRankings = leaderboardUsers.slice(3);
  const currentUserEntry = leaderboardUsers.find((u) => u.isCurrentUser || u.id === (user?.uid || playerProfile.id));

  return (
    <>
      <NavBar
        links={[
          { label: "Explore", href: "/" },
          { label: "Quizzes", href: "/quizzes" },
          { label: "Leaderboard", href: "/leaderboard", active: true },
          { label: "About", href: "/about" },
        ]}
      />

      <main className="flex-1 bg-[#F7F5EF] py-12 md:py-16">
        <div className="gq-container max-w-4xl space-y-8">
          {/* Header */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-2 text-center items-center relative"
          >
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-black uppercase tracking-wider text-amber-800">
              <Trophy size={14} className="text-amber-500 fill-amber-500" /> LEADERBOARD
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-[#10233F] tracking-tight">
              COMMUNITY RANKINGS
            </h1>

            <p className="text-body text-slate-600 max-w-lg text-base font-medium">
              See how you rank against other GermanQuest players.
            </p>

            {/* Sticker Quote */}
            <div className="absolute right-0 top-0 hidden md:block">
              <span className="inline-block font-handwriting text-base text-rose-600 rotate-[3deg] bg-white px-3.5 py-1.5 rounded-xl shadow-xs border border-rose-200">
                Lernen, Wettbewerben, Besser werden. ♡
              </span>
            </div>
          </motion.div>

          {/* User Rank Hero Banner */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="rounded-3xl p-6 sm:p-7 bg-white border border-[#10233F]/10 shadow-[var(--gq-shadow-md)] flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary text-white font-display text-2xl font-black flex items-center justify-center shadow-md shrink-0">
                #{calculatedRank || playerProfile.rank}
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                  YOUR CURRENT RANK
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-black text-[#10233F] tracking-tight flex items-center gap-2">
                  Rank #{calculatedRank || playerProfile.rank}
                  <span className="inline-flex items-center gap-0.5 text-xs font-extrabold text-emerald-700 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    <TrendingUp size={13} /> +{playerProfile.rankWeeklyChange} this week
                  </span>
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  Keep completing quizzes to climb into the top 3!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-800 font-black text-xs">
                <Zap size={14} className="text-amber-500 fill-amber-500" />
                <span>{playerProfile.xp} XP</span>
              </div>

              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-800 font-black text-xs">
                <Flame size={14} className="text-amber-500 fill-amber-500" />
                <span>{playerProfile.streak} STREAK</span>
              </div>
            </div>
          </motion.div>

          {/* Period Selector Tabs (Section 5) */}
          <div className="flex items-center justify-center">
            <div className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-card border border-[#10233F]/10 shadow-2xs">
              <button
                type="button"
                onClick={() => setPeriod("week")}
                className={cn(
                  "px-5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all",
                  period === "week"
                    ? "bg-primary text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                WEEK
              </button>
              <button
                type="button"
                onClick={() => setPeriod("month")}
                className={cn(
                  "px-5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all",
                  period === "month"
                    ? "bg-primary text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                MONTH
              </button>
              <button
                type="button"
                onClick={() => setPeriod("allTime")}
                className={cn(
                  "px-5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all",
                  period === "allTime"
                    ? "bg-primary text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                ALL TIME
              </button>
            </div>
          </div>

          {/* Animated Rankings Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={period}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-10"
            >
              {/* Top 3 Podium (Section 6) */}
              <Podium topThree={topThree} />

              {/* Ranked Players List 4-10 (Section 7 & 8) */}
              <LeaderboardList users={restRankings} currentUser={currentUserEntry} />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </>
  );
}
