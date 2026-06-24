import axios from 'axios';

import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from '../utils/storage';

let memoryAccessToken: string | null = null;
let memoryRefreshToken: string | null = null;

export function setMemoryAccessToken(token: string | null) {
  memoryAccessToken = token;
}

export function setMemoryRefreshToken(token: string | null) {
  memoryRefreshToken = token;
}

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const refreshApi = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const storedToken = await getAccessToken();
    const token = memoryAccessToken || storedToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error?.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const storedRefreshToken =
          memoryRefreshToken || (await getRefreshToken());

        if (!storedRefreshToken) {
          await clearTokens();
          setMemoryAccessToken(null);
          setMemoryRefreshToken(null);
          return Promise.reject(error);
        }

        const { data } = await refreshApi.post('/auth/refresh', {
          refreshToken: storedRefreshToken,
        });

        setMemoryAccessToken(data.accessToken);
        setMemoryRefreshToken(data.refreshToken);

        await saveTokens(data.accessToken, data.refreshToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        await clearTokens();
        setMemoryAccessToken(null);
        setMemoryRefreshToken(null);

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);