"use client";

import * as React from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { NavBar, GQButton } from "@/components/germanquest";
import { Footer } from "@/components/landing";
import {
  getLiveGameByPin,
  subscribeToLiveGame,
  startLiveGame,
  addDemoPlayers,
  type LiveGame,
} from "@/lib/live-game";
import { usePlayerStats } from "@/lib/player-stats";
import { Users, Play, UserPlus, Hash, Radio, Sparkles, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { cn } from "cn";

function GameLobbyContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const pin = (params?.pin as string) || "";
  const role = (searchParams?.get("role") as "host" | "player") || "player";
  const playerId = searchParams?.get("playerId") || "";

  const profile = usePlayerStats();
  const [game, setGame] = React.useState<LiveGame | null>(null);
  const hasNavigatedRef = React.useRef(false);

  // Subscribe to real-time game updates
  React.useEffect(() => {
    if (!pin) return;

    // Fetch initial
    const initial = getLiveGameByPin(pin);
    if (initial) setGame(initial);

    const unsubscribe = subscribeToLiveGame(pin, (updatedGame) => {
      setGame(updatedGame);
      // Auto-navigate to play screen when status changes
      if (updatedGame.status !== "lobby" && !hasNavigatedRef.current) {
        hasNavigatedRef.current = true;
        const targetUrl = playerId
          ? `/live/game/${pin}/play?role=${role}&playerId=${encodeURIComponent(playerId)}`
          : `/live/game/${pin}/play?role=${role}`;
        router.push(targetUrl);
      }
    });

    return () => unsubscribe();
  }, [pin, role, playerId, router]);

  const handleStartGame = async () => {
    if (!pin) return;
    const started = await startLiveGame(pin);
    if (started && !hasNavigatedRef.current) {
      hasNavigatedRef.current = true;
      router.push(`/live/game/${pin}/play?role=host`);
    }
  };

  const handleAddDemoPlayers = () => {
    if (!pin) return;
    const updated = addDemoPlayers(pin, 5);
    if (updated) setGame({ ...updated });
  };

  const handleCopyPin = () => {
    if (!pin) return;
    navigator.clipboard.writeText(pin);
  };

  const formattedPin = pin ? pin.replace(/(\d{3})(\d{3})/, "$1 $2") : pin;
  const isHost = role === "host";
  const nonHostPlayers = game?.players.filter((p) => !p.isHost) || [];

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

      <main className="flex-1 bg-[#F7F5EF] py-12 md:py-16 relative overflow-hidden">
        {/* Background German Town / Alpine Visual Context */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.06] bg-[radial-gradient(#10233F_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="gq-container max-w-2xl relative z-10 space-y-6">
          {/* Main Lobby Card */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="rounded-3xl p-8 sm:p-10 bg-white border border-[#10233F]/10 shadow-[var(--gq-shadow-md)] text-center flex flex-col items-center space-y-6 relative overflow-hidden"
          >
            {/* Top Badge */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-xs font-black uppercase tracking-wider text-primary">
              <Radio size={14} className="animate-pulse text-teal-600" />
              <span>LIVE CHALLENGE</span>
            </div>

            {/* Header & PIN */}
            <div className="space-y-1">
              <h1 className="font-display text-3xl sm:text-4xl font-black text-[#10233F] tracking-tight">
                GAME LOBBY
              </h1>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                GAME PIN
              </p>

              <div className="flex items-center justify-center gap-3 pt-2">
                <span className="font-mono text-4xl sm:text-5xl lg:text-6xl font-black text-[#10233F] tracking-[0.2em] bg-slate-50 px-6 py-2 rounded-2xl border border-slate-200 shadow-inner">
                  {formattedPin || "6 8 4 2 1 0"}
                </span>
                <button
                  type="button"
                  onClick={handleCopyPin}
                  className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-colors shadow-2xs"
                  title="Copy PIN"
                >
                  <Hash size={20} />
                </button>
              </div>
            </div>

            {/* Players Joined Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 text-xs font-extrabold text-[#10233F] border border-slate-200">
              <Users size={14} className="text-primary" />
              <span>{nonHostPlayers.length}/12 players joined</span>
            </div>

            {/* Players Grid / Chips */}
            <div className="w-full pt-2">
              {nonHostPlayers.length === 0 ? (
                <div className="p-8 rounded-2xl border-2 border-dashed border-slate-200 text-center space-y-2 bg-slate-50/50">
                  <Users size={28} className="mx-auto text-slate-400 animate-bounce" />
                  <p className="font-display text-sm font-bold text-slate-600">
                    Waiting for players to enter PIN...
                  </p>
                </div>
              ) : (
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                >
                  {nonHostPlayers.map((player) => {
                    const isSelf = player.id === playerId || player.id === profile.id;
                    return (
                      <motion.div
                        key={player.id}
                        variants={staggerItem}
                        className={cn(
                          "p-2.5 rounded-2xl border flex items-center gap-2.5 transition-all text-left shadow-2xs",
                          isSelf
                            ? "bg-teal-50 border-teal-500/40 text-teal-950 font-bold"
                            : "bg-slate-50/80 border-slate-200/80 text-slate-800"
                        )}
                      >
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center font-display text-xs font-black shrink-0",
                            isSelf
                              ? "bg-primary text-white"
                              : "bg-slate-200 text-slate-700"
                          )}
                        >
                          {player.avatar || player.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-display text-xs font-bold truncate">
                          {player.name} {isSelf && <span className="text-primary font-black">(You)</span>}
                        </span>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </div>

            {/* Waiting text */}
            <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 pt-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Waiting for more players...
            </p>

            {/* Host Controls */}
            {isHost && (
              <div className="w-full pt-4 space-y-3">
                <GQButton
                  variant="gold"
                  size="lg"
                  showArrow
                  onClick={handleStartGame}
                  disabled={nonHostPlayers.length === 0}
                  className="w-full font-black text-base py-6 shadow-md"
                >
                  START GAME
                </GQButton>

                <button
                  type="button"
                  onClick={handleAddDemoPlayers}
                  className="text-xs font-extrabold text-slate-500 hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  <UserPlus size={13} /> + Add Demo Players
                </button>
              </div>
            )}
          </motion.div>

          {/* German Sticker Quote Card Accent */}
          <div className="text-right">
            <span className="inline-block font-handwriting text-lg text-rose-600 rotate-[-2deg] bg-white px-4 py-2 rounded-xl shadow-xs border border-rose-200">
              Gemeinsam lernen, gemeinsam wachsen. ♡
            </span>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default function GameLobbyPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-sm">Loading lobby...</div>}>
      <GameLobbyContent />
    </React.Suspense>
  );
}
