"use client";

import * as React from "react";
import { getCalculatedPlayerStats } from "@/lib/player-stats";

export function JourneyTimeline() {
  const profile = getCalculatedPlayerStats(typeof window !== "undefined");

  return (
    <div className="rounded-3xl p-6 bg-card border border-[#10233F]/10 space-y-4">
      <h3 className="font-display text-xl font-bold text-foreground">
        QUIZ PROGRESS
      </h3>
      <p className="text-sm text-muted-foreground">
        {profile.quizzesCompleted} of {profile.totalQuizzes} quizzes completed.
      </p>
    </div>
  );
}
