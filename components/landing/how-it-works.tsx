"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "cn";
import { SectionHeading } from "@/components/germanquest";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { Compass, Gamepad2, Trophy } from "lucide-react";

/* ── Step data ──────────────────────────────────────────── */
interface Step {
  number: string;
  title: string;
  description: string;
  icon: React.ElementType;
  /** Tint color for icon bg */
  tint: string;
}

const steps: Step[] = [
  {
    number: "01",
    title: "CHOOSE",
    description: "Pick a German challenge from a wide range of topic levels.",
    icon: Compass,
    tint: "bg-teal-500/10 border-teal-500/20 text-primary",
  },
  {
    number: "02",
    title: "PLAY",
    description: "Answer questions, earn XP and build your streak.",
    icon: Gamepad2,
    tint: "bg-amber-500/10 border-amber-500/20 text-amber-700",
  },
  {
    number: "03",
    title: "IMPROVE",
    description: "Track your progress and challenge yourself or friends live.",
    icon: Trophy,
    tint: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600",
  },
];

/* ── StepCard ───────────────────────────────────────────── */
function StepCard({ step }: { step: Step }) {
  const Icon = step.icon;

  return (
    <motion.div
      variants={staggerItem}
      className="relative flex flex-col items-center text-center px-6 py-8 rounded-3xl bg-white border border-[#10233F]/8 shadow-[var(--gq-shadow-card)] hover:shadow-[var(--gq-shadow-card-hover)] transition-all duration-300"
    >
      {/* Icon circle */}
      <div className="relative mb-6">
        <div
          className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center border transition-transform duration-300 hover:scale-105",
            step.tint
          )}
        >
          <Icon size={28} />
        </div>
        {/* Step number badge */}
        <span className="absolute -top-2.5 -right-2.5 px-2.5 py-0.5 rounded-full bg-primary text-white text-xs font-extrabold flex items-center justify-center shadow-xs">
          {step.number}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-display text-xl font-extrabold text-[#10233F] mb-2 tracking-wider">
        {step.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-slate-600 max-w-xs leading-relaxed font-medium">
        {step.description}
      </p>
    </motion.div>
  );
}

/* ── HowItWorks section ─────────────────────────────────── */
export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="bg-[#F7F5EF] py-12 md:py-16 lg:py-20 border-t border-[#10233F]/6"
      aria-label="How GermanQuest works"
    >
      <div className="gq-container">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          <SectionHeading
            title="HOW IT WORKS"
            subtitle="Learn German through quick challenges and real-time competition."
            centered
          />
        </motion.div>

        <motion.div
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          {/* Connecting line accent on desktop */}
          <div
            className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-0.5 -translate-y-1/2 z-0"
            aria-hidden="true"
          >
            <div className="w-full h-full bg-gradient-to-r from-primary/30 via-amber-400/40 to-primary/30" />
          </div>

          {steps.map((step) => (
            <StepCard key={step.number} step={step} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
