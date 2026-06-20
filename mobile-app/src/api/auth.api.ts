import { api } from './client';

import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
} from '../types/auth.types';

export async function login(payload: LoginPayload) {
  const { data } = await api.post<AuthResponse>(
    '/auth/login-email',
    payload,
  );

  return data;
}

export async function register(payload: RegisterPayload) {
  const { data } = await api.post<AuthResponse>(
    '/auth/register-email',
    payload,
  );

  return data;
}

export async function getCurrentUser() {
  const { data } = await api.get('/auth/me');

  return data.user ?? data;
}

export async function logout(refreshToken: string) {
  const { data } = await api.post('/auth/logout', {
    refreshToken,
  });

  return data;
}

export async function refreshToken(refreshToken: string) {
  const { data } = await api.post<AuthResponse>(
    '/auth/refresh',
    {
      refreshToken,
    },
  );

  return data;
}

export async function forgotPassword(email: string) {
  const { data } = await api.post('/auth/forgot-password', {
    email,
  });

  return data;
}

export async function verifyResetOtp(email: string, otp: string) {
  const { data } = await api.post('/auth/verify-reset-otp', {
    email,
    otp,
  });

  return data;
}

export async function resetPassword(
  email: string,
  otp: string,
  newPassword: string,
) {
  const { data } = await api.post('/auth/reset-password', {
    email,
    otp,
    newPassword,
  });

  return data;
}