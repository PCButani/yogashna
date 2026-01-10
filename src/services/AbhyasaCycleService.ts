/**
 * AbhyasaCycle Service
 * Generates and caches user's personalized 21-day practice cycle
 * Links to ProgramTemplate for master content
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PracticePreferences } from "./PracticePreferences";
import type {
  AbhyasaCycle,
  AbhyasaDayPlan,
  AbhyasaPlaylistItem,
  ProgramTemplate,
} from "../data/models/ProgramTemplate";
import { getProgramTemplateById } from "../data/sources/ProgramTemplates";

const CYCLE_CACHE_KEY = "ABHYASA_CYCLE";
const CYCLE_VERSION_KEY = "ABHYASA_CYCLE_VERSION";

/**
 * Map user's practice preferences to a ProgramTemplate
 */
export function getProgramTemplateForPreferences(
  preferences: PracticePreferences
): ProgramTemplate | null {
  const { focus, goals } = preferences;
  const primaryGoal = goals && goals.length > 0 ? goals[0].toLowerCase() : "";

  // Map based on focus category and goals
  if (focus === "Health Support") {
    if (primaryGoal.includes("back")) {
      return getProgramTemplateById("prog_back_relief_21");
    }
    if (primaryGoal.includes("neck") || primaryGoal.includes("shoulder")) {
      return getProgramTemplateById("prog_neck_shoulder_relief");
    }
    if (primaryGoal.includes("diabetes")) {
      return getProgramTemplateById("prog_diabetes_30");
    }
    return getProgramTemplateById("prog_back_relief_21");
  }

  if (focus === "Lifestyle & Habits") {
    if (primaryGoal.includes("sleep")) {
      return getProgramTemplateById("prog_better_sleep");
    }
    if (primaryGoal.includes("morning") || primaryGoal.includes("energy")) {
      return getProgramTemplateById("prog_morning_energy");
    }
    return getProgramTemplateById("prog_better_sleep");
  }

  if (focus === "Fitness & Flexibility") {
    if (primaryGoal.includes("hip")) {
      return getProgramTemplateById("prog_hip_opening");
    }
    if (primaryGoal.includes("flexibility") || primaryGoal.includes("stretch")) {
      return getProgramTemplateById("prog_flexibility_challenge");
    }
    return getProgramTemplateById("prog_hip_opening");
  }

  if (focus === "Beginners & Mindfulness") {
    if (primaryGoal.includes("breath") || primaryGoal.includes("pranayama")) {
      return getProgramTemplateById("prog_breath_reset");
    }
    if (primaryGoal.includes("meditation")) {
      return getProgramTemplateById("prog_meditation_journey");
    }
    return getProgramTemplateById("prog_sun_salutation");
  }

  if (focus === "Office Yoga") {
    if (primaryGoal.includes("desk") || primaryGoal.includes("posture")) {
      return getProgramTemplateById("prog_desk_posture");
    }
    return getProgramTemplateById("prog_chair_stretch");
  }

  // Fallback
  return getProgramTemplateById("prog_sun_salutation");
}

/**
 * Generate personalized 21-day cycle based on preferences
 */
export function generate21DayCycle(
  preferences: PracticePreferences,
  minutesPreference: number
): AbhyasaDayPlan[] {
  const days: AbhyasaDayPlan[] = [];

  for (let dayNum = 1; dayNum <= 21; dayNum++) {
    const week = Math.ceil(dayNum / 7);
    const theme = getDayTheme(dayNum, week);
    const sessions = generateDaySessions(dayNum, week, preferences, minutesPreference);

    days.push({
      dayNumber: dayNum,
      theme,
      sessions,
      totalDuration: sessions.reduce((sum, s) => sum + s.durationMin, 0),
      isCompleted: false,
    });
  }

  return days;
}

/**
 * Get or generate cached AbhyasaCycle
 */
export async function getAbhyasaCycle(
  preferences: PracticePreferences
): Promise<AbhyasaCycle> {
  try {
    const minutesPreference = getMinutesFromLength(preferences.length);
    const prefsVersion = JSON.stringify({
      focus: preferences.focus,
      goals: preferences.goals,
      level: preferences.level,
      length: preferences.length,
    });

    const [cachedCycle, cachedVersion] = await Promise.all([
      AsyncStorage.getItem(CYCLE_CACHE_KEY),
      AsyncStorage.getItem(CYCLE_VERSION_KEY),
    ]);

    if (cachedCycle && cachedVersion === prefsVersion) {
      return JSON.parse(cachedCycle) as AbhyasaCycle;
    }

    // Generate new cycle
    const programTemplate = getProgramTemplateForPreferences(preferences);
    const days = generate21DayCycle(preferences, minutesPreference);

    const newCycle: AbhyasaCycle = {
      id: `cycle_${Date.now()}`,
      userId: "local",
      programTemplateId: programTemplate?.id || "prog_sun_salutation",
      days,
      minutesPreference,
      startDate: new Date().toISOString(),
      generatedAt: new Date().toISOString(),
      version: prefsVersion,
      completedDays: 0,
      currentDayNumber: 1,
    };

    await Promise.all([
      AsyncStorage.setItem(CYCLE_CACHE_KEY, JSON.stringify(newCycle)),
      AsyncStorage.setItem(CYCLE_VERSION_KEY, prefsVersion),
    ]);

    return newCycle;
  } catch (error) {
    console.error("Failed to get AbhyasaCycle:", error);
    const programTemplate = getProgramTemplateForPreferences(preferences);
    const minutesPreference = getMinutesFromLength(preferences.length);
    return {
      id: `cycle_error`,
      userId: "local",
      programTemplateId: programTemplate?.id || "prog_sun_salutation",
      days: generate21DayCycle(preferences, minutesPreference),
      minutesPreference,
      startDate: new Date().toISOString(),
      generatedAt: new Date().toISOString(),
      version: "error",
      completedDays: 0,
      currentDayNumber: 1,
    };
  }
}

/**
 * Clear cached cycle
 */
export async function clearAbhyasaCycleCache(): Promise<void> {
  try {
    await Promise.all([
      AsyncStorage.removeItem(CYCLE_CACHE_KEY),
      AsyncStorage.removeItem(CYCLE_VERSION_KEY),
    ]);
  } catch (error) {
    console.error("Failed to clear cycle cache:", error);
  }
}

// Helper functions

function getMinutesFromLength(length: PracticePreferences["length"]): number {
  switch (length) {
    case "Quick":
      return 10;
    case "Balanced":
      return 20;
    case "Deep":
      return 30;
    default:
      return 20;
  }
}

function getDayTheme(dayNum: number, week: number): string {
  const dayInWeek = ((dayNum - 1) % 7) + 1;

  if (week === 1) {
    if (dayInWeek === 1) return "Welcome & Foundation";
    if (dayInWeek === 7) return "Week 1 Integration";
    return "Building Foundation";
  } else if (week === 2) {
    if (dayInWeek === 1) return "Deepening Practice";
    if (dayInWeek === 7) return "Week 2 Reflection";
    return "Building Strength & Flexibility";
  } else {
    if (dayInWeek === 1) return "Advanced Integration";
    if (dayInWeek === 7) return "21-Day Completion";
    return "Deep Practice & Mastery";
  }
}

function generateDaySessions(
  dayNum: number,
  week: number,
  preferences: PracticePreferences,
  totalMinutes: number
): AbhyasaPlaylistItem[] {
  const sessions: AbhyasaPlaylistItem[] = [];
  const warmupMin = Math.floor(totalMinutes * 0.2);
  const mainMin = Math.floor(totalMinutes * 0.6);
  const cooldownMin = totalMinutes - warmupMin - mainMin;

  const { focus, goals, level, time } = preferences;
  const primaryGoal = goals && goals.length > 0 ? goals[0] : "General Wellness";

  // 1. WARM-UP
  sessions.push({
    id: `abhyasa-d${dayNum}-warmup`,
    title: getWarmupTitle(dayNum, week, time),
    sanskritTitle: "Sūkṣma Vyāyāma",
    durationMin: warmupMin,
    style: "Hatha",
    focusTags: ["Gentle Movement", "Joint Mobility", "Breath Awareness"],
    videoUrl: "",
    sequenceType: "warmup",
  });

  // 2. MAIN PRACTICE
  sessions.push({
    id: `abhyasa-d${dayNum}-main`,
    title: getMainPracticeTitle(dayNum, week, focus, primaryGoal),
    sanskritTitle: getMainPracticeSanskrit(focus, week),
    durationMin: mainMin,
    style: getMainPracticeStyle(level, week),
    focusTags: getMainPracticeTags(focus, primaryGoal, week),
    videoUrl: "",
    sequenceType: "main",
  });

  // 3. COOL-DOWN
  sessions.push({
    id: `abhyasa-d${dayNum}-cooldown`,
    title: getCooldownTitle(dayNum, week),
    sanskritTitle: "Śavāsana Prāṇāyāma",
    durationMin: cooldownMin,
    style: "Restorative",
    focusTags: ["Deep Relaxation", "Breath Work", "Integration"],
    videoUrl: "",
    sequenceType: "cooldown",
  });

  return sessions;
}

function getWarmupTitle(
  dayNum: number,
  week: number,
  time: PracticePreferences["time"]
): string {
  if (dayNum === 1) return "Welcome Warm-Up";
  if (dayNum === 21) return "Completion Warm-Up";

  if (time === "Morning") {
    return week === 1
      ? "Gentle Morning Awakening"
      : week === 2
      ? "Energizing Morning Flow"
      : "Dynamic Morning Practice";
  } else if (time === "Evening") {
    return week === 1
      ? "Calming Evening Warm-Up"
      : week === 2
      ? "Grounding Evening Flow"
      : "Restorative Evening Prep";
  }

  return week === 1
    ? "Mindful Body Warm-Up"
    : week === 2
    ? "Progressive Warm-Up"
    : "Advanced Warm-Up Flow";
}

function getMainPracticeTitle(
  dayNum: number,
  week: number,
  focus: PracticePreferences["focus"],
  goal: string
): string {
  if (dayNum === 1) return "Day 1: Introduction to Your Practice";
  if (dayNum === 7) return "Week 1 Integration Flow";
  if (dayNum === 14) return "Week 2 Reflection Flow";
  if (dayNum === 21) return "21-Day Completion Celebration";

  const weekPrefix = week === 1 ? "Foundation" : week === 2 ? "Building" : "Mastery";

  if (goal.toLowerCase().includes("back")) {
    return `${weekPrefix}: Spine Care Practice`;
  }
  if (goal.toLowerCase().includes("stress")) {
    return `${weekPrefix}: Stress Relief Flow`;
  }
  if (goal.toLowerCase().includes("sleep")) {
    return `${weekPrefix}: Evening Unwind`;
  }
  if (goal.toLowerCase().includes("flexibility")) {
    return `${weekPrefix}: Deep Stretch Flow`;
  }

  switch (focus) {
    case "Health Support":
      return `${weekPrefix}: Therapeutic Practice`;
    case "Fitness & Flexibility":
      return `${weekPrefix}: Dynamic Flow`;
    case "Office Yoga":
      return `${weekPrefix}: Desk Relief Practice`;
    default:
      return `${weekPrefix}: Balanced Flow`;
  }
}

function getMainPracticeSanskrit(
  focus: PracticePreferences["focus"],
  week: number
): string {
  const suffix = week === 1 ? "Prārambha" : week === 2 ? "Vikāsa" : "Siddhi";

  switch (focus) {
    case "Health Support":
      return `Cikitsā ${suffix}`;
    case "Fitness & Flexibility":
      return `Śakti ${suffix}`;
    case "Office Yoga":
      return `Kāryālaya ${suffix}`;
    default:
      return `Yoga ${suffix}`;
  }
}

function getMainPracticeStyle(
  level: PracticePreferences["level"],
  week: number
): string {
  if (level === "Beginner") {
    return week === 3 ? "Vinyasa" : "Hatha";
  } else if (level === "Intermediate") {
    return "Vinyasa";
  } else {
    return "Vinyasa";
  }
}

function getMainPracticeTags(
  focus: PracticePreferences["focus"],
  goal: string,
  week: number
): string[] {
  const tags: string[] = [];

  if (goal.toLowerCase().includes("back")) {
    tags.push("Back Care", "Spinal Health");
  }
  if (goal.toLowerCase().includes("stress")) {
    tags.push("Stress Relief", "Calming");
  }
  if (goal.toLowerCase().includes("flexibility")) {
    tags.push("Flexibility", "Deep Stretch");
  }

  switch (focus) {
    case "Health Support":
      tags.push("Therapeutic");
      break;
    case "Fitness & Flexibility":
      tags.push("Strength Building");
      break;
    case "Office Yoga":
      tags.push("Desk Relief");
      break;
  }

  if (week === 1) tags.push("Foundation");
  else if (week === 2) tags.push("Progressive");
  else tags.push("Advanced");

  return tags.slice(0, 3);
}

function getCooldownTitle(dayNum: number, week: number): string {
  if (dayNum === 1) return "Welcome Rest & Integration";
  if (dayNum === 21) return "Completion Meditation";

  return week === 1
    ? "Restorative Cool-Down"
    : week === 2
    ? "Deep Relaxation & Breath"
    : "Integration & Stillness";
}
