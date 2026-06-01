FROM node:24-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*

RUN useradd -m -u 1000 user

WORKDIR /home/user/app

COPY --chown=user:user package*.json ./
RUN npm ci --omit=dev

COPY --chown=user:user prisma ./prisma
RUN npx prisma generate

COPY --chown=user:user . .

USER user

EXPOSE 7860

CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]
