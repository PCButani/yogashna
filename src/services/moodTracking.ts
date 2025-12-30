/**
 * Mood Tracking Service
 * Handles saving and retrieving session mood check-ins
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "session_mood_v1";

export type MoodType = "Relaxed" | "Energized" | "Neutral" | "Tired";

export interface SessionMood {
  id: string; // Unique ID for this entry
  programId?: string;
  dayNumber?: number;
  sessionDate: string; // ISO date string
  mood: MoodType;
  timestamp: number; // Unix timestamp
}

/**
 * Save a mood check-in for a completed session
 */
export async function saveMoodCheckin(
  mood: MoodType,
  context?: { programId?: string; dayNumber?: number }
): Promise<void> {
  try {
    const entry: SessionMood = {
      id: `${Date.now()}-${Math.random()}`,
      programId: context?.programId,
      dayNumber: context?.dayNumber,
      sessionDate: new Date().toISOString().split("T")[0], // YYYY-MM-DD
      mood,
      timestamp: Date.now(),
    };

    // Load existing entries
    const existing = await loadMoodHistory();

    // Add new entry at the beginning
    const updated = [entry, ...existing];

    // Keep only last 100 entries to avoid storage bloat
    const trimmed = updated.slice(0, 100);

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error("Error saving mood check-in:", error);
    throw error;
  }
}

/**
 * Load all mood history
 */
export async function loadMoodHistory(): Promise<SessionMood[]> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    return JSON.parse(stored) as SessionMood[];
  } catch (error) {
    console.error("Error loading mood history:", error);
    return [];
  }
}

/**
 * Get mood stats for a date range
 */
export async function getMoodStats(days: number = 30): Promise<{
  total: number;
  byMood: Record<MoodType, number>;
  mostCommon: MoodType | null;
}> {
  try {
    const history = await loadMoodHistory();
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

    const recent = history.filter(entry => entry.timestamp >= cutoff);

    const byMood: Record<MoodType, number> = {
      Relaxed: 0,
      Energized: 0,
      Neutral: 0,
      Tired: 0,
    };

    recent.forEach(entry => {
      byMood[entry.mood]++;
    });

    let mostCommon: MoodType | null = null;
    let maxCount = 0;

    (Object.keys(byMood) as MoodType[]).forEach(mood => {
      if (byMood[mood] > maxCount) {
        maxCount = byMood[mood];
        mostCommon = mood;
      }
    });

    return {
      total: recent.length,
      byMood,
      mostCommon,
    };
  } catch (error) {
    console.error("Error getting mood stats:", error);
    return {
      total: 0,
      byMood: { Relaxed: 0, Energized: 0, Neutral: 0, Tired: 0 },
      mostCommon: null,
    };
  }
}
