/**
 * ProgramTemplateSchedules - Day/session structure for Library programs
 * References ProgramTemplate by ID for master content
 * Contains ONLY session scheduling data, no metadata duplication
 */

export type SessionLockState = "completed" | "current" | "locked";

export type YogaStyle =
  | "Hatha"
  | "Vinyasa"
  | "Yin"
  | "Restorative"
  | "Pranayama"
  | "Meditation"
  | "Mobility"
  | "Gentle"
  | "Gentle Flow"
  | "Chair Yoga";

export interface ScheduleSession {
  id: string;
  title: string;
  sanskritTitle?: string;
  durationMin: number;
  style: YogaStyle;
  focusTags: string[];
  videoId?: string;
}

export interface ScheduleDay {
  dayNumber: number;
  state: SessionLockState;
  session: ScheduleSession; // Main session (backward compatibility)
  sessions: ScheduleSession[]; // All sessions for the day
}

export interface ProgramTemplateSchedule {
  programTemplateId: string; // References ProgramTemplate.id
  totalDays: number;
  avgDailyMinutes: number;
  days: ScheduleDay[];
}

// Helper to generate day list with completed/current/locked states
function buildDays(
  programId: string,
  totalDays: number,
  completedDays: number,
  styles: YogaStyle[] = ["Hatha", "Vinyasa", "Pranayama"],
  focusTags: string[][] = [
    ["Mobility", "Strength"],
    ["Breath", "Calm"],
    ["Balance", "Focus"],
  ]
): ScheduleDay[] {
  const days: ScheduleDay[] = [];

  for (let i = 1; i <= totalDays; i++) {
    const state: SessionLockState =
      i <= completedDays ? "completed" : i === completedDays + 1 ? "current" : "locked";

    const styleIndex = (i - 1) % styles.length;
    const tagsIndex = (i - 1) % focusTags.length;

    // Generate 2-3 sessions per day
    const sessionCount = i % 3 === 0 ? 3 : 2;
    const sessions: ScheduleSession[] = [];

    for (let s = 0; s < sessionCount; s++) {
      const sessionTypes = [
        { prefix: "Warm-up", duration: 5 },
        { prefix: "Main Practice", duration: 15 },
        { prefix: "Cool-down", duration: 5 },
      ];
      const sessionType = sessionTypes[s] || sessionTypes[1];

      sessions.push({
        id: `${programId}-day-${i}-session-${s + 1}`,
        title: `${sessionType.prefix}: ${getDayTitle(i, programId)}`,
        sanskritTitle: i % 3 === 0 && s === 1 ? getSanskritTitle(i) : undefined,
        durationMin: sessionType.duration + ((i - 1) % 3) * 2,
        style: styles[styleIndex],
        focusTags: focusTags[tagsIndex],
      });
    }

    // First main session for backward compatibility
    const mainSession = sessions[1] || sessions[0];

    days.push({
      dayNumber: i,
      state,
      session: mainSession,
      sessions,
    });
  }

  return days;
}

// Helper to generate contextual day titles
function getDayTitle(dayNumber: number, programId: string): string {
  if (programId.includes("back_relief")) {
    const titles = [
      "Gentle Spine Awakening",
      "Core Foundation",
      "Lower Back Release",
      "Hip Flexor Opening",
      "Spinal Twist Flow",
      "Cat-Cow Variations",
      "Bridge & Extension",
      "Side Body Lengthening",
      "Full Spine Integration",
      "Restorative Back Care",
    ];
    return titles[(dayNumber - 1) % titles.length];
  }

  if (programId.includes("diabetes")) {
    const titles = [
      "Gentle Movement Flow",
      "Standing Strength",
      "Hip & Leg Circulation",
      "Breath & Balance",
      "Core Stability",
      "Full Body Integration",
      "Restorative Practice",
    ];
    return titles[(dayNumber - 1) % titles.length];
  }

  if (programId.includes("desk")) {
    const titles = [
      "Neck Release",
      "Shoulder Opening",
      "Upper Back Reset",
      "Wrist & Arm Relief",
      "Hip Flexor Stretch",
      "Full Body Integration",
      "Gentle Restoration",
    ];
    return titles[(dayNumber - 1) % titles.length];
  }

  return "Gentle Flow";
}

function getSanskritTitle(dayNumber: number): string {
  const titles = [
    "Sukha Vinyasa",
    "Sthira Sukham",
    "Pranayama Sadhana",
    "Surya Namaskar",
    "Chandra Namaskar",
    "Asana Sadhana",
  ];
  return titles[(dayNumber - 1) % titles.length];
}

// ========================================
// PROGRAM TEMPLATE SCHEDULES
// ========================================

export const PROGRAM_TEMPLATE_SCHEDULES: ProgramTemplateSchedule[] = [
  // HEALTH SUPPORT
  {
    programTemplateId: "prog_back_relief_21",
    totalDays: 14,
    avgDailyMinutes: 20,
    days: buildDays(
      "prog_back_relief_21",
      14,
      3,
      ["Hatha", "Gentle Flow", "Restorative"],
      [
        ["Back Care", "Mobility"],
        ["Core", "Strength"],
        ["Flexibility", "Relief"],
      ]
    ),
  },

  {
    programTemplateId: "prog_diabetes_30",
    totalDays: 21,
    avgDailyMinutes: 25,
    days: buildDays(
      "prog_diabetes_30",
      21,
      5,
      ["Hatha", "Gentle Flow", "Pranayama"],
      [
        ["Circulation", "Balance"],
        ["Strength", "Stability"],
        ["Breath", "Calm"],
      ]
    ),
  },

  {
    programTemplateId: "prog_neck_shoulder_relief",
    totalDays: 7,
    avgDailyMinutes: 15,
    days: buildDays(
      "prog_neck_shoulder_relief",
      7,
      0,
      ["Gentle", "Restorative"],
      [
        ["Neck", "Relief"],
        ["Shoulders", "Mobility"],
      ]
    ),
  },

  // LIFESTYLE & HABITS
  {
    programTemplateId: "prog_morning_energy",
    totalDays: 14,
    avgDailyMinutes: 18,
    days: buildDays(
      "prog_morning_energy",
      14,
      2,
      ["Vinyasa", "Hatha"],
      [
        ["Energy", "Focus"],
        ["Strength", "Mobility"],
      ]
    ),
  },

  {
    programTemplateId: "prog_better_sleep",
    totalDays: 21,
    avgDailyMinutes: 22,
    days: buildDays(
      "prog_better_sleep",
      21,
      7,
      ["Restorative", "Yin", "Pranayama"],
      [
        ["Calm", "Sleep"],
        ["Breath", "Relaxation"],
      ]
    ),
  },

  // FITNESS & FLEXIBILITY
  {
    programTemplateId: "prog_hip_opening",
    totalDays: 21,
    avgDailyMinutes: 25,
    days: buildDays(
      "prog_hip_opening",
      21,
      4,
      ["Hatha", "Yin", "Gentle Flow"],
      [
        ["Hip Opening", "Flexibility"],
        ["Mobility", "Balance"],
      ]
    ),
  },

  {
    programTemplateId: "prog_flexibility_challenge",
    totalDays: 7,
    avgDailyMinutes: 20,
    days: buildDays(
      "prog_flexibility_challenge",
      7,
      0,
      ["Hatha", "Yin"],
      [
        ["Flexibility", "Stretch"],
        ["Mobility", "Balance"],
      ]
    ),
  },

  // BEGINNERS & MINDFULNESS
  {
    programTemplateId: "prog_breath_reset",
    totalDays: 14,
    avgDailyMinutes: 15,
    days: buildDays(
      "prog_breath_reset",
      14,
      1,
      ["Pranayama", "Meditation"],
      [
        ["Breath", "Calm"],
        ["Focus", "Clarity"],
      ]
    ),
  },

  {
    programTemplateId: "prog_meditation_journey",
    totalDays: 21,
    avgDailyMinutes: 12,
    days: buildDays(
      "prog_meditation_journey",
      21,
      8,
      ["Meditation", "Pranayama"],
      [
        ["Meditation", "Mind"],
        ["Calm", "Clarity"],
      ]
    ),
  },

  {
    programTemplateId: "prog_sun_salutation",
    totalDays: 14,
    avgDailyMinutes: 20,
    days: buildDays(
      "prog_sun_salutation",
      14,
      6,
      ["Vinyasa", "Hatha"],
      [
        ["Flow", "Energy"],
        ["Strength", "Flexibility"],
      ]
    ),
  },

  // OFFICE YOGA
  {
    programTemplateId: "prog_desk_posture",
    totalDays: 7,
    avgDailyMinutes: 12,
    days: buildDays(
      "prog_desk_posture",
      7,
      0,
      ["Gentle", "Chair Yoga"],
      [
        ["Desk", "Relief"],
        ["Posture", "Mobility"],
      ]
    ),
  },

  {
    programTemplateId: "prog_chair_stretch",
    totalDays: 14,
    avgDailyMinutes: 10,
    days: buildDays(
      "prog_chair_stretch",
      14,
      0,
      ["Chair Yoga", "Gentle"],
      [
        ["Quick", "Relief"],
        ["Desk", "Mobility"],
      ]
    ),
  },
];

/**
 * Get schedule by ProgramTemplate ID
 */
export function getProgramScheduleById(
  programTemplateId: string
): ProgramTemplateSchedule | null {
  return (
    PROGRAM_TEMPLATE_SCHEDULES.find((s) => s.programTemplateId === programTemplateId) || null
  );
}
