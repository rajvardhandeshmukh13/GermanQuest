"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { GQButton } from "@/components/germanquest";
import { fadeInUp } from "@/lib/motion";
import { Gamepad2 } from "lucide-react";

/**
 * FinalCTA — Strong closing call-to-action with dual CTAs (Quizzes & Live Mode).
 */
export function FinalCTA() {
  return (
    <section
      id="cta"
      className="gq-section bg-[#F7F5EF] py-16 md:py-24"
      aria-label="Ready to test your German"
    >
      <div className="gq-container">
        <motion.div
          className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-[#10233F]"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {/* Subtle teal ambient glow inside CTA card */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] rounded-full opacity-25 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, oklch(0.65 0.14 195 / 45%) 0%, transparent 70%)",
            }}
            aria-hidden="true"
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center text-center py-16 md:py-20 px-6 max-w-2xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight">
              READY TO TEST YOUR
              <br />
              <span className="text-primary">GERMAN?</span>
            </h2>

            <p className="text-body text-slate-300 mt-4 max-w-md leading-relaxed font-medium">
              Challenge yourself, build your skills and compete live with friends
              or classmates.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 w-full">
              <Link href="/quizzes" className="w-full sm:w-auto">
                <GQButton showArrow size="lg" className="w-full sm:w-auto">
                  START YOUR QUEST
                </GQButton>
              </Link>
              <Link href="/live" className="w-full sm:w-auto">
                <GQButton
                  variant="gold"
                  size="lg"
                  className="w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  <Gamepad2 size={18} />
                  <span>JOIN A LIVE GAME</span>
                </GQButton>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
