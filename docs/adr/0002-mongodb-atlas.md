# ADR 0002: MongoDB Atlas as the primary database

**Status:** Accepted · 2026-11-06

## Context
We need a free tier until we reach real scale, India-region hosting and multilingual search. The data is a mix of document-shaped content (acts → sections with translations per locale) and relational transactional data (bookings, payments).

## Options compared
| Factor | MongoDB Atlas M0 | Supabase Free (Postgres) |
|---|---|---|
| Storage | 512 MB | 500 MB |
| Idle pause | None at 7 days (~60 days with no connections) | Pauses after 7 days |
| Mumbai region | Yes | Yes |
| Full-text search | Atlas Search (Lucene, Hindi analyzers, fuzzy matching) | Postgres FTS, weak for Indic languages |
| Vector search | Included | pgvector |
| Content model fit | Natural (embedded translations) | Many joined tables |
| Payments fit | Transactions + discipline | Native foreign keys/ACID |
| Limits | ~100 ops/s, 500 connections | Small instance |
| First paid step | Flex (capped ~$30/mo) → M10 | Pro $25/mo |

## Decision
MongoDB Atlas (M0, AWS ap-south-1) with Mongoose.

## Consequences
- We have to enforce integrity ourselves:
  - ObjectId references with indexes
  - multi-document transactions for booking/payment
  - `$jsonSchema` validation on critical collections
  - idempotency keys
  - `sanitizeFilter` against NoSQL injection
- M0 has no backups, so a weekly `mongodump` → R2 GitHub Action is required.
- Reads must stay off the database (see ADR 0003) to fit within ~100 ops/s.
