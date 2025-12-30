import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'favorites_v1';

type FavoritesState = {
  favorites: Set<string>;
  isHydrated: boolean;

  // Actions
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  getFavoritesArray: () => string[];
  getFavoritesCount: () => number;
  hydrate: () => Promise<void>;
  _persist: () => Promise<void>;
};

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: new Set<string>(),
  isHydrated: false,

  toggleFavorite: (id: string) => {
    set((state) => {
      const newFavorites = new Set(state.favorites);

      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }

      return { favorites: newFavorites };
    });

    // Persist after state update
    get()._persist();
  },

  isFavorite: (id: string) => {
    return get().favorites.has(id);
  },

  getFavoritesArray: () => {
    return Array.from(get().favorites);
  },

  getFavoritesCount: () => {
    return get().favorites.size;
  },

  hydrate: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        set({ favorites: new Set(parsed), isHydrated: true });
      } else {
        set({ isHydrated: true });
      }
    } catch (error) {
      console.error('Failed to hydrate favorites:', error);
      set({ isHydrated: true });
    }
  },

  _persist: async () => {
    try {
      const favoritesArray = Array.from(get().favorites);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(favoritesArray));
    } catch (error) {
      console.error('Failed to persist favorites:', error);
    }
  },
}));

// Auto-hydrate on import (for initial load)
useFavoritesStore.getState().hydrate();
