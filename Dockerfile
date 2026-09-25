FROM node:20-slim AS base
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --production && npm cache clean --force

COPY . .

RUN rm -f .env firebase.json

EXPOSE 3000

USER node

CMD ["node", "shipping.js"]
