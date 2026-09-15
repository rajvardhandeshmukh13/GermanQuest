/**
 * Centralized Demo Leaderboard Dataset for GermanQuest
 *
 * Deterministic community leaderboard seed data with dynamic ranking for active player.
 */

export type LeaderboardPeriod = "week" | "month" | "allTime";

export interface LeaderboardUser {
  rank: number;
  id: string;
  name: string;
  avatar?: string;
  avatarUrl?: string;
  level: number;
  totalXP: number;
  xp: number;
  streak: number;
  isCurrentUser?: boolean;
}

export const BASE_LEADERBOARD_USERS: Record<LeaderboardPeriod, Omit<LeaderboardUser, "rank">[]> = {
  week: [
    { id: "user-1", name: "Lena S.", level: 8, totalXP: 2450, xp: 2450, streak: 12 },
    { id: "user-2", name: "Arjun K.", level: 7, totalXP: 2310, xp: 2310, streak: 9 },
    { id: "user-3", name: "Maya R.", level: 7, totalXP: 2190, xp: 2190, streak: 7 },
    { id: "user-4", name: "Sophie B.", level: 6, totalXP: 1980, xp: 1980, streak: 8 },
    { id: "user-5", name: "Noah W.", level: 5, totalXP: 1870, xp: 1870, streak: 6 },
    { id: "user-6", name: "Emma H.", level: 5, totalXP: 1760, xp: 1760, streak: 5 },
    { id: "user-8", name: "Lucas F.", level: 3, totalXP: 680, xp: 680, streak: 3 },
    { id: "user-9", name: "Hannah T.", level: 3, totalXP: 620, xp: 620, streak: 4 },
    { id: "user-10", name: "Leon P.", level: 2, totalXP: 540, xp: 540, streak: 2 },
  ],
  month: [
    { id: "user-1", name: "Lena S.", level: 8, totalXP: 8900, xp: 8900, streak: 12 },
    { id: "user-2", name: "Arjun K.", level: 7, totalXP: 8200, xp: 8200, streak: 9 },
    { id: "user-4", name: "Sophie B.", level: 6, totalXP: 7600, xp: 7600, streak: 8 },
    { id: "user-3", name: "Maya R.", level: 7, totalXP: 7100, xp: 7100, streak: 7 },
    { id: "user-5", name: "Noah W.", level: 5, totalXP: 6400, xp: 6400, streak: 6 },
    { id: "user-6", name: "Emma H.", level: 5, totalXP: 5800, xp: 5800, streak: 5 },
    { id: "user-8", name: "Lucas F.", level: 3, totalXP: 2900, xp: 2900, streak: 3 },
    { id: "user-9", name: "Hannah T.", level: 3, totalXP: 2400, xp: 2400, streak: 4 },
    { id: "user-10", name: "Leon P.", level: 2, totalXP: 1950, xp: 1950, streak: 2 },
  ],
  allTime: [
    { id: "user-1", name: "Lena S.", level: 14, totalXP: 24500, xp: 24500, streak: 45 },
    { id: "user-2", name: "Arjun K.", level: 12, totalXP: 21300, xp: 21300, streak: 30 },
    { id: "user-4", name: "Sophie B.", level: 11, totalXP: 19800, xp: 19800, streak: 28 },
    { id: "user-3", name: "Maya R.", level: 10, totalXP: 17400, xp: 17400, streak: 21 },
    { id: "user-5", name: "Noah W.", level: 9, totalXP: 15200, xp: 15200, streak: 18 },
    { id: "user-6", name: "Emma H.", level: 8, totalXP: 13100, xp: 13100, streak: 15 },
    { id: "user-8", name: "Lucas F.", level: 6, totalXP: 9800, xp: 9800, streak: 12 },
    { id: "user-9", name: "Hannah T.", level: 5, totalXP: 8400, xp: 8400, streak: 9 },
    { id: "user-10", name: "Leon P.", level: 4, totalXP: 6500, xp: 6500, streak: 7 },
  ],
};

/**
 * Calculates dynamic leaderboard rankings by combining active player stats
 * with the base demo users and sorting by totalXP descending.
 */
export function getDynamicLeaderboard(
  player: {
    id: string;
    name: string;
    avatar?: string;
    level: number;
    totalXP: number;
    streak: number;
  },
  period: LeaderboardPeriod = "week"
): { users: LeaderboardUser[]; userRank: number } {
  const baseUsers = BASE_LEADERBOARD_USERS[period] || BASE_LEADERBOARD_USERS.week;

  // Scale player XP for month and allTime if period is not week
  const effectiveXP =
    period === "week"
      ? player.totalXP
      : period === "month"
      ? Math.round(player.totalXP * 4.44)
      : Math.round(player.totalXP * 6.55);

  const currentUserEntry: Omit<LeaderboardUser, "rank"> = {
    id: player.id,
    name: `${player.name} (YOU)`,
    avatar: player.avatar,
    level: player.level,
    totalXP: effectiveXP,
    xp: effectiveXP,
    streak: player.streak,
    isCurrentUser: true,
  };

  // Exclude current user if already in base
  const filteredBase = baseUsers.filter((u) => u.id !== player.id);
  const combined = [...filteredBase, currentUserEntry];
  combined.sort((a, b) => b.totalXP - a.totalXP);

  let userRank = 7;
  const users: LeaderboardUser[] = combined.map((user, index) => {
    const rank = index + 1;
    if (user.isCurrentUser || user.id === player.id) {
      userRank = rank;
    }
    return {
      ...user,
      rank,
    };
  });

  return { users, userRank };
}

/**
 * Async getter that fetches real users from Firebase RTDB users/ node,
 * merges them with base demo users, and returns ranked array.
 */
export async function fetchFirebaseLeaderboardUsers(
  currentUserOrId?: string | { id: string; name: string; avatar?: string; level: number; totalXP: number; streak: number },
  period: LeaderboardPeriod = "week"
): Promise<{ users: LeaderboardUser[]; currentUserRank: number }> {
  const baseUsers = BASE_LEADERBOARD_USERS[period] || BASE_LEADERBOARD_USERS.week;
  const realUsersMap: Record<string, Omit<LeaderboardUser, "rank">> = {};

  const currentUserId = typeof currentUserOrId === "string" ? currentUserOrId : currentUserOrId?.id;
  const currentUserObj = typeof currentUserOrId === "object" ? currentUserOrId : undefined;

  try {
    const { ref, get } = await import("firebase/database");
    const { database } = await import("./firebase");
    const usersRef = ref(database, "users");
    const snapshot = await get(usersRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      Object.keys(data).forEach((uid) => {
        const u = data[uid]?.profile;
        if (u && u.name) {
          const rawXP = u.totalXP || 0;
          const effectiveXP =
            period === "week"
              ? rawXP
              : period === "month"
              ? Math.round(rawXP * 4.44)
              : Math.round(rawXP * 6.55);

          const isCurrent = uid === currentUserId;
          realUsersMap[uid] = {
            id: uid,
            name: isCurrent ? `${u.name} (YOU)` : u.name,
            avatar: u.avatar || u.name.slice(0, 2).toUpperCase(),
            level: u.level || 1,
            totalXP: effectiveXP,
            xp: effectiveXP,
            streak: u.currentStreak || 0,
            isCurrentUser: isCurrent,
          };
        }
      });
    }
  } catch (err: any) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Firebase leaderboard read restricted/unavailable (falling back to demo dataset):", err?.message || err);
    }
  }

  // Ensure current user entry is always present with their latest local active stats
  if (currentUserObj && currentUserObj.id) {
    const rawXP = currentUserObj.totalXP || 0;
    const effectiveXP =
      period === "week"
        ? rawXP
        : period === "month"
        ? Math.round(rawXP * 4.44)
        : Math.round(rawXP * 6.55);

    const existingName = realUsersMap[currentUserObj.id]?.name;
    const cleanName = currentUserObj.name.replace(/\s*\(YOU\)$/i, "");

    realUsersMap[currentUserObj.id] = {
      id: currentUserObj.id,
      name: `${cleanName} (YOU)`,
      avatar: currentUserObj.avatar || cleanName.slice(0, 2).toUpperCase(),
      level: currentUserObj.level || 1,
      totalXP: Math.max(realUsersMap[currentUserObj.id]?.totalXP || 0, effectiveXP),
      xp: Math.max(realUsersMap[currentUserObj.id]?.xp || 0, effectiveXP),
      streak: Math.max(realUsersMap[currentUserObj.id]?.streak || 0, currentUserObj.streak || 0),
      isCurrentUser: true,
    };
  }

  // Merge real users with base demo users
  const mergedList: Omit<LeaderboardUser, "rank">[] = [];
  const addedIds = new Set<string>();

  Object.values(realUsersMap).forEach((ru) => {
    mergedList.push(ru);
    addedIds.add(ru.id);
  });

  baseUsers.forEach((bu) => {
    if (!addedIds.has(bu.id)) {
      mergedList.push(bu);
      addedIds.add(bu.id);
    }
  });

  mergedList.sort((a, b) => b.totalXP - a.totalXP);

  let currentUserRank = 7;
  const users: LeaderboardUser[] = mergedList.map((user, index) => {
    const rank = index + 1;
    if (user.isCurrentUser || user.id === currentUserId) {
      currentUserRank = rank;
    }
    return {
      ...user,
      rank,
    };
  });

  return { users, currentUserRank };
}
