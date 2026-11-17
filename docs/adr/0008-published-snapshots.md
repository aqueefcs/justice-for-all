# ADR 0008: Published snapshots keep approved content live while it is re-edited

**Status:** Accepted · 2026-11-17

## Context
Content follows draft → in review → published. To change a published guide, a lawyer moves it back to draft. Content packs were built only from items whose status is `published`. That caused two problems:
- The live version of a guide being corrected disappeared from the app at the next publish.
- Each translation's own status stayed `draft` after approval, so approved items could be skipped by the pack builder.

## Decision
- When a reviewer approves an item, the workflow stores a **`published` snapshot**: every content field, with each translation marked `published`. The reviewer approves exactly what they see, including the translations.
- The pack builder uses the snapshot for any item that has one, whatever its current status. Older documents without a snapshot (e.g. seeded starter content) still count while their status is `published`.
- **Archiving** removes the snapshot, so archived content leaves the app at the next publish.
- Approval also clears `isSample`. Once every starter item has been approved, the app's "awaiting lawyer review" banner disappears.
- Re-seeding (`pnpm --filter @jfa/db seed`) clears snapshots, so it fully resets to starter content.

## Consequences
- A citizen always sees the last approved version. Edits reach the app only after a reviewer approves them and someone presses **Publish to app**.
- Each item holds up to two copies of its content (working draft + snapshot), which is negligible at our scale.
