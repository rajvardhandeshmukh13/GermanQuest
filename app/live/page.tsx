import * as React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { NavBar, GQButton } from "@/components/germanquest";
import { Footer } from "@/components/landing";
import { Users, Gamepad2, ArrowRight, ShieldCheck, Trophy, Sparkles } from "lucide-react";
import { getMockPlayerProfile } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "GermanQuest — Live Challenge Hub",
  description: "Compete with your classmates in real time. Host a game or join using a 6-digit game PIN.",
};

export default function LiveHubPage() {
  return (
    <>
      <NavBar
        links={[
          { label: "Explore", href: "/" },
          { label: "Quizzes", href: "/quizzes" },
          { label: "Leaderboard", href: "/leaderboard" },
          { label: "About", href: "/about" },
        ]}
      />

      <main className="flex-1 bg-background py-16 md:py-24">
        <div className="gq-container max-w-4xl text-center space-y-12">
          {/* Hero Section */}
          <div className="space-y-4 max-w-2xl mx-auto flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-800 text-xs font-black uppercase tracking-widest shadow-2xs">
              <Sparkles size={16} className="text-amber-500" />
              <span>REAL-TIME MULTIPLAYER</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-normal">
              LIVE GERMAN CHALLENGE
            </h1>

            <p className="text-body text-muted-foreground text-base sm:text-xl font-semibold leading-relaxed">
              Compete with your classmates in real time. Answer questions, earn speed bonuses, and climb the live podium!
            </p>
          </div>

          {/* 2 Primary Actions: HOST A GAME | JOIN A GAME */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto items-stretch">
            {/* Action 1: HOST A GAME */}
            <div className="rounded-3xl p-8 bg-card border-2 border-primary/30 shadow-[var(--gq-shadow-md)] flex flex-col justify-between text-left space-y-6 hover:border-primary transition-all">
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-primary shadow-2xs">
                  <Gamepad2 size={28} />
                </div>
                <h2 className="font-display text-2xl font-black text-foreground tracking-normal">
                  HOST A GAME
                </h2>
                <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                  Create a live classroom game, get a 6-digit Game PIN, and lead your students through German challenges.
                </p>
              </div>

              <Link href="/live/host" className="w-full">
                <GQButton
                  variant="teal"
                  size="lg"
                  icon={<ArrowRight size={18} />}
                  className="w-full font-bold text-base shadow-md"
                >
                  HOST A GAME
                </GQButton>
              </Link>
            </div>

            {/* Action 2: JOIN A GAME */}
            <div className="rounded-3xl p-8 bg-card border-2 border-amber-500/30 shadow-[var(--gq-shadow-md)] flex flex-col justify-between text-left space-y-6 hover:border-amber-500 transition-all">
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-700 shadow-2xs">
                  <Users size={28} />
                </div>
                <h2 className="font-display text-2xl font-black text-foreground tracking-normal">
                  JOIN A GAME
                </h2>
                <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                  Have a 6-digit Game PIN from your host or teacher? Enter your nickname and join the live lobby!
                </p>
              </div>

              <Link href="/live/join" className="w-full">
                <GQButton
                  variant="gold"
                  size="lg"
                  icon={<ArrowRight size={18} />}
                  className="w-full font-bold text-base shadow-md"
                >
                  JOIN A GAME
                </GQButton>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
