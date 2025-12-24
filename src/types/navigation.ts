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
  MainTabs: undefined;
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
