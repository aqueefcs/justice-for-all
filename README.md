# Justice For All

A digital legal-help platform for ordinary people in India. It offers plain-language legal knowledge, step-by-step FIR/GD and drafting guides, low-cost consultations with verified lawyers, and secure document exchange. The app supports multiple languages.

> Legal information, not legal advice.

## Docs
- [Getting started (run it locally, build an APK, deploy to AWS)](docs/getting-started.md)
- [Integrations: every tool, its placeholder and how to switch it on](docs/integrations.md)
- [Plan: product, architecture, stack, roadmap](docs/plan.md)
- [Architecture Decision Records](docs/adr/README.md)
- [Compliance checklist](docs/compliance.md)
- [CLAUDE.md](CLAUDE.md): guidance for AI coding agents. The detailed rules are in `.claude/rules/` and the workflows in `.claude/skills/`.

## Stack
- Expo (React Native) mobile app
- NestJS + Fastify API
- MongoDB Atlas
- Cloudflare R2/Pages
- AWS Lambda + SQS in Mumbai (ap-south-1), set up with AWS CDK
- pnpm + Turborepo monorepo

## Status
Phase 0 is done: the monorepo, API, mobile app, admin console, AWS infrastructure and CI are in place, and every integration has a placeholder. Phase 1 (MVP content) is next. See the roadmap in [docs/plan.md](docs/plan.md).

```bash
pnpm install && pnpm build && pnpm db:up
pnpm --filter @jfa/api dev      # API + Swagger at http://localhost:3000/docs
pnpm --filter @jfa/mobile start # mobile app (Expo)
```
