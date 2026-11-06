---
paths:
  - "apps/mobile/**"
---

# Mobile (Expo + expo-router)

- Routing: file-based in `apps/mobile/app/`. Use route groups: `(onboarding)`, `(tabs)`, `(lawyer)`. Role-gated groups check the session in their `_layout.tsx`.
- Styling: NativeWind classes plus tokens from `packages/ui-tokens`. No per-screen inline style blobs or duplicated gradients; build shared components in `apps/mobile/components/`.
- Data:
  - Server data comes from TanStack Query with the generated `packages/api-client`.
  - Published content is read from local SQLite (content packs). Don't call the API to read content.
  - Forms use react-hook-form + zodResolver with schemas from `packages/shared`.
- Offline: content packs are downloaded and versioned. Search uses SQLite FTS5. Handle no-network states gracefully everywhere.
- Templates: fill the HTML template on the device and generate the PDF with `expo-print`, then share with `expo-sharing`. Never send template form data to the server in the MVP.
- Storage:
  - Tokens go in `expo-secure-store`.
  - Preferences go in MMKV.
  - Never store personal data in AsyncStorage or plain files.
- Accessibility:
  - `accessibilityLabel` on every pressable
  - 16px minimum body text and 48dp touch targets
  - support system font scaling
  - WCAG AA contrast, including on the navy theme
- Performance: target low-end Android (2–3 GB RAM). Use FlashList for long lists, `expo-image` for images, and lazy-load heavy screens.
- Every content screen renders `<LegalDisclaimer />`.
- Use `react-native-safe-area-context` (not the deprecated RN SafeAreaView).
