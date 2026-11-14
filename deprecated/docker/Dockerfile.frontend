# syntax=docker/dockerfile:1

ARG NODE_VERSION=22-alpine
FROM node:${NODE_VERSION} AS development

WORKDIR /app

# Copy dependency configs
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --no-audit --no-fund

# Expose dev port
EXPOSE 5173

# Run development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
