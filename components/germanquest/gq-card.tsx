"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { motion } from "motion/react";
import { cn } from "cn";
import { cardHover, springTransition } from "@/lib/motion";

type GQCardVariant = "surface" | "glass" | "flat";

interface GQCardProps extends React.ComponentProps<"div"> {
  /** Visual style variant */
  variant?: GQCardVariant;
  /** Enable hover lift + shadow transition */
  interactive?: boolean;
  /** Padding size */
  padding?: "none" | "sm" | "default" | "lg";
}

const variantClasses: Record<GQCardVariant, string> = {
  surface: cn(
    "bg-card text-card-foreground",
    "ring-1 ring-foreground/[0.08]",
    "shadow-[var(--gq-shadow-card)]"
  ),
  glass: cn(
    "gq-glass text-foreground",
    "ring-1 ring-foreground/[0.08]",
    "shadow-[var(--gq-shadow-md)]"
  ),
  flat: cn(
    "bg-muted/60 text-foreground",
    "ring-0",
    "shadow-none"
  ),
};

const paddingClasses = {
  none: "p-0",
  sm: "p-3",
  default: "p-5",
  lg: "p-7",
};

/**
 * GQCard — Premium reusable card with consistent surface treatment.
 * Extends shadcn Card with GermanQuest-specific variants and
 * optional interactive hover animation via Motion.
 *
 * Variants:
 * - `surface` — White card on dark backgrounds (default)
 * - `glass`  — Glassmorphism backdrop on dark backgrounds
 * - `flat`   — No shadow, muted background
 */
function GQCard({
  variant = "surface",
  interactive = false,
  padding = "default",
  className,
  children,
  ...props
}: GQCardProps) {
  const cardContent = (
    <Card
      className={cn(
        "overflow-hidden rounded-2xl",
        variantClasses[variant],
        paddingClasses[padding],
        interactive && "gq-card-interactive cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </Card>
  );

  if (interactive) {
    return (
      <motion.div
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        variants={cardHover}
        transition={springTransition}
      >
        {cardContent}
      </motion.div>
    );
  }

  return cardContent;
}

export { GQCard };
export type { GQCardProps, GQCardVariant };
