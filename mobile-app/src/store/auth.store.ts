import { create } from 'zustand';

import { getCurrentUser, login, logout, register } from '../api/auth.api';
import type {
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from '../types/auth.types';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from '../utils/storage';

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  loginUser: (payload: LoginPayload, rememberMe?: boolean) => Promise<void>;
  registerUser: (payload: RegisterPayload) => Promise<void>;
  loadUser: () => Promise<void>;
  logoutUser: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,

  loginUser: async (payload, rememberMe = true) => {
  set({ isLoading: true });

  try {
    const data = await login(payload);

    if (rememberMe) {
      await saveTokens(data.accessToken, data.refreshToken);
    } else {
      await clearTokens();
    }

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

  registerUser: async (payload) => {
    set({ isLoading: true });

    try {
      const data = await register(payload);

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

      const user = await getCurrentUser();

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

  logoutUser: async () => {
  const refreshToken = get().refreshToken;

  try {
    if (refreshToken) {
      await logout(refreshToken);
    }
  } catch {
    // Even if backend logout fails, still clear local session.
  } finally {
    await clearTokens();

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  }
},
}));