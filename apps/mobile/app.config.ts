import type { ExpoConfig } from 'expo/config';

/**
 * Expo app config. Public runtime values come from EXPO_PUBLIC_* env vars (see .env.example)
 * or the `env` block of the EAS build profile in eas.json.
 * TODO: confirm the Android package name / domain before the first Play Store upload — it can't change later.
 */
const easProjectId = process.env.EAS_PROJECT_ID; // set after `eas init`

const config: ExpoConfig = {
  name: 'Justice For All',
  slug: 'justice-for-all',
  scheme: 'jfa',
  version: '0.1.0',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  // TODO: add ./assets/icon.png, adaptive-icon.png and splash-icon.png (1024×1024) from the design team.
  android: {
    package: 'in.justiceforall.app',
  },
  ios: {
    bundleIdentifier: 'in.justiceforall.app',
    supportsTablet: false,
  },
  web: { output: 'single' },
  plugins: [
    'expo-router',
    'expo-localization',
    'expo-sqlite',
    'expo-secure-store',
    ['expo-splash-screen', { backgroundColor: '#070F2B' }],
  ],
  experiments: { typedRoutes: true },
  runtimeVersion: { policy: 'appVersion' },
  ...(easProjectId
    ? { updates: { url: `https://u.expo.dev/${easProjectId}` }, extra: { eas: { projectId: easProjectId } } }
    : {}),
};

export default config;
