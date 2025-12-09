# PrepPioneer Client Dockerfile
# Two-stage build for optimized React production deployment

# ====================================
# Stage 1: Build the React application
# ====================================
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the React app for production
# This creates optimized static files in /app/dist
RUN npm run build

# ====================================
# Stage 2: Serve with Nginx
# ====================================
FROM nginx:alpine

# Copy custom nginx configuration for React Router support
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Add labels for documentation
LABEL maintainer="PrepPioneer Team"
LABEL description="PrepPioneer React Frontend"

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx (foreground mode)
CMD ["nginx", "-g", "daemon off;"]
