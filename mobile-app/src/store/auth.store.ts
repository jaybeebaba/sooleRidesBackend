import { create } from 'zustand';

import type { AuthUser } from '../types/auth.types';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from '../utils/tokenStorage';
import { getMe, loginUser, logoutUser, registerUser } from '../api/auth.api';
import type { LoginPayload, RegisterPayload } from '../types/auth.types';

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  register: (payload: RegisterPayload) => Promise<void>;
  login: (payload: LoginPayload) => Promise<void>;
  loadUser: () => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,

  register: async (payload) => {
    set({ isLoading: true });

    try {
      const data = await registerUser(payload);

      await saveTokens(data.accessToken, data.refreshToken);

      set({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        isAuthenticated: true,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (payload) => {
    set({ isLoading: true });

    try {
      const data = await loginUser(payload);

      await saveTokens(data.accessToken, data.refreshToken);

      set({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        isAuthenticated: true,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  loadUser: async () => {
    set({ isLoading: true });

    try {
      const accessToken = await getAccessToken();
      const refreshToken = await getRefreshToken();

      if (!accessToken || !refreshToken) {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
        return;
      }

      const user = await getMe();

      set({
        user,
        accessToken,
        refreshToken,
        isAuthenticated: true,
      });
    } catch {
      await clearTokens();

      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    const refreshToken = get().refreshToken;

    if (refreshToken) {
      await logoutUser(refreshToken);
    }

    await clearTokens();

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },
}));