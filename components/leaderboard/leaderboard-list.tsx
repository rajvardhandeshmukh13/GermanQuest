"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Flame, Zap, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { staggerContainer, staggerItem } from "@/lib/motion";
import type { LeaderboardUser } from "@/lib/mock-data";
import { cn } from "cn";

interface LeaderboardListProps {
  users: LeaderboardUser[];
  currentUser?: LeaderboardUser;
}

export function LeaderboardList({ users, currentUser }: LeaderboardListProps) {
  const getInitials = (name: string) =>
    name
      .replace("(YOU)", "")
      .trim()
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2);

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-2.5"
      >
        {users.map((user) => {
          const isUser = user.isCurrentUser;

          return (
            <motion.div
              key={user.id}
              variants={staggerItem}
              className={cn(
                "p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between gap-3 transition-all",
                isUser
                  ? "bg-primary/10 border-2 border-primary shadow-sm font-bold ring-2 ring-primary/10"
                  : "bg-card border-[#10233F]/8 hover:border-primary/30 shadow-2xs"
              )}
            >
              {/* Rank + Avatar + Name */}
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={cn(
                    "w-7 text-center font-display text-sm sm:text-base font-black shrink-0",
                    isUser ? "text-primary" : "text-muted-foreground font-bold"
                  )}
                >
                  #{user.rank}
                </span>

                <Avatar className="w-10 h-10 border border-border shrink-0">
                  <AvatarFallback className={isUser ? "bg-primary text-white font-bold" : "bg-muted font-semibold"}>
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="font-display text-sm sm:text-base font-extrabold text-foreground truncate">
                      {user.name}
                    </p>
                    {isUser && (
                      <span className="px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-wider">
                        YOU
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    Level {user.level}
                  </span>
                </div>
              </div>

              {/* XP + Streak */}
              <div className="flex items-center gap-3 sm:gap-6 shrink-0">
                <div className="flex items-center gap-1 text-xs sm:text-sm font-black text-amber-700">
                  <Zap size={14} className="text-amber-500 fill-amber-500 shrink-0" />
                  <span>{user.xp.toLocaleString()} XP</span>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                  <Flame size={12} className="text-amber-500 fill-amber-500 shrink-0" />
                  <span>{user.streak}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Sticky User Position Indicator Card (Section 8) */}
      {currentUser && (
        <div className="sticky bottom-4 z-30 pt-2">
          <div className="p-4 rounded-2xl bg-card border-2 border-primary shadow-xl flex items-center justify-between gap-4 max-w-3xl mx-auto backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary text-white font-black flex items-center justify-center font-display text-base shadow-xs shrink-0">
                #{currentUser.rank}
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                  YOUR POSITION
                </span>
                <h4 className="font-display text-base font-extrabold text-foreground">
                  {currentUser.name.replace("(YOU)", "").trim()}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-sm font-black text-amber-800">
                <Zap size={15} className="text-amber-500 fill-amber-500" />
                <span>{currentUser.xp.toLocaleString()} XP</span>
              </div>
              <div className="flex items-center gap-1 text-xs font-extrabold text-amber-700">
                <Flame size={13} className="text-amber-500 fill-amber-500" />
                <span>{currentUser.streak} day streak</span>
              </div>
              <Link href="/profile" className="hidden sm:inline-block text-xs font-bold text-primary underline">
                View Profile
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
