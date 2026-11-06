# Architecture Decision Records

Each significant decision gets a short record: context → decision → consequences. To change a decision, add a new ADR that supersedes the old one; don't edit the old one.

| # | Decision | Status |
|---|---|---|
| [0001](0001-nestjs-api.md) | NestJS (Fastify) custom API serving app, admin and web | Accepted |
| [0002](0002-mongodb-atlas.md) | MongoDB Atlas as primary database | Accepted |
| [0003](0003-content-packs-offline-first.md) | Published content packs on CDN, offline-first reading | Accepted |
| [0004](0004-single-mobile-app-role-based.md) | One Expo app with role-based modes; no judge role | Accepted |
| [0005](0005-free-tier-hosting.md) | Free-tier hosting: Cloudflare R2/Pages, Atlas, EAS | Partly superseded by 0006 |
| [0006](0006-aws-hosting.md) | AWS hosting: Lambda (Mumbai) + SQS + CDK, fronted by Cloudflare | Accepted |
