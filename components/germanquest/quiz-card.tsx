"use client";

import * as React from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { DifficultyBadge, type Difficulty } from "./difficulty-badge";
import { XPIndicator } from "./xp-indicator";
import { GQButton } from "./gq-button";
import { motion } from "motion/react";
import { cn } from "cn";
import { cardHover, springTransition } from "@/lib/motion";

interface QuizCardProps extends React.ComponentProps<"div"> {
  /** Quiz title */
  title: string;
  /** Quiz description */
  description: string;
  /** Number of questions */
  questionCount: number;
  /** Difficulty level */
  difficulty: Difficulty;
  /** XP reward */
  xpReward: number;
  /** Image URL for the card header */
  imageSrc?: string;
  /** Image alt text */
  imageAlt?: string;
  /** CTA button label */
  ctaLabel?: string;
  /** Click handler */
  onPlay?: () => void;
}

/**
 * QuizCard — Premium card for quiz selection with image, metadata,
 * and interactive hover effects. Features subtle elevation on hover,
 * image zoom, and a "Play Now →" CTA button.
 */
function QuizCard({
  title,
  description,
  questionCount,
  difficulty,
  xpReward,
  imageSrc,
  imageAlt = "",
  ctaLabel = "Play Now",
  onPlay,
  className,
  ...props
}: QuizCardProps) {
  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      variants={cardHover}
      transition={springTransition}
    >
      <Card
        className={cn(
          "overflow-hidden cursor-pointer gq-card-interactive group/quiz",
          "bg-card border-0 ring-1 ring-foreground/[0.06]",
          className
        )}
        onClick={onPlay}
        role={onPlay ? "button" : undefined}
        tabIndex={onPlay ? 0 : undefined}
        onKeyDown={(e) => {
          if (onPlay && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onPlay();
          }
        }}
        {...props}
      >
        {/* Image area */}
        {imageSrc && (
          <div className="relative aspect-[16/10] overflow-hidden">
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              className="object-cover transition-transform duration-300 ease-out group-hover/quiz:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {/* Subtle gradient overlay at bottom */}
            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        )}

        {/* Content */}
        <CardHeader className="pb-1">
          <CardTitle className="text-card-heading text-card-foreground">
            {title}
          </CardTitle>
          <CardDescription className="text-small line-clamp-2">
            {description}
          </CardDescription>
        </CardHeader>

        {/* CTA Button */}
        <CardContent className="pt-2 pb-0">
          <GQButton
            showArrow
            fullWidthMobile
            className="w-full"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
          >
            {ctaLabel}
          </GQButton>
        </CardContent>

        {/* Footer with difficulty + XP + question count */}
        <CardFooter className="flex items-center justify-between border-t-0 bg-transparent pt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <DifficultyBadge difficulty={difficulty} />
            <span className="text-metadata">
              {questionCount} {questionCount === 1 ? "Q" : "Qs"}
            </span>
          </div>
          <XPIndicator value={xpReward} animated={false} size="sm" />
        </CardFooter>
      </Card>
    </motion.div>
  );
}

export { QuizCard };
export type { QuizCardProps };
