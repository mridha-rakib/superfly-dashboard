FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_BASE_URL=http://localhost:8080/api/v1
ARG VITE_NODE_ENV=production

ENV VITE_BASE_URL=${VITE_BASE_URL}
ENV VITE_NODE_ENV=${VITE_NODE_ENV}

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


FROM nginx:1.27-alpine AS runner

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
