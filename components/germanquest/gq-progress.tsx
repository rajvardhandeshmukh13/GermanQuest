"use client";

import * as React from "react";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import { cn } from "cn";

interface GQProgressProps {
  /** Current value (0–100) */
  value: number;
  /** Optional label displayed above the bar */
  label?: string;
  /** Whether to show the percentage value */
  showValue?: boolean;
  /** Size variant */
  size?: "sm" | "default" | "lg";
  /** Additional class names */
  className?: string;
}

/**
 * GQProgress — Extended progress bar with teal fill and optional label.
 * Built on top of shadcn Progress with GermanQuest styling.
 */
function GQProgress({
  value,
  label,
  showValue = true,
  size = "default",
  className,
}: GQProgressProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  const trackHeight = {
    sm: "[&_[data-slot=progress-track]]:h-1",
    default: "[&_[data-slot=progress-track]]:h-2",
    lg: "[&_[data-slot=progress-track]]:h-3",
  };

  return (
    <Progress
      value={clampedValue}
      className={cn(
        "w-full",
        trackHeight[size],
        /* Teal indicator fill */
        "[&_[data-slot=progress-indicator]]:bg-primary",
        "[&_[data-slot=progress-indicator]]:rounded-full",
        /* Track styling */
        "[&_[data-slot=progress-track]]:rounded-full",
        "[&_[data-slot=progress-track]]:bg-muted",
        className
      )}
    >
      {(label || showValue) && (
        <>
          {label && <ProgressLabel>{label}</ProgressLabel>}
          {showValue && (
            <ProgressValue>
              {(_formatted, v) =>
                v !== null ? `${Math.round(v)}%` : "0%"
              }
            </ProgressValue>
          )}
        </>
      )}
    </Progress>
  );
}

export { GQProgress };
export type { GQProgressProps };
