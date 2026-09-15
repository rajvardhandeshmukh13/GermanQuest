"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { NavBar, GQButton } from "@/components/germanquest";
import { Footer } from "@/components/landing";
import { useAuth } from "@/components/auth/auth-provider";
import { LogIn, ArrowRight, AlertCircle, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { fadeInUp } from "@/lib/motion";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/profile";

  const { signIn, signInWithGoogle, isAuthenticated, error, clearError } = useAuth();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [localError, setLocalError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectPath);
    }
  }, [isAuthenticated, redirectPath, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!email.trim() || !password) {
      setLocalError("Please enter both email and password.");
      return;
    }

    try {
      setIsSubmitting(true);
      await signIn(email.trim(), password);
      router.push(redirectPath);
    } catch (err: any) {
      // Error handled by AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    clearError();
    try {
      setIsSubmitting(true);
      await signInWithGoogle();
      router.push(redirectPath);
    } catch (err: any) {
      // Error handled by AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = localError || error;

  return (
    <>
      <NavBar
        links={[
          { label: "Explore", href: "/" },
          { label: "Quizzes", href: "/quizzes" },
          { label: "Leaderboard", href: "/leaderboard" },
          { label: "About", href: "/about" },
        ]}
        showUser={false}
      />

      <main className="flex-1 bg-[#F7F5EF] py-12 md:py-16 flex items-center justify-center">
        <div className="gq-container max-w-md w-full">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="rounded-3xl p-8 bg-white border border-[#10233F]/10 shadow-[var(--gq-shadow-md)] space-y-6"
          >
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-black uppercase tracking-wider text-primary">
                <LogIn size={13} /> WELCOME BACK
              </div>
              <h1 className="font-display text-3xl font-black text-[#10233F] tracking-tight">
                LOG IN TO GERMANQUEST
              </h1>
              <p className="text-sm font-medium text-slate-600">
                Continue your German learning journey.
              </p>
            </div>

            {/* Error Announcement */}
            {displayError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2"
              >
                <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                <span>{displayError}</span>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-xs font-extrabold uppercase tracking-wider text-[#10233F]"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-[#10233F] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-extrabold uppercase tracking-wider text-[#10233F]"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-[#10233F] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
              </div>

              <GQButton
                type="submit"
                variant="teal"
                size="lg"
                fullWidthMobile
                disabled={isSubmitting}
                className="w-full font-bold shadow-md mt-2"
              >
                {isSubmitting ? "LOGGING IN..." : "LOG IN →"}
              </GQButton>
            </form>

            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest absolute">
                OR
              </span>
            </div>

            {/* Google Sign-in */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-extrabold text-[#10233F] transition-all flex items-center justify-center gap-2.5 shadow-2xs"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>CONTINUE WITH GOOGLE</span>
            </button>

            {/* Signup prompt */}
            <div className="pt-4 border-t border-slate-100 text-center">
              <p className="text-xs font-semibold text-slate-600">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="text-primary font-bold hover:underline ml-1"
                >
                  CREATE ACCOUNT
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#F7F5EF] flex items-center justify-center text-sm font-semibold text-slate-500">Loading Login...</div>}>
      <LoginFormContent />
    </React.Suspense>
  );
}
