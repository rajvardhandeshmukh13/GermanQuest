"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { cn } from "cn";
import { ArrowRight } from "lucide-react";
import { buttonPress, arrowNudge, springTransition } from "@/lib/motion";

type GQButtonVariant = "teal" | "gold" | "navy" | "ghost" | "outline";
type GQButtonSize = "sm" | "default" | "lg";

interface GQButtonProps
  extends Omit<React.ComponentProps<typeof Button>, "variant" | "size"> {
  /** GermanQuest-specific button variant */
  variant?: GQButtonVariant;
  /** Button size */
  size?: GQButtonSize;
  /** Show a trailing arrow icon with hover animation */
  showArrow?: boolean;
  /** Custom trailing icon (overrides showArrow) */
  icon?: React.ReactNode;
  /** Full width on mobile */
  fullWidthMobile?: boolean;
}

const variantClasses: Record<GQButtonVariant, string> = {
  teal: cn(
    "bg-primary text-primary-foreground",
    "hover:bg-[oklch(0.58_0.14_195)]",
    "gq-glow-teal",
    "border-primary/20"
  ),
  gold: cn(
    "bg-secondary text-secondary-foreground font-semibold",
    "hover:bg-[oklch(0.75_0.15_85)]",
    "border-secondary/20"
  ),
  navy: cn(
    "bg-navy-900 text-white font-medium",
    "hover:bg-navy-800",
    "border-navy-700/30 shadow-sm"
  ),
  ghost: cn(
    "bg-transparent text-foreground",
    "hover:bg-accent hover:text-accent-foreground",
    "border-transparent"
  ),
  outline: cn(
    "bg-card text-foreground",
    "border border-foreground/15 hover:bg-muted/50 hover:border-foreground/30 shadow-xs"
  ),
};

const sizeMap: Record<GQButtonSize, "sm" | "default" | "lg"> = {
  sm: "sm",
  default: "default",
  lg: "lg",
};

/**
 * GQButton — GermanQuest-styled button with motion feedback.
 *
 * Features:
 * - Teal/gold/navy/ghost/outline variants
 * - Subtle scale animation on press via Motion
 * - Optional trailing arrow icon with nudge-right on hover
 * - Size passthrough to shadcn Button
 *
 * Usage:
 * ```tsx
 * <GQButton showArrow>START QUEST</GQButton>
 * <GQButton variant="gold" size="lg">Earn XP</GQButton>
 * ```
 */
function GQButton({
  variant = "teal",
  size = "default",
  showArrow = false,
  icon,
  fullWidthMobile = false,
  className,
  children,
  ...props
}: GQButtonProps) {
  const trailingIcon = icon ?? (showArrow ? <ArrowRight size={16} /> : null);

  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      variants={buttonPress}
      transition={springTransition}
      className={cn(
        "inline-flex",
        fullWidthMobile && "w-full sm:w-auto"
      )}
    >
      <Button
        size={sizeMap[size]}
        className={cn(
          "text-button transition-colors gap-2",
          variantClasses[variant],
          fullWidthMobile && "w-full sm:w-auto",
          className
        )}
        {...props}
      >
        {children}
        {trailingIcon && (
          <motion.span
            variants={arrowNudge}
            transition={springTransition}
            className="inline-flex"
            aria-hidden="true"
          >
            {trailingIcon}
          </motion.span>
        )}
      </Button>
    </motion.div>
  );
}

export { GQButton };
export type { GQButtonProps, GQButtonVariant, GQButtonSize };
