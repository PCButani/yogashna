export class UserProfileResponseDto {
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
  wellnessFocusId: string | null;
  primaryGoalId: string | null;
  preferences: Record<string, any> | null;
  onboarding: {
    isComplete: boolean;
    completedAt: string | null;
  };
}
