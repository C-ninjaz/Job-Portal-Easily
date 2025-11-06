# Production image
FROM node:20-alpine AS base

WORKDIR /app

# Environment
ENV NODE_ENV=production
ENV PORT=3201

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source
COPY . .

# Run as non-root for better security
USER node

# Basic liveness probe hitting GET /
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD node -e "http=require('http').get('http://localhost:'+process.env.PORT, r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

# Document the port
EXPOSE 3201

# Start the server
CMD ["node", "src/server.js"]
