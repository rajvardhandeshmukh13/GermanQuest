import * as React from "react";
import { cn } from "cn";

type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

interface SectionHeadingProps extends React.ComponentProps<"div"> {
  /** The heading text */
  title: string;
  /** Optional subtitle / description below the heading */
  subtitle?: string;
  /** Semantic heading level — defaults to h2 */
  as?: HeadingLevel;
  /** Optional action element (button, link, etc.) rendered to the right */
  action?: React.ReactNode;
  /** Center-align the heading */
  centered?: boolean;
}

/**
 * SectionHeading — A reusable heading block for page sections.
 * Uses the display font (Space Grotesk) with consistent spacing
 * and an optional subtitle + action slot.
 */
function SectionHeading({
  title,
  subtitle,
  as: Tag = "h2",
  action,
  centered = false,
  className,
  ...props
}: SectionHeadingProps) {
  return (
    <div
      data-slot="section-heading"
      className={cn(
        "flex flex-col gap-2",
        centered && "items-center text-center",
        !centered && action && "sm:flex-row sm:items-end sm:justify-between",
        className
      )}
      {...props}
    >
      <div className={cn("flex flex-col gap-1", centered && "items-center")}>
        <Tag className="text-section-heading text-foreground">{title}</Tag>
        {subtitle && (
          <p className="text-small text-muted-foreground max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export { SectionHeading };
export type { SectionHeadingProps };
