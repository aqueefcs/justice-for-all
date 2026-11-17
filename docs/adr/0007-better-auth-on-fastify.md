# ADR 0007: Better Auth mounted directly on Fastify, with mandatory two-step verification for staff

**Status:** Accepted · 2026-11-17

## Context
Phase 1 needs real staff login (lawyers, reviewers, admins) for the content editor. The plan named `@thallesp/nestjs-better-auth` as the NestJS integration, but that package expects Express, and our API uses Fastify (ADR 0001). Better Auth is also ESM-only, while the API compiles to CommonJS.

## Decision
- **Mount Better Auth's web-standard handler directly** on a Fastify catch-all route, `/v1/auth/*`, following Better Auth's Fastify integration pattern (`apps/api/src/auth/auth-routes.ts`). Two details matter here:
  - Set-Cookie headers are copied one by one, because `Headers.forEach` would merge them.
  - The Cloudflare origin lock (`isOriginVerified`) is applied to these routes too, since they bypass the Nest guards.
- **Load Better Auth with `import()`** inside an async Nest provider (`AUTH_INSTANCE`). This works the same in Node, Vitest and the esbuild Lambda bundle.
- **Use the MongoDB adapter** on the existing Mongoose connection (with transactions on our replica set). Better Auth's `user` collection is the source of truth for identity and **role** (admin plugin). Custom roles (`citizen`, `lawyer`, `reviewer`, `admin`, `super_admin`) are declared through access control. Our own `users` collection keeps only app-profile fields.
- **No public sign-up.** The first `super_admin` comes from `pnpm --filter @jfa/api create-admin`; everyone else is added from the admin console's Team page.
- **Two-step verification (TOTP) is mandatory for every non-citizen role:**
  - The API guard returns `TWO_FACTOR_REQUIRED` until it is enabled.
  - A Better Auth `before` hook applies the same rule to its own `/admin/*` endpoints.
- **Privilege escalation guard:** only a `super_admin` may grant `admin` or `super_admin`. This is enforced on the server.
- **Test-only impersonation:** the `x-dev-role` header now works **only** when `STAGE=test` (automated tests). Local development uses real sign-in.

## Consequences
- The auth bridge is a small amount of code we own and must keep in step with Better Auth upgrades. The e2e tests in `apps/api/test/auth.e2e.spec.ts` guard it.
- `BETTER_AUTH_SECRET` (32+ random characters) is required in every stage except tests. On AWS it lives in SSM under `/jfa/<stage>/BETTER_AUTH_SECRET`.
- The admin console and the API must share a site (`admin.<domain>` and `api.<domain>`) so `SameSite=Lax` cookies work. Locally, `localhost:5173` and `localhost:3000` count as the same site.
