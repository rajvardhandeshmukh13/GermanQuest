"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { cn } from "cn";

interface XPIndicatorProps extends React.ComponentProps<"div"> {
  /** Current XP value */
  value: number;
  /** Whether to animate the count on mount */
  animated?: boolean;
  /** Size variant */
  size?: "sm" | "default" | "lg";
  /** Show the label "XP" */
  showLabel?: boolean;
}

/**
 * XPIndicator — Displays XP count with a star icon.
 * Uses the golden --gq-xp color. Optionally animates on mount.
 */
function XPIndicator({
  value,
  animated = true,
  size = "default",
  showLabel = true,
  className,
  ...props
}: XPIndicatorProps) {
  const motionValue = useMotionValue(0);
  const displayValue = useTransform(motionValue, (v) =>
    Math.round(v).toLocaleString()
  );

  React.useEffect(() => {
    if (animated) {
      const controls = animate(motionValue, value, {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      });
      return () => controls.stop();
    } else {
      motionValue.set(value);
    }
  }, [value, animated, motionValue]);

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
      data-slot="xp-indicator"
      className={cn(
        "inline-flex items-center font-semibold tabular-nums",
        sizeClasses[size],
        className
      )}
      style={{ color: "var(--gq-xp)" }}
      {...props}
    >
      <Star
        size={iconSize[size]}
        className="fill-current"
        aria-hidden="true"
      />
      <motion.span>{displayValue}</motion.span>
      {showLabel && (
        <span className="text-muted-foreground font-medium">XP</span>
      )}
    </div>
  );
}

export { XPIndicator };
export type { XPIndicatorProps };
