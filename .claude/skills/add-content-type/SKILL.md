---
name: add-content-type
description: Add a new kind of legal content (e.g. RTI guide type, FAQ, scheme explainer) end to end, covering the shared Zod schema, Mongoose model, API module, admin CMS form, content-pack builder, mobile screens and i18n. Use when asked to add or extend a content type.
---

# Add a content type end to end

Content flows: **Admin CMS → review → publish → content pack (R2) → mobile SQLite (offline)**. Touch every layer in this order.

1. **Shared schema** `packages/shared/src/content/<type>.ts`
   - A Zod schema for one locale's fields, plus `translations: z.record(LocaleSchema, <TypeLocaleSchema>)`.
   - Include the publishing fields from `PublishableBase` (status, authorId, reviewerId, version, publishedAt).
   - Export the inferred types.
2. **DB model** `packages/db/src/models/<type>.model.ts`
   - Mongoose schema mirroring the Zod schema, with indexes for each query (`status`, `categoryId`, `slug` unique).
   - Add an Atlas Search mapping if it should be searchable on the server (remember M0 allows only 3 search indexes, so prefer extending the existing `content` index).
   - Add a `migrate-mongo` migration for the indexes.
3. **API** (follow the `add-api-module` skill)
   - `apps/api/src/content/<type>/`: CRUD for staff (`@Roles('lawyer','reviewer','admin')`).
   - Status transitions: draft → in_review (author) → published (reviewer only).
   - Public read only through packs.
4. **Pack builder** `apps/api/src/publishing/builders/<type>.builder.ts`
   - Serialise the published items per locale into the pack JSON and register the builder.
   - Bump the pack schema version if the shape changes, and keep the mobile reader backward compatible.
5. **Admin** `apps/admin/src/routes/content/<type>/`
   - List, edit form (react-hook-form + zodResolver) and a TipTap editor for rich text.
   - Locale tabs with per-locale status; a "Submit for review" button and a reviewer "Approve & publish" button.
6. **Mobile**
   - Add the SQLite table + FTS5 entry in the pack importer.
   - Add screens under `apps/mobile/app/`.
   - Render `<LegalDisclaimer />` on the screens.
7. **i18n**: add UI keys to `packages/i18n/locales/en/*.json` with `[TODO]` placeholders in the other locales.
8. **Seed**: add 1–2 items to `packages/db/seed/`, marked `SAMPLE`.
9. **Tests**:
   - Zod schema tests.
   - API e2e: an author can't publish, a reviewer can, a citizen gets 403.
   - Pack builder snapshot test.
   - A Maestro flow for the mobile screen if it's a primary journey.
10. Regenerate the api-client: `pnpm --filter api-client generate`.
