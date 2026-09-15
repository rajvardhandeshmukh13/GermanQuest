"use client";

import * as React from "react";
import { Users, Hash, Radio } from "lucide-react";
import { LiveTimer } from "./live-timer";

interface LiveHeaderProps {
  pin: string;
  currentQuestion?: number;
  totalQuestions?: number;
  playerCount: number;
  showTimer?: boolean;
  timeRemaining?: number;
  onTimeUp?: () => void;
  isPaused?: boolean;
  role?: "host" | "player";
}

export function LiveHeader({
  pin,
  currentQuestion,
  totalQuestions,
  playerCount,
  showTimer = false,
  timeRemaining = 15,
  onTimeUp,
  isPaused = false,
  role = "player",
}: LiveHeaderProps) {
  const formattedPin = pin ? pin.replace(/(\d{3})(\d{3})/, "$1 $2") : pin;

  return (
    <header className="w-full bg-card border-b border-[#10233F]/10 py-3.5 px-4 sm:px-6 shadow-2xs sticky top-0 z-40">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Brand / Live Tag */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-700 text-xs font-black uppercase tracking-wider">
            <Radio size={14} className="animate-pulse text-rose-600" />
            <span>LIVE</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-xs font-black text-foreground uppercase tracking-wider">
            <span className="font-display font-extrabold text-primary">
              GermanQuest
            </span>
            <span className="text-muted-foreground">• {role.toUpperCase()}</span>
          </div>
        </div>

        {/* Center: Question indicator or Lobby title */}
        {currentQuestion !== undefined && totalQuestions !== undefined ? (
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-black uppercase tracking-widest text-primary">
            QUESTION {currentQuestion} / {totalQuestions}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs font-black text-foreground uppercase tracking-widest">
            <Hash size={14} className="text-primary" />
            <span>GAME PIN:</span>
            <span className="font-mono text-base font-extrabold text-primary tracking-wider">
              {formattedPin}
            </span>
          </div>
        )}

        {/* Right: Timer & Player Count */}
        <div className="flex items-center gap-3">
          {showTimer && (
            <LiveTimer
              initialSeconds={timeRemaining}
              onTimeUp={onTimeUp}
              isPaused={isPaused}
            />
          )}

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/60 border border-border/50 text-xs font-extrabold text-foreground">
            <Users size={14} className="text-primary" />
            <span>{playerCount}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
