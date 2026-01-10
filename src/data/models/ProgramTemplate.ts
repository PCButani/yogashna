/**
 * ProgramTemplate - Master library program definition
 * Shared content source for both Library and Personal Abhyāsa
 */

export interface ProgramTemplate {
  id: string; // programTemplateId
  title: string;
  sanskritTitle?: string;
  subtitle: string;
  heroImage: string;
  benefits: string[];
  whatYouNeed?: string[];
  safetyNotes?: string[];
  defaultDays: number; // e.g., 14 or 21
  defaultMinutesPerDay: number; // e.g., 20
  levelLabel: string; // "Beginner", "All Levels", etc.
  category?: string; // "Health Support", "Lifestyle & Habits", etc.
  tags?: string[];
}

export interface VideoAsset {
  id: string;
  title: string;
  sanskritTitle?: string;
  durationMin: number;
  style: string;
  focusTags: string[];
  videoUrl: string;
}

export interface AbhyasaPlaylistItem {
  id: string;
  title: string;
  sanskritTitle?: string;
  durationMin: number;
  style: string;
  focusTags: string[];
  videoUrl: string;
  thumbnailUrl?: string | null;
  sequenceType?: "warmup" | "main" | "cooldown"; // Optional sequence indicator
}

export interface AbhyasaDayPlan {
  dayNumber: number; // 1-21
  theme: string;
  sessions: AbhyasaPlaylistItem[];
  totalDuration: number;
  isCompleted: boolean;
}

export interface AbhyasaCycle {
  id: string;
  userId: string; // or "local" for offline
  programTemplateId: string; // REQUIRED - links to ProgramTemplate
  days: AbhyasaDayPlan[];
  minutesPreference: number; // 10, 20, or 30
  startDate: string; // ISO date
  generatedAt: string;
  version: string;
  // Progress summary
  completedDays?: number;
  currentDayNumber?: number;
}
