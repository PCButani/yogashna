/**
 * Route Constants
 * Centralized route names to prevent typos and enable refactoring
 */

export const Routes = {
  // Auth & Onboarding Flow
  SPLASH: "Splash",
  ONBOARDING: "Onboarding",
  AUTH_ENTRY: "AuthEntry",
  OTP_VERIFY: "OtpVerify",

  // Signup Onboarding Flow
  WELLNESS_FOCUS: "WellnessFocus",
  GOALS: "Goals",
  ABOUT_YOU: "AboutYou",
  PERSONALIZE_PRACTICE: "PersonalizePractice",
  PLAN_SUMMARY: "PlanSummary",

  // Main App
  MAIN_TABS: "MainTabs",
  TODAY: "Today",
  WELLNESS_GOALS: "WellnessGoals",

  // Tab Screens
  LIBRARY: "Library",
  LIVE: "Live",
  PROGRESS: "Progress",
  PROFILE: "Profile",
} as const;

export type RouteKey = keyof typeof Routes;
export type RouteName = (typeof Routes)[RouteKey];
