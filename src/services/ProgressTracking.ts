/**
 * Progress Tracking Service
 * Manages user's yoga practice progress including:
 * - Daily streak tracking
 * - Total minutes practiced
 * - Sessions completed
 * - Weekly activity tracking
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const PROGRESS_KEY = "YOGA_PROGRESS_DATA";
const LAST_PRACTICE_KEY = "YOGA_LAST_PRACTICE_DATE";

export interface DailyActivity {
  date: string; // YYYY-MM-DD format
  minutesPracticed: number;
  sessionsCompleted: number;
}

export interface ProgressData {
  currentStreak: number; // Days
  longestStreak: number; // Days
  totalMinutes: number; // All-time total
  totalSessions: number; // All-time total
  programsCompleted: number; // Number of full programs completed
  weeklyActivity: DailyActivity[]; // Last 7 days
  lastPracticeDate: string; // YYYY-MM-DD
  updatedAt: string; // ISO timestamp
}

/**
 * Default progress data for new users
 */
const defaultProgress: ProgressData = {
  currentStreak: 0,
  longestStreak: 0,
  totalMinutes: 0,
  totalSessions: 0,
  programsCompleted: 0,
  weeklyActivity: [],
  lastPracticeDate: "",
  updatedAt: new Date().toISOString(),
};

/**
 * Get current date in YYYY-MM-DD format
 */
function getTodayString(): string {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

/**
 * Calculate days between two dates
 */
function daysBetween(date1Str: string, date2Str: string): number {
  if (!date1Str || !date2Str) return 0;
  const d1 = new Date(date1Str);
  const d2 = new Date(date2Str);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get progress data from storage
 */
export async function getProgressData(): Promise<ProgressData> {
  try {
    const stored = await AsyncStorage.getItem(PROGRESS_KEY);
    if (!stored) {
      return defaultProgress;
    }
    const data = JSON.parse(stored) as ProgressData;

    // Update streak based on last practice date
    const today = getTodayString();
    const daysSinceLastPractice = daysBetween(data.lastPracticeDate, today);

    // If more than 1 day has passed, streak is broken
    if (daysSinceLastPractice > 1) {
      data.currentStreak = 0;
    }

    return data;
  } catch (error) {
    console.error("Failed to load progress data:", error);
    return defaultProgress;
  }
}

/**
 * Record a completed practice session
 * Updates streak, total minutes, sessions count, and weekly activity
 */
export async function recordPracticeSession(
  durationMinutes: number,
  sessionCount: number = 1
): Promise<ProgressData> {
  try {
    const current = await getProgressData();
    const today = getTodayString();

    // Calculate new streak
    const daysSinceLastPractice = daysBetween(current.lastPracticeDate, today);
    let newStreak = current.currentStreak;

    if (!current.lastPracticeDate) {
      // First ever practice
      newStreak = 1;
    } else if (daysSinceLastPractice === 0) {
      // Already practiced today, maintain streak
      newStreak = current.currentStreak;
    } else if (daysSinceLastPractice === 1) {
      // Practiced yesterday, increment streak
      newStreak = current.currentStreak + 1;
    } else {
      // Streak broken, start new
      newStreak = 1;
    }

    // Update weekly activity
    const weeklyActivity = [...current.weeklyActivity];
    const todayIndex = weeklyActivity.findIndex((day) => day.date === today);

    if (todayIndex >= 0) {
      // Update today's entry
      weeklyActivity[todayIndex].minutesPracticed += durationMinutes;
      weeklyActivity[todayIndex].sessionsCompleted += sessionCount;
    } else {
      // Add new entry for today
      weeklyActivity.push({
        date: today,
        minutesPracticed: durationMinutes,
        sessionsCompleted: sessionCount,
      });
    }

    // Keep only last 30 days of activity
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);
    const cutoffStr = cutoffDate.toISOString().split("T")[0];
    const filteredActivity = weeklyActivity.filter((day) => day.date >= cutoffStr);

    // Sort by date descending
    filteredActivity.sort((a, b) => b.date.localeCompare(a.date));

    const updated: ProgressData = {
      currentStreak: newStreak,
      longestStreak: Math.max(current.longestStreak, newStreak),
      totalMinutes: current.totalMinutes + durationMinutes,
      totalSessions: current.totalSessions + sessionCount,
      programsCompleted: current.programsCompleted,
      weeklyActivity: filteredActivity,
      lastPracticeDate: today,
      updatedAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error("Failed to record practice session:", error);
    throw error;
  }
}

/**
 * Record a completed program
 */
export async function recordProgramCompletion(): Promise<ProgressData> {
  try {
    const current = await getProgressData();
    const updated: ProgressData = {
      ...current,
      programsCompleted: current.programsCompleted + 1,
      updatedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error("Failed to record program completion:", error);
    throw error;
  }
}

/**
 * Get weekly activity for the last 7 days
 * Returns array with 7 items (today and previous 6 days)
 */
export async function getWeeklyActivity(): Promise<DailyActivity[]> {
  try {
    const progress = await getProgressData();
    const result: DailyActivity[] = [];

    // Generate last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      // Find matching activity
      const activity = progress.weeklyActivity.find((day) => day.date === dateStr);

      result.push({
        date: dateStr,
        minutesPracticed: activity?.minutesPracticed || 0,
        sessionsCompleted: activity?.sessionsCompleted || 0,
      });
    }

    return result;
  } catch (error) {
    console.error("Failed to get weekly activity:", error);
    return [];
  }
}

/**
 * Get week day label (Mon, Tue, etc.)
 */
export function getWeekDayLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[date.getDay()];
}

/**
 * Reset all progress data (for testing or user request)
 */
export async function resetProgressData(): Promise<void> {
  try {
    await AsyncStorage.removeItem(PROGRESS_KEY);
    await AsyncStorage.removeItem(LAST_PRACTICE_KEY);
  } catch (error) {
    console.error("Failed to reset progress data:", error);
  }
}

/**
 * Get this week's total sessions target
 * Based on user's practice frequency (default: 5 sessions per week)
 */
export function getWeeklySessionsTarget(): number {
  return 5; // Can be made dynamic based on user preferences
}

/**
 * Calculate weekly completion percentage
 */
export async function getWeeklyCompletionPercentage(): Promise<number> {
  const weekly = await getWeeklyActivity();
  const completed = weekly.reduce((sum, day) => sum + day.sessionsCompleted, 0);
  const target = getWeeklySessionsTarget();
  return Math.min(100, Math.round((completed / target) * 100));
}
