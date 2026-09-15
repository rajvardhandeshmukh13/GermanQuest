"use client";

import * as React from "react";
import { Flame } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "cn";

interface StreakIndicatorProps extends React.ComponentProps<"div"> {
  /** Current streak count (days) */
  value: number;
  /** Size variant */
  size?: "sm" | "default" | "lg";
  /** Show the label */
  showLabel?: boolean;
  /** Whether the streak is currently active (shows pulse animation) */
  active?: boolean;
}

/**
 * StreakIndicator — Displays streak count with a flame icon.
 * Uses the warm --gq-streak color. Pulses when active.
 */
function StreakIndicator({
  value,
  size = "default",
  showLabel = true,
  active = true,
  className,
  ...props
}: StreakIndicatorProps) {
  const sizeClasses = {
    sm: "text-xs gap-1",
    default: "text-sm gap-1.5",
    lg: "text-base gap-2",
  };

  const iconSize = {
    sm: 12,
    default: 14,
    lg: 18,
  };

  return (
    <div
      data-slot="streak-indicator"
      className={cn(
        "inline-flex items-center font-semibold tabular-nums",
        sizeClasses[size],
        className
      )}
      style={{ color: "var(--gq-streak)" }}
      {...props}
    >
      <motion.div
        animate={
          active && value > 0
            ? {
                scale: [1, 1.15, 1],
              }
            : undefined
        }
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Flame
          size={iconSize[size]}
          className="fill-current"
          aria-hidden="true"
        />
      </motion.div>
      <span>{value}</span>
      {showLabel && (
        <span className="text-muted-foreground font-medium">
          {value === 1 ? "day" : "days"}
        </span>
      )}
    </div>
  );
}

export { StreakIndicator };
export type { StreakIndicatorProps };
