"use client";

import * as React from "react";
import { notFound, useRouter, useParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { slideQuestion } from "@/lib/motion";
import { QuizPlayHeader } from "@/components/quiz-engine/quiz-play-header";
import { QuizTimer } from "@/components/quiz-engine/quiz-timer";
import { QuestionCard } from "@/components/quiz-engine/question-card";
import { AnswerGrid } from "@/components/quiz-engine/answer-grid";
import { AnswerFeedback } from "@/components/quiz-engine/answer-feedback";
import {
  QuizCompletionModal,
  type QuizResultData,
} from "@/components/quiz-engine/quiz-completion-modal";
import { getQuizById } from "@/lib/quiz-data";
import { getQuestionsForQuiz, type QuizQuestion } from "@/lib/quiz-questions-data";
import { saveQuizAttempt } from "@/lib/mock-data";
import { useAuth } from "@/components/auth/auth-provider";

export default function SoloQuizPlayPage() {
  const router = useRouter();
  const params = useParams();
  const { repository } = useAuth();
  const quizId = (params.quizId as string) || "hallo";

  const quiz = getQuizById(quizId);
  const questions: QuizQuestion[] = getQuestionsForQuiz(quizId);

  const [currentIndex, setCurrentIndex] = React.useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = React.useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = React.useState<boolean>(false);
  const [earnedXpForQuestion, setEarnedXpForQuestion] = React.useState<number>(0);
  const [totalXp, setTotalXp] = React.useState<number>(0);
  const [streak, setStreak] = React.useState<number>(0);
  const [bestStreak, setBestStreak] = React.useState<number>(0);
  const [correctCount, setCorrectCount] = React.useState<number>(0);
  const [remainingTimeSeconds, setRemainingTimeSeconds] = React.useState<number>(15);
  const [quizStartTime] = React.useState<number>(() => Date.now());
  const [answersRecord, setAnswersRecord] = React.useState<
    QuizResultData["userAnswers"]
  >([]);
  const [isFinished, setIsFinished] = React.useState<boolean>(false);

  if (!quiz) {
    notFound();
  }

  const currentQuestion = questions[currentIndex] || questions[0];

  // Handle answer selection
  const handleSelectOption = (option: string) => {
    if (isSubmitted) return;

    setSelectedAnswer(option);
    setIsSubmitted(true);

    const isCorrect = option === currentQuestion.correctAnswer;

    let questionXp = 0;
    let newStreak = 0;

    if (isCorrect) {
      newStreak = streak + 1;
      setStreak(newStreak);
      setBestStreak((prev) => Math.max(prev, newStreak));
      setCorrectCount((prev) => prev + 1);

      // Simple deterministic scoring calculation:
      // Base (100) + speed bonus (remainingSeconds * 3) + streak bonus (streak * 5)
      const speedBonus = remainingTimeSeconds * 3;
      const streakBonus = newStreak * 5;
      questionXp = currentQuestion.baseXp + speedBonus + streakBonus;

      setEarnedXpForQuestion(questionXp);
      setTotalXp((prev) => prev + questionXp);
    } else {
      setStreak(0);
      setEarnedXpForQuestion(0);
    }

    // Record answer
    setAnswersRecord((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        question: currentQuestion.question,
        translation: currentQuestion.contextPrompt || "",
        userAnswer: option,
        correctAnswer: currentQuestion.correctAnswer,
        isCorrect,
        explanation: currentQuestion.explanation,
      },
    ]);
  };

  // Handle time expired
  const handleTimeExpired = () => {
    if (isSubmitted) return;
    handleSelectOption("");
  };
  const hasSavedAttemptRef = React.useRef(false);

  // Build final result object
  const totalTimeSeconds = Math.round((Date.now() - quizStartTime) / 1000);
  const accuracy = Math.round((correctCount / questions.length) * 100);

  const finalResultData: QuizResultData = {
    quizId: quiz.id,
    quizTitle: quiz.title,
    totalXp,
    correctCount,
    totalQuestions: questions.length,
    accuracy,
    bestStreak,
    totalTimeSeconds,
    userAnswers: answersRecord,
  };

  // Advance to next question or complete quiz
  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsSubmitted(false);
      setEarnedXpForQuestion(0);
      setRemainingTimeSeconds(15);
    } else {
      if (!hasSavedAttemptRef.current) {
        hasSavedAttemptRef.current = true;
        try {
          await repository.saveQuizAttempt({
            quizId: quiz.id,
            quizTitle: quiz.title,
            quizSubtitle: quiz.subtitle,
            topic: quiz.topics[0] || quiz.title,
            score: totalXp,
            xpEarned: totalXp,
            correctAnswers: correctCount,
            totalQuestions: questions.length,
            accuracy,
            bestStreak,
            timeTakenSeconds: totalTimeSeconds,
          });
        } catch (err) {
          console.warn("Failed to save quiz attempt:", err);
        }
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("gq_stats_updated"));
        }
      }
      setIsFinished(true);
    }
  };

  const handleViewResults = () => {
    // Store in sessionStorage so /results page can read it
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        "gq_last_quiz_result",
        JSON.stringify(finalResultData)
      );
    }
    router.push("/results");
  };

  const handlePlayAgain = () => {
    hasSavedAttemptRef.current = false;
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsSubmitted(false);
    setEarnedXpForQuestion(0);
    setTotalXp(0);
    setStreak(0);
    setBestStreak(0);
    setCorrectCount(0);
    setAnswersRecord([]);
    setIsFinished(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <QuizPlayHeader
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        currentXp={totalXp}
        streak={streak}
        quizId={quiz.id}
      />

      {/* Main Play Body */}
      <main className="flex-1 gq-container max-w-3xl py-8 md:py-12 flex flex-col items-center justify-between gap-8">
        {/* Timer Bar */}
        <div className="w-full">
          <QuizTimer
            timeLimit={currentQuestion.timeLimit}
            questionIndex={currentIndex}
            totalQuestions={questions.length}
            isPaused={isSubmitted}
            onTimeExpired={handleTimeExpired}
            onTick={setRemainingTimeSeconds}
          />
        </div>

        {/* Animated Question & Answers Transition Container */}
        <div className="w-full overflow-hidden p-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              variants={slideQuestion}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full space-y-8"
            >
              {/* Question Card */}
              <QuestionCard
                question={currentQuestion.question}
                contextPrompt={currentQuestion.contextPrompt}
                correctAnswer={currentQuestion.correctAnswer}
                questionIndex={currentIndex}
                totalQuestions={questions.length}
              />

              {/* Answer Options Grid */}
              <AnswerGrid
                options={currentQuestion.options}
                selectedAnswer={selectedAnswer}
                correctAnswer={currentQuestion.correctAnswer}
                isSubmitted={isSubmitted}
                onSelectOption={handleSelectOption}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Feedback Bar (shown after submission) */}
        {isSubmitted && (
          <div className="w-full pt-2">
            <AnswerFeedback
              isCorrect={selectedAnswer === currentQuestion.correctAnswer}
              explanation={currentQuestion.explanation}
              earnedXp={earnedXpForQuestion}
              isLastQuestion={currentIndex === questions.length - 1}
              onNext={handleNext}
            />
          </div>
        )}
      </main>

      {/* Quiz Completion Celebration Modal */}
      {isFinished && (
        <QuizCompletionModal
          result={finalResultData}
          onPlayAgain={handlePlayAgain}
          onViewResults={handleViewResults}
        />
      )}
    </div>
  );
}
