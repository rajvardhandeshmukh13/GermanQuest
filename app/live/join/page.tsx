"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { NavBar, GQButton } from "@/components/germanquest";
import { Footer } from "@/components/landing";
import { Users, ArrowRight, AlertCircle, Sparkles } from "lucide-react";
import { joinLiveGame, getLiveGameByPin } from "@/lib/live-game";
import { usePlayerStats } from "@/lib/player-stats";

function JoinLiveGameForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPin = searchParams?.get("pin") || "";

  const [pin, setPin] = React.useState(initialPin);
  const [nickname, setNickname] = React.useState("");
  const [error, setError] = React.useState("");
  const [isJoining, setIsJoining] = React.useState(false);

  const handleJoin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");

    const cleanPin = pin.replace(/\s+/g, "").trim();
    const cleanName = nickname.trim();

    if (cleanPin.length !== 6 || !/^\d{6}$/.test(cleanPin)) {
      setError("Please enter a valid 6-digit Game PIN.");
      return;
    }

    if (!cleanName) {
      setError("Please enter your nickname.");
      return;
    }

    setIsJoining(true);
    try {
      const result = await joinLiveGame(cleanPin, cleanName);
      if (result) {
        router.push(
          `/live/game/${cleanPin}/lobby?role=player&playerId=${result.player.id}`
        );
      } else {
        setError("Game PIN not found or game is no longer active. Check that the host has created the game!");
        setIsJoining(false);
      }
    } catch (err) {
      console.error("Join live game error:", err);
      setError("Unable to connect to the live game. Please check your internet connection.");
      setIsJoining(false);
    }
  };

  const profile = usePlayerStats();

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

      <main className="flex-1 bg-gradient-to-b from-[#10233F] via-[#1A365D] to-[#10233F] text-white py-16 md:py-24 relative overflow-hidden">
        {/* Background German architectural silhouette accent */}
        <div className="absolute inset-0 flex items-center justify-between opacity-10 pointer-events-none select-none px-12">
          <div className="text-9xl">🏘️</div>
          <div className="text-9xl">🏰</div>
        </div>

        <div className="gq-container max-w-lg text-center flex flex-col items-center space-y-8 relative z-10">
          <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-md">
            <Users size={36} />
          </div>

          <div className="space-y-2">
            <span className="px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-black uppercase tracking-widest shadow-2xs">
              LIVE MULTIPLAYER
            </span>

            <h1 className="font-display text-4xl sm:text-5xl font-black text-white tracking-normal">
              JOIN LIVE GAME
            </h1>

            <p className="text-body text-slate-300 leading-relaxed text-sm font-semibold max-w-sm mx-auto">
              Enter your 6-digit game PIN and nickname to enter the live lobby.
            </p>
          </div>

          {/* Form Card */}
          <div className="w-full relative">
            {/* Sticker quote accent (Panel 3 reference) */}
            <div className="absolute -top-6 -right-4 px-3.5 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs shadow-lg rotate-3 z-20 hidden sm:block">
              Gute Freunde, Bessere Gespräche ♡
            </div>

            <form onSubmit={handleJoin} className="w-full space-y-5 text-left p-8 rounded-3xl bg-white text-[#10233F] border border-white/20 shadow-2xl relative z-10">
              {error && (
                <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-800 text-xs font-bold animate-shake">
                  <AlertCircle size={16} className="shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">
                  GAME PIN
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Enter 6-digit PIN"
                  className="w-full py-4 text-center font-mono text-2xl tracking-[0.2em] font-bold rounded-2xl bg-slate-50 border-2 border-[#08AEB5]/40 focus:border-[#08AEB5] focus:ring-4 focus:ring-[#08AEB5]/20 text-[#10233F] placeholder:text-slate-400 placeholder:font-sans placeholder:tracking-normal placeholder:text-base outline-none transition-all shadow-2xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">
                  YOUR NICKNAME
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Enter your nickname"
                  className="w-full py-3.5 px-4 font-display font-extrabold text-lg text-center rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-[#08AEB5] focus:ring-4 focus:ring-[#08AEB5]/20 text-[#10233F] placeholder:text-slate-400 placeholder:font-normal placeholder:text-base outline-none transition-all shadow-2xs"
                />
              </div>

              <GQButton
                type="submit"
                variant="gold"
                size="lg"
                disabled={isJoining}
                icon={<ArrowRight size={18} />}
                className="w-full font-bold text-base shadow-md pt-2"
              >
                {isJoining ? "JOINING GAME..." : "JOIN GAME"}
              </GQButton>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default function JoinLiveGamePage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-sm">Loading...</div>}>
      <JoinLiveGameForm />
    </React.Suspense>
  );
}
