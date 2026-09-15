"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { BookOpen, Users, ArrowRight, ArrowDown } from "lucide-react";
import { GQButton } from "@/components/germanquest";
import { fadeInUp } from "@/lib/motion";

export function ModeSelector() {
  const [selectedMode, setSelectedMode] = React.useState<"practice" | "live">(
    "practice"
  );

  const scrollToGrid = () => {
    const grid = document.getElementById("quiz-grid");
    if (grid) {
      grid.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 gap-5"
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
    >
      {/* Mode 1: PRACTICE (Default) */}
      <div
        onClick={() => setSelectedMode("practice")}
        className={`relative rounded-3xl p-6 md:p-7 border transition-all cursor-pointer flex flex-col justify-between ${
          selectedMode === "practice"
            ? "bg-card border-primary ring-2 ring-primary/15 shadow-[var(--gq-shadow-md)]"
            : "bg-card/70 border-[#10233F]/8 hover:border-primary/40 shadow-xs"
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-primary">
            <BookOpen size={24} />
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider">
            PRIMARY MODE
          </span>
        </div>

        <div>
          <h2 className="font-display text-2xl font-extrabold text-foreground mb-1 tracking-tight">
            PRACTICE
          </h2>
          <p className="text-small text-muted-foreground leading-relaxed font-medium mb-6">
            Practice German at your own pace. Choose a topic and test your
            knowledge.
          </p>
        </div>

        <div>
          <GQButton
            variant="teal"
            size="default"
            onClick={(e) => {
              e.stopPropagation();
              scrollToGrid();
            }}
            icon={<ArrowDown size={16} />}
          >
            EXPLORE QUIZZES
          </GQButton>
        </div>
      </div>

      {/* Mode 2: LIVE CHALLENGE */}
      <div
        onClick={() => setSelectedMode("live")}
        className={`relative rounded-3xl p-6 md:p-7 border transition-all cursor-pointer flex flex-col justify-between ${
          selectedMode === "live"
            ? "bg-card border-secondary ring-2 ring-secondary/20 shadow-[var(--gq-shadow-md)]"
            : "bg-card/70 border-[#10233F]/8 hover:border-secondary/50 shadow-xs"
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-700">
            <Users size={24} />
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
            MULTIPLAYER
          </span>
        </div>

        <div>
          <h2 className="font-display text-2xl font-extrabold text-foreground mb-1 tracking-tight">
            LIVE CHALLENGE
          </h2>
          <p className="text-small text-muted-foreground leading-relaxed font-medium mb-6">
            Compete with classmates in a live GermanQuest game. Join using a
            game PIN.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/live/join">
            <GQButton
              variant="gold"
              size="default"
              icon={<ArrowRight size={16} />}
            >
              JOIN LIVE GAME
            </GQButton>
          </Link>
          <Link href="/live/host">
            <GQButton
              variant="outline"
              size="default"
              icon={<Users size={16} />}
            >
              HOST GAME
            </GQButton>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
