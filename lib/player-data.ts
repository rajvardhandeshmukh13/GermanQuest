/**
 * Player Profile Data for GermanQuest
 *
 * Centralized identity & profile settings for the active demo player.
 */

export interface PlayerProfile {
  id: string;
  name: string;
  avatar: string;
  avatarUrl?: string;
  activityStreak: number;
}

export const DEMO_PLAYER: PlayerProfile = {
  id: "player-001",
  name: "Sarah M",
  avatar: "SM",
  activityStreak: 5,
};

const STORAGE_KEY = "gq_player_profile";

export function getPlayerProfile(useLocalStorage = true): PlayerProfile {
  if (!useLocalStorage || typeof window === "undefined") {
    return DEMO_PLAYER;
  }

  try {
    const item = localStorage.getItem(STORAGE_KEY);
    if (!item) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_PLAYER));
      return DEMO_PLAYER;
    }
    return { ...DEMO_PLAYER, ...JSON.parse(item) };
  } catch (error) {
    console.error("Failed to read player profile from localStorage:", error);
    return DEMO_PLAYER;
  }
}

export function updatePlayerProfile(updates: Partial<PlayerProfile>): PlayerProfile {
  const current = getPlayerProfile(true);
  const updated = { ...current, ...updates };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("gq_stats_updated"));
    } catch (error) {
      console.error("Failed to update player profile:", error);
    }
  }

  return updated;
}
