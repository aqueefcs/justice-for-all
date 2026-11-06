# Integrations: placeholders and how to switch them on

Every third-party tool has a **placeholder** already wired into the code. Until its keys are set, it runs in a safe fallback mode: it skips, runs locally or reports "not configured". To switch one on, create the account, put the secrets in SSM (AWS) or `.env` (local), and complete the `TODO` in the listed file.

You can see the live status in **Admin → Integrations**, which comes from `GET /v1/integrations` (admin only).

Where secrets go:
- **Local:** `apps/api/.env` (copy from `.env.example`).
- **AWS:** SSM Parameter Store as SecureString under `/jfa/<stage>/<NAME>`, e.g. `/jfa/dev/MONGODB_URI`. The Lambdas load them at cold start (`apps/api/src/config/load-ssm.ts`).
- **Mobile and admin:** only public values (`EXPO_PUBLIC_*`, `VITE_*`). Never put secrets in them.

## Backend (API)

| Tool | Status today | Phase | Env vars (SSM) | Code | What's left |
|---|---|---|---|---|---|
| **MongoDB Atlas** (M0, Mumbai) | ✅ Working (local Docker or Atlas) | MVP | `MONGODB_URI`, `MONGODB_MAX_POOL_SIZE` | `apps/api/src/app.module.ts`, `packages/db` | Create the M0 cluster on AWS ap-south-1, add a least-privilege user, and set the URI. Create the Atlas Search index from `packages/db/search-indexes/content.json`. |
| **Cloudflare R2** (storage + CDN) | ✅ Implemented; writes to `.local-storage/` when no keys are set | MVP | `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_PUBLIC_BUCKET`, `R2_PRIVATE_BUCKET`, `CONTENT_CDN_URL` | `integrations/storage/storage.service.ts` | Create 2 buckets: a public one on a custom domain `content.<domain>`, and a private one. Create an R2 API token scoped to those buckets. |
| **AWS SQS** (jobs) | ✅ Implemented; jobs run inline when not set | MVP | `JOBS_QUEUE_URL` (set by CDK automatically) | `integrations/queue/queue.service.ts`, `jobs/jobs.module.ts`, `worker.ts` | Nothing: CDK creates the queue, the DLQ and the worker. |
| **Cloudflare origin lock** | ✅ Implemented | MVP | `ORIGIN_VERIFY_SECRET` | `common/guards/origin-verify.guard.ts` | Create a Cloudflare Transform Rule that adds the `x-origin-verify` header to requests for `api.<domain>`. |
| **Better Auth** | 🟡 Placeholder (only the local dev-role header works) | MVP (staff) / Phase 2 (citizens) | `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | `auth/auth.service.ts` | Add `better-auth` + `@thallesp/nestjs-better-auth` with the MongoDB adapter. Staff: email + 2FA. Citizens: phone OTP + Google. |
| **Amazon SES** (email) | ✅ Implemented; skips when not set | Phase 2 | `SES_FROM_EMAIL` | `integrations/email/email.service.ts` | Verify the domain (DKIM) and request production access. |
| **MSG91** (SMS OTP) | 🟡 Placeholder | Phase 2 | `MSG91_AUTH_KEY`, `MSG91_TEMPLATE_ID` | `integrations/sms/sms.service.ts` | TRAI DLT registration (entity, sender ID, OTP template), then implement `sendOtp`. |
| **Expo Push** | 🟡 Placeholder | Phase 2 | `EXPO_ACCESS_TOKEN` | `integrations/push/push.service.ts` | Add `expo-server-sdk`, store device tokens, handle receipts. |
| **Bhashini** (translation drafts) | 🟡 Placeholder | Phase 2 | `BHASHINI_USER_ID`, `BHASHINI_API_KEY` | `integrations/translation/translation.service.ts` | Register on bhashini.gov.in and call the ULCA pipeline. Output is saved as **draft** only, and a lawyer reviews it. |
| **ClamAV** (malware scan) | 🟡 Placeholder | Phase 2 | `MALWARE_SCAN_ENABLED` | `integrations/malware-scan/malware-scan.service.ts` | Container-image worker Lambda with freshclam, plus a `document.scan` job. |
| **Razorpay** (payments) | 🟡 Placeholder (webhook signature check already implemented) | Phase 3 | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | `integrations/payments/payments.service.ts` | Account KYC, then orders, a webhook controller with idempotency and transactions, and Route payouts. **Get the legal opinion on the fee model first** (docs/compliance.md). |
| **100ms** (video/voice) | 🟡 Placeholder | Phase 3 | `HMS_ACCESS_KEY`, `HMS_SECRET`, `HMS_TEMPLATE_ID` | `integrations/video/video.service.ts` | Create rooms and issue participant tokens. Recording stays off unless both parties consent. |
| **Sentry** | 🟡 Placeholder | MVP | `SENTRY_DSN` | `integrations/error-tracking/error-tracking.service.ts` | Add `@sentry/nestjs` with `sendDefaultPii: false` and a PII scrubber. |
| **PostHog** | 🟡 Placeholder | MVP | `POSTHOG_API_KEY`, `POSTHOG_HOST` | `integrations/analytics/analytics.service.ts` | Add `posthog-node`. Events use opaque IDs only, never personal data. |

## Mobile app

| Tool | Status | Phase | Config | Code |
|---|---|---|---|---|
| **Content packs** (R2 CDN → device) | ✅ Implemented (manifest sync, kv-store cache, bundled SAMPLE fallback) | MVP | `EXPO_PUBLIC_CONTENT_CDN_URL` | `src/content/pack-store.ts`. TODO: SQLite FTS5 and sha256 check |
| **On-device PDF** (expo-print/sharing) | ✅ Working | MVP | none | `app/template/[slug].tsx` |
| **Read aloud** (expo-speech) | ✅ Working | MVP | none | `src/components/read-aloud.tsx` |
| **EAS Build / Update** | ✅ Configured | MVP | `EAS_PROJECT_ID`, GitHub secret `EXPO_TOKEN` | `eas.json`, `.github/workflows/eas-build.yml` |
| **Sentry** | 🟡 Placeholder | MVP | `EXPO_PUBLIC_SENTRY_DSN` | `src/integrations/index.ts` |
| **PostHog** | 🟡 Placeholder | MVP | `EXPO_PUBLIC_POSTHOG_KEY` | `src/integrations/index.ts` |
| **Better Auth client** | 🟡 Placeholder (secure-store helpers ready) | Phase 2 | `EXPO_PUBLIC_API_URL` | `src/integrations/auth.ts` |
| **API client** | 🟡 Placeholder (`@jfa/api-client` is ready to use) | Phase 2 | `EXPO_PUBLIC_API_URL` | `src/integrations/api.ts` |
| **Push, Razorpay, 100ms, document upload** | 🟡 Placeholders and "Coming soon" screens | Phase 2–3 | none | `src/integrations/future.ts`, `app/coming-soon/[feature].tsx` |

## Admin web

| Tool | Status | Code |
|---|---|---|
| API client + TanStack Query | ✅ Working (health, guides, integrations pages) | `apps/admin/src/lib.ts`, `src/pages.tsx` |
| Staff login | 🟡 Dev-role placeholder (local only). Replace with Better Auth (email + 2FA). | `apps/admin/src/lib.ts` (`devAuth`) |
| Hosting | Cloudflare Pages: build `pnpm --filter @jfa/admin build`, output `apps/admin/dist` | none |

## AWS (infra/)

| Resource | Status | Notes |
|---|---|---|
| API Lambda + Function URL + Web Adapter | ✅ CDK | Confirm `webAdapterLayerVersion` in `infra/lib/config.ts` |
| SQS + DLQ + worker Lambda | ✅ CDK | — |
| CloudWatch alarms → SNS email | ✅ CDK | `-c alertEmail=...` |
| AWS Budgets ($1/$5/$10) | ✅ CDK | Account-wide |
| GitHub OIDC deploy role | ✅ CDK | `-c githubRepo=owner/repo`, then set the repo variable `AWS_DEPLOY_ROLE_ARN` |
| EventBridge Scheduler | 🟡 TODO (Phase 2) | Retention purge, reminders |
