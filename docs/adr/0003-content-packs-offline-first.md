# ADR 0003: Published content packs and offline-first reading

**Status:** Accepted · 2026-11-06

## Context
Most traffic is citizens reading legal content, often on weak networks and cheap phones. The free database tier is small.

## Decision
- When content is published, the API builds versioned JSON **content packs** (per category per locale) and uploads them to a public Cloudflare R2 bucket behind the CDN.
- The app downloads the manifest and packs into on-device SQLite with FTS5 search, and syncs by version.
- Drafting templates are filled in and turned into PDFs on the device (`expo-print`).

## Consequences
- **Good:**
  - reading works fully offline
  - reads cost close to zero (R2 has no egress fees)
  - scales to many users with no database load
  - personal data from templates never leaves the phone
- **Bad:**
  - publishing is asynchronous, so changes appear after the next sync
  - the pack schema needs versioning and backward compatibility
