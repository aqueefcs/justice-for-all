# Getting started

## Prerequisites
- Node **22.13+** (Node 24/26 LTS recommended), pnpm 9+, Docker Desktop (local MongoDB)
- For APKs: an Expo account (`npm i -g eas-cli`, then `eas login`)
- For AWS: the AWS CLI, plus the account set up as described in docs/plan.md ("Immediate next steps")

## First run
```bash
pnpm install
pnpm build                       # builds shared packages (and apps)
pnpm db:up                       # local MongoDB replica set on :27017
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
