# Build stage
FROM node:24 AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Run stage
FROM builder as runner


WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# Cloud Run sets PORT at runtime; listen on all interfaces
CMD ["node", "dist/index.js"]
