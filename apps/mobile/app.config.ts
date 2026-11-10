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
  userInterfaceStyle: 'dark',
  backgroundColor: '#090A10',
  // "Open Law" logo — sources in /brand (SVG), rendered PNGs in ./assets/images.
  icon: './assets/images/icon.png',
  android: {
    package: 'in.justiceforall.app',
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundImage: './assets/images/adaptive-background.png',
      backgroundColor: '#67E8F9',
    },
  },
  ios: {
    bundleIdentifier: 'in.justiceforall.app',
    supportsTablet: false,
  },
  web: { output: 'single', favicon: './assets/images/favicon.png' },
  plugins: [
    'expo-router',
    'expo-localization',
    'expo-sqlite',
    'expo-secure-store',
    'expo-font',
    ['expo-splash-screen', { backgroundColor: '#090A10', image: './assets/images/splash-icon.png', imageWidth: 160 }],
  ],
  experiments: { typedRoutes: true },
  runtimeVersion: { policy: 'appVersion' },
  ...(easProjectId
    ? { updates: { url: `https://u.expo.dev/${easProjectId}` }, extra: { eas: { projectId: easProjectId } } }
    : {}),
};

export default config;
