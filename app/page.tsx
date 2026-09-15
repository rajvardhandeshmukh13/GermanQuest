import { NavBar } from "@/components/germanquest";
import {
  Hero,
  HowItWorks,
  FeatureShowcase,
  FinalCTA,
  Footer,
} from "@/components/landing";

/**
 * GermanQuest — Homepage Redesign
 *
 * Premium 3D German Quiz + Live Game Landing Page
 */
export default function Home() {
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

      <main className="flex-1 bg-[#F7F5EF]">
        <Hero />
        <HowItWorks />
        <FeatureShowcase />
        <FinalCTA />
      </main>

      <Footer />
    </>
  );
}
