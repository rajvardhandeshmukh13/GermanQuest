"use client";

import * as React from "react";
import { motion } from "motion/react";
import { SectionHeading, GQButton } from "@/components/germanquest";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { Zap, Flame, Target, Award, CheckCircle2, Clock, Sparkles } from "lucide-react";
import Link from "next/link";

export function FeatureShowcase() {
  const [selectedOption, setSelectedOption] = React.useState<number | null>(0); // Default to option 0 ("Sehr gut")
  const [showXPToast, setShowXPToast] = React.useState(true);

  const options = [
    { text: "Sehr gut", translation: "Very good", correct: true },
    { text: "Danke", translation: "Thank you", correct: false },
    { text: "Gut", translation: "Good", correct: false },
    { text: "Hallo", translation: "Hello", correct: false },
  ];

  const handleSelect = (idx: number) => {
    setSelectedOption(idx);
    if (idx === 0) {
      setShowXPToast(true);
    }
  };

  return (
    <section
      id="feature-showcase"
      className="gq-section bg-[#F7F5EF] py-16 md:py-24 overflow-hidden relative"
      aria-label="Interactive Visual Feature Section"
    >
      {/* Background glow accents */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full opacity-15"
        style={{
          background:
            "radial-gradient(circle, oklch(0.65 0.14 195 / 30%) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="gq-container relative z-10">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          <SectionHeading
            title="MORE THAN JUST A QUIZ."
            subtitle="Practice German through interactive challenges designed to make learning feel like a game."
            centered
          />
        </motion.div>

        {/* Product Visual Showcase Frame */}
        <motion.div
          className="mt-12 max-w-4xl mx-auto relative"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          {/* Main Central Mock Quiz Card */}
          <motion.div
            variants={staggerItem}
            className="relative rounded-3xl bg-white border border-[#10233F]/12 shadow-[0_25px_60px_-15px_rgba(16,35,63,0.12)] p-6 sm:p-10 z-10 overflow-hidden"
          >
            {/* Header row */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-extrabold tracking-wider uppercase text-[#10233F]">
                  GERMAN CHALLENGE
                </span>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                  A1 • Hallo!
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                <Clock size={13} className="text-amber-500" />
                <span>15s</span>
              </div>
            </div>

            {/* Question Box */}
            <div className="text-center my-6 py-4 px-6 rounded-2xl bg-[#F7F5EF] border border-[#10233F]/5">
              <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400 block mb-1">
                Translate to German
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#10233F]">
                &quot;How are you?&quot;
              </h3>
              <p className="text-sm font-semibold text-primary mt-1">
                Wie geht&apos;s dir?
              </p>
            </div>

            {/* 4 Interactive Option Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-6">
              {options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = opt.correct;

                return (
                  <button
                    key={opt.text}
                    type="button"
                    onClick={() => handleSelect(idx)}
                    className={`relative flex items-center justify-between p-4 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? isCorrect
                          ? "bg-emerald-50/80 border-emerald-500 text-emerald-950 shadow-sm"
                          : "bg-rose-50 border-rose-400 text-rose-950"
                        : "bg-white border-slate-200 hover:border-primary/40 hover:bg-slate-50/80 text-[#10233F]"
                    }`}
                  >
                    <div>
                      <span className="font-display font-extrabold text-base block">
                        {opt.text}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {opt.translation}
                      </span>
                    </div>

                    {isSelected && isCorrect && (
                      <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                        <CheckCircle2 size={16} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Simulated Live Feedback Toast */}
            {showXPToast && selectedOption === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-500 text-white shadow-md mt-4"
              >
                <div className="flex items-center gap-2.5 text-sm font-extrabold">
                  <Sparkles size={18} className="text-amber-300" />
                  <span>Richtig! Excellent answer!</span>
                </div>
                <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-black tracking-wider uppercase">
                  +100 XP
                </span>
              </motion.div>
            )}
          </motion.div>

          {/* FLOATING INDICATORS AROUND MOCK CARD */}

          {/* 1. +100 XP Badge - Top Left */}
          <motion.div
            variants={staggerItem}
            className="absolute -top-6 -left-4 sm:-left-8 z-20 px-4 py-2.5 rounded-2xl bg-white text-[#10233F] shadow-xl border border-slate-100 flex items-center gap-2.5 hidden sm:flex"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center font-black shadow-xs">
              <Zap size={17} className="fill-slate-900" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">INSTANT SCORE</div>
              <div className="text-sm font-extrabold text-amber-500">+100 XP</div>
            </div>
          </motion.div>

          {/* 2. 🔥 5 STREAK Badge - Top Right */}
          <motion.div
            variants={staggerItem}
            className="absolute -top-6 -right-4 sm:-right-8 z-20 px-4 py-2.5 rounded-2xl bg-white text-[#10233F] shadow-xl border border-slate-100 flex items-center gap-2.5 hidden sm:flex"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          >
            <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black shadow-xs">
              <Flame size={17} className="fill-white" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">DAILY GOALS</div>
              <div className="text-sm font-extrabold text-orange-600">5 STREAK</div>
            </div>
          </motion.div>

          {/* 3. 87% ACCURACY Badge - Bottom Left */}
          <motion.div
            variants={staggerItem}
            className="absolute -bottom-6 -left-4 sm:-left-8 z-20 px-4 py-2.5 rounded-2xl bg-white text-[#10233F] shadow-xl border border-slate-100 flex items-center gap-2.5 hidden sm:flex"
            animate={{ y: [0, -7, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            <div className="w-8 h-8 rounded-xl bg-teal-500 text-white flex items-center justify-center font-black shadow-xs">
              <Target size={17} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">PERFORMANCE</div>
              <div className="text-sm font-extrabold text-teal-600">87% ACCURACY</div>
            </div>
          </motion.div>

          {/* 4. LEVEL UP Badge - Bottom Right */}
          <motion.div
            variants={staggerItem}
            className="absolute -bottom-6 -right-4 sm:-right-8 z-20 px-4 py-2.5 rounded-2xl bg-white text-[#10233F] shadow-xl border border-slate-100 flex items-center gap-2.5 hidden sm:flex"
            animate={{ y: [0, -9, 0] }}
            transition={{ duration: 4.0, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-black shadow-xs">
              <Award size={17} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">STATUS</div>
              <div className="text-sm font-extrabold text-indigo-600">LEVEL UP</div>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
