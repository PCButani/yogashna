// src/data/mock/profile.ts

import { UserProfile } from "./models";

export const mockUserProfile: UserProfile = {
  name: "Pradip",
  avatarUrl: undefined,
  level: "Beginner",
  goals: ["Stress Relief", "Flexibility", "Better Sleep"],
  preferredSessionMinutes: 20,
  preferredTime: "Evening",
  favoritesCount: 8,
  subscription: {
    planName: "Free",
    statusText: "Free plan • Upgrade anytime",
  },
};
