import { create } from 'zustand';

import {
  getAppMode,
  saveAppMode,
  clearAppMode,
} from '../utils/storage';

export type AppMode = 'PASSENGER' | 'DRIVER';

type AppModeState = {
  activeMode: AppMode;

  initializeMode: () => Promise<void>;
  setActiveMode: (mode: AppMode) => Promise<void>;
  resetMode: () => Promise<void>;
};

export const useAppModeStore = create<AppModeState>(
  (set) => ({
    activeMode: 'PASSENGER',

    initializeMode: async () => {
      const storedMode = await getAppMode();

      set({
        activeMode:
          storedMode === 'DRIVER'
            ? 'DRIVER'
            : 'PASSENGER',
      });
    },

    setActiveMode: async (mode) => {
      await saveAppMode(mode);

      set({
        activeMode: mode,
      });
    },

    resetMode: async () => {
      await clearAppMode();

      set({
        activeMode: 'PASSENGER',
      });
    },
  }),
);