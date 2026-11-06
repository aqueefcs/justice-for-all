# ADR 0001: NestJS (Fastify) custom API

**Status:** Accepted · 2026-11-06

## Context
The mobile app, the admin web and a future public website must share one backend. Payments, lawyer verification, role checks and audit logging need to live in one place. The team writes TypeScript.

## Decision
Build `apps/api` with NestJS 11 on the Fastify adapter:
- feature modules
- Guards for RBAC
- Interceptors for audit logging
- `nestjs-zod` DTOs built from shared Zod schemas
- `@nestjs/swagger` for OpenAPI, from which `packages/api-client` is generated

We are not using a backend-as-a-service (Supabase/Firebase) for business logic.

## Consequences
- **Good:**
  - a structure a growing team can work in
  - clear module boundaries
  - first-class testing
  - OpenAPI documentation for any client
- **Bad:**
  - more boilerplate than a minimal framework
  - ~1 s cold start on serverless hosting (AWS Lambda, see ADR 0006), which is acceptable because content reads go through the CDN
