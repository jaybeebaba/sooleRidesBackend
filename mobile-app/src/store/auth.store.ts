import { create } from 'zustand';

import { getCurrentUser, login, logout, register } from '../api/auth.api';
import {
  setMemoryAccessToken,
  setMemoryRefreshToken,
} from '../api/client';
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

    setMemoryAccessToken(data.accessToken);
    setMemoryRefreshToken(data.refreshToken);

    if (rememberMe) {
      await saveTokens(data.accessToken, data.refreshToken);
    } else {
      await clearTokens();
    }

    const user = await getCurrentUser();

    set({
      user,
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

      setMemoryAccessToken(data.accessToken);
      setMemoryRefreshToken(data.refreshToken);

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
        const currentUser = get().user;
        const currentAccessToken = get().accessToken;
        const currentRefreshToken = get().refreshToken;

        if (currentUser && currentAccessToken && currentRefreshToken) {
          setMemoryAccessToken(currentAccessToken);
          setMemoryRefreshToken(currentRefreshToken);

          set({
            user: currentUser,
            accessToken: currentAccessToken,
            refreshToken: currentRefreshToken,
            isAuthenticated: true,
          });

          return;
        }

        setMemoryAccessToken(null);
        setMemoryRefreshToken(null);

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });

        return;
      }

      setMemoryAccessToken(accessToken);
      setMemoryRefreshToken(refreshToken);

      const user = await getCurrentUser();

      set({
        user,
        accessToken,
        refreshToken,
        isAuthenticated: true,
      });
    } catch {
      await clearTokens();

      setMemoryAccessToken(null);
      setMemoryRefreshToken(null);

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

      setMemoryAccessToken(null);
      setMemoryRefreshToken(null);

      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      });
    }
  },
}));