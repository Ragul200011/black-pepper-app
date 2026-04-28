# Backend Dockerfile - Node server only (models not included)
FROM node:18-alpine
WORKDIR /app

# Install system deps required by some node packages
RUN apk add --no-cache python3 make g++ bash

COPY package*.json ./
RUN npm ci --only=production || npm install --only=production

COPY . .
EXPOSE 5001
ENV NODE_ENV=production
CMD ["node", "server.js"]
