FROM node:20-alpine AS builder

WORKDIR /app

ARG BUILD_NODE_OPTIONS=--max-old-space-size=512
ARG VITE_BASE_URL=/api/v1
ARG VITE_NODE_ENV=production

ENV NODE_OPTIONS=${BUILD_NODE_OPTIONS} \
    NPM_CONFIG_AUDIT=false \
    NPM_CONFIG_FUND=false \
    NPM_CONFIG_UPDATE_NOTIFIER=false \
    npm_config_loglevel=warn \
    CI=true \
    VITE_BASE_URL=${VITE_BASE_URL} \
    VITE_NODE_ENV=${VITE_NODE_ENV}

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


FROM nginx:1.27-alpine AS runner

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
