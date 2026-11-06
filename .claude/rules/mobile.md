---
paths:
  - "apps/mobile/**"
---

# Mobile (Expo + expo-router)

- Routing: file-based in `apps/mobile/app/`: `onboarding`, `(tabs)` (home/library/guides/more), detail routes (`act/`, `guide/`, `template/`, `article/`, `category/`), `coming-soon/[feature]`. Phase 2 adds a role-gated `(lawyer)` group whose `_layout.tsx` checks the session.
- Styling: `StyleSheet` plus tokens from `@jfa/ui-tokens`; reuse the shared components in `apps/mobile/src/components/ui.tsx` (Screen, ListItem, Field, PrimaryButton, LegalDisclaimer, SampleBanner). No hard-coded colours or font sizes.
- Data:
  - Published content comes from `useContent()` / `useContentLookup()` (content packs, `src/content/`). Don't call the API to read content.
  - Phase 2+: server data via TanStack Query with `@jfa/api-client` (add the deps when the first API call lands).
  - Validation uses the shared Zod schemas from `@jfa/shared`.
- Placeholders for future integrations live in `src/integrations/` — extend those, don't scatter SDK calls through screens.
- Offline: content packs are downloaded and versioned (`src/content/pack-store.ts`); the bundled SAMPLE pack is the last fallback. Search is in-memory (`src/content/search.ts`) until real bare acts land, then SQLite FTS5. Handle no-network states gracefully everywhere.
- Templates: fill the HTML template on the device and generate the PDF with `expo-print`, then share with `expo-sharing`. Never send template form data to the server in the MVP.
- Storage:
  - Tokens go in `expo-secure-store`.
  - Preferences and cached packs go in `expo-sqlite/kv-store` (`src/lib/preferences.ts`).
  - Never store personal data in AsyncStorage or plain files.
- Accessibility:
  - `accessibilityLabel` on every pressable
  - 16px minimum body text and 48dp touch targets
  - support system font scaling
  - WCAG AA contrast, including on the navy theme
- Performance: target low-end Android (2–3 GB RAM). Switch long lists (e.g. full bare acts) to FlashList, use `expo-image` for images, and lazy-load heavy screens.
- After adding a native dependency use `npx expo install <pkg>` (keeps SDK-compatible versions) and check with `npx expo-doctor`.
- Every content screen renders `<LegalDisclaimer />`.
- Use `react-native-safe-area-context` (not the deprecated RN SafeAreaView).
