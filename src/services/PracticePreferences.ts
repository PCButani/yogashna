/**
 * Practice Preferences Service
 * Handles storing and retrieving user's Abhyāsa preferences
 * Uses AsyncStorage for persistence
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { getWellnessFocusLabel, getWellnessGoalLabel } from "../constants/wellnessTags";
import { UserMe } from "../types/api";

const PREFERENCES_KEY = "YOGA_PRACTICE_PREFERENCES";

export type WellnessFocus =
  | "Health Support"
  | "Lifestyle & Habits"
  | "Fitness & Flexibility"
  | "Beginners & Mindfulness"
  | "Office Yoga"
  | null;

export type PracticeLevel = "Beginner" | "Intermediate" | "Expert" | null;

export type SessionLength = "Quick" | "Balanced" | "Deep" | null;

export type BestTime = "Morning" | "Evening" | "Anytime" | null;

export interface PracticePreferences {
  focus: WellnessFocus;
  goals: string[];
  level: PracticeLevel;
  length: SessionLength;
  time: BestTime;
  updatedAt: string; // ISO timestamp
}

export function mergePreferencesWithUserMe(
  prefs: PracticePreferences,
  userMe: UserMe | null
): PracticePreferences {
  if (!userMe) return prefs;

  const focusLabel = userMe.wellnessFocusId
    ? getWellnessFocusLabel(userMe.wellnessFocusId) || prefs.focus
    : prefs.focus;
  const goalLabel = userMe.primaryGoalId
    ? getWellnessGoalLabel(userMe.primaryGoalId)
    : null;

  return {
    ...prefs,
    focus: focusLabel ?? prefs.focus,
    goals: goalLabel ? [goalLabel] : prefs.goals,
  };
}

/**
 * Default preferences (used for new users or before onboarding completion)
 */
const defaultPreferences: PracticePreferences = {
  focus: "Health Support",
  goals: ["Back Pain Relief"],
  level: "Beginner",
  length: "Balanced",
  time: "Morning",
  updatedAt: new Date().toISOString(),
};

/**
 * Save user practice preferences to AsyncStorage
 */
export async function savePracticePreferences(
  prefs: Partial<PracticePreferences>
): Promise<void> {
  try {
    const current = await getPracticePreferences();
    const updated: PracticePreferences = {
      ...current,
      ...prefs,
      updatedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to save practice preferences:", error);
    throw error;
  }
}

/**
 * Get user practice preferences from AsyncStorage
 * Returns default preferences if none exist
 */
export async function getPracticePreferences(): Promise<PracticePreferences> {
  try {
    const stored = await AsyncStorage.getItem(PREFERENCES_KEY);
    if (!stored) {
      // No preferences saved yet, use defaults
      return defaultPreferences;
    }
    return JSON.parse(stored) as PracticePreferences;
  } catch (error) {
    console.error("Failed to load practice preferences:", error);
    return defaultPreferences;
  }
}

/**
 * Clear all practice preferences (for logout or reset)
 */
export async function clearPracticePreferences(): Promise<void> {
  try {
    await AsyncStorage.removeItem(PREFERENCES_KEY);
  } catch (error) {
    console.error("Failed to clear practice preferences:", error);
  }
}

/**
 * Helper to get session length in minutes
 */
export function getSessionLengthMinutes(length: SessionLength): number {
  switch (length) {
    case "Quick":
      return 10;
    case "Balanced":
      return 20;
    case "Deep":
      return 30;
    default:
      return 20; // Default to Balanced
  }
}

/**
 * Helper to format focus category for display
 */
export function formatFocusCategory(focus: WellnessFocus): string {
  return focus ?? "General Wellness";
}

/**
 * Helper to format session length for display
 */
export function formatSessionLength(length: SessionLength): string {
  switch (length) {
    case "Quick":
      return "10 min";
    case "Balanced":
      return "20 min";
    case "Deep":
      return "30 min";
    default:
      return "20 min";
  }
}
