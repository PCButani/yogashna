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
      let errorText = "";
      try {
        errorText = await response.text();
      } catch {}

      console.error("❌ updateProfile failed:", response.status, errorText);

      if (response.status === 401) {
        throw new Error("Unauthorized - Invalid or expired token");
      }

      throw new Error(`Failed to update profile: ${response.status} ${errorText}`);
    }

    const data: UserProfileResponseDto = await response.json();
    console.log("✅ Profile updated successfully");

    return mapMeResponseToUserMe(data);
  } catch (error) {
    console.error("❌ updateProfile error:", error);
    throw error;
  }
}

/**
 * Fetch video library from backend
 * GET /api/v1/videos
 */
export async function getVideos(params?: {
  limit?: number;
  offset?: number;
  primaryCategory?: string;
  accessLevel?: string;
  tagIds?: string;
  status?: string;
  lang?: string;
}): Promise<any> {
  try {
    const token = await getAuthToken();

    const queryParams = new URLSearchParams();
    if (params?.limit !== undefined) queryParams.append("limit", params.limit.toString());
    if (params?.offset !== undefined) queryParams.append("offset", params.offset.toString());
    if (params?.primaryCategory) queryParams.append("primaryCategory", params.primaryCategory);
    if (params?.accessLevel) queryParams.append("accessLevel", params.accessLevel);
    if (params?.tagIds) queryParams.append("tagIds", params.tagIds);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.lang) queryParams.append("lang", params.lang);

    const queryString = queryParams.toString();
    const url = `${BASE_URL}/videos${queryString ? "?" + queryString : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized");
      }
      throw new Error(`Failed to fetch videos: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Videos fetched successfully:", data.data?.length || 0, "items");

    return data;
  } catch (error) {
    console.error("❌ getVideos error:", error);
    throw error;
  }
}

/**
 * Abhyasa: Cycle summary
 * GET /api/v1/me/programs/:programTemplateId/abhyasa-cycle
 */
export async function getAbhyasaCycleSummary(programTemplateId: string): Promise<any> {
  try {
    const token = await getAuthToken();
    const url = `${BASE_URL}/me/programs/${programTemplateId}/abhyasa-cycle`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized");
      }
      throw new Error(`Failed to fetch abhyasa cycle: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("❌ getAbhyasaCycleSummary error:", error);
    throw error;
  }
}

/**
 * Abhyasa: Day plan with playlist items
 * GET /api/v1/me/programs/:programTemplateId/abhyasa-cycle/days/:dayNumber
 */
export async function getAbhyasaDay(
  programTemplateId: string,
  dayNumber: number
): Promise<any> {
  try {
    const token = await getAuthToken();
    const url = `${BASE_URL}/me/programs/${programTemplateId}/abhyasa-cycle/days/${dayNumber}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized");
      }
      throw new Error(`Failed to fetch abhyasa day: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("❌ getAbhyasaDay error:", error);
    throw error;
  }
}

/**
 * Abhyasa: Today playlist
 * GET /api/v1/me/programs/:programTemplateId/abhyasa-cycle/today
 */
export async function getAbhyasaToday(programTemplateId: string): Promise<any> {
  try {
    const token = await getAuthToken();
    const url = `${BASE_URL}/me/programs/${programTemplateId}/abhyasa-cycle/today`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized");
      }
      throw new Error(`Failed to fetch abhyasa today: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("❌ getAbhyasaToday error:", error);
    throw error;
  }
}
