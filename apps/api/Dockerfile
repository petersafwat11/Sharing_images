# syntax=docker/dockerfile:1
# Multi-stage Dockerfile used for both `api` and `worker` containers.
# The worker just uses a different entrypoint command.

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
RUN corepack enable
WORKDIR /repo

# ---- deps ----
FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* .npmrc turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
COPY packages/tsconfig/package.json ./packages/tsconfig/
RUN pnpm fetch
RUN pnpm install --frozen-lockfile=false --prefer-offline

# ---- build ----
FROM deps AS build
COPY . .
RUN pnpm --filter @picflow/api prisma:generate
RUN pnpm --filter @picflow/api build

# ---- runtime ----
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/packages ./packages
COPY --from=build /repo/apps/api/dist ./dist
COPY --from=build /repo/apps/api/prisma ./prisma
COPY --from=build /repo/apps/api/package.json ./package.json

EXPOSE 3001
CMD ["node", "dist/main.js"]
