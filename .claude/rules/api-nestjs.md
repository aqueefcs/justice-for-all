---
paths:
  - "apps/api/**"
---

# API (NestJS 11 + Fastify)

- One module per domain: `auth`, `users`, `content`, `publishing`, `lawyers`, `documents`, `consultations`, `payments`, `audit`. Layout is `src/<feature>/<feature>.module.ts | .controller.ts | .service.ts | dto/ | schemas/`.
- Controllers stay thin; business logic lives in services. Services own the Mongoose models through `@InjectModel`.
- DTOs: create them with `createZodDto(schema)` from `nestjs-zod`, using schemas imported from `packages/shared`. Register the global `ZodValidationPipe`.
- Every route has Swagger decorators (`@ApiTags`, `@ApiOkResponse`…). After any API change, regenerate `packages/api-client`.
- Auth and authorisation:
  - Better Auth session guard globally; mark public routes explicitly with `@Public()`.
  - Use `@Roles('reviewer', 'admin')` together with `RolesGuard`.
  - Ownership checks (e.g. a user can only access their own documents) live in the service, not only in the guard.
- Audit: an `AuditInterceptor` or explicit `auditService.log()` call on every create/update/delete of users, lawyers, content status, documents and payments.
- Errors: throw Nest HTTP exceptions with stable error codes (`{ code: 'CONTENT_NOT_FOUND' }`). Never leak stack traces or DB errors to clients.
- Rate limiting: `@nestjs/throttler` globally, with stricter limits on auth/OTP routes.
- Config: `@nestjs/config` with a Zod-validated env schema. Fail fast on boot if config is missing.
- Versioning: URI prefix `/v1`.
- **Runtime is AWS Lambda** (via Lambda Web Adapter, see ADR 0006):
  - Keep the app stateless. No in-memory caches or sessions that must survive between requests, and no `setInterval`.
  - Don't do any work after the response is sent. Anything slow (pack building, emails, scans) is published to SQS through `JobsService` and handled by a worker.
  - Keep cold starts small: lazy-load heavy modules, avoid large dependencies, and bundle with esbuild.
  - Reject requests without a valid `X-Origin-Verify` header (global guard), except in local dev.
  - Keep a `GET /v1/health` endpoint for smoke tests. Its handler must be `@Public()` and must not touch the database.
- Tests:
  - Each service has unit tests.
  - Each controller has an e2e test with `mongodb-memory-server` (replica set), including a "wrong role → 403" case.
