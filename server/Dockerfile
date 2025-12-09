# PrepPioneer Server Dockerfile
# Production-ready Node.js backend container

# Use official Node.js LTS Alpine image (lightweight)
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install system dependencies for Prisma (required for SQLite)
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./

# Install production dependencies only
# Use npm ci for clean, reproducible builds
RUN npm ci --only=production

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy application source code
COPY . .

# Create directory for SQLite database (if using file-based DB)
RUN mkdir -p /app/data

# Set environment to production
ENV NODE_ENV=production

# Expose port (default 5000, can be overridden)
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/status', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Run database migrations and start server
# Note: In production, run migrations separately before deploying
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
