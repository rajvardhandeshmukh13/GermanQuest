"use client";

import * as React from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import {
  IPlayerRepository,
  DemoPlayerRepository,
  FirebasePlayerRepository,
} from "@/lib/player-repository";
import { FullPlayerStats, getCalculatedPlayerStats, getPlayerLevelInfo } from "@/lib/player-stats";

export interface AuthContextType {
  user: User | null;
  profile: FullPlayerStats | null;
  repository: IPlayerRepository;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  signUp: (name: string, email: string, pass: string) => Promise<void>;
  signIn: (email: string, pass: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  clearError: () => void;
  refreshStats: () => Promise<void>;
}

const defaultRepository = new DemoPlayerRepository();

const AuthContext = React.createContext<AuthContextType>({
  user: null,
  profile: null,
  repository: defaultRepository,
  loading: true,
  isAuthenticated: false,
  error: null,
  signUp: async () => {},
  signIn: async () => {},
  signInWithGoogle: async () => {},
  signOutUser: async () => {},
  clearError: () => {},
  refreshStats: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [profile, setProfile] = React.useState<FullPlayerStats | null>(null);
  const [repository, setRepository] = React.useState<IPlayerRepository>(defaultRepository);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  // Stable ref so handleStatsUpdated never causes the main effect to re-run
  const repositoryRef = React.useRef<IPlayerRepository>(defaultRepository);

  const refreshStats = React.useCallback(async () => {
    try {
      const stats = await repositoryRef.current.getPlayerStats();
      setProfile(stats);
    } catch (err) {
      console.warn("Failed to refresh player stats:", err);
    }
  }, []); // stable — reads from ref, no deps

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        const fbRepo = new FirebasePlayerRepository(firebaseUser.uid);
        repositoryRef.current = fbRepo;
        setRepository(fbRepo);

        // Immediately build and set an initial profile for the Firebase user
        const initialProfile = fbRepo.buildStatsObject({
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || "German Learner",
          avatar: (firebaseUser.displayName || "GL").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
          email: firebaseUser.email || "",
          createdAt: Date.now(),
          totalXP: 0,
          level: 1,
          currentStreak: 0,
          bestStreak: 0,
          lastActivityDate: "",
        });
        setProfile(initialProfile);

        try {
          await FirebasePlayerRepository.initializeUserProfile(firebaseUser.uid, {
            name: firebaseUser.displayName || "German Learner",
            email: firebaseUser.email || undefined,
          });
          const stats = await fbRepo.getPlayerStats();
          setProfile(stats);
        } catch (err) {
          console.warn("Failed to fetch Firebase user profile from RTDB:", err);
        }
      } else {
        setUser(null);
        const demoRepo = new DemoPlayerRepository();
        repositoryRef.current = demoRepo;
        setRepository(demoRepo);
        setProfile(null);
      }
      setLoading(false);
    });

    const handleStatsUpdated = () => {
      refreshStats();
    };

    window.addEventListener("gq_stats_updated", handleStatsUpdated);

    return () => {
      unsubscribe();
      window.removeEventListener("gq_stats_updated", handleStatsUpdated);
    };
  }, []);

  const clearError = () => setError(null);

  const getFriendlyErrorMessage = (code: string, message: string): string => {
    switch (code) {
      case "auth/email-already-in-use":
        return "This email address is already registered. Please log in instead.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/weak-password":
        return "Password should be at least 6 characters long.";
      case "auth/wrong-password":
      case "auth/user-not-found":
      case "auth/invalid-credential":
        return "Invalid email or password. Please check your credentials.";
      case "auth/too-many-requests":
        return "Too many unsuccessful attempts. Please try again in a few minutes.";
      case "auth/popup-closed-by-user":
        return "Google sign-in was cancelled.";
      case "auth/configuration-not-found":
        return "Firebase Authentication is not enabled for this project yet. Please enable Email/Password authentication in the Firebase Console (Build > Authentication > Get Started).";
      default:
        return message || "An unexpected authentication error occurred. Please try again.";
    }
  };

  const signUp = async (name: string, email: string, pass: string) => {
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const createdUser = userCredential.user;

      if (name) {
        await updateProfile(createdUser, { displayName: name });
      }

      const fbRepo = new FirebasePlayerRepository(createdUser.uid);
      repositoryRef.current = fbRepo;
      setRepository(fbRepo);
      setUser(createdUser);

      // Set initial authenticated profile immediately
      const initialProfile = fbRepo.buildStatsObject({
        uid: createdUser.uid,
        name: name || "German Learner",
        avatar: (name || "GL").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
        email,
        createdAt: Date.now(),
        totalXP: 0,
        level: 1,
        currentStreak: 0,
        bestStreak: 0,
        lastActivityDate: "",
      });
      setProfile(initialProfile);
      setLoading(false);

      try {
        await FirebasePlayerRepository.initializeUserProfile(createdUser.uid, { name, email });
        await fbRepo.updateProfile({ name });
        const stats = await fbRepo.getPlayerStats();
        setProfile(stats);
      } catch (err) {
        console.warn("RTDB sync warning:", err);
      }
    } catch (err: any) {
      setLoading(false);
      const msg = getFriendlyErrorMessage(err.code, err.message);
      setError(msg);
      throw new Error(msg);
    }
  };

  const signIn = async (email: string, pass: string) => {
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const loggedInUser = userCredential.user;
      const fbRepo = new FirebasePlayerRepository(loggedInUser.uid);
      repositoryRef.current = fbRepo;
      setRepository(fbRepo);
      setUser(loggedInUser);

      const initialProfile = fbRepo.buildStatsObject({
        uid: loggedInUser.uid,
        name: loggedInUser.displayName || "German Learner",
        avatar: (loggedInUser.displayName || "GL").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
        email: loggedInUser.email || "",
        createdAt: Date.now(),
        totalXP: 0,
        level: 1,
        currentStreak: 0,
        bestStreak: 0,
        lastActivityDate: "",
      });
      setProfile(initialProfile);
      setLoading(false);

      try {
        const stats = await fbRepo.getPlayerStats();
        setProfile(stats);
      } catch (err) {
        console.warn("RTDB sync warning:", err);
      }
    } catch (err: any) {
      setLoading(false);
      const msg = getFriendlyErrorMessage(err.code, err.message);
      setError(msg);
      throw new Error(msg);
    }
  };

  const signInWithGoogle = async () => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;

      const fbRepo = new FirebasePlayerRepository(googleUser.uid);
      repositoryRef.current = fbRepo;
      setRepository(fbRepo);
      setUser(googleUser);
      setLoading(false);

      try {
        await FirebasePlayerRepository.initializeUserProfile(googleUser.uid, {
          name: googleUser.displayName || "German Learner",
          email: googleUser.email || undefined,
          avatar: googleUser.photoURL || undefined,
        });
        const stats = await fbRepo.getPlayerStats();
        setProfile(stats);
      } catch (err) {
        console.warn("RTDB sync warning:", err);
      }
    } catch (err: any) {
      setLoading(false);
      const msg = getFriendlyErrorMessage(err.code, err.message);
      setError(msg);
      throw new Error(msg);
    }
  };

  const signOutUser = async () => {
    setError(null);
    try {
      await signOut(auth);
      setUser(null);
      const demoRepo = new DemoPlayerRepository();
      repositoryRef.current = demoRepo;
      setRepository(demoRepo);
      setProfile(null);
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      console.warn("Sign out error:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        repository,
        loading,
        isAuthenticated: !!user,
        error,
        signUp,
        signIn,
        signInWithGoogle,
        signOutUser,
        clearError,
        refreshStats,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  return React.useContext(AuthContext);
}

/**
 * Hook for player statistics synchronization.
 * Returns authenticated Firebase user stats when signed in, or guest demo stats when logged out.
 */
export function usePlayerStats(): FullPlayerStats {
  const { user, profile } = useAuth();
  const [demoStats, setDemoStats] = React.useState<FullPlayerStats>(() => getCalculatedPlayerStats(false));

  React.useEffect(() => {
    setDemoStats(getCalculatedPlayerStats(true));

    const handleUpdate = () => {
      setDemoStats(getCalculatedPlayerStats(true));
    };

    window.addEventListener("gq_stats_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("gq_stats_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  if (user !== null) {
    if (profile !== null) {
      return profile;
    }
    // Return initial profile for authenticated user while loading instead of falling back to Sarah M
    const initialLevelInfo = getPlayerLevelInfo(0);
    return {
      id: user.uid,
      name: user.displayName || "German Learner",
      avatar: (user.displayName || "GL").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
      level: initialLevelInfo.level,
      totalXP: 0,
      xp: 0,
      currentLevelXp: initialLevelInfo.currentLevelXp,
      nextLevelXp: initialLevelInfo.nextLevelXp,
      currentStreak: 0,
      streak: 0,
      bestStreak: 0,
      rank: 7,
      rankWeeklyChange: 0,
      accuracy: 0,
      quizzesCompleted: 0,
      totalQuizzes: 6,
      questionsAnswered: 0,
      correctAnswers: 0,
      levelInfo: initialLevelInfo,
      topicProgress: [],
      recentAttempts: [],
      nextChallenge: {
        id: "hallo",
        title: "Hallo!",
        subtitle: "Greetings & Basics",
        topics: ["Greetings"],
      } as any,
    };
  }

  return demoStats;
}

