FROM node:16-bullseye AS builder
WORKDIR /app
ARG API_URL
ENV API_URL $API_URL
ARG API_PATH
ENV API_PATH $API_PATH

COPY package*.json ./
RUN npm install
COPY prisma ./prisma/

COPY . .
RUN npm run build

FROM node:16-bullseye AS runner
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

EXPOSE 5000
CMD [ "npm", "start" ]
