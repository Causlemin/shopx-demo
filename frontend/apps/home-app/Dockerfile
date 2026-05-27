FROM node:20-alpine AS base
WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable && corepack prepare pnpm@10.27.0 --activate

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/home-app/package.json ./apps/home-app/package.json
COPY packages/ui/package.json ./packages/ui/package.json
COPY packages/types/package.json ./packages/types/package.json
COPY packages/event-bus/package.json ./packages/event-bus/package.json
COPY packages/api-client/package.json ./packages/api-client/package.json

RUN pnpm install --frozen-lockfile

FROM base AS builder

ARG NEXT_PUBLIC_API_GATEWAY_URL
ARG CART_ZONE_URL

ENV NEXT_PUBLIC_API_GATEWAY_URL=$NEXT_PUBLIC_API_GATEWAY_URL
ENV CART_ZONE_URL=$CART_ZONE_URL

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/home-app/node_modules ./apps/home-app/node_modules
COPY --from=deps /app/packages ./packages
COPY . .

RUN pnpm --filter home-app build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

ARG NEXT_PUBLIC_API_GATEWAY_URL
ARG CART_ZONE_URL

ENV NEXT_PUBLIC_API_GATEWAY_URL=$NEXT_PUBLIC_API_GATEWAY_URL
ENV CART_ZONE_URL=$CART_ZONE_URL

COPY --from=builder /app/apps/home-app/.next ./apps/home-app/.next
COPY --from=builder /app/apps/home-app/public ./apps/home-app/public
COPY --from=builder /app/apps/home-app/package.json ./apps/home-app/package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/home-app/node_modules ./apps/home-app/node_modules
COPY --from=builder /app/packages ./packages

WORKDIR /app/apps/home-app

EXPOSE 3000

CMD ["pnpm", "start"]