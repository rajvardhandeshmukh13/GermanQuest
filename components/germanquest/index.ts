/**
 * GermanQuest Component Library
 *
 * Barrel export for all GermanQuest-specific UI components.
 * Import from "@/components/germanquest" for clean imports.
 */

// Layout & Navigation
export { NavBar } from "./nav-bar";
export type { NavBarProps, NavLink } from "./nav-bar";

export { SectionHeading } from "./section-heading";
export type { SectionHeadingProps } from "./section-heading";

// Cards
export { GQCard } from "./gq-card";
export type { GQCardProps, GQCardVariant } from "./gq-card";

export { QuizCard } from "./quiz-card";
export type { QuizCardProps } from "./quiz-card";

// Badges
export { DifficultyBadge } from "./difficulty-badge";
export type { DifficultyBadgeProps, Difficulty } from "./difficulty-badge";

// Gamification Indicators
export { XPIndicator } from "./xp-indicator";
export type { XPIndicatorProps } from "./xp-indicator";

export { StreakIndicator } from "./streak-indicator";
export type { StreakIndicatorProps } from "./streak-indicator";

// Extended Primitives
export { GQButton } from "./gq-button";
export type { GQButtonProps, GQButtonVariant, GQButtonSize } from "./gq-button";

export { GQProgress } from "./gq-progress";
export type { GQProgressProps } from "./gq-progress";

// Motion Presets (re-exported for convenience)
export {
  fadeInUp,
  fadeIn,
  scaleIn,
  slideDown,
  staggerContainer,
  staggerItem,
  cardHover,
  buttonPress,
  arrowNudge,
  springTransition,
  gentleSpring,
  quickEase,
  moderateEase,
  reducedMotionVariants,
} from "@/lib/motion";
