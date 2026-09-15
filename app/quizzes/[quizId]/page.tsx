import * as React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { NavBar } from "@/components/germanquest";
import { Footer } from "@/components/landing";
import { QuizReady } from "@/components/quizzes/quiz-ready";
import { getQuizById, QUIZZES } from "@/lib/quiz-data";
import { getMockPlayerProfile } from "@/lib/mock-data";

interface QuizPageProps {
  params: Promise<{
    quizId: string;
  }>;
}

export async function generateStaticParams() {
  return QUIZZES.map((quiz) => ({
    quizId: quiz.id,
  }));
}

export async function generateMetadata({
  params,
}: QuizPageProps): Promise<Metadata> {
  const { quizId } = await params;
  const quiz = getQuizById(quizId);

  if (!quiz) {
    return {
      title: "Quiz Not Found — GermanQuest",
    };
  }

  return {
    title: `GermanQuest — ${quiz.title} (${quiz.subtitle})`,
    description: quiz.description,
  };
}

export default async function QuizDetailPage({ params }: QuizPageProps) {
  const { quizId } = await params;
  const quiz = getQuizById(quizId);
  const profile = getMockPlayerProfile();

  if (!quiz) {
    notFound();
  }

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

      <main className="flex-1 bg-background">
        <QuizReady quiz={quiz} />
      </main>

      <Footer />
    </>
  );
}
