---
name: add-api-module
description: Scaffold a new NestJS feature module or endpoint in apps/api following project conventions (Zod DTOs from packages/shared, Swagger, RBAC guards, audit logging, Mongoose, tests, regenerated api-client). Use when adding API endpoints or backend features.
---

# Add a NestJS module / endpoint

1. **Schema first**: add Zod request/response schemas in `packages/shared/src/<feature>/`. They are the single source of truth.
2. **Generate the module** (if new):
   ```
   cd apps/api
   pnpm nest g module <feature> && pnpm nest g controller <feature> --no-spec && pnpm nest g service <feature>
   ```
   Layout: `src/<feature>/{<feature>.module.ts, .controller.ts, .service.ts, dto/, schemas/}`.
3. **DTOs**: `export class CreateXDto extends createZodDto(CreateXSchema) {}` (from `nestjs-zod`).
4. **Controller**
   - `@ApiTags('<feature>')` on the class, and `@ApiOkResponse` / `@ApiCreatedResponse` per route.
   - Auth: routes are private by default. Add `@Public()` only for genuinely public reads, and `@Roles(...)` for staff routes.
   - Keep it thin and delegate to the service.
5. **Service**
   - Inject models with `@InjectModel(X.name)`. Use `.lean()` reads and cursor pagination.
   - Ownership checks belong here (`if (doc.ownerId !== user.id) throw new ForbiddenException(...)`).
   - Multi-document writes go in `session.withTransaction()`.
   - Call `auditService.log({ actorId, action, entity, entityId })` for sensitive changes.
   - Throw exceptions with stable error codes.
6. **Register** the module in `app.module.ts`, and register any Mongoose models via `MongooseModule.forFeature`.
7. **Tests** in `apps/api/test/<feature>.e2e-spec.ts` with `mongodb-memory-server` (replica set):
   - happy path
   - validation error (400)
   - unauthenticated (401)
   - wrong role (403)
   - another user's resource (403/404)
   - `$`-operator injection payload rejected
8. **Client**: run `pnpm --filter api-client generate` and commit the generated client.
9. Check `/docs` (Swagger) shows the endpoints correctly.
