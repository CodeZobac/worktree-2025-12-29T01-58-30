# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Set memory limits for Node.js build (for low-memory VMs)
ENV NODE_OPTIONS="--max-old-space-size=512"

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies with reduced memory usage
RUN npm ci --maxsockets 1

# Copy application files
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the application with memory constraints
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install sqlite3 for backup verification and OpenSSL for Prisma
# Use openssl instead of openssl1.1-compat (Alpine 3.19+ has openssl 3.x which works with newer Prisma)
RUN apk add --no-cache sqlite openssl

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Create directories for SQLite database and uploads with proper permissions
RUN mkdir -p /app/prisma /app/public/uploads && \
    chown -R nextjs:nodejs /app

USER nextjs

# Expose application port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["node", "server.js"]
