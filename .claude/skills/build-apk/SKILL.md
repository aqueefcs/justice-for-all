---
name: build-apk
description: Build and share an Android APK of the Justice For All mobile app with partners (EAS internal distribution, local builds, or an over-the-air update). Use when asked to "build an APK", "share the app", "release to partners" or "push an update".
---

# Build & share the APK

The app is in `apps/mobile` (Expo). Partners install a release APK; later JS-only changes reach them over the air.

## 1. Decide: new APK or OTA update?
- **OTA update (EAS Update)**: only JS/TS, assets or i18n changed, with no new native module or `app.json` native config, and the `runtimeVersion` is unchanged.
  ```
  cd apps/mobile
  eas update --channel preview --message "<what changed>"
  ```
- **New APK**: native dependency added or upgraded, Expo SDK bump, `app.json` permissions/plugins changed, or the first install.

## 2. Pre-flight
```
pnpm lint && pnpm typecheck && pnpm test
```
- Bump `version` in `apps/mobile/app.json` (semver). `android.versionCode` auto-increments via `eas.json` `autoIncrement`.
- Make sure the API base URL / content-pack URL for the `preview` env is set in `eas.json` → `build.preview.env`.

## 3. Build
`eas.json` profiles:
- `development` (dev client)
- `preview` (APK, internal distribution, channel `preview`)
- `production` (AAB for the Play Store)

```
cd apps/mobile
eas build -p android --profile preview          # cloud build (counts toward free monthly quota)
eas build -p android --profile preview --local  # unlimited; needs JDK 17 + Android SDK (use WSL/Linux or macOS)
```

## 4. Share
- The cloud build gives an install link and QR code. Send the link to partners (they need "Install unknown apps" enabled).
- For a local build, upload the `.apk` to the GitHub Release for the tag (`gh release create v0.x.y build.apk --notes "..."`) or to Firebase App Distribution.
- Write short release notes (what's new, what to test) in plain language for the lawyers.

## 5. Tag
```
git tag mobile-v0.x.y && git push --tags
```
