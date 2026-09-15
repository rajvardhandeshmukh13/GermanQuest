import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "cn";

type Difficulty = "easy" | "medium" | "hard";

interface DifficultyBadgeProps extends React.ComponentProps<"span"> {
  /** The difficulty level */
  difficulty: Difficulty;
}

const difficultyConfig: Record<
  Difficulty,
  { label: string; className: string }
> = {
  easy: {
    label: "Easy",
    className:
      "bg-gq-success/15 text-gq-success border-gq-success/25 hover:bg-gq-success/20",
  },
  medium: {
    label: "Medium",
    className:
      "bg-secondary/15 text-secondary border-secondary/25 hover:bg-secondary/20",
  },
  hard: {
    label: "Hard",
    className:
      "bg-destructive/15 text-destructive border-destructive/25 hover:bg-destructive/20",
  },
};

/**
 * DifficultyBadge — Color-coded badge for quiz difficulty levels.
 * Easy = green, Medium = yellow, Hard = red.
 */
function DifficultyBadge({
  difficulty,
  className,
  ...props
}: DifficultyBadgeProps) {
  const config = difficultyConfig[difficulty];

  return (
    <Badge
      variant="outline"
      className={cn(
        "border font-semibold text-xs px-2.5 py-0.5",
        config.className,
        className
      )}
      {...props}
    >
      {config.label}
    </Badge>
  );
}

export { DifficultyBadge };
export type { DifficultyBadgeProps, Difficulty };
