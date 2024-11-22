FROM node:20-alpine AS builder

WORKDIR /home/node

COPY . .

RUN npm ci

RUN npm run build

RUN npm prune --production

FROM node:20-alpine As production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /home/node

COPY --from=builder /home/node/package.json ./package.json
COPY --from=builder /home/node/package-lock.json ./package-lock.json
COPY --from=builder /home/node/dist ./dist
COPY --from=builder /home/node/node_modules ./node_modules