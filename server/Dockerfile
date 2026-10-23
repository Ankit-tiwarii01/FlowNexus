FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
COPY client/package.json client/package.json
COPY server/package.json server/package.json
COPY shared/package.json shared/package.json
COPY worker/package.json worker/package.json
RUN npm ci
COPY tsconfig.base.json ./
COPY shared shared
COPY server server
RUN npm run build -w @flownexus/shared && npm run db:generate -w @flownexus/server && npm run build -w @flownexus/server
EXPOSE 4000
CMD ["sh", "-c", "npm run db:deploy -w @flownexus/server && npm run start -w @flownexus/server"]
