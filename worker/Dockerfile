FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
COPY client/package.json client/package.json
COPY server/package.json server/package.json
COPY shared/package.json shared/package.json
COPY worker/package.json worker/package.json
RUN npm ci
COPY tsconfig.base.json ./
COPY worker worker
RUN npm run build -w @flownexus/worker
CMD ["npm", "run", "start", "-w", "@flownexus/worker"]
