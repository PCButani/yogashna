// src/data/mock/programs.ts

import { Program } from "./models";

const VIDEO =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

// Helper to generate day list with completed/current/locked states
function buildDays(
  programId: string,
  totalDays: number,
  completedDays: number,
  styles: string[] = ["Hatha", "Vinyasa", "Pranayama"],
  focusTags: string[][] = [
    ["Mobility", "Strength"],
    ["Breath", "Calm"],
    ["Balance", "Focus"],
  ]
): Program["days"] {
  const days: Program["days"] = [];

  for (let i = 1; i <= totalDays; i++) {
    const state =
      i <= completedDays ? "completed" : i === completedDays + 1 ? "current" : "locked";

    const styleIndex = (i - 1) % styles.length;
    const tagsIndex = (i - 1) % focusTags.length;

    // Generate 2-3 sessions per day
    const sessionCount = i % 3 === 0 ? 3 : 2; // Every 3rd day has 3 sessions, others have 2
    const sessions = [];

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
        style: styles[styleIndex] as any,
        focusTags: focusTags[tagsIndex],
        videoUrl: VIDEO,
      });
    }

    // First session is the "main" one for backward compatibility
    const mainSession = sessions[1] || sessions[0];

    days.push({
      dayNumber: i,
      state,
      session: mainSession, // Backward compatibility: single main session
      sessions, // NEW: Array of all sessions for the day
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

  // Default generic titles
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

export const mockPrograms: Program[] = [
  // ========================================
  // HEALTH SUPPORT PROGRAMS
  // ========================================
  {
    id: "prog_back_relief_21",
    category: "Health Support",
    title: "Back Pain Relief",
    sanskritTitle: "Pṛṣṭha Sukha",
    subtitle: "Gentle mobility + core support practices",
    bannerImage:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1400&q=60",
    level: "Beginner",
    totalDays: 14,
    avgDailyMinutes: 20,
    benefits: [
      "Improved spine mobility and flexibility",
      "Reduced lower back stiffness and tension",
      "Stronger core muscles for better posture support",
      "Gentle strengthening without strain",
      "Better awareness of body alignment",
      "Relief from desk-related back pain",
    ],
    equipment: ["Yoga mat", "Yoga block (optional)", "Folded blanket or towel"],
    tags: ["Back care", "Posture", "Gentle", "Therapeutic"],
    disclaimer:
      "This program is designed for general wellness and education. It is not a substitute for medical advice, diagnosis, or treatment. If you have severe pain, numbness, tingling, or a diagnosed spinal condition, please consult a healthcare professional before starting this practice.",
    contraindications: [
      "Avoid deep forward folds if you have a herniated or slipped disc",
      "Avoid sharp twisting movements if you experience pain",
      "Skip inversions if you have high blood pressure or glaucoma",
      "Move slowly and stay within your comfortable range of motion",
      "Stop immediately if you feel sharp or shooting pain",
    ],
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
    id: "prog_diabetes_30",
    category: "Health Support",
    title: "Diabetes Support",
    sanskritTitle: "Madhumeha Sadhana",
    subtitle: "Support metabolism and circulation with steady practice",
    bannerImage:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1400&q=60",
    level: "Beginner",
    totalDays: 21,
    avgDailyMinutes: 25,
    benefits: [
      "Improved insulin sensitivity through regular movement",
      "Better blood sugar regulation support",
      "Enhanced circulation and cardiovascular health",
      "Stress reduction for better hormonal balance",
      "Gentle strengthening for metabolic support",
      "Improved energy levels and vitality",
      "Better sleep quality and recovery",
    ],
    equipment: ["Yoga mat", "Yoga block", "Chair or wall for support"],
    tags: ["Metabolic", "Circulation", "All Levels", "Therapeutic"],
    disclaimer:
      "This program complements but does not replace medical treatment for diabetes. Continue taking prescribed medications and monitoring blood sugar as directed by your doctor. Consult your healthcare provider before starting any new exercise program.",
    contraindications: [
      "Check blood sugar before and after practice, especially if on insulin",
      "Have a snack nearby in case of low blood sugar (hypoglycemia)",
      "Avoid strenuous inversions if you have diabetic retinopathy",
      "Skip poses that cause dizziness or excessive strain",
      "Stay hydrated throughout your practice",
      "Inform your doctor about your yoga practice",
    ],
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
    id: "prog_neck_shoulder_relief",
    category: "Health Support",
    title: "Neck & Shoulder Relief",
    sanskritTitle: "Greeva Skandha Sukha",
    subtitle: "Release tension from desk work and screen time",
    bannerImage:
      "https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=1400&q=60",
    level: "Beginner",
    totalDays: 7,
    avgDailyMinutes: 15,
    benefits: [
      "Relief from tech neck and desk posture strain",
      "Reduced tension headaches",
      "Improved neck and shoulder mobility",
      "Better upper body alignment",
      "Decreased muscle tightness and knots",
    ],
    equipment: ["Yoga mat", "Optional towel or strap"],
    tags: ["Neck", "Shoulders", "Relief", "Quick"],
    disclaimer:
      "This program is for general wellness. If you have chronic pain, recent injury, or diagnosed cervical spine issues, consult a healthcare professional before practice.",
    contraindications: [
      "Avoid if you have acute neck injury or whiplash",
      "Move gently and never force neck movements",
      "Skip deep backbends if you have cervical spine issues",
      "Stop if you feel numbness or tingling in arms",
    ],
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

  // ========================================
  // LIFESTYLE & HABITS PROGRAMS
  // ========================================
  {
    id: "prog_morning_energy",
    category: "Lifestyle & Habits",
    title: "Morning Energy",
    sanskritTitle: "Prabhata Shakti",
    subtitle: "Start your day with vitality and focus",
    bannerImage:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1400&q=60",
    level: "Beginner",
    totalDays: 14,
    avgDailyMinutes: 18,
    benefits: [
      "Natural energy boost without caffeine",
      "Improved morning focus and mental clarity",
      "Better circulation and metabolism activation",
      "Positive mood and mindset for the day",
      "Gentle awakening for body and mind",
    ],
    equipment: ["Yoga mat"],
    tags: ["Morning", "Energy", "Routine", "Quick"],
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
    id: "prog_better_sleep",
    category: "Lifestyle & Habits",
    title: "Better Sleep",
    sanskritTitle: "Nidra Sadhana",
    subtitle: "Evening practices for deep, restorative rest",
    bannerImage:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1400&q=60",
    level: "Beginner",
    totalDays: 21,
    avgDailyMinutes: 22,
    benefits: [
      "Fall asleep faster and more easily",
      "Deeper, more restorative sleep quality",
      "Reduced nighttime anxiety and racing thoughts",
      "Calmer nervous system before bed",
      "Better sleep-wake cycle regulation",
    ],
    equipment: ["Yoga mat", "Pillow or bolster", "Blanket"],
    tags: ["Sleep", "Evening", "Calm", "Restorative"],
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

  // ========================================
  // FITNESS & FLEXIBILITY PROGRAMS
  // ========================================
  {
    id: "prog_hip_opening",
    category: "Fitness & Flexibility",
    title: "Hip Opening Journey",
    sanskritTitle: "Kati Vikas",
    subtitle: "Unlock tight hips and improve lower body mobility",
    bannerImage:
      "https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=1400&q=60",
    level: "Beginner",
    totalDays: 21,
    avgDailyMinutes: 25,
    benefits: [
      "Increased hip flexibility and range of motion",
      "Relief from lower back tension",
      "Better posture and alignment",
      "Improved circulation in lower body",
      "Emotional release and stress relief",
    ],
    equipment: ["Yoga mat", "Yoga block", "Strap or belt"],
    tags: ["Hips", "Flexibility", "Mobility", "Beginner"],
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
    id: "prog_flexibility_challenge",
    category: "Fitness & Flexibility",
    title: "7-Day Flexibility Challenge",
    subtitle: "One week to noticeable flexibility gains",
    bannerImage:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1400&q=60",
    level: "Beginner",
    totalDays: 7,
    avgDailyMinutes: 20,
    benefits: [
      "Measurable flexibility improvement in one week",
      "Full body range of motion enhancement",
      "Better muscle elasticity",
      "Injury prevention through balanced stretching",
    ],
    equipment: ["Yoga mat", "Strap"],
    tags: ["Challenge", "Flexibility", "Quick", "All Levels"],
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

  // ========================================
  // MINDFULNESS PROGRAMS
  // ========================================
  {
    id: "prog_breath_reset",
    category: "Beginners & Mindfulness",
    title: "Breath Reset",
    sanskritTitle: "Pranayama Prashanti",
    subtitle: "Master breathwork for stress relief and focus",
    bannerImage:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1400&q=60",
    level: "Beginner",
    totalDays: 14,
    avgDailyMinutes: 15,
    benefits: [
      "Reduced stress and anxiety through breath control",
      "Improved focus and mental clarity",
      "Better emotional regulation",
      "Enhanced lung capacity and respiratory health",
      "Calmer nervous system response",
    ],
    equipment: ["Yoga mat or comfortable seat", "Optional cushion"],
    tags: ["Pranayama", "Breath", "Calm", "Mindfulness"],
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
    id: "prog_meditation_journey",
    category: "Beginners & Mindfulness",
    title: "Meditation Journey",
    sanskritTitle: "Dhyana Sadhana",
    subtitle: "21 days to establish a meditation practice",
    bannerImage:
      "https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=1400&q=60",
    level: "Beginner",
    totalDays: 21,
    avgDailyMinutes: 12,
    benefits: [
      "Established daily meditation habit",
      "Greater mental clarity and focus",
      "Reduced stress and anxiety",
      "Improved emotional resilience",
      "Better sleep and relaxation",
      "Enhanced self-awareness",
    ],
    equipment: ["Comfortable seat or meditation cushion"],
    tags: ["Meditation", "Mindfulness", "Mind", "Beginner"],
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
    id: "prog_sun_salutation",
    category: "Beginners & Mindfulness",
    title: "Sun Salutation",
    sanskritTitle: "Surya Namaskar",
    subtitle: "Build consistency with a simple daily flow",
    bannerImage:
      "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?auto=format&fit=crop&w=1400&q=60",
    level: "Beginner",
    totalDays: 14,
    avgDailyMinutes: 20,
    benefits: [
      "Better energy and vitality",
      "Improved flexibility and strength",
      "Established morning routine",
      "Mind-body connection and balance",
      "Full body warming and activation",
    ],
    equipment: ["Yoga mat", "Optional yoga block"],
    tags: ["Morning", "Routine", "Beginner", "Flow"],
    disclaimer:
      "This program is for general wellness and not medical advice. Stop if you feel pain.",
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

  // ========================================
  // OFFICE YOGA PROGRAMS
  // ========================================
  {
    id: "prog_desk_posture",
    category: "Office Yoga",
    title: "Desk Posture Reset",
    subtitle: "7-day routine for neck, shoulders, and upper back",
    bannerImage:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1400&q=60",
    level: "Beginner",
    totalDays: 7,
    avgDailyMinutes: 12,
    benefits: [
      "Undo the effects of prolonged sitting",
      "Relief from tech neck and desk posture",
      "Improved upper body alignment",
      "Better circulation during work hours",
      "Reduced tension and stiffness",
    ],
    equipment: ["Chair", "Desk or wall for support"],
    tags: ["Office", "Desk", "Quick", "Beginner"],
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
    id: "prog_chair_stretch",
    category: "Office Yoga",
    title: "Chair Stretch Program",
    subtitle: "Micro-break stretches between meetings",
    bannerImage:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1400&q=60",
    level: "Beginner",
    totalDays: 14,
    avgDailyMinutes: 10,
    benefits: [
      "Quick relief during busy workdays",
      "Improved focus and productivity",
      "Reduced physical strain from sitting",
      "Better energy throughout the day",
      "No mat or special clothes needed",
    ],
    equipment: ["Office chair", "Desk"],
    tags: ["Office", "Quick", "Chair", "Beginner"],
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

export function getProgramById(programId: string): Program | undefined {
  return mockPrograms.find((p) => p.id === programId);
}
