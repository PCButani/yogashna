/**
 * ProgramTemplates Data Source
 * Master library programs - single source of truth
 * Used by both Library and Personal Abhyāsa screens
 */

import type { ProgramTemplate } from "../models/ProgramTemplate";

// Re-export ProgramTemplate type for convenience
export type { ProgramTemplate } from "../models/ProgramTemplate";

export const PROGRAM_TEMPLATES: ProgramTemplate[] = [
  // ========================================
  // HEALTH SUPPORT
  // ========================================
  {
    id: "prog_back_relief_21",
    title: "Back Pain Relief",
    sanskritTitle: "Pṛṣṭha Sukha",
    subtitle: "Gentle mobility + core support practices",
    heroImage:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1400&q=60",
    benefits: [
      "Improved spine mobility and flexibility",
      "Reduced lower back stiffness and tension",
      "Stronger core muscles for better posture support",
      "Gentle strengthening without strain",
      "Better awareness of body alignment",
      "Relief from desk-related back pain",
    ],
    whatYouNeed: ["Yoga mat", "Yoga block (optional)", "Folded blanket or towel"],
    safetyNotes: [
      "Avoid deep forward folds if you have a herniated or slipped disc",
      "Avoid sharp twisting movements if you experience pain",
      "Skip inversions if you have high blood pressure or glaucoma",
      "Move slowly and stay within your comfortable range of motion",
      "Stop immediately if you feel sharp or shooting pain",
    ],
    defaultDays: 14,
    defaultMinutesPerDay: 20,
    levelLabel: "Beginner",
    category: "Health Support",
    tags: ["Back care", "Posture", "Gentle", "Therapeutic"],
  },

  {
    id: "prog_diabetes_30",
    title: "Diabetes Support",
    sanskritTitle: "Madhumeha Sadhana",
    subtitle: "Support metabolism and circulation with steady practice",
    heroImage:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1400&q=60",
    benefits: [
      "Improved insulin sensitivity through regular movement",
      "Better blood sugar regulation support",
      "Enhanced circulation and cardiovascular health",
      "Stress reduction for better hormonal balance",
      "Gentle strengthening for metabolic support",
      "Improved energy levels and vitality",
      "Better sleep quality and recovery",
    ],
    whatYouNeed: ["Yoga mat", "Yoga block", "Chair or wall for support"],
    safetyNotes: [
      "Check blood sugar before and after practice, especially if on insulin",
      "Have a snack nearby in case of low blood sugar (hypoglycemia)",
      "Avoid strenuous inversions if you have diabetic retinopathy",
      "Skip poses that cause dizziness or excessive strain",
      "Stay hydrated throughout your practice",
      "Inform your doctor about your yoga practice",
    ],
    defaultDays: 21,
    defaultMinutesPerDay: 25,
    levelLabel: "Beginner",
    category: "Health Support",
    tags: ["Metabolic", "Circulation", "All Levels", "Therapeutic"],
  },

  {
    id: "prog_neck_shoulder_relief",
    title: "Neck & Shoulder Relief",
    sanskritTitle: "Greeva Skandha Sukha",
    subtitle: "Release tension from desk work and screen time",
    heroImage:
      "https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=1400&q=60",
    benefits: [
      "Relief from tech neck and desk posture strain",
      "Reduced tension headaches",
      "Improved neck and shoulder mobility",
      "Better upper body alignment",
      "Decreased muscle tightness and knots",
    ],
    whatYouNeed: ["Yoga mat", "Optional towel or strap"],
    safetyNotes: [
      "Avoid if you have acute neck injury or whiplash",
      "Move gently and never force neck movements",
      "Skip deep backbends if you have cervical spine issues",
      "Stop if you feel numbness or tingling in arms",
    ],
    defaultDays: 7,
    defaultMinutesPerDay: 15,
    levelLabel: "Beginner",
    category: "Health Support",
    tags: ["Neck", "Shoulders", "Relief", "Quick"],
  },

  // ========================================
  // LIFESTYLE & HABITS
  // ========================================
  {
    id: "prog_morning_energy",
    title: "Morning Energy",
    sanskritTitle: "Prabhata Shakti",
    subtitle: "Start your day with vitality and focus",
    heroImage:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1400&q=60",
    benefits: [
      "Natural energy boost without caffeine",
      "Improved morning focus and mental clarity",
      "Better circulation and metabolism activation",
      "Positive mood and mindset for the day",
      "Gentle awakening for body and mind",
    ],
    whatYouNeed: ["Yoga mat"],
    defaultDays: 14,
    defaultMinutesPerDay: 18,
    levelLabel: "Beginner",
    category: "Lifestyle & Habits",
    tags: ["Morning", "Energy", "Routine", "Quick"],
  },

  {
    id: "prog_better_sleep",
    title: "Better Sleep",
    sanskritTitle: "Nidra Sadhana",
    subtitle: "Evening practices for deep, restorative rest",
    heroImage:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1400&q=60",
    benefits: [
      "Fall asleep faster and more easily",
      "Deeper, more restorative sleep quality",
      "Reduced nighttime anxiety and racing thoughts",
      "Calmer nervous system before bed",
      "Better sleep-wake cycle regulation",
    ],
    whatYouNeed: ["Yoga mat", "Pillow or bolster", "Blanket"],
    defaultDays: 21,
    defaultMinutesPerDay: 22,
    levelLabel: "Beginner",
    category: "Lifestyle & Habits",
    tags: ["Sleep", "Evening", "Calm", "Restorative"],
  },

  // ========================================
  // FITNESS & FLEXIBILITY
  // ========================================
  {
    id: "prog_hip_opening",
    title: "Hip Opening Journey",
    sanskritTitle: "Kati Vikas",
    subtitle: "Unlock tight hips and improve lower body mobility",
    heroImage:
      "https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=1400&q=60",
    benefits: [
      "Increased hip flexibility and range of motion",
      "Relief from lower back tension",
      "Better posture and alignment",
      "Improved circulation in lower body",
      "Emotional release and stress relief",
    ],
    whatYouNeed: ["Yoga mat", "Yoga block", "Strap or belt"],
    defaultDays: 21,
    defaultMinutesPerDay: 25,
    levelLabel: "Beginner",
    category: "Fitness & Flexibility",
    tags: ["Hips", "Flexibility", "Mobility", "Beginner"],
  },

  {
    id: "prog_flexibility_challenge",
    title: "7-Day Flexibility Challenge",
    subtitle: "One week to noticeable flexibility gains",
    heroImage:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1400&q=60",
    benefits: [
      "Measurable flexibility improvement in one week",
      "Full body range of motion enhancement",
      "Better muscle elasticity",
      "Injury prevention through balanced stretching",
    ],
    whatYouNeed: ["Yoga mat", "Strap"],
    defaultDays: 7,
    defaultMinutesPerDay: 20,
    levelLabel: "Beginner",
    category: "Fitness & Flexibility",
    tags: ["Challenge", "Flexibility", "Quick", "All Levels"],
  },

  // ========================================
  // BEGINNERS & MINDFULNESS
  // ========================================
  {
    id: "prog_breath_reset",
    title: "Breath Reset",
    sanskritTitle: "Pranayama Prashanti",
    subtitle: "Master breathwork for stress relief and focus",
    heroImage:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1400&q=60",
    benefits: [
      "Reduced stress and anxiety through breath control",
      "Improved focus and mental clarity",
      "Better emotional regulation",
      "Enhanced lung capacity and respiratory health",
      "Calmer nervous system response",
    ],
    whatYouNeed: ["Yoga mat or comfortable seat", "Optional cushion"],
    defaultDays: 14,
    defaultMinutesPerDay: 15,
    levelLabel: "Beginner",
    category: "Beginners & Mindfulness",
    tags: ["Pranayama", "Breath", "Calm", "Mindfulness"],
  },

  {
    id: "prog_meditation_journey",
    title: "Meditation Journey",
    sanskritTitle: "Dhyana Sadhana",
    subtitle: "21 days to establish a meditation practice",
    heroImage:
      "https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=1400&q=60",
    benefits: [
      "Established daily meditation habit",
      "Greater mental clarity and focus",
      "Reduced stress and anxiety",
      "Improved emotional resilience",
      "Better sleep and relaxation",
      "Enhanced self-awareness",
    ],
    whatYouNeed: ["Comfortable seat or meditation cushion"],
    defaultDays: 21,
    defaultMinutesPerDay: 12,
    levelLabel: "Beginner",
    category: "Beginners & Mindfulness",
    tags: ["Meditation", "Mindfulness", "Mind", "Beginner"],
  },

  {
    id: "prog_sun_salutation",
    title: "Sun Salutation",
    sanskritTitle: "Surya Namaskar",
    subtitle: "Build consistency with a simple daily flow",
    heroImage:
      "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?auto=format&fit=crop&w=1400&q=60",
    benefits: [
      "Better energy and vitality",
      "Improved flexibility and strength",
      "Established morning routine",
      "Mind-body connection and balance",
      "Full body warming and activation",
    ],
    whatYouNeed: ["Yoga mat", "Optional yoga block"],
    defaultDays: 14,
    defaultMinutesPerDay: 20,
    levelLabel: "Beginner",
    category: "Beginners & Mindfulness",
    tags: ["Morning", "Routine", "Beginner", "Flow"],
  },

  // ========================================
  // OFFICE YOGA
  // ========================================
  {
    id: "prog_desk_posture",
    title: "Desk Posture Reset",
    subtitle: "7-day routine for neck, shoulders, and upper back",
    heroImage:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1400&q=60",
    benefits: [
      "Undo the effects of prolonged sitting",
      "Relief from tech neck and desk posture",
      "Improved upper body alignment",
      "Better circulation during work hours",
      "Reduced tension and stiffness",
    ],
    whatYouNeed: ["Chair", "Desk or wall for support"],
    defaultDays: 7,
    defaultMinutesPerDay: 12,
    levelLabel: "Beginner",
    category: "Office Yoga",
    tags: ["Office", "Desk", "Quick", "Beginner"],
  },

  {
    id: "prog_chair_stretch",
    title: "Chair Stretch Program",
    subtitle: "Micro-break stretches between meetings",
    heroImage:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1400&q=60",
    benefits: [
      "Quick relief during busy workdays",
      "Improved focus and productivity",
      "Reduced physical strain from sitting",
      "Better energy throughout the day",
      "No mat or special clothes needed",
    ],
    whatYouNeed: ["Office chair", "Desk"],
    defaultDays: 14,
    defaultMinutesPerDay: 10,
    levelLabel: "Beginner",
    category: "Office Yoga",
    tags: ["Office", "Quick", "Chair", "Beginner"],
  },
];

/**
 * Get ProgramTemplate by ID
 */
export function getProgramTemplateById(id: string): ProgramTemplate | null {
  return PROGRAM_TEMPLATES.find((t) => t.id === id) || null;
}

/**
 * Get all ProgramTemplates
 */
export function getAllProgramTemplates(): ProgramTemplate[] {
  return PROGRAM_TEMPLATES;
}

/**
 * Get ProgramTemplates by category
 */
export function getProgramTemplatesByCategory(category: string): ProgramTemplate[] {
  return PROGRAM_TEMPLATES.filter((t) => t.category === category);
}
