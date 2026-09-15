"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Zap, Award } from "lucide-react";

interface XPCountUpProps {
  targetXp: number;
  isPersonalBest?: boolean;
}

export function XPCountUp({ targetXp, isPersonalBest = true }: XPCountUpProps) {
  const [displayXp, setDisplayXp] = React.useState(0);

  React.useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setDisplayXp(targetXp);
      return;
    }

    let startTimestamp: number | null = null;
    const duration = 800; // ms

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayXp(Math.floor(easedProgress * targetXp));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    const animId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animId);
  }, [targetXp]);

  return (
    <div className="relative rounded-3xl p-8 md:p-10 bg-card border border-[#10233F]/10 shadow-[var(--gq-shadow-lg)] text-center flex flex-col items-center justify-center overflow-hidden">
      {/* Decorative background ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, oklch(0.75 0.18 75 / 25%) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Personal Best Badge */}
      {isPersonalBest && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mb-4 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-800 font-extrabold text-xs tracking-wider uppercase shadow-xs"
        >
          <Award size={14} className="text-amber-500 fill-amber-500" />
          <span>🏆 NEW PERSONAL BEST!</span>
        </motion.div>
      )}

      {/* XP Focal Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-600 shadow-sm mb-4"
      >
        <Zap size={36} className="fill-amber-500 text-amber-500" />
      </motion.div>

      {/* Main Animated XP Number */}
      <div className="space-y-1">
        <p className="font-display text-5xl sm:text-6xl lg:text-7xl font-black text-amber-800 tracking-tight leading-none">
          +{displayXp} XP
        </p>
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground pt-1">
          TOTAL XP EARNED
        </p>
      </div>
    </div>
  );
}
