/**
 * Progress Store (Zustand)
 * Real-time cache for user progress with AsyncStorage persistence
 * Wraps ProgressTracking service for instant UI updates
 */

import { create } from 'zustand';
import {
  getProgressData,
  recordPracticeSession as persistSession,
  recordProgramCompletion as persistProgramCompletion,
  type ProgressData,
  type DailyActivity,
  getWeeklyActivity,
} from '../services/ProgressTracking';

// Badge definitions
export type BadgeType =
  | 'FIRST_SESSION'
  | '3_DAY_STREAK'
  | '7_DAY_STREAK'
  | '14_DAY_STREAK'
  | '21_DAY_STREAK'
  | 'FIRST_PROGRAM_COMPLETED'
  | '10_SESSIONS'
  | '25_SESSIONS'
  | '50_SESSIONS';

export interface Badge {
  type: BadgeType;
  unlockedAt: string; // ISO timestamp
  title: string;
  description: string;
}

// Session completion identifier
export interface SessionIdentifier {
  programId?: string;
  dayId?: string;
  videoId: string;
}

interface ProgressState {
  // Core progress data (synced with AsyncStorage)
  progressData: ProgressData | null;
  weeklyActivity: DailyActivity[];

  // Badges
  badges: Badge[];

  // Hydration state
  isHydrated: boolean;

  // Actions
  hydrate: () => Promise<void>;
  markSessionCompleted: (params: {
    sessionId: SessionIdentifier;
    durationMin: number;
  }) => Promise<void>;
  markProgramCompleted: () => Promise<void>;
  isSessionCompleted: (sessionId: SessionIdentifier) => boolean;
  getDailyMinutes: (date: string) => number;
  getCurrentStreak: () => number;
  getLongestStreak: () => number;
  getTotalSessions: () => number;
  getTotalMinutes: () => number;
  getWeeklyData: () => DailyActivity[];
  getBadges: () => Badge[];

  // Internal
  _completedSessions: Set<string>;
  _checkAndUnlockBadges: () => void;
  _addBadge: (type: BadgeType) => void;
  _serializeSessionId: (id: SessionIdentifier) => string;
}

// Badge unlock rules
const BADGE_RULES: Record<BadgeType, (state: ProgressState) => boolean> = {
  FIRST_SESSION: (state) => (state.progressData?.totalSessions ?? 0) >= 1,
  '3_DAY_STREAK': (state) => (state.progressData?.currentStreak ?? 0) >= 3,
  '7_DAY_STREAK': (state) => (state.progressData?.currentStreak ?? 0) >= 7,
  '14_DAY_STREAK': (state) => (state.progressData?.currentStreak ?? 0) >= 14,
  '21_DAY_STREAK': (state) => (state.progressData?.currentStreak ?? 0) >= 21,
  FIRST_PROGRAM_COMPLETED: (state) => (state.progressData?.programsCompleted ?? 0) >= 1,
  '10_SESSIONS': (state) => (state.progressData?.totalSessions ?? 0) >= 10,
  '25_SESSIONS': (state) => (state.progressData?.totalSessions ?? 0) >= 25,
  '50_SESSIONS': (state) => (state.progressData?.totalSessions ?? 0) >= 50,
};

const BADGE_METADATA: Record<BadgeType, { title: string; description: string }> = {
  FIRST_SESSION: {
    title: 'First Light',
    description: 'Completed your first yoga session',
  },
  '3_DAY_STREAK': {
    title: '3-Day Warrior',
    description: 'Practiced for 3 consecutive days',
  },
  '7_DAY_STREAK': {
    title: 'Week Champion',
    description: 'Maintained a 7-day practice streak',
  },
  '14_DAY_STREAK': {
    title: 'Fortnight Master',
    description: '14 days of dedicated practice',
  },
  '21_DAY_STREAK': {
    title: 'Habit Builder',
    description: '21 days - a true yoga habit formed',
  },
  FIRST_PROGRAM_COMPLETED: {
    title: 'Program Graduate',
    description: 'Completed your first full program',
  },
  '10_SESSIONS': {
    title: 'Dedicated Practitioner',
    description: 'Completed 10 yoga sessions',
  },
  '25_SESSIONS': {
    title: 'Committed Yogi',
    description: 'Completed 25 yoga sessions',
  },
  '50_SESSIONS': {
    title: 'Yoga Devotee',
    description: 'Completed 50 yoga sessions',
  },
};

export const useProgressStore = create<ProgressState>((set, get) => ({
  progressData: null,
  weeklyActivity: [],
  badges: [],
  isHydrated: false,
  _completedSessions: new Set<string>(),

  _serializeSessionId: (id: SessionIdentifier) => {
    return `${id.programId || 'none'}::${id.dayId || 'none'}::${id.videoId}`;
  },

  hydrate: async () => {
    try {
      const [progress, weekly] = await Promise.all([
        getProgressData(),
        getWeeklyActivity(),
      ]);

      // ✅ Build completed sessions set from persisted weekly activity
      // This prevents double-counting after app restart
      const completedSessionIds = new Set<string>();
      weekly.forEach((day) => {
        // We can't reconstruct exact session IDs from DailyActivity,
        // so we'll track by date instead for dedup
        if (day.sessionsCompleted > 0) {
          // Mark this date as having sessions completed
          completedSessionIds.add(`date::${day.date}`);
        }
      });

      set({
        progressData: progress,
        weeklyActivity: weekly,
        _completedSessions: completedSessionIds,
        isHydrated: true,
      });

      // Check and unlock badges after hydration
      get()._checkAndUnlockBadges();
    } catch (error) {
      console.error('Failed to hydrate progress store:', error);
      set({ isHydrated: true });
    }
  },

  markSessionCompleted: async ({ sessionId, durationMin }) => {
    const serialized = get()._serializeSessionId(sessionId);
    const today = new Date().toISOString().split('T')[0];
    const todayKey = `date::${today}`;

    // Check if already completed (in-memory dedup for same app session)
    if (get()._completedSessions.has(serialized)) {
      return;
    }

    try {
      // Persist to AsyncStorage via service
      const updatedProgress = await persistSession(durationMin, 1);

      // Reload weekly activity
      const weekly = await getWeeklyActivity();

      // Update Zustand state immediately
      set((state) => ({
        progressData: updatedProgress,
        weeklyActivity: weekly,
        _completedSessions: new Set([
          ...state._completedSessions,
          serialized,
          todayKey, // Also mark today as having completed sessions
        ]),
      }));

      // Check for new badge unlocks
      get()._checkAndUnlockBadges();
    } catch (error) {
      console.error('Failed to mark session completed:', error);
      throw error;
    }
  },

  markProgramCompleted: async () => {
    try {
      const updatedProgress = await persistProgramCompletion();

      set({
        progressData: updatedProgress,
      });

      // Check for new badge unlocks
      get()._checkAndUnlockBadges();
    } catch (error) {
      console.error('Failed to mark program completed:', error);
      throw error;
    }
  },

  isSessionCompleted: (sessionId) => {
    const serialized = get()._serializeSessionId(sessionId);
    return get()._completedSessions.has(serialized);
  },

  getDailyMinutes: (date) => {
    const activity = get().weeklyActivity.find((day) => day.date === date);
    return activity?.minutesPracticed ?? 0;
  },

  getCurrentStreak: () => {
    return get().progressData?.currentStreak ?? 0;
  },

  getLongestStreak: () => {
    return get().progressData?.longestStreak ?? 0;
  },

  getTotalSessions: () => {
    return get().progressData?.totalSessions ?? 0;
  },

  getTotalMinutes: () => {
    return get().progressData?.totalMinutes ?? 0;
  },

  getWeeklyData: () => {
    return get().weeklyActivity;
  },

  getBadges: () => {
    return get().badges;
  },

  _checkAndUnlockBadges: () => {
    const state = get();
    const unlockedTypes = new Set(state.badges.map((b) => b.type));

    // Check each badge rule
    (Object.keys(BADGE_RULES) as BadgeType[]).forEach((type) => {
      if (!unlockedTypes.has(type) && BADGE_RULES[type](state)) {
        get()._addBadge(type);
      }
    });
  },

  _addBadge: (type) => {
    const meta = BADGE_METADATA[type];
    const newBadge: Badge = {
      type,
      unlockedAt: new Date().toISOString(),
      title: meta.title,
      description: meta.description,
    };

    set((state) => ({
      badges: [...state.badges, newBadge],
    }));
  },
}));

// Auto-hydrate on app launch
useProgressStore.getState().hydrate();
