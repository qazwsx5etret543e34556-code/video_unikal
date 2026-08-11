FROM node:22-alpine AS base

# Install dependencies for argon2
RUN apk add --no-cache python3 make g++

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable && pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable && pnpm build

FROM base AS runner
WORKDIR /app

# Install runtime dependencies for argon2
RUN apk add --no-cache python3 make g++

ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.pnpm/@prisma+client*/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/node_modules/.pnpm/prisma*/node_modules/prisma ./node_modules/prisma

RUN npx prisma generate

EXPOSE 3001

CMD ["node", "dist/index.js"]
