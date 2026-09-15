/**
 * GermanQuest — Shared Motion Presets
 *
 * Reusable animation variants and transitions for Motion (React).
 * Import from "@/lib/motion" for consistent, purposeful animations.
 *
 * Principles:
 * - Purposeful: every animation serves a UX goal
 * - Fast: 150–250ms for UI transitions
 * - Subtle: never gratuitous
 * - Accessible: respect prefers-reduced-motion
 */

import type { Variants, Transition } from "motion/react";

/* ==========================================================
   TRANSITIONS
   ========================================================== */

/** Snappy spring for interactive feedback (buttons, cards) */
export const springTransition: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 25,
};

/** Gentle spring for entrances */
export const gentleSpring: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 30,
};

/** Quick ease-out for UI micro-interactions */
export const quickEase: Transition = {
  duration: 0.2,
  ease: [0.16, 1, 0.3, 1],
};

/** Moderate ease for page-level transitions */
export const moderateEase: Transition = {
  duration: 0.35,
  ease: [0.65, 0, 0.35, 1],
};

/* ==========================================================
   VARIANTS — Page & Section Entrances
   ========================================================== */

/** Fade up — standard entrance for sections, cards, content blocks */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
};

/** Fade in — subtle reveal without translation */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

/** Scale in — for modals, popovers, dialogs */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

/** Slide down — for dropdown menus, mobile nav */
export const slideDown: Variants = {
  hidden: { height: 0, opacity: 0 },
  visible: {
    height: "auto",
    opacity: 1,
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

/* ==========================================================
   VARIANTS — Staggered Lists
   ========================================================== */

/** Container that staggers its children */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

/** Each child in a stagger group */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
};

/* ==========================================================
   VARIANTS — Interactive Micro-animations
   ========================================================== */

/** Card hover — subtle lift with shadow change */
export const cardHover = {
  rest: { y: 0, scale: 1 },
  hover: { y: -4, scale: 1 },
  tap: { y: 0, scale: 0.99 },
};

/** Button press feedback */
export const buttonPress = {
  rest: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.97 },
};

/** Arrow nudge — for CTA arrows that shift right on hover */
export const arrowNudge = {
  rest: { x: 0 },
  hover: { x: 4 },
};

/** Horizontal shake animation for incorrect answer option */
export const shakeVariant: Variants = {
  idle: { x: 0 },
  shake: {
    x: [0, -6, 6, -4, 4, -2, 2, 0],
    transition: { duration: 0.35, ease: "easeInOut" },
  },
};

/** Horizontal slide transition for question change (250ms responsive) */
export const slideQuestion: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

/** Floating XP gain badge animation */
export const xpFloat: Variants = {
  initial: { opacity: 0, y: 10, scale: 0.8 },
  animate: {
    opacity: [0, 1, 1, 0],
    y: [10, -12, -22, -28],
    scale: [0.8, 1.1, 1, 0.9],
    transition: { duration: 1.2, times: [0, 0.2, 0.7, 1], ease: "easeOut" },
  },
};

/* ==========================================================
   UTILITIES
   ========================================================== */

/**
 * Returns empty variants when the user prefers reduced motion.
 * Use in components that check `window.matchMedia`.
 *
 * For CSS-level support, the `prefers-reduced-motion` media query
 * in globals.css handles transition/animation durations globally.
 */
export const reducedMotionVariants: Variants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
};
