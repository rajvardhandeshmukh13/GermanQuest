"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { XPIndicator } from "./xp-indicator";
import { StreakIndicator } from "./streak-indicator";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "cn";

import { usePathname } from "next/navigation";

interface NavLink {
  label: string;
  href: string;
  active?: boolean;
}

interface NavBarProps extends React.ComponentProps<"header"> {
  /** Navigation links */
  links?: NavLink[];
  /** User XP (show XP indicator if provided) */
  userXP?: number;
  /** User streak (show streak indicator if provided) */
  userStreak?: number;
  /** User avatar URL */
  avatarSrc?: string;
  /** User name (for avatar fallback) */
  userName?: string;
  /** Whether to show the user section */
  showUser?: boolean;
}

export const DEFAULT_NAV_LINKS: NavLink[] = [
  { label: "Explore", href: "/" },
  { label: "Quizzes", href: "/quizzes" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Profile", href: "/profile" },
  { label: "About", href: "/about" },
];

/**
 * NavBar — Top navigation with logo, links, XP/streak indicators, avatar, and logout.
 * Sticky with backdrop blur. Responsive with mobile hamburger menu.
 */
import { useAuth } from "@/components/auth/auth-provider";

function NavBar({
  links,
  userXP: userXpProp,
  userStreak: userStreakProp,
  avatarSrc: avatarSrcProp,
  userName: userNameProp,
  showUser = true,
  className,
  ...props
}: NavBarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const pathname = usePathname();
  const { user, profile, isAuthenticated, loading, signOutUser } = useAuth();

  // If custom links are provided without Profile, automatically include Profile link for full accessibility
  const baseLinks = links && links.length > 0 ? links : DEFAULT_NAV_LINKS;
  const hasProfileLink = baseLinks.some((l) => l.href === "/profile");
  const navLinks = hasProfileLink
    ? baseLinks
    : [
        ...baseLinks.slice(0, 3),
        { label: "Profile", href: "/profile" },
        ...baseLinks.slice(3),
      ];

  const isUserAuthenticated = isAuthenticated && user !== null;

  const displayXP = isUserAuthenticated
    ? userXpProp !== undefined
      ? userXpProp
      : profile?.totalXP ?? 0
    : undefined;

  const displayStreak = isUserAuthenticated
    ? userStreakProp !== undefined
      ? userStreakProp
      : profile?.currentStreak ?? 0
    : undefined;

  const displayName = isUserAuthenticated
    ? userNameProp || profile?.name || user?.displayName || "Learner"
    : "";

  const avatarSrc = isUserAuthenticated
    ? avatarSrcProp || profile?.avatarUrl || user?.photoURL || undefined
    : undefined;

  const initials = displayName
    ? displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "GQ";

  const isLinkActive = (link: NavLink) => {
    if (link.active !== undefined) return link.active;
    if (!pathname) return false;
    if (link.href === "/" && pathname === "/") return true;
    if (
      link.href !== "/" &&
      !link.href.startsWith("#") &&
      !link.href.startsWith("/#") &&
      pathname.startsWith(link.href)
    ) {
      return true;
    }
    return false;
  };

  return (
    <header
      data-slot="nav-bar"
      className={cn(
        "sticky top-0 z-50 w-full bg-[#F7F5EF]/95 backdrop-blur-md border-b border-[#10233F]/10 text-[#10233F] shadow-2xs transition-all",
        className
      )}
      {...props}
    >
      <nav
        className="gq-container flex h-[70px] items-center justify-between"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-xl font-black tracking-tight text-[#10233F] transition-opacity hover:opacity-90"
        >
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-primary text-base shadow-2xs">
            🏛️
          </div>
          <span className="text-[#10233F]">German</span>
          <span className="text-primary">Quest</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const active = isLinkActive(link);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative px-4 py-1.5 text-sm font-semibold rounded-full transition-all duration-200",
                  active
                    ? "text-[#10233F] bg-white shadow-2xs ring-1 ring-[#10233F]/10 font-bold"
                    : "text-slate-600 hover:text-[#10233F] hover:bg-white/60"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right section — XP, streak, avatar OR Login/Signup */}
        <div className="flex items-center gap-3">
          {showUser && isUserAuthenticated ? (
            <div className="flex items-center gap-3">
              {/* Desktop indicators */}
              <div className="hidden sm:flex items-center gap-2.5">
                {displayStreak !== undefined && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-800 text-xs font-black shadow-2xs">
                    <span className="text-amber-500">🔥</span>
                    <span>{displayStreak}</span>
                  </div>
                )}
                {displayXP !== undefined && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-800 text-xs font-black shadow-2xs">
                    <span className="text-amber-500">★</span>
                    <span>{displayXP.toLocaleString()} XP</span>
                  </div>
                )}
              </div>

              <Link
                href="/profile"
                title={`View profile (${displayName})`}
                className="flex items-center gap-2 group p-1 rounded-full hover:bg-white transition-all"
              >
                <Avatar size="default" className="cursor-pointer ring-2 ring-primary/40 group-hover:ring-primary transition-all w-8 h-8">
                  {avatarSrc && (
                    <AvatarImage src={avatarSrc} alt={displayName || "User"} />
                  )}
                  <AvatarFallback className="bg-primary text-white font-bold text-xs">{initials}</AvatarFallback>
                </Avatar>
                <span className="hidden xl:inline text-xs font-extrabold text-[#10233F] group-hover:text-primary truncate max-w-[120px]">
                  {displayName}
                </span>
              </Link>

              <button
                type="button"
                onClick={() => signOutUser()}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 transition-all text-xs font-bold flex items-center gap-1 shrink-0"
                title="Log out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="outline" size="sm" className="font-extrabold text-xs border-slate-300 text-[#10233F] hover:bg-white bg-transparent">
                  LOG IN
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="default" size="sm" className="font-extrabold text-xs bg-primary text-white shadow-xs hover:bg-primary/90 border border-primary/20">
                  SIGN UP
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white hover:bg-white/10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              duration: 0.2,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="overflow-hidden md:hidden border-t border-border"
          >
            <div className="gq-container flex flex-col gap-1 py-4">
              {navLinks.map((link) => {
                const active = isLinkActive(link);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                      active
                        ? "text-primary bg-primary/10 font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}

              {/* Mobile user / auth section */}
              {isUserAuthenticated ? (
                <div className="flex items-center justify-between px-3 pt-3 mt-2 border-t border-border">
                  <div className="flex items-center gap-3">
                    {displayStreak !== undefined && (
                      <StreakIndicator value={displayStreak} size="sm" />
                    )}
                    {displayXP !== undefined && (
                      <XPIndicator value={displayXP} size="sm" animated={false} />
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                      <Avatar size="sm">
                        {avatarSrc && <AvatarImage src={avatarSrc} alt={displayName} />}
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                    </Link>
                    <button
                      onClick={() => {
                        signOutUser();
                        setMobileMenuOpen(false);
                      }}
                      className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
                    >
                      <LogOut size={14} /> LOGOUT
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2 pt-3 mt-2 border-t border-border">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full font-bold text-xs">
                      LOG IN
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="default" className="w-full font-bold text-xs bg-primary text-white">
                      CREATE ACCOUNT
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export { NavBar };
export type { NavBarProps, NavLink };
