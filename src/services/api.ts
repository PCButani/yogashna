/**
 * API Client for Yogashna Backend
 *
 * Handles all HTTP requests to NestJS backend.
 * Automatically attaches Firebase ID token to requests.
 */

import { auth } from "../config/firebase";
import {
  UserProfileResponseDto,
  UserMe,
  UpdateProfilePayload,
} from "../types/api";

/**
 * Base API URL
 * For Android emulator: 10.0.2.2 maps to host machine's localhost
 * For iOS simulator: localhost works directly
 * For physical device: use actual IP address
 */
const BASE_URL = "http://10.0.2.2:3000/api/v1";

/**
 * Get Firebase ID token for the current user
 */
async function getAuthToken(): Promise<string> {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User not authenticated");
  }

  try {
    const token = await user.getIdToken();
    return token;
  } catch (error) {
    console.error("❌ Failed to get ID token:", error);
    throw new Error("Failed to get authentication token");
  }
}

function mapMeResponseToUserMe(dto: UserProfileResponseDto): UserMe {
  return {
    id: dto.id,
    firebaseUid: dto.firebaseUid,
    phoneNumber: dto.phoneNumber ?? null,
    name: dto.profile?.name ?? null,
    age: dto.profile?.age ?? null,
    gender: dto.profile?.gender ?? null,
    heightCm: dto.profile?.heightCm ?? null,
    weightKg: dto.profile?.weightKg ?? null,
    wellnessFocusId: dto.wellnessFocusId ?? null,
    primaryGoalId: dto.primaryGoalId ?? null,
    preferences: dto.preferences ?? null,
    onboarding: {
      isComplete: dto.onboarding?.isComplete ?? false,
      completedAt: dto.onboarding?.completedAt ?? null,
    },
  };
}

/**
 * Fetch user profile from backend
 * GET /api/v1/me
 */
export async function getProfile(): Promise<UserMe> {
  try {
    const token = await getAuthToken();

    const response = await fetch(`${BASE_URL}/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized - Invalid or expired token");
      }
      throw new Error(`Failed to fetch profile: ${response.status}`);
    }

    const data: UserProfileResponseDto = await response.json();
    console.log("✅ Profile fetched successfully");

    return mapMeResponseToUserMe(data);
  } catch (error) {
    console.error("❌ getProfile error:", error);
    throw error;
  }
}

/**
 * Update user profile
 * PATCH /api/v1/me
 */
export async function updateProfile(
  payload: UpdateProfilePayload
): Promise<UserMe> {
  try {
    const token = await getAuthToken();

    const response = await fetch(`${BASE_URL}/me`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized - Invalid or expired token");
      }
      throw new Error(`Failed to update profile: ${response.status}`);
    }

    const data: UserProfileResponseDto = await response.json();
    console.log("✅ Profile updated successfully");

    return mapMeResponseToUserMe(data);
  } catch (error) {
    console.error("❌ updateProfile error:", error);
    throw error;
  }
}
