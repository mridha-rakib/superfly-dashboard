# Use Node.js image for building
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

COPY . .

# Build React app
RUN npm run build

# Serve using a lightweight web server
FROM nginx:alpine

# Copy build to Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 3000
EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
