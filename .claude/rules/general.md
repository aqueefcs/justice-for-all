# Justice For All — general rules

- This is a legal-help platform for low-income citizens in India. Read `CLAUDE.md` and `docs/plan.md` for context.
- Monorepo: pnpm + Turborepo, TypeScript strict. Apps: `apps/mobile` (Expo), `apps/admin` (Vite React), `apps/api` (NestJS + Fastify). Shared code lives in `packages/*`.
- Current scope is the MVP: the Knowledge Library and Guides (FIR/GD/drafting templates) are real. Consultations, Documents, Login and Lawyer mode are "Coming soon" placeholders.
- Zod schemas in `packages/shared` are the single source of truth for data shapes. Do not duplicate types.
- Every user-facing string goes through i18n. Never hard-code display text.
- Never invent legal content. Seed/sample content must be marked `SAMPLE` until a lawyer reviews it.
- Never rank or promote lawyers (Bar Council of India Rule 36).
- Never log personal data. Collect the minimum needed (DPDP Act 2023).
- Prefer small, focused changes. Don't add dependencies without a clear reason, and keep the mobile bundle lean.
- Conventional Commits. Kebab-case filenames.
