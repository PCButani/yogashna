// src/data/mock/models.ts

export type ProgramLevel = "Beginner" | "Intermediate" | "Advanced";

export type SessionLockState = "completed" | "current" | "locked";

export type WellnessCategory =
  | "Health Support"
  | "Lifestyle & Habits"
  | "Fitness & Flexibility"
  | "Beginners & Mindfulness"
  | "Office Yoga";

export type YogaStyle =
  | "Hatha"
  | "Vinyasa"
  | "Yin"
  | "Restorative"
  | "Pranayama"
  | "Meditation"
  | "Mobility";

export type AchievementType = "streak" | "minutes" | "programs" | "sessions";

export interface Program {
  id: string;
  category: WellnessCategory;
  title: string; // English name
  sanskritTitle?: string; // optional Sanskrit name
  subtitle: string;
  bannerImage: string; // can be a URL or local asset later
  level: ProgramLevel;
  totalDays: number;
  avgDailyMinutes: number;
  benefits: string[];
  equipment: string[];
  tags: string[];
  disclaimer?: string; // general disclaimer text
  contraindications?: string[]; // warnings list
  days: ProgramDay[];
}

export interface ProgramDay {
  dayNumber: number;
  state: SessionLockState;
  session: Session; // Keep for backward compatibility
  sessions: Session[]; // NEW: Support multiple sessions per day
}

export interface Session {
  id: string;
  title: string;
  sanskritTitle?: string;
  durationMin: number;
  style: YogaStyle;
  focusTags: string[];
  videoUrl: string;
}

export interface ProgressStats {
  currentStreakDays: number;
  weeklyMinutes: { label: string; minutes: number }[]; // 7 items (Mon..Sun)
  totalMinutes: number;
  sessionsCompleted: number;
  programsCompleted: number;
  weeklyInsight: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  type: AchievementType;
  earned: boolean;
}

export interface UserProfile {
  name: string;
  avatarUrl?: string;
  level: ProgramLevel;
  goals: string[];
  preferredSessionMinutes: number;
  preferredTime: "Morning" | "Afternoon" | "Evening";
  favoritesCount: number;
  subscription: {
    planName: "Free" | "Premium";
    statusText: string;
  };
}

export interface NotificationSettings {
  dailyReminderEnabled: boolean;
  liveSessionAlertsEnabled: boolean;
  streakNudgesEnabled: boolean;
  reminderTime: string; // "07:30"
}
