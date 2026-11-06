# Justice For All — Product, Architecture & Execution Plan

## Context
A team of lawyers wants a digital legal-help platform for ordinary and low-income people in India. They need four things: plain-language legal knowledge (bare acts, rights, FAQs); step-by-step guides (how to file an FIR or GD, how to draft common documents); low-cost video/phone consultations with verified lawyers; and document exchange (a lawyer uploads a draft, the citizen downloads and prints it). The app starts in English, but every screen must support multiple languages.

- **Delivery:** a mobile app first (an APK shared with partners at every stage), backed by an API that a public website will reuse later. Lawyers get role-based app screens. An admin website covers content, verification and operations.
- **Constraints:** a private company; free tiers until real scale; production-grade security; thousands of users.
- **Judge role:** dropped from the software. A sitting judge cannot take part in a commercial venture. If the "head judge" is retired, they can sit on an offline **Legal Advisory Board** that signs off content policy, with no account in the app.
- **Reference:** `D:\legal-app-project\legal-app-prototype` is a UI-only Expo mockup (hard-coded data, no backend). Reuse ideas only: the navy/glass look and the flow landing → home categories → knowledge base → booking. No code is reused.
- **MVP scope (user decision):** Legal Knowledge Library plus FIR/GD/Drafting Guides are real. Consultations, Documents, Profile and Login are **dummy pages**.
- **Stack decisions (user):** TypeScript everywhere; **NestJS** backend; **MongoDB Atlas** database; **AWS** for backend hosting, in the Mumbai region (ap-south-1).

---

## Part 1 — Idea discussion and key product decisions

### 1.1 Who uses it
| Persona | Needs | Surface |
|---|---|---|
| Citizen (low literacy, low bandwidth, budget Android, regional language) | Understand rights, file an FIR/GD, get a draft, talk to a lawyer cheaply | Mobile app (later the web) |
| Lawyer (verified advocate) | Write/review content, take consultations, upload drafts | The same mobile app in "Lawyer mode", plus the admin web for writing content |
| Senior Reviewer (senior lawyer) | Approve content before publishing; verify lawyers | Admin web |
| Admin / Super-admin (ops team) | Users, payments, disputes, analytics, settings | Admin web |

**One mobile app with role-based navigation**: one APK to share and one codebase.

### 1.2 Legal and compliance guardrails (bake in from day 1)
- **"Legal information, not legal advice."** Show a disclaimer on every content page. Advice happens only inside a consultation with a lawyer.
- **Bar Council of India Rule 36 (no advertising or solicitation by advocates).** List lawyers neutrally (practice area, languages, enrolment state, availability), with no "top/best" ranking. The lawyer's fee is shown separately from the platform/tech fee. **Get a written legal opinion on the fee model before launching paid consults.**
- **DPDP Act 2023 + DPDP Rules 2025:**
  - explicit consent screens and a consent log
  - a privacy notice in the user's language
  - data export and deletion on request
  - breach notification process
  - data minimisation
  - India-region hosting (Mumbai)
- **IT Act / intermediary rules:** a grievance officer, terms of use and takedown handling.
- **Content:**
  - Bare acts from India Code can be reproduced (Copyright Act s.52(1)(q)).
  - Use BNS/BNSS/BSA 2023 with mappings to the old IPC/CrPC/Evidence Act section numbers.

### 1.3 Product principles
Offline-first content, a small APK, low-end Android first, large fonts, icon-led navigation, read-aloud, and every string translatable from the first commit.

---

## Part 2 — Architecture

### 2.1 High-level diagram
```
 Mobile app (Expo, Android APK)        Admin web (React SPA)        Public web (Phase 4, Next.js/Astro, SEO)
          └──────────────────────────────┬───────────────────────────────┘
                                         ▼
                Cloudflare (DNS, CDN, WAF, rate limits — free)
                                         │
       ┌─────────────────────────────────┼─────────────────────────────────┐
       ▼                                 ▼                                 ▼
 API: NestJS (Fastify adapter)     Content CDN: R2 public bucket      R2 private bucket:
 on AWS Lambda, ap-south-1 Mumbai  versioned JSON "content packs"     user docs, lawyer drafts
 (Function URL + Web Adapter)      per language, edge-cached          (signed URLs only)
 – REST + Swagger/OpenAPI
 – Better Auth (sessions, RBAC)
 – Mongoose ODM
       │                 └──► SQS queue ──► Worker Lambdas (pack builder, malware scan, email/push)
       ▼                      EventBridge Scheduler (cron) · SES (email) · SSM Parameter Store (secrets) · CloudWatch (logs)
 MongoDB Atlas (on AWS ap-south-1, same region as Lambda) + Atlas Search + Vector Search (Phase 4 AI)
       │
 Later: Razorpay (UPI) · 100ms/LiveKit (video) · Expo Push/FCM · Bhashini (translation) · MSG91 (SMS OTP)
```

### 2.2 Key architectural decisions (each becomes an ADR in `docs/adr/`)
1. **ADR-001: Custom API with NestJS 11 (Fastify adapter).** One API serves the app, the admin web and the future website. It is organised as modules: auth, users, content, publishing, lawyers, documents, consultations, payments, audit. Roles are enforced by Guards and audit logging by Interceptors. `@nestjs/swagger` produces OpenAPI, and a typed client (`openapi-typescript` + `openapi-fetch`) is generated into `packages/api-client`.
2. **ADR-002: MongoDB Atlas as the primary database** (see the comparison below). Mongoose via `@nestjs/mongoose`, with Zod schemas shared from `packages/shared`. Rules to keep relational integrity:
   - reference by ObjectId plus indexes
   - **multi-document transactions** (Atlas is a replica set) for booking + payment + ledger writes
   - schema validation (`$jsonSchema`) on the critical collections
   - an idempotency-keys collection for webhooks
3. **Content is published, not queried.** Lawyers write in the admin CMS, then a reviewer approves. Publishing builds versioned **content packs**: JSON per category per locale, uploaded to R2 behind the CDN. The app caches them in on-device SQLite, works offline and syncs only the differences. Reading barely touches the database, which matters because M0 is capped at ~100 operations per second.
4. **Search:**
   - In the app: offline SQLite FTS5 over the downloaded packs.
   - Server side, web and admin: **Atlas Search** (free on M0, limited to 3 indexes), which has `lucene.hindi`/`lucene.bengali` analyzers and fuzzy matching. No separate search service is needed until much later.
5. **Multilingual in two layers:**
   - **UI strings:** i18next JSON in `packages/i18n`.
   - **Content:** translations embedded per document as `translations: { en: {...}, hi: {...} }`, each with a `status` per locale. Machine drafts come from Bhashini / IndicTrans2 (free), and a lawyer must review before publishing.
6. **Drafting templates:** HTML with `{{placeholders}}` plus a field schema. The app renders a form and produces the PDF **on the device** with `expo-print`, then shares or prints it. Personal data stays on the phone in the MVP.
7. **Stateless, serverless API** (AWS Lambda scales 0→N; see §2.6). Sessions live in MongoDB, slow work goes through SQS, and nothing is kept in memory between requests.
8. **RBAC:** `citizen`, `lawyer`, `reviewer`, `admin`, `super_admin`. Enforced in API Guards and mirrored in UI navigation guards. Sensitive writes go to `audit_logs`.

### 2.3 MongoDB Atlas M0 vs Supabase Postgres Free (ADR-002 rationale)
| Factor | MongoDB Atlas M0 (Free) | Supabase Free (Postgres) |
|---|---|---|
| Storage | 512 MB | 500 MB DB (+1 GB file storage) |
| Pauses when idle? | **No 7-day pause** (only after ~60 days with no connections) | **Pauses after 7 days of inactivity**, so a keep-alive cron is needed |
| Mumbai region | Yes (AWS ap-south-1) | Yes |
| Built-in full-text search | **Atlas Search (Lucene) with Hindi and other analyzers, fuzzy matching, autocomplete** | Postgres FTS (weak for Indic languages) + `pg_trgm` |
| Vector search (future AI assistant) | **Atlas Vector Search included** | pgvector included |
| Fit for content (act → sections, embedded translations) | **Natural**: one document per section with nested translations | Many joined tables |
| Fit for payments/bookings | Good with multi-document transactions and discipline | **Native**: foreign keys and ACID |
| Throughput limits | ~100 ops/sec, 500 connections, shared CPU | Small dedicated instance, pooler |
| Backups on free | None on M0, so we run our own `mongodump` → R2 (weekly GitHub Action) | No downloadable backups on free either |
| First paid step | **Flex tier (pay-as-you-go, capped ~US$30/mo)** → M10 dedicated (~US$57/mo) | Pro US$25/mo |
| Bundled extras | Atlas Triggers, Charts | Auth, Storage, Realtime (we wouldn't use them; Better Auth + R2 instead) |
| NestJS integration | First-class `@nestjs/mongoose`; Better Auth has a MongoDB adapter | Drizzle/Prisma |

**Verdict:** for this product's free stage, Atlas is the stronger free tier. It doesn't pause, comes with real multilingual search and vector search, and suits the content model. The trade-off is weaker relational guarantees for payments and bookings. Transactions, validation, idempotency keys and tests on the payment flows cover that.

### 2.4 Data model (Mongoose collections in `packages/db`)
- **Identity:**
  - `users` (phone, email, name, preferredLocale, role, status)
  - `sessions` / `accounts` (Better Auth)
  - `consents` (userId, purpose, version, grantedAt, withdrawnAt)
- **Lawyers:** `lawyerProfiles` (userId, barEnrolmentNo, stateBarCouncil, practiceAreas[], languages[], verificationStatus, verifiedBy, fee, docs[] → R2 keys).
- **Knowledge:**
  - `categories` (slug, icon, translations{})
  - `acts` (shortName, year, translations{})
  - `actSections` (actId, number, oldLawRefs[], translations{locale: {title, text, plainExplanation, status}})
  - `articles` (categoryId, tags, translations{})
- **Guides:** `guides` (type: FIR | GD | complaint | RTI…, steps[] embedded, checklist[], stateLinks[], translations{}).
- **Templates:** `templates` (fieldSchema, bodyHtml per locale, translations{}).
- **Publishing:** common fields `status`, `authorId`, `reviewerId`, `version`, `publishedAt`; `contentPacks` (locale, category, version, r2Key, checksum).
- **Phase 2–3:**
  - `documents` (ownerId, consultationId, kind, r2Key, mime, size, scanStatus)
  - `availabilitySlots`, `consultations`, `payments`, `callSessions`, `idempotencyKeys`
- **Ops:** `auditLogs` (TTL/archival policy), `notifications`, `feedback`.

### 2.5 Security baseline
- **Transport and secrets:** TLS through Cloudflare. Secrets live in AWS SSM Parameter Store (SecureString) / GitHub secrets, never in the repo. GitHub Actions deploys to AWS through **OIDC role assumption**, so there are no long-lived AWS access keys.
- **Atlas:**
  - IP access list
  - a separate least-privilege DB user per environment
  - TLS required
  - encryption at rest (Atlas default)
- **Auth:**
  - Better Auth with httpOnly cookies on the web and `expo-secure-store` tokens on mobile
  - Google sign-in and phone OTP
  - 2FA required for staff
- **API hardening:**
  - Zod validation on all inputs
  - NoSQL-injection hardening: Mongoose `sanitizeFilter`; reject `$`-prefixed keys
  - `@nestjs/throttler` plus Cloudflare rate limits
  - CORS allowlist and security headers
- **Files:** private R2 with short-lived signed URLs, MIME and size checks, malware scan (ClamAV job, Phase 2).
- **Backups:** weekly `mongodump` to R2 from a GitHub Action. Dependabot, CodeQL and `pnpm audit` in CI.
- **DPDP rights endpoints:** `/me/export`, `/me/delete`, plus a retention policy.
- **AWS account hygiene:**
  - MFA on the root account, and the root account is never used day to day
  - people sign in through IAM Identity Center
  - least-privilege IAM roles per Lambda
  - CloudTrail on
  - **AWS Budgets alerts at $1 / $5 / $10**

### 2.6 AWS deployment design (ADR-006)
```
 Cloudflare (DNS api.<domain>, WAF, rate limits)
   │  adds a secret "X-Origin-Verify" header (Transform Rule)
   ▼
 Lambda Function URL ──► api Lambda (Node 22, arm64/Graviton, 1024 MB)
                          NestJS + Fastify run unchanged via AWS Lambda Web Adapter
                          esbuild-bundled zip; Mongoose connection cached across invocations
                          │
                          ├─► SQS "jobs" queue ──► worker Lambda(s): publish content packs → R2,
                          │                        ClamAV scan (container Lambda, Phase 2), SES email, Expo push
                          ├─► SSM Parameter Store (secrets, read once at cold start)
                          └─► CloudWatch Logs (14–30 day retention, no personal data)
 EventBridge Scheduler ──► cron Lambdas (reminders, cleanup, retention purges)
 Infrastructure as code: AWS CDK (TypeScript) in /infra · CI: GitHub Actions + OIDC
```
- **Why Lambda, not EC2/Fargate/App Runner:**
  - Lambda's always-free allowance (1M requests and 400k GB-seconds a month) is **permanent**.
  - EC2, Fargate and App Runner either cost money from day one or only run on the new-account credits. Since July 2025, new AWS accounts get up to $200 of credits on a 6-month "Free plan". After that you switch to the "Paid plan", and the always-free Lambda, SQS and CloudWatch allowances keep the bill at roughly ₹0.
- **No API Gateway:** Lambda Function URLs are free. Cloudflare in front provides the domain, WAF and rate limiting. The API rejects any request that lacks the Cloudflare origin-verify header, so the raw Function URL can't be called directly.
- **Cold starts:** around 1 s for a bundled NestJS app on arm64 at 1024 MB. That is acceptable because citizens read content from the CDN and device packs, not the API. If it becomes a problem, use provisioned concurrency or move to Fargate.
- **MongoDB from Lambda:**
  - Connect once per execution environment, outside the handler.
  - Keep `maxPoolSize` at 2–5 and cap Lambda reserved concurrency (e.g. 50) so total connections stay well under M0's 500.
  - New AWS accounts can start with a concurrency quota as low as 10, so request an increase before launch.
- **Atlas network trade-off:**
  - M0 doesn't support VPC peering or PrivateLink, and a Lambda outside a VPC has no fixed IP. Giving it one needs a NAT Gateway (~US$35+/month).
  - So for the free stage, Atlas allows `0.0.0.0/0`, protected by a long random password (SCRAM) over TLS for a least-privilege user stored in SSM.
  - **Upgrade path:** Atlas M10 + PrivateLink, with the Lambdas in a VPC.
- **Portability:** the API keeps a Dockerfile, and the Web Adapter means the same app runs on ECS Fargate (Graviton) behind an ALB when sustained traffic, WebSockets or long-running work call for it.
- **Storage stays on Cloudflare R2, not S3.** Downloads and prints of documents and packs are the main traffic. R2 has zero egress fees, while S3 egress in Mumbai is paid after the first 100 GB a month.

---

## Part 3 — Tech stack (free-tier first)

| Layer | Choice | Free tier / why | Upgrade trigger |
|---|---|---|---|
| Monorepo | **pnpm + Turborepo** | Shared types, schemas and i18n | — |
| Language | **TypeScript (strict)** everywhere | Matches team skills | — |
| Mobile | **Expo SDK 58 + expo-router**, StyleSheet + shared design tokens (kept lean, no styling library), i18next + expo-localization, expo-sqlite (kv-store; FTS5 later), expo-print, expo-speech, expo-secure-store; TanStack Query + api-client added in Phase 2 | Android, iOS and web from one codebase | — |
| APK sharing | **EAS Build** internal-distribution APK (link/QR) plus **EAS Update** OTA for JS changes; `eas build --local` when the free quota runs out | Free plan has limited builds per month; local builds are unlimited | Frequent builds → EAS Starter |
| API | **NestJS 11 + Fastify on Node 22**, `@nestjs/mongoose`, `nestjs-zod`, `@nestjs/swagger`, `@nestjs/throttler`, Better Auth (MongoDB adapter, NestJS integration) | Structured modules for a growing team; OpenAPI → typed client | — |
| API hosting | **AWS Lambda, ap-south-1 Mumbai** (Node 22 arm64, Function URL, Lambda Web Adapter) | Always free: 1M requests + 400k GB-s/month; scales to zero; same region as Atlas | Cold starts hurt → provisioned concurrency; sustained traffic/WebSockets → ECS Fargate |
| Infrastructure as code | **AWS CDK (TypeScript)** in `/infra` | Official, typed, same language as the app | — |
| Queue & cron | **SQS** (1M requests/month always free) + **EventBridge Scheduler** | Pack building, malware scans, emails, reminders | — |
| Secrets | **SSM Parameter Store** SecureString | Standard parameters are free (Secrets Manager costs $0.40 per secret per month) | Rotation needs → Secrets Manager |
| Logs & metrics | **CloudWatch** (5 GB logs free) + Sentry | Retention 14–30 days | — |
| Cost guardrails | **AWS Budgets** alerts ($1/$5/$10), Free-plan credits | Avoid surprise bills | — |
| Database | **MongoDB Atlas M0, AWS Mumbai** | 512 MB, no idle pause, Atlas Search + Vector Search | >512 MB or >100 ops/s → Flex, then M10 |
| SMS OTP | Phase 2: **MSG91/2Factor** (~₹0.15–0.25/SMS) + free Google sign-in | Only paid item | — |
| Files & content CDN | **Cloudflare R2** | 10 GB free, zero egress fees | >10 GB |
| Edge | **Cloudflare** free (DNS, CDN, WAF) | — | — |
| Admin web | **Vite + React + TanStack Router + shadcn/ui + TipTap**, on **Cloudflare Pages** | Free, commercial use allowed | — |
| Public web (Phase 4) | **Next.js or Astro** on Cloudflare | SEO growth channel | — |
| Payments (Phase 3) | **Razorpay** (UPI; Route for lawyer payouts) | No setup fee | — |
| Video/voice (Phase 3) | **100ms** (~10k free min/month) or LiveKit Cloud | — | Per-minute pricing at scale |
| Push / email | Expo Push (FCM) · **Amazon SES** (~$0.10 per 1,000 emails; request production access to leave the sandbox) | Effectively free at our volume | — |
| Translation | Bhashini / IndicTrans2, with lawyer review | Free | — |
| Background jobs | **SQS → worker Lambdas** (see the Queue & cron row) | No Redis or queue server needed | — |
| Observability | Sentry, PostHog, Better Stack/UptimeRobot | Free | — |
| CI/CD | **GitHub Actions** | Free | — |
| Testing | Vitest/Jest + **mongodb-memory-server** (API), **Maestro** (mobile end-to-end), Playwright (admin) | Free | — |

---

## Part 4 — Repository structure (`D:\justice-for-all`)
```
apps/
  mobile/        Expo app (citizen + lawyer modes)
  admin/         Vite React admin & content CMS
  api/           NestJS API (modules: auth, users, content, publishing, lawyers, documents, consultations, payments, audit)
  web/           (Phase 4) public website
packages/
  db/            Mongoose schemas/models, index definitions, seed (sample acts/guides/templates), migrate-mongo scripts
  shared/        Zod schemas, DTO types, role/permission constants, utils
  api-client/    typed client generated from the API's OpenAPI spec
  i18n/          locales/en/*.json, locales/hi/*.json + typed keys
  ui-tokens/     colour/spacing/typography tokens (navy/glass theme)
  config/        tsconfig, eslint, prettier presets
infra/           AWS CDK app (TypeScript): Lambda API + Function URL, SQS + workers, Scheduler, SSM params, alarms, budgets
docs/            plan, adr/, content-style-guide.md, compliance.md
.github/workflows/  ci.yml, deploy-api.yml (OIDC → cdk deploy), eas-build.yml, db-backup.yml
CLAUDE.md, .claude/rules/*.md, .claude/skills/<name>/SKILL.md
```

---

## Part 5 — Phased roadmap

### Phase 0 — Foundations (~1 week)
- Set up the monorepo, strict TypeScript, ESLint/Prettier, Turborepo and GitHub Actions CI.
- Write **CLAUDE.md** (currently empty): product summary, monorepo map, commands, conventions, the "every string via i18n" rule, security rules (incl. NoSQL injection), "legal info not advice", and the definition of done.
- **`.claude/rules/`** (Claude Code rules; `paths:` frontmatter scopes them to parts of the repo):
  - `general.md`
  - `security.md`
  - `mobile.md`
  - `api-nestjs.md`
  - `mongodb.md`
  - `i18n.md`
- Fix `.claude/skills/SKILL.md`. It is empty and in the wrong place: skills go at `.claude/skills/<name>/SKILL.md`. Add:
  - `build-apk`
  - `add-content-type`: schema + translations + admin form + pack builder
  - `add-api-module`: NestJS module, Zod DTO, Swagger, RBAC guard, tests
- Write ADR-001…006.
- AWS foundation:
  - account security (MFA, Identity Center, Budgets)
  - `infra/` CDK skeleton deploying a "hello" NestJS Lambda behind a Function URL
  - Cloudflare DNS for `api.<domain>` with the origin-verify header
  - a GitHub Actions OIDC deploy role
- Create the Expo app shell (theme tokens, i18n, tabs, language switcher). **First APK to partners at the end of week 1.**

### Phase 1 — MVP: Knowledge + Guides (~weeks 2–6)
- **API:**
  - content modules with the review workflow
  - read endpoints
  - pack builder/publisher to R2
  - Atlas Search index for the admin and web
- **Admin web:**
  - staff login (email + 2FA)
  - TipTap CMS for articles, guides and templates
  - review queue and translation-status grid
  - bare-act import script (India Code → JSON)
- **Mobile:**
  - onboarding with language pick
  - Home: categories, search, quick actions "File FIR", "File GD", "Make a Draft"
  - Library: acts → sections, old↔new law mapping
  - Articles
  - Guides: steps, checklist, state e-FIR portal links
  - Templates: form → PDF → share/print
  - offline packs with SQLite FTS, bookmarks, read-aloud
- **Dummy "Coming soon" pages:** Consult a Lawyer, My Documents, Profile/Login, Lawyer mode preview.
- **Seed content (written by the lawyers):** about 6 categories, 15–20 articles, FIR + GD + 3–5 guides, 5 templates (police complaint, RTI, legal notice, affidavit, rent agreement).
- **Releases:** a weekly APK plus EAS Update OTA.

### Phase 2 — Accounts, Lawyers, Documents (~weeks 7–10)
- Citizen login (Google + phone OTP) with consent capture.
- Lawyer onboarding and verification, and Lawyer mode.
- Document exchange through signed URLs, with malware scan, audit log and retention.
- Hindi content live, plus 1–2 more languages.

### Phase 3 — Consultations & Payments (~weeks 11–14)
- Availability slots → booking → Razorpay UPI with webhooks (idempotent, transactional) → 100ms/LiveKit video and voice.
- Push reminders, post-call draft upload, refunds and disputes in the admin, BCI-compliant neutral listing.

### Phase 4 — Scale & Growth
- Public SEO website and Play Store release.
- More languages and audio content.
- AI legal-information assistant: retrieval over bare acts and reviewed articles using Atlas Vector Search, with citations and a disclaimer, handing off to a lawyer.
- k6 load tests. When the metrics call for it: move Atlas from M0 to Flex/M10 (+ PrivateLink, Lambdas in a VPC), add Lambda provisioned concurrency, or move the API to ECS Fargate.

---

## Part 6 — Scalability notes
- Reading content goes through the CDN and the device's local storage, which keeps it well under M0's ~100 ops/sec.
- Serverless API: one cached Mongoose connection per Lambda environment (`maxPoolSize` 2–5) and reserved concurrency set so the total stays within M0's 500 connections. Slow work goes through SQS, never in the request.
- Compound indexes for every query pattern (checked with `explain()` in CI for hot queries), cursor pagination, idempotency keys, TTL indexes for sessions and logs.

---

## Verification (per phase)
- **CI on every PR:** typecheck, lint, unit and integration tests (API against `mongodb-memory-server` replica-set mode so transactions are tested), index/migration check, `cdk synth` + `cdk diff` posted on infra changes.
- **AWS:** after a deploy, a smoke test calls `api.<domain>/v1/health` through Cloudflare (expect 200) and the raw Function URL without the header (expect 403). Check CloudWatch for cold-start duration, and confirm a Budgets alert email arrives.
- **API:** Swagger at `/docs`. RBAC contract tests (a citizen cannot reach reviewer/admin routes). NoSQL-injection tests (`$`-operator payloads rejected).
- **Mobile:** Maestro flows:
  - onboarding → language switch
  - offline section search (airplane mode)
  - FIR guide
  - template → PDF
- **Admin:** Playwright: create → review → publish an article, then check the pack version bumps and the app picks it up.
- **Release check:** install the APK on a 2–3 GB RAM Android phone. Check cold start, offline reading and Hindi rendering, then share the link/QR with partners.

## Immediate next steps after approval
1. Scaffold the monorepo, CLAUDE.md, `.claude/rules`, skills and ADRs (Phase 0).
2. Build the Expo shell and EAS APK profile → first shareable APK.
3. Create accounts: Expo, MongoDB Atlas (M0 on AWS Mumbai), Cloudflare (R2 + Pages + DNS), **AWS** (choose region ap-south-1; turn on MFA, create an IAM Identity Center user and Budgets alerts before anything else), Sentry, PostHog.
4. In parallel, the lawyers draft seed content and get a legal opinion on the fee model.
