---
name: add-content-type
description: Add a new kind of legal content (e.g. FAQ, scheme explainer, court-fee table) end to end, covering the shared Zod schema, Mongoose model, content-type registry, pack builder, admin editor form, mobile screens and i18n. Use when asked to add or extend a content type.
---

# Add a content type end to end

Content flows: **admin editor → submit → a different reviewer approves (published snapshot, ADR 0008) → Publish to app → content pack → phone (offline)**. The review workflow is generic, so most of the work is the schema, the editor form and the mobile screen.

1. **Shared schema** in `packages/shared/src/content.ts`
   - `XSchema = z.object({ slug: SlugSchema, ..., translations: translationsOf(z.object({ title, ..., ...localeStatus })) })`. English is required; other locales are optional.
   - Add the pack shape in `content-pack.ts` (flattened, single locale) and add it to `ContentPackSchema`. Bump `PACK_SCHEMA_VERSION` only for breaking changes, and keep the app reader backward compatible.
2. **DB model** in `packages/db/src/models/content.ts`
   - Mongoose schema with `translationsField({...})` and `...publishingFields` (this includes `status`, `version`, `authorId`, `reviewerId`, `isSample` and the `published` snapshot).
   - Add an index for every query (`status`, `slug` unique, and anything you filter by).
   - Register the model in `MODEL_DEFINITIONS` (`packages/db/src/index.ts`).
3. **API: register, don't hand-write controllers**
   - Add `{ key, model, entity, label, schema, sanitize? }` to `CONTENT_TYPES` in `apps/api/src/content/content-types.ts`. Every route then exists automatically:
     - list, get, create, update (drafts only)
     - `/:id/status`, with the four-eyes rule
     - review queue, summary, audit log
   - Rich-text fields must be sanitised. Add a sanitiser in `apps/api/src/content/sanitize.ts`.
   - Add the type to the review-queue/summary controller in `content.module.ts` (explicit `@InjectModel`), and add `key` to `ContentKindSchema` in `content.dto.ts`.
4. **Pack builder** in `apps/api/src/publishing/pack-builder.ts`: map live items (snapshot or published) through `pickTranslation` into the pack shape. Then add the model to `PublishingService.publishAll`.
5. **Admin editor** in `apps/admin`
   - `src/lib/content-kinds.ts`: add to `KINDS`, `KIND_SCHEMAS`, `emptyDoc`, `emptyTranslation`.
   - `src/components/content-forms.tsx`: write an `XForm` using the field helpers (`TextField`, `RichTextField`, `LocaleTabs`, …) and register it in `FORMS`.
   - The list, editor shell, status actions and review queue pick the new type up automatically.
6. **Mobile**: read it from the pack (`useContent()`), add screens under `apps/mobile/app/`, and render `<LegalDisclaimer />`.
7. **i18n**: add the admin labels to `packages/i18n/locales/en/admin.json` and the mobile UI strings to `app.json`. Regenerate the `[TODO]` Hindi placeholders and run `node packages/i18n/scripts/check-keys.mjs`.
8. **Seed**: add starter items to `packages/shared/src/samples.ts` (`isSample` stays true until a lawyer approves them) and to `packages/db/seed/seed.ts`.
9. **Tests**
   - Add the type to `SAMPLES` in `apps/api/test/content.e2e.spec.ts`. The parametrised workflow test then covers create → submit → four-eyes → approve.
   - Write a pack-builder unit test for the new mapping.
10. **Regenerate the client**: `pnpm --filter @jfa/api build && pnpm --filter @jfa/api openapi && pnpm --filter @jfa/api-client generate`.
