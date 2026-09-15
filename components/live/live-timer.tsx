"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { cn } from "cn";

interface LiveTimerProps {
  initialSeconds?: number;
  onTimeUp?: () => void;
  isPaused?: boolean;
}

export function LiveTimer({
  initialSeconds = 15,
  onTimeUp,
  isPaused = false,
}: LiveTimerProps) {
  const [timeLeft, setTimeLeft] = React.useState(initialSeconds);
  const onTimeUpRef = React.useRef(onTimeUp);

  React.useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  React.useEffect(() => {
    setTimeLeft(initialSeconds);
  }, [initialSeconds]);

  React.useEffect(() => {
    if (isPaused || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onTimeUpRef.current) {
            onTimeUpRef.current();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, timeLeft]);

  const isUrgent = timeLeft <= 5;
  const isCritical = timeLeft <= 3;

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-2xl font-mono text-lg font-black transition-all shadow-xs border",
        isCritical
          ? "bg-rose-500/20 border-rose-500 text-rose-700 animate-pulse ring-4 ring-rose-500/10"
          : isUrgent
          ? "bg-amber-500/20 border-amber-500 text-amber-800"
          : "bg-teal-500/15 border-teal-500/30 text-teal-900"
      )}
    >
      <Clock
        size={20}
        className={cn(
          isCritical ? "text-rose-600 animate-bounce" : "text-primary"
        )}
      />
      <span>{timeLeft}s</span>
    </div>
  );
}
