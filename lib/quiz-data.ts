import type { Difficulty } from "@/components/germanquest";

export type QuizStatus = "completed" | "current" | "available" | "locked";

export interface Quiz {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  difficulty: Difficulty;
  questionCount: number;
  xp: number;
  progress: number;
  status: QuizStatus;
  locked: boolean;
  unlockXp?: number;
  iconName: "MessageCircle" | "Hash" | "Users" | "UtensilsCrossed" | "Landmark" | "Navigation";
  accentBg: string;
  iconColor: string;
  topics: string[];
  estimatedTime: string;
}


export const QUIZZES: Quiz[] = [
  {
    id: "hallo",
    title: "Hallo!",
    subtitle: "Greetings & Introductions",
    description:
      "Master everyday German greetings and learn to introduce yourself with confidence.",
    difficulty: "easy",
    questionCount: 8,
    xp: 80,
    progress: 100,
    status: "completed",
    locked: false,
    iconName: "MessageCircle",
    accentBg: "bg-teal-500/10 border-teal-500/20",
    iconColor: "text-teal-600",
    topics: ["Greetings", "Introductions", "Basic conversations"],
    estimatedTime: "3–5 minutes",
  },
  {
    id: "zahlen",
    title: "Zahlen",
    subtitle: "Numbers & Time",
    description:
      "Count, tell the time, and handle numbers in everyday German conversations.",
    difficulty: "easy",
    questionCount: 10,
    xp: 100,
    progress: 100,
    status: "completed",
    locked: false,
    iconName: "Hash",
    accentBg: "bg-sky-500/10 border-sky-500/20",
    iconColor: "text-sky-600",
    topics: ["Numbers 1–100", "Telling Time", "Days & Months"],
    estimatedTime: "4–6 minutes",
  },
  {
    id: "meine-welt",
    title: "Meine Welt",
    subtitle: "Family & People",
    description:
      "Talk about your family, friends, and the people around you in German.",
    difficulty: "medium",
    questionCount: 10,
    xp: 120,
    progress: 70,
    status: "current",
    locked: false,
    iconName: "Users",
    accentBg: "bg-amber-500/10 border-amber-500/20",
    iconColor: "text-amber-600",
    topics: ["Family Members", "Describing People", "Possessive Pronouns"],
    estimatedTime: "5–7 minutes",
  },
  {
    id: "essen",
    title: "Essen",
    subtitle: "Food & Drinks",
    description:
      "Order food, describe meals, and navigate German dining culture.",
    difficulty: "medium",
    questionCount: 12,
    xp: 120,
    progress: 0,
    status: "available",
    locked: false,
    iconName: "UtensilsCrossed",
    accentBg: "bg-emerald-500/10 border-emerald-500/20",
    iconColor: "text-emerald-600",
    topics: ["Food & Beverages", "Ordering at Restaurants", "Preferences"],
    estimatedTime: "5–7 minutes",
  },
  {
    id: "deutschland",
    title: "Deutschland",
    subtitle: "Cities & Culture",
    description:
      "Explore German cities, landmarks, traditions, and cultural knowledge.",
    difficulty: "hard",
    questionCount: 15,
    xp: 150,
    progress: 0,
    status: "available",
    locked: false,
    iconName: "Landmark",
    accentBg: "bg-indigo-500/10 border-indigo-500/20",
    iconColor: "text-indigo-600",
    topics: ["Major Cities", "German Landmarks", "Cultural Facts"],
    estimatedTime: "7–10 minutes",
  },
  {
    id: "unterwegs",
    title: "Unterwegs",
    subtitle: "Directions & Transport",
    description:
      "Navigate Germany using trains, buses, and directions in German.",
    difficulty: "hard",
    questionCount: 12,
    xp: 150,
    progress: 0,
    status: "available",
    locked: false,
    iconName: "Navigation",
    accentBg: "bg-rose-500/10 border-rose-500/20",
    iconColor: "text-rose-600",
    topics: ["Asking for Directions", "Public Transport", "Travel Vocabulary"],
    estimatedTime: "6–8 minutes",
  },
];

export function getQuizById(id: string): Quiz | undefined {
  return QUIZZES.find((q) => q.id === id);
}
