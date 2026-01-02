import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ContinueWatchingItem = {
  videoId: string;
  title?: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  positionSeconds: number;
  updatedAt: string;
  videoUrl?: string;
};

type ContinueWatchingState = {
  item: ContinueWatchingItem | null;
  setContinueWatching: (item: ContinueWatchingItem) => void;
  clearContinueWatching: () => void;
  getContinueWatching: () => ContinueWatchingItem | null;
  updatePosition: (videoId: string, positionSeconds: number) => void;
  getProgressPercent: () => number;
};

const STORAGE_KEY = "continue_watching_v1";

export const useContinueWatchingStore = create<ContinueWatchingState>()(
  persist(
    (set, get) => ({
      item: null,
      setContinueWatching: (item) => {
        const safePosition = Number.isFinite(item.positionSeconds)
          ? Math.max(0, item.positionSeconds)
          : 0;
        set({
          item: {
            ...item,
            positionSeconds: safePosition,
            updatedAt: new Date().toISOString(),
          },
        });
      },
      clearContinueWatching: () => set({ item: null }),
      getContinueWatching: () => get().item,
      updatePosition: (videoId, positionSeconds) => {
        const current = get().item;
        if (!current || current.videoId !== videoId) return;
        const safePosition = Number.isFinite(positionSeconds)
          ? Math.max(0, positionSeconds)
          : 0;
        set({
          item: {
            ...current,
            positionSeconds: safePosition,
            updatedAt: new Date().toISOString(),
          },
        });
      },
      getProgressPercent: () => {
        const current = get().item;
        if (!current?.durationSeconds || current.durationSeconds <= 0) return 0;
        const raw = (current.positionSeconds / current.durationSeconds) * 100;
        if (!Number.isFinite(raw)) return 0;
        return Math.max(0, Math.min(100, Math.round(raw)));
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ item: state.item }),
    }
  )
);
