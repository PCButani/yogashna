/**
 * Navigation Type Definitions
 * Centralized navigation param lists for type-safe navigation
 */

export type WellnessCategory =
  | "Health Support"
  | "Lifestyle & Habits"
  | "Fitness & Flexibility"
  | "Beginners & Mindfulness"
  | "Office Yoga";

/**
 * Root Stack Navigator Param List
 * Defines all screens in the main stack navigator
 */
export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  AuthEntry: { mode: "signup" | "login" };
  OtpVerify: { mode: "login" | "signup"; identifier: string };
  WellnessFocus: undefined;
  Goals: undefined;
  AboutYou: undefined;
  PersonalizePractice: undefined;
  PlanSummary: undefined;
  Today: undefined;
  WellnessGoals: { wellnessCategory: WellnessCategory };
  ProgramDetail: { programId: string };
  MyAbhyasaProgram: undefined;
  VideoLibrary: { filter?: "All" | "Yoga" | "Breathing" | "Meditation" };
  CommonPlayer: {
    // Support both single session (legacy) and playlist modes
    session?: any; // Legacy: single session
    playlist?: any[]; // NEW: array of sessions for auto-advance
    startIndex?: number; // Which session to start with (default: 0)
    context?: { programId?: string; dayNumber?: number }; // Optional context
    uri?: string;
    title?: string;
    isLocked?: boolean;
    resumeKey?: string;
    startPositionSeconds?: number;
  };
  MainTabs: undefined;
  NotificationSettings: undefined;
};

/**
 * Main Tab Navigator Param List
 * Defines all tabs in the bottom tab navigator
 */
export type MainTabParamList = {
  Today: undefined;
  Library: undefined;
  Live: undefined;
  Progress: undefined;
  Profile: undefined;
};
