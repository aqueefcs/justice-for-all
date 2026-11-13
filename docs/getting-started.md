# Getting started

## Prerequisites
- Node **22.13+** (Node 24/26 LTS recommended), pnpm 9+, Docker Desktop (local MongoDB)
- For APKs: an Expo account (`npm i -g eas-cli`, then `eas login`)
- For AWS: the AWS CLI, plus the account set up as described in docs/plan.md ("Immediate next steps")

## First run
```bash
pnpm install
pnpm build                       # builds shared packages (and apps)
pnpm db:local                    # local MongoDB replica set on :27017 (no Docker; data in .data/)
                                 # …or `pnpm db:up` if you prefer Docker
cp apps/api/.env.example apps/api/.env
pnpm --filter @jfa/db seed       # SAMPLE content (marked isSample)
pnpm --filter @jfa/api dev       # http://localhost:3000/docs
```

Try the API, using the local-only dev role header:
```bash
curl localhost:3000/v1/health
curl -H "x-dev-role: lawyer"   localhost:3000/v1/content/guides
curl -X POST -H "x-dev-role: reviewer" -H "content-type: application/json" -d '{}' localhost:3000/v1/publishing/packs
# → content packs are written to apps/api/.local-storage/packs/ (R2 not configured)
```

Admin console:
```bash
cp apps/admin/.env.example apps/admin/.env.local
pnpm --filter @jfa/admin dev     # http://localhost:5173 → pick a role on the dev sign-in page
```

Mobile app:
```bash
pnpm --filter @jfa/mobile start  # scan the QR code with Expo Go, or press "a" for an Android emulator
```
The app runs fully offline on the bundled SAMPLE pack. To use real packs, set `EXPO_PUBLIC_CONTENT_CDN_URL`.

### On your phone (Expo Go, same Wi-Fi as the PC)
1. Find the PC's Wi-Fi IP (`ipconfig` → Wi-Fi → IPv4, e.g. `192.168.0.247`) and put it in
   `apps/api/.env` (`CONTENT_CDN_URL=http://<ip>:8090`) and `apps/mobile/.env`
   (`EXPO_PUBLIC_CONTENT_CDN_URL=http://<ip>:8090`).
2. Run: `pnpm db:local`, `pnpm --filter @jfa/api start`, `pnpm --filter @jfa/api cdn:local`,
   then `cd apps/mobile && npx expo start --lan`.
3. Install **Expo Go** (Play Store), then scan the QR code or use "Enter URL manually": `exp://<ip>:8081`.
4. End-to-end check: publish packs (`POST /v1/publishing/packs` as `reviewer`), then reopen the app
   and it downloads the new pack from the local CDN.
If the phone can't connect, allow Node.js through Windows Firewall for your network profile, and
make sure the phone isn't on a guest network that isolates clients.

## Local Android builds on Windows (`npx expo run:android`)
Most people should use the cloud build below. These steps apply only to building on your own PC.
1. `JAVA_HOME` must be the JDK folder itself, **not** its `\bin` (e.g. `C:\Program Files\Java\jdk-17`).
2. Turn on long file paths. In an **Administrator** PowerShell, run:
   `reg add HKLM\SYSTEM\CurrentControlSet\Control\FileSystem /v LongPathsEnabled /t REG_DWORD /d 1 /f`
   Then sign out and back in.
3. Install CMake 3.31.6 (`sdkmanager "cmake;3.31.6"`). Then add this to `apps/mobile/android/local.properties`:
   `cmake.dir=C\:\\Users\\<you>\\AppData\\Local\\Android\\Sdk\\cmake\\3.31.6`
   CMake 3.31.6 ships ninja 1.12+, which handles the long paths this monorepo creates.
4. If IPv6 is broken on your network, add `systemProp.java.net.preferIPv4Stack=true` to `%USERPROFILE%\.gradle\gradle.properties`.

`npx expo prebuild --clean` deletes `android/`, so you'd need to redo step 3 after it.

## Share an APK with partners
See `.claude/skills/build-apk/SKILL.md`. In short:
```bash
cd apps/mobile
eas init                          # once: creates the EAS project; put the id in EAS_PROJECT_ID
eas build -p android --profile preview   # gives an install link + QR code
eas update --channel preview      # later JS-only changes reach installed apps over the air
```

## Deploy the API to AWS (Mumbai)
```bash
pnpm --filter @jfa/api bundle:lambda
cd infra
npx cdk bootstrap aws://<ACCOUNT_ID>/ap-south-1
# Secrets first (SecureString), e.g.:
aws ssm put-parameter --region ap-south-1 --type SecureString --name /jfa/dev/MONGODB_URI --value "mongodb+srv://..."
aws ssm put-parameter --region ap-south-1 --type SecureString --name /jfa/dev/ORIGIN_VERIFY_SECRET --value "<random 32+ chars>"
npx cdk deploy --all -c stage=dev -c alertEmail=you@example.com
```
Then in Cloudflare:
1. Create a proxied DNS record `api.<domain>` pointing at the Function URL host (it appears in the stack output).
2. Add a Transform Rule that sets the request header `x-origin-verify: <same secret>`.
3. Set `vars.API_URL` in GitHub so CI can run the smoke test.

## Everyday commands
| Task | Command |
|---|---|
| Typecheck, lint and test everything | `pnpm typecheck && pnpm lint && pnpm test` |
| Regenerate the API client after API changes | `pnpm --filter @jfa/api build && pnpm --filter @jfa/api openapi && pnpm --filter @jfa/api-client generate` |
| Check i18n keys | `pnpm --filter @jfa/i18n lint` |
| Preview AWS changes | `pnpm --filter @jfa/infra exec cdk diff -c stage=dev` |
