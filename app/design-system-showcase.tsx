"use client";

import * as React from "react";
import { motion } from "motion/react";
import {
  GQButton,
  GQCard,
  GQProgress,
  QuizCard,
  DifficultyBadge,
  XPIndicator,
  StreakIndicator,
  SectionHeading,
  NavBar,
  fadeInUp,
  staggerContainer,
  staggerItem,
} from "@/components/germanquest";
import { Badge } from "@/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Zap, BookOpen, Trophy, Globe } from "lucide-react";

/* ── Color swatch helper ─────────────────────────────────── */
function Swatch({
  name,
  className,
  textClass = "text-white",
}: {
  name: string;
  className: string;
  textClass?: string;
}) {
  return (
    <div
      className={`flex items-end rounded-lg p-3 h-20 ${className}`}
    >
      <span className={`text-xs font-mono font-medium ${textClass}`}>
        {name}
      </span>
    </div>
  );
}

/* ── Typography sample helper ────────────────────────────── */
function TypoSample({
  label,
  className,
  children,
}: {
  label: string;
  className: string;
  children: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-metadata text-muted-foreground">{label}</span>
      <p className={className}>{children}</p>
    </div>
  );
}

/* ── Section wrapper ─────────────────────────────────────── */
function Section({
  children,
  id,
}: {
  children: React.ReactNode;
  id: string;
}) {
  return (
    <motion.section
      id={id}
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      className="gq-section"
    >
      {children}
    </motion.section>
  );
}

/* ══════════════════════════════════════════════════════════ */
/*  DESIGN SYSTEM SHOWCASE                                   */
/* ══════════════════════════════════════════════════════════ */
export function DesignSystemShowcase() {
  return (
    <>
      {/* Navigation preview */}
      <NavBar
        links={[
          { label: "Explore", href: "#colors" },
          { label: "Quizzes", href: "#cards", active: true },
          { label: "Leaderboard", href: "#gamification" },
        ]}
        showUser
        userXP={2450}
        userStreak={7}
        userName="Design System"
      />

      <main className="flex-1">
        <div className="gq-container">
          {/* ── Header ─────────────────────────────────── */}
          <Section id="hero">
            <div className="flex flex-col items-center gap-4 text-center pt-8">
              <h1 className="text-display text-foreground">
                German<span className="text-primary">Quest</span>
              </h1>
              <p className="text-body text-muted-foreground max-w-lg">
                Eine Reise. Ein Spiel. Deutsch lernen.
              </p>
              <div className="flex items-center gap-3 text-metadata text-muted-foreground">
                <span>Design System</span>
                <span aria-hidden="true">·</span>
                <span>v0.2.0</span>
              </div>
            </div>
          </Section>

          <Separator className="my-2" />

          {/* ── Colors ─────────────────────────────────── */}
          <Section id="colors">
            <SectionHeading
              title="Color System"
              subtitle="Navy-first palette with teal interactivity and German yellow accents."
            />

            <div className="mt-6 space-y-6">
              {/* Navy scale */}
              <div>
                <p className="text-metadata text-muted-foreground mb-3">Navy Scale</p>
                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-11 gap-2">
                  <Swatch name="50" className="bg-navy-50" textClass="text-navy-900" />
                  <Swatch name="100" className="bg-navy-100" textClass="text-navy-900" />
                  <Swatch name="200" className="bg-navy-200" textClass="text-navy-900" />
                  <Swatch name="300" className="bg-navy-300" textClass="text-navy-950" />
                  <Swatch name="400" className="bg-navy-400" />
                  <Swatch name="500" className="bg-navy-500" />
                  <Swatch name="600" className="bg-navy-600" />
                  <Swatch name="700" className="bg-navy-700" />
                  <Swatch name="800" className="bg-navy-800" />
                  <Swatch name="900" className="bg-navy-900" />
                  <Swatch name="950" className="bg-navy-950" />
                </div>
              </div>

              {/* Teal scale */}
              <div>
                <p className="text-metadata text-muted-foreground mb-3">Teal Scale</p>
                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-11 gap-2">
                  <Swatch name="50" className="bg-teal-50" textClass="text-teal-900" />
                  <Swatch name="100" className="bg-teal-100" textClass="text-teal-900" />
                  <Swatch name="200" className="bg-teal-200" textClass="text-teal-900" />
                  <Swatch name="300" className="bg-teal-300" textClass="text-teal-950" />
                  <Swatch name="400" className="bg-teal-400" />
                  <Swatch name="500" className="bg-teal-500" />
                  <Swatch name="600" className="bg-teal-600" />
                  <Swatch name="700" className="bg-teal-700" />
                  <Swatch name="800" className="bg-teal-800" />
                  <Swatch name="900" className="bg-teal-900" />
                  <Swatch name="950" className="bg-teal-950" />
                </div>
              </div>

              {/* Semantic colors */}
              <div>
                <p className="text-metadata text-muted-foreground mb-3">Semantic Colors</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                  <Swatch name="Primary (Teal)" className="bg-primary" />
                  <Swatch name="Secondary (Gold)" className="bg-secondary" textClass="text-secondary-foreground" />
                  <Swatch name="Success" className="bg-gq-success" />
                  <Swatch name="Destructive" className="bg-destructive" />
                  <Swatch name="Muted" className="bg-muted" textClass="text-muted-foreground" />
                  <Swatch name="Accent" className="bg-accent" textClass="text-accent-foreground" />
                </div>
              </div>
            </div>
          </Section>

          <Separator className="my-2" />

          {/* ── Typography ─────────────────────────────── */}
          <Section id="typography">
            <SectionHeading
              title="Typography"
              subtitle="Space Grotesk for headings, Geist Sans for body. Fluid sizing with clamp()."
            />

            <div className="mt-6 space-y-6">
              <TypoSample label="DISPLAY" className="text-display text-foreground">
                GermanQuest
              </TypoSample>
              <TypoSample label="H1 — PAGE HEADING" className="text-page-heading text-foreground">
                Choose Your German Quiz
              </TypoSample>
              <TypoSample label="H2 — SECTION HEADING" className="text-section-heading text-foreground">
                Popular Quizzes This Week
              </TypoSample>
              <TypoSample label="H3" className="text-h3 text-foreground">
                Culture & History Category
              </TypoSample>
              <TypoSample label="CARD HEADING" className="text-card-heading text-foreground">
                German Cities Explorer
              </TypoSample>
              <TypoSample label="BODY" className="text-body text-muted-foreground">
                Explore iconic architecture, history, and urban culture through interactive quizzes designed for A1 learners.
              </TypoSample>
              <TypoSample label="SMALL" className="text-small text-muted-foreground">
                10 Questions · Medium Difficulty · 100 XP
              </TypoSample>
              <TypoSample label="BUTTON" className="text-button text-primary">
                START QUEST
              </TypoSample>
              <TypoSample label="METADATA" className="text-metadata text-muted-foreground">
                LAST PLAYED 2 HOURS AGO
              </TypoSample>
            </div>
          </Section>

          <Separator className="my-2" />

          {/* ── Buttons ────────────────────────────────── */}
          <Section id="buttons">
            <SectionHeading
              title="Buttons"
              subtitle="GQButton variants with motion feedback and arrow hover animation."
            />

            <div className="mt-6 space-y-8">
              {/* Variants */}
              <div>
                <p className="text-metadata text-muted-foreground mb-4">Variants</p>
                <div className="flex flex-wrap items-center gap-3">
                  <GQButton variant="teal" showArrow>START QUEST</GQButton>
                  <GQButton variant="gold">Earn XP</GQButton>
                  <GQButton variant="navy">Dashboard</GQButton>
                  <GQButton variant="ghost">Cancel</GQButton>
                  <GQButton variant="outline">Settings</GQButton>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <p className="text-metadata text-muted-foreground mb-4">Sizes</p>
                <div className="flex flex-wrap items-center gap-3">
                  <GQButton size="sm" showArrow>Small</GQButton>
                  <GQButton size="default" showArrow>Default</GQButton>
                  <GQButton size="lg" showArrow>Large</GQButton>
                </div>
              </div>

              {/* With custom icon */}
              <div>
                <p className="text-metadata text-muted-foreground mb-4">With Icons</p>
                <div className="flex flex-wrap items-center gap-3">
                  <GQButton icon={<Zap size={16} />}>Power Up</GQButton>
                  <GQButton variant="gold" icon={<Trophy size={16} />}>
                    Leaderboard
                  </GQButton>
                  <GQButton variant="navy" icon={<Globe size={16} />}>
                    Explore
                  </GQButton>
                </div>
              </div>
            </div>
          </Section>

          <Separator className="my-2" />

          {/* ── Cards ──────────────────────────────────── */}
          <Section id="cards">
            <SectionHeading
              title="Cards"
              subtitle="GQCard variants and QuizCard with premium surface treatment."
            />

            <div className="mt-6 space-y-8">
              {/* GQCard variants */}
              <div>
                <p className="text-metadata text-muted-foreground mb-4">GQCard Variants</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <GQCard variant="surface" interactive>
                    <div className="flex flex-col gap-2">
                      <BookOpen size={24} className="text-primary" />
                      <h3 className="text-card-heading text-card-foreground">Surface Card</h3>
                      <p className="text-small text-muted-foreground">
                        White elevated surface. Interactive with hover lift.
                      </p>
                    </div>
                  </GQCard>

                  <GQCard variant="glass">
                    <div className="flex flex-col gap-2">
                      <Globe size={24} className="text-teal-300" />
                      <h3 className="text-card-heading text-foreground">Glass Card</h3>
                      <p className="text-small text-muted-foreground">
                        Glassmorphism backdrop on dark backgrounds.
                      </p>
                    </div>
                  </GQCard>

                  <GQCard variant="flat">
                    <div className="flex flex-col gap-2">
                      <Zap size={24} className="text-secondary" />
                      <h3 className="text-card-heading text-foreground">Flat Card</h3>
                      <p className="text-small text-muted-foreground">
                        No shadow, muted background. For less emphasis.
                      </p>
                    </div>
                  </GQCard>
                </div>
              </div>

              {/* QuizCard (without images — placeholders) */}
              <div>
                <p className="text-metadata text-muted-foreground mb-4">Quiz Cards</p>
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <motion.div variants={staggerItem}>
                    <QuizCard
                      title="German Cities"
                      description="Explore iconic architecture, history, and urban culture."
                      questionCount={10}
                      difficulty="medium"
                      xpReward={100}
                      onPlay={() => {}}
                    />
                  </motion.div>
                  <motion.div variants={staggerItem}>
                    <QuizCard
                      title="Culinary Traditions"
                      description="Discover regional dishes, local flavors, and German food culture."
                      questionCount={12}
                      difficulty="easy"
                      xpReward={100}
                      onPlay={() => {}}
                    />
                  </motion.div>
                  <motion.div variants={staggerItem}>
                    <QuizCard
                      title="Travel & Landmarks"
                      description="Journey through famous castles, natural wonders, and sights."
                      questionCount={15}
                      difficulty="hard"
                      xpReward={150}
                      onPlay={() => {}}
                    />
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </Section>

          <Separator className="my-2" />

          {/* ── Badges & Indicators ────────────────────── */}
          <Section id="gamification">
            <SectionHeading
              title="Badges & Gamification"
              subtitle="Difficulty badges, XP indicators, streak counters, and shadcn badge variants."
            />

            <div className="mt-6 space-y-8">
              {/* Difficulty badges */}
              <div>
                <p className="text-metadata text-muted-foreground mb-4">Difficulty Badges</p>
                <div className="flex flex-wrap items-center gap-3">
                  <DifficultyBadge difficulty="easy" />
                  <DifficultyBadge difficulty="medium" />
                  <DifficultyBadge difficulty="hard" />
                </div>
              </div>

              {/* shadcn badge variants */}
              <div>
                <p className="text-metadata text-muted-foreground mb-4">Badge Variants (shadcn)</p>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge variant="ghost">Ghost</Badge>
                </div>
              </div>

              {/* XP & Streak */}
              <div>
                <p className="text-metadata text-muted-foreground mb-4">Gamification Indicators</p>
                <div className="flex flex-wrap items-center gap-8">
                  <div className="flex flex-col items-center gap-2">
                    <XPIndicator value={2450} size="lg" />
                    <span className="text-metadata text-muted-foreground">Large</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <XPIndicator value={1200} size="default" />
                    <span className="text-metadata text-muted-foreground">Default</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <XPIndicator value={500} size="sm" />
                    <span className="text-metadata text-muted-foreground">Small</span>
                  </div>
                  <Separator orientation="vertical" className="h-12" />
                  <div className="flex flex-col items-center gap-2">
                    <StreakIndicator value={7} size="lg" />
                    <span className="text-metadata text-muted-foreground">Active</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <StreakIndicator value={3} size="default" active={false} />
                    <span className="text-metadata text-muted-foreground">Inactive</span>
                  </div>
                </div>
              </div>

              {/* Avatar */}
              <div>
                <p className="text-metadata text-muted-foreground mb-4">Avatars</p>
                <div className="flex items-center gap-4">
                  <Avatar size="sm">
                    <AvatarFallback>SM</AvatarFallback>
                  </Avatar>
                  <Avatar size="default">
                    <AvatarFallback>GQ</AvatarFallback>
                  </Avatar>
                  <Avatar size="lg">
                    <AvatarFallback>LG</AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>
          </Section>

          <Separator className="my-2" />

          {/* ── Progress ───────────────────────────────── */}
          <Section id="progress">
            <SectionHeading
              title="Progress"
              subtitle="GQProgress with teal fill, size variants, and optional label."
            />

            <div className="mt-6 space-y-6 max-w-xl">
              <GQProgress value={75} label="Quiz Progress" size="lg" />
              <GQProgress value={45} label="Daily Goal" size="default" />
              <GQProgress value={20} size="sm" showValue={false} />
            </div>
          </Section>

          <Separator className="my-2" />

          {/* ── Shadows ────────────────────────────────── */}
          <Section id="shadows">
            <SectionHeading
              title="Shadows"
              subtitle="Layered shadow tokens for depth hierarchy."
            />

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
                <div
                  key={size}
                  className="flex items-center justify-center rounded-xl bg-card text-card-foreground p-6 h-24"
                  style={{ boxShadow: `var(--gq-shadow-${size})` }}
                >
                  <span className="text-metadata">{size.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </Section>

          <Separator className="my-2" />

          {/* ── Spacing ────────────────────────────────── */}
          <Section id="spacing">
            <SectionHeading
              title="Spacing & Radii"
              subtitle="4px grid spacing system and radius scale."
            />

            <div className="mt-6 space-y-8">
              {/* Radius preview */}
              <div>
                <p className="text-metadata text-muted-foreground mb-4">Border Radius Scale</p>
                <div className="flex flex-wrap items-end gap-4">
                  {(["sm", "md", "lg", "xl", "2xl", "3xl", "4xl"] as const).map((r) => (
                    <div key={r} className="flex flex-col items-center gap-2">
                      <div
                        className="w-16 h-16 bg-primary/20 border-2 border-primary"
                        style={{ borderRadius: `var(--radius-${r})` }}
                      />
                      <span className="text-metadata text-muted-foreground">{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* Footer spacer */}
          <div className="h-20" />
        </div>
      </main>
    </>
  );
}
