import * as React from "react";
import Link from "next/link";

/* ── Link groups ────────────────────────────────────────── */
const navLinks = [
  { label: "Explore", href: "/" },
  { label: "Quizzes", href: "/quizzes" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Profile", href: "/profile" },
  { label: "About", href: "/about" },
];

const legalLinks = [
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
];

/**
 * Footer — Compact, polished, and balanced site footer for GermanQuest.
 * Features a 2-layer structure: 3-column top navigation & compact bottom copyright row.
 * Server component — no client-side JS needed.
 */
export function Footer() {
  return (
    <footer
      className="w-full bg-[#F7F5EF] border-t border-[#10233F]/10 text-[#10233F]"
      role="contentinfo"
    >
      {/* TOP FOOTER LAYER */}
      <div className="gq-container pt-10 pb-8 md:pt-11 md:pb-9">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-8 items-start">
          {/* COLUMN 1 — BRAND */}
          <div className="md:col-span-6 flex flex-col items-start gap-2.5">
            <div className="flex items-center gap-2.5">
              <Link
                href="/"
                className="inline-flex items-center gap-1 font-display text-xl font-black tracking-tight text-[#10233F] transition-opacity hover:opacity-90"
              >
                <span>German</span>
                <span className="text-primary">Quest</span>
              </Link>

              {/* Subtle German theme DE accent badge */}
              <div
                aria-label="Germany (DE)"
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#10233F]/5 border border-[#10233F]/10 text-[11px] font-bold text-[#10233F]/80 select-none"
              >
                <span className="flex h-2.5 w-3.5 flex-col overflow-hidden rounded-[1px] border border-black/10">
                  <span className="h-1/3 w-full bg-[#101828]" />
                  <span className="h-1/3 w-full bg-[#B42318]" />
                  <span className="h-1/3 w-full bg-[#F5B82E]" />
                </span>
                <span>DE</span>
              </div>
            </div>

            <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed max-w-sm">
              Eine Reise. Ein Spiel. Deutsch lernen.
            </p>
          </div>

          {/* COLUMN 2 — NAVIGATION */}
          <div className="md:col-span-3 flex flex-col gap-2.5">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#10233F]/90">
              NAVIGATION
            </h3>
            <nav aria-label="Footer navigation" className="flex flex-col gap-1.5">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-xs md:text-sm font-medium text-slate-600 hover:text-primary transition-colors duration-200 w-fit"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* COLUMN 3 — LEGAL */}
          <div className="md:col-span-3 flex flex-col gap-2.5">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#10233F]/90">
              LEGAL
            </h3>
            <nav aria-label="Legal links" className="flex flex-col gap-1.5">
              {legalLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-xs md:text-sm font-medium text-slate-600 hover:text-primary transition-colors duration-200 w-fit"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* DIVIDER */}
      <div className="gq-container">
        <div className="border-t border-[#10233F]/10 w-full" />
      </div>

      {/* COPYRIGHT ROW LAYER */}
      <div className="gq-container py-4 md:py-4.5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 font-medium text-center sm:text-left">
          <span>© 2026 GermanQuest. All rights reserved.</span>
          <span className="hidden sm:inline text-slate-400">•</span>
          <span className="text-slate-500 font-medium">
            Eine Reise. Ein Spiel. Deutsch lernen.
          </span>
        </div>
      </div>
    </footer>
  );
}

