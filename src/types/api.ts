/**
 * API Response Types
 * These match the backend NestJS DTOs
 */

export interface UserProfileResponseDto {
  id: string;
  firebaseUid: string;
  phoneNumber: string | null;

  profile: {
    name: string | null;
    age: number | null;
    gender: string | null;
    heightCm: number | null;
    weightKg: number | null;
  };

  // Wellness & Goals
  wellnessFocusId: string | null;
  primaryGoalId: string | null;

  // Practice Preferences
  preferences: {
    sessionLength: string | null;
    preferredTime: string | null;
    experienceLevel: string | null;
  } | null;

  // Onboarding Status
  onboarding: {
    isComplete: boolean;
    completedAt: string | null;
  };
}

export interface UserMe {
  id: string;
  firebaseUid: string;
  phoneNumber: string | null;

  name: string | null;
  age: number | null;
  gender: string | null;
  heightCm: number | null;
  weightKg: number | null;

  wellnessFocusId: string | null;
  primaryGoalId: string | null;

  preferences: {
    sessionLength: string | null;
    preferredTime: string | null;
    experienceLevel: string | null;
  } | null;

  onboarding: {
    isComplete: boolean;
    completedAt: string | null;
  };
}

export interface UpdateProfilePayload {
  // AboutYou screen
  name?: string;
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;

  // WellnessFocus screen
  wellnessFocusId?: string;

  // Goals screen
  primaryGoalId?: string;

  // PersonalizePractice screen
  preferences?: {
    sessionLength?: string;
    preferredTime?: string;
    experienceLevel?: string;
  };
}
