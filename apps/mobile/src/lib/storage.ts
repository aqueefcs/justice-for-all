import { requireOptionalNativeModule } from 'expo';

/**
 * Small key-value store for preferences and cached content packs.
 *
 * Uses expo-sqlite's kv-store when the native module is present (dev builds, release APKs,
 * Expo Go builds that include it). If it is missing — e.g. a mismatched Expo Go or web —
 * we fall back to an in-memory map so the app still starts; data then lasts only for the session.
 * Never store personal data or tokens here (tokens go in expo-secure-store).
 */
interface KvStore {
  getItemSync(key: string): string | null;
  setItemSync(key: string, value: string): void;
  setItem(key: string, value: string): Promise<void>;
}

function createMemoryStore(): KvStore {
  const map = new Map<string, string>();
  return {
    getItemSync: (key) => map.get(key) ?? null,
    setItemSync: (key, value) => void map.set(key, value),
    setItem: async (key, value) => void map.set(key, value),
  };
}

function createStore(): { store: KvStore; persistent: boolean } {
  if (requireOptionalNativeModule('ExpoSQLite')) {
    try {
      // Required lazily: importing kv-store when the native module is absent throws at load time.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const kv = require('expo-sqlite/kv-store') as { default: KvStore };
      return { store: kv.default, persistent: true };
    } catch {
      // fall through to memory
    }
  }
  if (__DEV__) console.warn('[storage] ExpoSQLite native module not available — using in-memory storage');
  return { store: createMemoryStore(), persistent: false };
}

const { store, persistent } = createStore();

export const storage = store;
/** False when running on the in-memory fallback (nothing survives an app restart). */
export const storageIsPersistent = persistent;
