# ADR 0004: One mobile app with role-based modes; no judge role

**Status:** Accepted · 2026-11-06

## Context
Citizens and lawyers both need the mobile app. Partners need one APK that is easy to share. The founding team includes a judge.

## Decision
- A single Expo app with route groups gated by role.
- Roles: `citizen`, `lawyer`, `reviewer`, `admin`, `super_admin`.
- Reviewers and admins work mainly in the admin web.
- **No judge role in the software.** A sitting judge cannot take part in a commercial venture. A retired judge can serve on an offline Legal Advisory Board that approves content policy.

## Consequences
One codebase and one APK. Role checks are enforced on the server; client-side gating is only for UX.
