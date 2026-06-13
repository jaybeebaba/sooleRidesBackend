import * as SecureStore from 'expo-secure-store';

import { STORAGE_KEYS } from '../constants/storageKeys';

export async function saveTokens(
  accessToken: string,
  refreshToken: string,
) {
  await SecureStore.setItemAsync(
    STORAGE_KEYS.ACCESS_TOKEN,
    accessToken,
  );

  await SecureStore.setItemAsync(
    STORAGE_KEYS.REFRESH_TOKEN,
    refreshToken,
  );
}

export async function getAccessToken() {
  return SecureStore.getItemAsync(
    STORAGE_KEYS.ACCESS_TOKEN,
  );
}

export async function getRefreshToken() {
  return SecureStore.getItemAsync(
    STORAGE_KEYS.REFRESH_TOKEN,
  );
}

export async function clearTokens() {
  await SecureStore.deleteItemAsync(
    STORAGE_KEYS.ACCESS_TOKEN,
  );

  await SecureStore.deleteItemAsync(
    STORAGE_KEYS.REFRESH_TOKEN,
  );
}