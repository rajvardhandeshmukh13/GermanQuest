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
  const hasTriggeredRef = React.useRef(false);

  React.useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  React.useEffect(() => {
    setTimeLeft(initialSeconds);
    hasTriggeredRef.current = false;
  }, [initialSeconds]);

  React.useEffect(() => {
    if (isPaused || timeLeft <= 0) {
      if (timeLeft <= 0 && !hasTriggeredRef.current) {
        hasTriggeredRef.current = true;
        if (onTimeUpRef.current) {
          onTimeUpRef.current();
        }
      }
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearTimeout(timer);
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
