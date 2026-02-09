# 1. Base Image
FROM node:18-alpine AS base

# Set working directory
WORKDIR /usr/src/app


# 2. Dependencies
FROM base AS deps
WORKDIR /usr/src/app

# Copy root package files
COPY package.json package-lock.json ./

# Copy backend package files
COPY packages/backend/package.json ./packages/backend/

# Install ALL dependencies (including dev) for the entire monorepo
# This is necessary for the build step
RUN npm install


# 3. Builder
FROM base AS builder
WORKDIR /usr/src/app

# Copy all dependencies from the previous stage
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=deps /usr/src/app/packages/backend/node_modules ./packages/backend/node_modules


# Copy the rest of the source code
COPY . .

# Build the backend TypeScript code into JavaScript
RUN npm run build --prefix packages/backend


# 4. Production Runner
FROM node:18-alpine AS runner
WORKDIR /usr/src/app

# Copy production dependencies from the 'deps' stage
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=deps /usr/src/app/packages/backend/node_modules ./packages/backend/node_modules

# Copy the built backend code from the 'builder' stage
COPY --from=builder /usr/src/app/packages/backend/dist ./packages/backend/dist

# Copy the backend's package.json
COPY packages/backend/package.json ./packages/backend/

# Expose port and start the server
EXPOSE 3001
CMD [ "npm", "start", "--prefix", "packages/backend" ]
