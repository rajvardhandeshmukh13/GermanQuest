"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Clock } from "lucide-react";
import { cn } from "cn";

interface QuizTimerProps {
  timeLimit: number; // 15
  questionIndex: number;
  totalQuestions?: number;
  isPaused: boolean;
  onTimeExpired: () => void;
  onTick?: (remainingSeconds: number) => void;
}

export function QuizTimer({
  timeLimit = 15,
  questionIndex,
  totalQuestions,
  isPaused,
  onTimeExpired,
  onTick,
}: QuizTimerProps) {
  const [timeLeft, setTimeLeft] = React.useState<number>(timeLimit);

  // Keep refs for callbacks to avoid re-creating intervals on prop changes
  const onTimeExpiredRef = React.useRef(onTimeExpired);
  const onTickRef = React.useRef(onTick);

  React.useEffect(() => {
    onTimeExpiredRef.current = onTimeExpired;
    onTickRef.current = onTick;
  }, [onTimeExpired, onTick]);

  // Reset timer on question change
  const prevSecondRef = React.useRef<number>(Math.ceil(timeLimit));
  React.useEffect(() => {
    setTimeLeft(timeLimit);
    prevSecondRef.current = Math.ceil(timeLimit);
  }, [questionIndex, timeLimit]);

  // Handle countdown interval
  React.useEffect(() => {
    if (isPaused || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 0.1));
    }, 100);

    return () => clearInterval(interval);
  }, [isPaused, timeLeft]);

  // Notify parent on tick change and expiration safely in useEffect
  React.useEffect(() => {
    const remainingSeconds = Math.ceil(timeLeft);
    if (remainingSeconds !== prevSecondRef.current) {
      prevSecondRef.current = remainingSeconds;
      onTickRef.current?.(remainingSeconds);
    }

    if (timeLeft <= 0) {
      onTimeExpiredRef.current?.();
    }
  }, [timeLeft]);

  const percentage = Math.max(0, (timeLeft / timeLimit) * 100);
  const remainingSeconds = Math.ceil(timeLeft);

  // Dynamic bar color based on remaining time
  const timerColorClass =
    remainingSeconds > 7
      ? "bg-primary"
      : remainingSeconds > 3
      ? "bg-amber-500"
      : "bg-rose-500";

  const textColorClass =
    remainingSeconds > 7
      ? "text-primary"
      : remainingSeconds > 3
      ? "text-amber-700"
      : "text-rose-600 font-black animate-pulse";

  const progressPercentage = totalQuestions
    ? Math.min(100, Math.max(0, ((questionIndex + 1) / totalQuestions) * 100))
    : 0;

  return (
    <div className="w-full space-y-4">
      {/* Question Progress Bar */}
      {totalQuestions && (
        <div className="w-full space-y-1.5">
          <div className="flex items-center justify-between text-xs font-extrabold text-muted-foreground uppercase tracking-wider">
            <span>QUESTION PROGRESS</span>
            <span className="text-foreground font-mono">
              {questionIndex + 1} / {totalQuestions}
            </span>
          </div>
          <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden border border-border/40 p-0.5">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Time Remaining Bar */}
      <div className="w-full space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock size={14} className={textColorClass} />
            <span>TIME REMAINING</span>
          </div>
          <span className={cn("font-mono text-sm font-extrabold", textColorClass)}>
            {remainingSeconds}s
          </span>
        </div>

        <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden border border-border/40 p-0.5">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-100 ease-linear",
              timerColorClass
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
