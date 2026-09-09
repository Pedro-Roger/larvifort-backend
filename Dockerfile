FROM node:22-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY tsconfig*.json nest-cli.json prisma.config.ts knexfile.js ./
COPY prisma ./prisma
COPY knex ./knex
COPY src ./src

ENV DATABASE_URL=postgresql://lavifort:lavifort@localhost:5432/lavifort?schema=public

RUN npx prisma generate \
  && npm run build \
  && mkdir -p dist/generated \
  && cp -a generated/prisma dist/generated/

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
