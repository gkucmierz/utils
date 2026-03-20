# Stage 1: Build documentation
FROM node:lts-alpine as build-stage

# Set working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies needed for JSDoc
RUN npm install

# Copy source code and build documentation
COPY . .
RUN npm run docs:build

# Stage 2: Serve the application with Nginx
FROM nginx:stable-alpine as production-stage

# Copy the built JSDoc artifacts from the build stage
COPY --from=build-stage /app/docs /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Healthcheck to ensure Nginx is running and serving
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
