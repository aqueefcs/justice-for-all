import * as SecureStore from 'expo-secure-store';

/**
 * PLACEHOLDER — Better Auth client (Phase 2: citizen phone OTP + Google sign-in; lawyer accounts).
 * TODO: add `better-auth` + `@better-auth/expo` client, point it at EXPO_PUBLIC_API_URL,
 * store the session token ONLY in expo-secure-store (never kv-store/AsyncStorage),
 * capture DPDP consent (purpose + notice version) before account creation.
 */
const TOKEN_KEY = 'auth.session';

export async function getSessionToken(): Promise<string | undefined> {
  return (await SecureStore.getItemAsync(TOKEN_KEY)) ?? undefined;
}

export async function signOut(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export const authEnabled = false;
