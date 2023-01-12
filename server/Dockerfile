FROM node:16-bullseye AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY server.ts tsconfig.json decs.d.ts ./
COPY app ./app
COPY prisma ./prisma
ARG API_URL
ENV API_URL $API_URL
ARG API_PATH
ENV API_PATH $API_PATH

RUN npm run build

FROM node:16-bullseye AS runner
WORKDIR /app

RUN apt-get update &&\
    apt-get install python3-pip -y &&\
    apt-get clean
COPY scripts/requirements.txt ./scripts/
RUN pip install -r scripts/requirements.txt

COPY scripts ./scripts
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

EXPOSE 5000
CMD [ "npm", "start" ]
