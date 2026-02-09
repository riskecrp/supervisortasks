# 1. Base Image
FROM node:18-alpine AS base
WORKDIR /usr/src/app

# 2. Builder Stage: Install dependencies and build the app
FROM base AS builder
WORKDIR /usr/src/app

# Copy the package.json files for the entire monorepo
COPY package.json ./
COPY packages/backend/package.json ./packages/backend/

# Install ALL dependencies for the monorepo.
# Using `npm install` is more flexible and doesn't require a lockfile.
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the backend TypeScript code into JavaScript
RUN npm run build --prefix packages/backend

# 3. Production Runner Stage: Prepare the final image
FROM base AS runner
WORKDIR /usr/src/app

# Copy only the necessary files for running the backend
COPY package.json ./
COPY packages/backend/package.json ./packages/backend/

# Copy the installed dependencies from the builder stage
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/packages/backend/node_modules ./packages/backend/node_modules

# Copy the compiled code from the builder stage
COPY --from=builder /usr/src/app/packages/backend/dist ./packages/backend/dist

# Expose port and define the start command
EXPOSE 3001
CMD [ "npm", "start", "--prefix", "packages/backend" ]
