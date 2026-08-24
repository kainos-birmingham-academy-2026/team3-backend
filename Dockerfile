# syntax=docker/dockerfile:1
FROM node:24-bookworm-slim AS build

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates openssl \
	&& update-ca-certificates \
	&& rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN --mount=type=secret,id=corporate_ca,dst=/tmp/corporate-ca.crt \
	if [ -f /tmp/corporate-ca.crt ]; then export NODE_EXTRA_CA_CERTS=/tmp/corporate-ca.crt; fi; \
	npx prisma generate && npm run build

FROM node:24-bookworm-slim AS runtime

ENV NODE_ENV=production

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates openssl \
	&& update-ca-certificates \
	&& rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npm ci --omit=dev && npm install --omit=dev --no-save tsx@4.23.5

COPY --chown=node:node --from=build /app/dist ./dist
COPY --chown=node:node --from=build /app/src/generated/prisma/*.node ./dist/generated/prisma/

EXPOSE 4000

USER node

CMD ["./node_modules/.bin/tsx", "dist/index.js"]