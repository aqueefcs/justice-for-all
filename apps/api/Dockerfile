# Container image for the API — the escape hatch to ECS Fargate (ADR 0006).
# Build from the repo root:  docker build -f apps/api/Dockerfile -t jfa-api .
FROM node:24-alpine AS build
WORKDIR /repo
RUN corepack enable
COPY . .
RUN pnpm install --frozen-lockfile --filter @jfa/api... \
 && pnpm --filter @jfa/api... build \
 && node apps/api/scripts/bundle-lambda.mjs

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=8080
COPY --from=build /repo/apps/api/.lambda/api/main.js ./main.js
USER node
EXPOSE 8080
CMD ["node", "main.js"]
