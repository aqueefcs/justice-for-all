# Justice For All — guidance for AI coding agents

Legal-help platform for ordinary and low-income people in India: plain-language legal knowledge, FIR/GD and drafting guides, low-cost lawyer consultations, and document exchange. Built by a private company working with a team of lawyers.

The full plan is in [docs/plan.md](docs/plan.md). Decisions are recorded in [docs/adr/](docs/adr/). Read both before making architectural changes.

## Current phase
**Phase 0 → Phase 1 (MVP).** The MVP has two real features: the **Knowledge Library** (acts/sections/articles) and the **Guides** (FIR, GD, drafting templates → PDF). Consult a Lawyer, My Documents, Profile/Login and Lawyer mode are **"Coming soon" placeholder screens**. Do not build their backends until the phase says so.

## Monorepo map (pnpm + Turborepo, TypeScript strict everywhere)
```
apps/mobile      Expo SDK 58 + expo-router app (citizen + lawyer modes in ONE app)
apps/admin       Vite + React + TanStack Router + Tailwind admin & content CMS
apps/api         NestJS 11 (Fastify adapter) REST API, Swagger at /docs; src/worker.ts = SQS worker
apps/web         (Phase 4) public SEO website
packages/db      Mongoose schemas (plain, registered via MODEL_DEFINITIONS), indexes, seed
packages/shared  Zod schemas (single source of truth for DTOs), roles/permissions, utils
packages/api-client  typed client generated from the API OpenAPI spec — never hand-edit
packages/i18n    locales/<lang>/*.json UI strings + typed keys
packages/ui-tokens  colours, spacing, typography (navy/glass theme)
packages/config  shared tsconfig / eslint / prettier
infra/           AWS CDK app (Lambda API, SQS workers, scheduler, alarms, budgets)
docs/            plan, ADRs, compliance, integrations, getting-started
```
All workspace packages are named `@jfa/<folder>` (e.g. `@jfa/api`, `@jfa/mobile`).

## Stack
- Expo SDK 58 (RN 0.88, React 19.3), StyleSheet + `@jfa/ui-tokens` (no styling library), i18next, expo-sqlite (kv-store now, FTS5 later), expo-print, expo-speech, expo-secure-store
- NestJS + Fastify, `@nestjs/mongoose`, `nestjs-zod`, `@nestjs/swagger`, `@nestjs/throttler`, Better Auth
- MongoDB Atlas (M0, Mumbai) with Atlas Search
- **AWS (ap-south-1 Mumbai):** API on Lambda (Function URL + Lambda Web Adapter), SQS + worker Lambdas, EventBridge Scheduler, SES, SSM Parameter Store, CloudWatch; infrastructure as code with AWS CDK in `infra/`
- Cloudflare: DNS/WAF in front of the API; R2 for files and content packs; Pages for the admin/web
- EAS Build/Update to share APKs

## Commands
```
pnpm install && pnpm build          # build shared packages first (apps import their dist/)
pnpm db:up                          # local MongoDB replica set (Docker)
pnpm --filter @jfa/api dev          # API → http://localhost:3000/docs  (needs apps/api/.env)
pnpm --filter @jfa/mobile start     # Expo dev server
pnpm --filter @jfa/admin dev        # http://localhost:5173
pnpm typecheck && pnpm lint && pnpm test
pnpm --filter @jfa/db seed          # SAMPLE content
# after API changes: rebuild, export spec, regenerate client (CI fails if stale)
pnpm --filter @jfa/api build && pnpm --filter @jfa/api openapi && pnpm --filter @jfa/api-client generate
pnpm --filter @jfa/api bundle:lambda                      # Lambda artifacts in apps/api/.lambda/
pnpm --filter @jfa/infra exec cdk diff -c stage=dev       # preview AWS changes (prod deploys only from CI)
```
Requires Node 22.13+ (local: Node 26; Lambda runtime: Node 24) and pnpm 9+. On Windows, edit files with the editor tools, not PowerShell `Set-Content` (it corrupts UTF-8).

## Gotchas
- Shared packages are consumed from `dist/` — run `pnpm build` (or `pnpm --filter <pkg> dev`) after changing `packages/*`.
- Mongoose `sanitizeFilter` is on: operators you build server-side must be wrapped in `trusted({...})`.
- `ConfigModule` validates env when `AppModule` is imported — set env (or load SSM) **before** importing it (see `main.ts`, `worker.ts`, tests).
- Lambda bundles are built from `dist/` (tsc keeps decorator metadata; esbuild alone would not).
- Local dev auth: `x-dev-role: <role>` header works only with `STAGE=local|test` and `ALLOW_DEV_AUTH=true`.
- Integrations: see docs/integrations.md — each has a placeholder service with a TODO; status at `GET /v1/integrations`.

## Non-negotiable rules
1. **Every user-facing string goes through i18n** (`t('key')`), in the mobile app and the admin alike. Add the key to `packages/i18n/locales/en/*.json`. Never hard-code display text. Content (acts, guides, templates) is stored per locale in `translations: { en: {...}, hi: {...} }`.
2. **"Legal information, not legal advice."** Every content screen shows the disclaimer component. Never generate or invent legal content. Seed content is clearly marked SAMPLE until a lawyer reviews it.
3. **Bar Council compliance:** never rank, rate or promote lawyers ("top", "best", star ratings). Lawyer listings stay neutral (practice area, languages, state, availability).
4. **Zod schemas in `packages/shared` are the single source of truth** for request/response shapes. The API validates with them, and the clients use the generated types.
5. **Security:** see `.claude/rules/security.md`. In short:
   - Validate all input and reject `$`-prefixed keys (NoSQL injection).
   - Every non-public route needs an auth guard and a `@Roles()` check.
   - Write sensitive changes to `auditLogs`.
   - Files are served only through short-lived signed URLs.
   - No secrets in code. Use `.env`, and keep `.env.example` up to date.
6. **Privacy (DPDP Act):** collect the minimum personal data. In the MVP, template form data stays on the device (PDF generated with expo-print). Never log personal data (phone, name, case details).
7. **Offline-first reading:** citizens read content from downloaded content packs (R2/CDN → SQLite). Don't add API calls to the reading path.
8. **Low-end Android first:** keep bundle size small, avoid heavy dependencies, test on a 2–3 GB RAM phone, and keep fonts at 16px or larger.
9. Roles: `citizen`, `lawyer`, `reviewer`, `admin`, `super_admin`. There is **no judge role**; for compliance reasons the judge is not part of the software.

## Conventions
- Files are kebab-case. React components are PascalCase. NestJS follows the `feature/feature.module.ts | .controller.ts | .service.ts | .schema.ts` pattern.
- Money is stored in paise as integers. Dates are stored in UTC and shown in IST.
- Commits use Conventional Commits (`feat(mobile): …`, `fix(api): …`).
- Payments, bookings and other multi-document writes use MongoDB transactions plus idempotency keys.

## Definition of done
Typecheck, lint and tests pass. New strings are in i18n. New endpoints are documented in Swagger and covered by an RBAC test. The api-client is regenerated. Docs/ADR are updated if a decision changed. Mobile changes are checked on Android.

## Rules & skills
- `.claude/rules/`: `general`, `security` (always loaded); `mobile`, `api-nestjs`, `mongodb`, `i18n`, `aws-infra` (loaded for matching paths)
- `.claude/skills/`: `build-apk`, `add-content-type`, `add-api-module`
