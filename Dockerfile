FROM node:24-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /home/node/app

COPY --chown=node:node package*.json ./
RUN npm ci --omit=dev

COPY --chown=node:node prisma ./prisma
RUN npx prisma generate

COPY --chown=node:node . .

USER node

EXPOSE 7860

CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]
