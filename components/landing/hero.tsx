"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { GQButton } from "@/components/germanquest";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { Sparkles, Users, TrendingUp, Gamepad2 } from "lucide-react";

/**
 * Hero — GermanQuest Landing Hero (Final Visual Refinement).
 * Preserves warm cream background (#F7F5EF), navy typography (#10233F),
 * teal/gold accents, and 3D German Learner card while optimizing vertical proportions,
 * spacing rhythm, first-viewport fit, image visibility, and UI floating elements.
 */
export function Hero() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-[#F7F5EF] text-[#10233F] pt-14 pb-14 lg:pt-[76px] lg:pb-[76px]"
      aria-label="Hero"
    >
      {/* Ambient background glow */}
      <div
        className="pointer-events-none absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full opacity-[0.06]"
        style={{
          background:
            "radial-gradient(circle, #08AEB5 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="gq-container max-w-[1280px] relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[48%_52%] gap-10 lg:gap-14 items-center">
          
          {/* Left Column — Content, CTAs & Compact Benefits */}
          <motion.div
            className="flex flex-col max-w-[580px]"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Eyebrow Pill */}
            <motion.div variants={staggerItem} className="flex items-center mb-6">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#08AEB5]/10 border border-[#08AEB5]/20 text-[#08AEB5] text-xs font-black tracking-wider uppercase shadow-2xs">
                <Sparkles size={13} className="text-[#08AEB5]" />
                EINE REISE. EIN SPIEL. DEUTSCH LERNEN.
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={staggerItem}
              className="font-display text-[clamp(3.25rem,4.8vw,4.75rem)] font-extrabold leading-[0.98] tracking-[-0.02em] text-[#10233F] mb-7"
            >
              LEARN GERMAN.
              <br />
              <span className="text-[#F5B82E]">PLAY THE QUEST.</span>
              <br />
              CONQUER YOUR
              <br />
              GOALS.
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={staggerItem}
              className="text-base sm:text-lg lg:text-[19px] text-[#10233F]/80 max-w-[580px] leading-[1.55] font-semibold mb-7"
            >
              Build real German skills through interactive quizzes, live
              challenges and friendly competition.
            </motion.p>

            {/* Primary & Secondary CTAs */}
            <motion.div
              variants={staggerItem}
              className="flex flex-wrap items-center gap-3.5 mb-8"
            >
              <Link href="/quizzes" className="w-full sm:w-auto">
                <GQButton
                  variant="teal"
                  showArrow
                  size="lg"
                  className="px-7 h-[50px] shadow-md font-extrabold text-base w-full sm:w-auto bg-[#08AEB5] text-white hover:bg-[#07999F]"
                >
                  START YOUR QUEST
                </GQButton>
              </Link>
              <GQButton
                variant="outline"
                size="lg"
                className="w-full sm:w-auto h-[50px] bg-white hover:bg-slate-50 text-[#10233F] border-slate-300 font-extrabold text-base shadow-2xs px-6"
                onClick={() => {
                  document
                    .getElementById("how-it-works")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                HOW IT WORKS
              </GQButton>
            </motion.div>

            {/* Benefits Row */}
            <motion.div
              variants={staggerItem}
              aria-label="Key Benefits"
              className="pt-6 border-t border-[#10233F]/10 grid grid-cols-1 sm:grid-cols-3 gap-3"
            >
              {[
                { icon: Gamepad2, label: "Fun & Interactive", color: "text-[#08AEB5] bg-[#08AEB5]/10 border-[#08AEB5]/20" },
                { icon: Users, label: "Play Solo or Live", color: "text-[#F5B82E] bg-amber-500/10 border-amber-500/20" },
                { icon: TrendingUp, label: "Track Your Progress", color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" },
              ].map(({ icon: Icon, label, color }) => (
                <div
                  key={label}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/80 border border-[#10233F]/8 shadow-2xs hover:bg-white transition-colors"
                >
                  <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${color}`}>
                    <Icon size={14} />
                  </div>
                  <span className="font-display text-xs font-extrabold text-[#10233F] leading-tight">{label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Column — 3D German Learner Card + Subtle Floating Badges */}
          <motion.div
            className="relative flex items-center justify-center lg:justify-end w-full"
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            {/* Outer White Card Container */}
            <div className="relative w-full max-w-[580px] rounded-[28px] sm:rounded-[32px] p-3.5 sm:p-4 bg-white border border-[#10233F]/10 shadow-[0_20px_50px_-15px_rgba(16,35,63,0.12)]">
              
              {/* Floating Element 1: Top-Left Hallo! */}
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                className="absolute -top-3.5 left-4 sm:left-6 z-20 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#10233F]/10 shadow-md text-xs font-black text-[#10233F] pointer-events-none select-none"
              >
                <span className="text-amber-500 text-sm">👋</span>
                <span>Hallo!</span>
              </motion.div>

              {/* Floating Element 2: Top-Right Wie geht's? */}
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.45, duration: 0.4 }}
                className="absolute -top-3.5 right-4 sm:right-6 z-20 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#10233F]/10 shadow-md text-xs font-black text-[#10233F] pointer-events-none select-none"
              >
                <span className="text-[#08AEB5] text-sm">💬</span>
                <span>Wie geht&apos;s?</span>
              </motion.div>

              {/* Floating Element 3: Bottom-Left +50 XP */}
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.55, duration: 0.4 }}
                className="absolute -bottom-3.5 left-4 sm:left-6 z-20 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#10233F]/10 shadow-md text-xs font-black text-[#10233F] pointer-events-none select-none"
              >
                <span className="text-amber-500 text-xs">⚡</span>
                <span className="text-[#F5B82E] font-black">+50 XP</span>
              </motion.div>

              {/* Floating Element 4: Bottom-Right Level Up! */}
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.65, duration: 0.4 }}
                className="absolute -bottom-3.5 right-4 sm:right-6 z-20 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#10233F]/10 shadow-md text-xs font-black text-[#10233F] pointer-events-none select-none"
              >
                <span className="text-amber-500 text-xs">🏆</span>
                <span>Level Up!</span>
              </motion.div>

              {/* Inner Image Frame */}
              <div className="relative w-full aspect-[1.16/1] rounded-[20px] sm:rounded-[24px] overflow-hidden bg-slate-50">
                <Image
                  src="/hero_3d_german_learner.png"
                  alt="GermanQuest 3D Learner"
                  width={700}
                  height={595}
                  className="w-full h-full object-cover object-[center_32%]"
                  priority
                />
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

