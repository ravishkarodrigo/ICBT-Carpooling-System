# ---- Base ----
FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# ---- Dependencies ----
FROM base AS deps
COPY package*.json ./
RUN npm ci --omit=dev

# ---- Runtime ----
FROM base AS runner
# Run as an unprivileged user (security hardening).
RUN addgroup -S app && adduser -S app -G app
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY src ./src
USER app
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1
CMD ["node", "src/server.js"]
