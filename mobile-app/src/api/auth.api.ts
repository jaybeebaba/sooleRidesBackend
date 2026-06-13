import { apiClient } from './client';
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
} from '../types/auth.types';

export async function registerUser(payload: RegisterPayload) {
  const response = await apiClient.post<AuthResponse>(
    '/auth/register-email',
    payload,
  );

  return response.data;
}

export async function loginUser(payload: LoginPayload) {
  const response = await apiClient.post<AuthResponse>(
    '/auth/login-email',
    payload,
  );

  return response.data;
}

export async function getMe() {
  const response = await apiClient.get('/auth/me');
  return response.data;
}

export async function logoutUser(refreshToken: string) {
  const response = await apiClient.post('/auth/logout', {
    refreshToken,
  });

  return response.data;
}