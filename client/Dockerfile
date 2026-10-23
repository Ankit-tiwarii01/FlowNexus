FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY client/package.json client/package.json
COPY server/package.json server/package.json
COPY shared/package.json shared/package.json
COPY worker/package.json worker/package.json
RUN npm ci
COPY tsconfig.base.json ./
COPY shared shared
COPY client client
RUN npm run build -w @flownexus/shared && npm run build -w @flownexus/client

FROM nginx:1.27-alpine
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/client/dist /usr/share/nginx/html
EXPOSE 80
