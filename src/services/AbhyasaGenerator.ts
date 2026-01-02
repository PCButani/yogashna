/**
 * Abhyāsa Generator Service
 * Generates personalized daily yoga practice playlists based on user preferences
 * Creates warm-up → main practice → cool-down sequences
 */

import type { PracticePreferences } from "./PracticePreferences";
import type { AbhyasaPlaylistItem } from "../data/models/ProgramTemplate";

// Sample video URLs for testing playlist functionality
// Each video has a distinct URL to ensure proper player key updates on Android
const WARMUP_VIDEO_URL =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
const MAIN_VIDEO_URL =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4";
const COOLDOWN_VIDEO_URL =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

// Fallback video URL
const VIDEO_URL = WARMUP_VIDEO_URL;

/**
 * Generate today's Abhyāsa playlist based on user preferences
 * Returns an array of sessions in sequence: warm-up → main → cool-down
 */
export function generateTodaysAbhyasa(preferences: PracticePreferences): AbhyasaPlaylistItem[] {
  const { focus, goals, level, length, time } = preferences;

  // Calculate session durations based on total length
  const totalMinutes = getTotalMinutes(length);
  const warmupMin = Math.floor(totalMinutes * 0.2); // 20% warm-up
  const mainMin = Math.floor(totalMinutes * 0.6); // 60% main practice
  const cooldownMin = totalMinutes - warmupMin - mainMin; // Remaining for cool-down

  // Get primary goal for session focus
  const primaryGoal = goals && goals.length > 0 ? goals[0] : "General Wellness";

  // Generate session sequence
  const sessions: AbhyasaPlaylistItem[] = [];

  // 1. WARM-UP SESSION
  sessions.push({
    id: `abhyasa-warmup-${Date.now()}`,
    title: getWarmupTitle(time),
    sanskritTitle: "Sūkṣma Vyāyāma",
    durationMin: warmupMin,
    style: "Hatha",
    focusTags: ["Gentle Movement", "Joint Mobility", "Breath Awareness"],
    videoUrl: WARMUP_VIDEO_URL,
    sequenceType: "warmup",
  });

  // 2. MAIN PRACTICE SESSION
  sessions.push({
    id: `abhyasa-main-${Date.now()}`,
    title: getMainPracticeTitle(focus, primaryGoal),
    sanskritTitle: getMainPracticeSanskrit(focus),
    durationMin: mainMin,
    style: getMainPracticeStyle(level),
    focusTags: getMainPracticeTags(focus, primaryGoal),
    videoUrl: MAIN_VIDEO_URL,
    sequenceType: "main",
  });

  // 3. COOL-DOWN SESSION
  sessions.push({
    id: `abhyasa-cooldown-${Date.now()}`,
    title: "Restorative Wind-Down",
    sanskritTitle: "Śavāsana Prāṇāyāma",
    durationMin: cooldownMin,
    style: "Restorative",
    focusTags: ["Deep Relaxation", "Breath Work", "Stillness"],
    videoUrl: COOLDOWN_VIDEO_URL,
    sequenceType: "cooldown",
  });

  return sessions
    .map((session) => ({
      ...session,
      videoUrl: ensureValidVideoUrl(session.videoUrl),
    }))
    .filter((session) => !!session.videoUrl);
}

function ensureValidVideoUrl(url?: string): string {
  const trimmed = url?.trim();
  return trimmed ? trimmed : VIDEO_URL;
}

/**
 * Helper: Get total minutes based on session length preference
 */
function getTotalMinutes(length: PracticePreferences["length"]): number {
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

/**
 * Helper: Get warm-up title based on preferred time
 */
function getWarmupTitle(time: PracticePreferences["time"]): string {
  switch (time) {
    case "Morning":
      return "Awakening Sun Warm-Up";
    case "Evening":
      return "Gentle Evening Warm-Up";
    default:
      return "Mindful Body Warm-Up";
  }
}

/**
 * Helper: Get main practice title based on focus and goal
 */
function getMainPracticeTitle(
  focus: PracticePreferences["focus"],
  goal: string
): string {
  if (goal.toLowerCase().includes("back")) {
    return "Spine Care Flow";
  }
  if (goal.toLowerCase().includes("stress")) {
    return "Calming Stress Relief Flow";
  }
  if (goal.toLowerCase().includes("sleep")) {
    return "Evening Unwind Flow";
  }
  if (goal.toLowerCase().includes("flexibility")) {
    return "Deep Stretch Flow";
  }
  if (goal.toLowerCase().includes("strength")) {
    return "Strengthening Flow";
  }

  // Default based on focus
  switch (focus) {
    case "Health Support":
      return "Therapeutic Healing Flow";
    case "Lifestyle & Habits":
      return "Daily Wellness Flow";
    case "Fitness & Flexibility":
      return "Dynamic Flexibility Flow";
    case "Beginners & Mindfulness":
      return "Mindful Beginner Flow";
    case "Office Yoga":
      return "Desk Relief Flow";
    default:
      return "Balanced Yoga Flow";
  }
}

/**
 * Helper: Get Sanskrit name for main practice
 */
function getMainPracticeSanskrit(focus: PracticePreferences["focus"]): string {
  switch (focus) {
    case "Health Support":
      return "Cikitsā Yoga";
    case "Lifestyle & Habits":
      return "Dina Abhyāsa";
    case "Fitness & Flexibility":
      return "Śakti Vikāsa";
    case "Beginners & Mindfulness":
      return "Sthira Sukham";
    case "Office Yoga":
      return "Kāryālaya Yoga";
    default:
      return "Yoga Sādhana";
  }
}

/**
 * Helper: Get yoga style for main practice based on level
 */
function getMainPracticeStyle(
  level: PracticePreferences["level"]
): string {
  switch (level) {
    case "Beginner":
      return "Hatha";
    case "Intermediate":
      return "Vinyasa";
    case "Expert":
      return "Vinyasa";
    default:
      return "Hatha";
  }
}

/**
 * Helper: Get focus tags for main practice
 */
function getMainPracticeTags(
  focus: PracticePreferences["focus"],
  goal: string
): string[] {
  const tags: string[] = [];

  // Add goal-specific tags
  if (goal.toLowerCase().includes("back")) {
    tags.push("Back Care", "Spinal Health");
  }
  if (goal.toLowerCase().includes("stress")) {
    tags.push("Stress Relief", "Calming");
  }
  if (goal.toLowerCase().includes("sleep")) {
    tags.push("Sleep Support", "Relaxation");
  }
  if (goal.toLowerCase().includes("flexibility")) {
    tags.push("Flexibility", "Deep Stretch");
  }

  // Add focus-specific tags
  switch (focus) {
    case "Health Support":
      tags.push("Therapeutic", "Gentle");
      break;
    case "Fitness & Flexibility":
      tags.push("Strength Building", "Flexibility");
      break;
    case "Office Yoga":
      tags.push("Desk Relief", "Posture Correction");
      break;
    default:
      tags.push("Balanced Practice");
  }

  // Always include breath awareness
  if (!tags.includes("Breath Awareness")) {
    tags.push("Breath Awareness");
  }

  return tags.slice(0, 3); // Max 3 tags
}
