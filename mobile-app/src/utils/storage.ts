import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'soolerides_access_token';
const REFRESH_TOKEN_KEY = 'soolerides_refresh_token';
const ONBOARDING_SEEN_KEY = 'soolerides_onboarding_seen';
const APP_MODE_KEY = 'soolerides_app_mode';

export async function saveTokens(accessToken: string, refreshToken: string) {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
}

export async function getAccessToken() {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken() {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function clearTokens() {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

export async function markOnboardingSeen() {
  await SecureStore.setItemAsync(ONBOARDING_SEEN_KEY, 'true');
}

export async function hasSeenOnboarding() {
  const value = await SecureStore.getItemAsync(ONBOARDING_SEEN_KEY);
  return value === 'true';
}



export async function saveAppMode(
  mode: 'PASSENGER' | 'DRIVER',
) {
  await SecureStore.setItemAsync(APP_MODE_KEY, mode);
}

export async function getAppMode() {
  return SecureStore.getItemAsync(APP_MODE_KEY);
}

export async function clearAppMode() {
  await SecureStore.deleteItemAsync(APP_MODE_KEY);
}