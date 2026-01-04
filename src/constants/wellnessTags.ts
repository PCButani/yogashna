/**
 * Wellness Focus and Goal Tag Code Mappings
 *
 * Maps display names (used in mobile UI) to tag codes (stored in backend database).
 * These codes MUST match the 'code' field in backend/prisma/seed.ts
 *
 * IMPORTANT: Since some goal names appear in multiple wellness focuses (e.g., "Better Sleep", "Stress Relief"),
 * we use a context-aware mapping function that considers the selected wellness focus.
 */

export type WellnessFocusCode =
  | "health_support"
  | "lifestyle_habits"
  | "fitness_flexibility"
  | "beginners_mindfulness"
  | "office_yoga";

/**
 * Map wellness focus display names to tag codes
 */
export const WELLNESS_FOCUS_TO_CODE: Record<string, WellnessFocusCode> = {
  "Health Support": "health_support",
  "Lifestyle & Habits": "lifestyle_habits",
  "Fitness & Flexibility": "fitness_flexibility",
  "Beginners & Mindfulness": "beginners_mindfulness",
  "Office Yoga": "office_yoga",
};

const WELLNESS_FOCUS_FROM_CODE: Record<WellnessFocusCode, string> = Object.fromEntries(
  Object.entries(WELLNESS_FOCUS_TO_CODE).map(([label, code]) => [code, label])
) as Record<WellnessFocusCode, string>;

/**
 * Context-aware mapping: wellness_focus → goal_display_name → goal_code
 * Handles duplicate goal names across different wellness focuses
 */
const WELLNESS_GOAL_MAPPINGS: Record<WellnessFocusCode, Record<string, string>> = {
  health_support: {
    "Back Pain Relief": "reduce_back_pain",
    "Stress Relief": "stress_relief_health",
    "Diabetes Support": "diabetes_support",
    "PCOS Balance": "pcos_balance",
    "Thyroid Support": "thyroid_support",
    "Better Sleep": "better_sleep_health",
  },
  lifestyle_habits: {
    "Daily Routine": "daily_routine",
    "Better Sleep": "better_sleep_lifestyle",
    "Mindful Living": "mindful_living",
    "Discipline & Consistency": "discipline_consistency",
    "Energy Boost": "energy_boost",
  },
  fitness_flexibility: {
    "Weight Loss": "weight_loss",
    "Strength Building": "strength_building",
    "Flexibility": "flexibility",
    "Posture सुधार": "posture_improvement",
    "Core Stability": "core_stability",
  },
  beginners_mindfulness: {
    "Beginner Friendly": "beginner_friendly",
    "Breathing Practice": "breathing_practice",
    "Calm Mind": "calm_mind",
    "Anxiety Relief": "anxiety_relief",
    "Focus & Clarity": "focus_clarity",
  },
  office_yoga: {
    "Neck & Shoulder Relief": "neck_shoulder_relief",
    "Back Release": "back_release",
    "Desk Stretching": "desk_stretching",
    "Stress Relief": "stress_relief_office",
    "Energy at Work": "energy_at_work",
  },
};

const WELLNESS_GOAL_CODE_TO_LABEL: Record<string, string> = Object.entries(
  WELLNESS_GOAL_MAPPINGS
).reduce((acc, [, mapping]) => {
  Object.entries(mapping).forEach(([label, code]) => {
    acc[code] = label;
  });
  return acc;
}, {} as Record<string, string>);

/**
 * Convert wellness focus display name to tag code
 */
export function getWellnessFocusCode(displayName: string | null): WellnessFocusCode | null {
  if (!displayName) return null;
  return WELLNESS_FOCUS_TO_CODE[displayName] || null;
}

export function getWellnessFocusLabel(code: string | null): string | null {
  if (!code) return null;
  return WELLNESS_FOCUS_FROM_CODE[code as WellnessFocusCode] || null;
}

/**
 * Convert wellness goal display name to tag code
 * Requires wellness focus context to handle duplicate goal names
 *
 * @param goalDisplayName - The goal display name from UI (e.g., "Better Sleep")
 * @param wellnessFocusDisplayName - The wellness focus display name (e.g., "Health Support")
 * @returns The goal tag code or null
 */
export function getWellnessGoalCode(
  goalDisplayName: string | null,
  wellnessFocusDisplayName: string | null
): string | null {
  if (!goalDisplayName || !wellnessFocusDisplayName) return null;

  const focusCode = getWellnessFocusCode(wellnessFocusDisplayName);
  if (!focusCode) return null;

  const goalMapping = WELLNESS_GOAL_MAPPINGS[focusCode];
  return goalMapping?.[goalDisplayName] || null;
}

export function getWellnessGoalLabel(code: string | null): string | null {
  if (!code) return null;
  return WELLNESS_GOAL_CODE_TO_LABEL[code] || null;
}
