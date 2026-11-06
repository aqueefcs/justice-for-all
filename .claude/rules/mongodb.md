---
paths:
  - "packages/db/**"
  - "apps/api/src/**/schemas/**"
  - "apps/api/src/**/*.service.ts"
---

# MongoDB (Atlas M0 → Flex/M10) with Mongoose

- Schemas live in `packages/db`. Use `timestamps: true`, `strict: 'throw'` on writes and lean reads (`.lean()`) for read paths.
- Collection names are camelCase plural (`actSections`, `lawyerProfiles`). References use ObjectId plus an index on the referencing field.
- Translatable content: `translations: { [locale]: { title, body, status: 'draft'|'in_review'|'published' } }`. Never create a separate document per language.
- Publishing fields on all content: `status`, `authorId`, `reviewerId`, `version`, `publishedAt`.
- Indexes:
  - Define every query pattern's compound index in the schema.
  - No unindexed queries on hot paths.
  - TTL indexes for sessions, OTPs and idempotency keys.
- Transactions: use `session.withTransaction()` for multi-document writes (booking + payment + ledger, publish + pack record).
- Idempotency: webhooks and payment endpoints store `idempotencyKeys` with a unique index.
- Safety:
  - Set `mongoose.set('sanitizeFilter', true)`.
  - Never pass raw `req.body`/`req.query` into a filter.
  - Reject `$`-prefixed keys.
- Pagination is cursor-based (`_id`/`createdAt` + limit). No `skip` on large collections.
- M0 limits: ~100 ops/s, 512 MB, 500 connections. Keep the reading path on the CDN packs.
- The API runs on AWS Lambda:
  - Create the Mongoose connection **once per execution environment** (module scope, reused across invocations), never per request.
  - Keep `maxPoolSize` at 2–5 and `serverSelectionTimeoutMS` short.
  - Lambda reserved concurrency × pool size must stay well under 500.
- Search: Atlas Search indexes (max 3 on M0) are defined in `packages/db/search-indexes/*.json`. Use the `lucene.hindi` analyzer for `hi` fields.
- Migrations: `migrate-mongo` scripts for index/shape changes; never change shapes silently.
- Money is integer paise. Dates are UTC.
