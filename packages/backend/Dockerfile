# 1. Builder Stage
# This stage installs dependencies and builds the TypeScript code
FROM node:18-alpine AS builder
WORKDIR /usr/src/app

# Copy package manifests
COPY package.json ./
COPY packages/backend/package.json ./packages/backend/

# Install all dependencies. NPM will hoist them to the root node_modules.
RUN npm install

# Copy the entire source code
COPY . .

# Build the backend TypeScript into JavaScript
RUN npm run build --prefix packages/backend


# 2. Production Stage
# This stage creates the final, lean image for running the application
FROM node:18-alpine AS runner
WORKDIR /usr/src/app

# Copy only the necessary package manifests for the runner
COPY package.json ./
COPY packages/backend/package.json ./packages/backend/

# Copy the pre-installed node_modules from the builder stage
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Copy the compiled JavaScript code from the builder stage
COPY --from=builder /usr/src/app/packages/backend/dist ./packages/backend/dist

# Expose port and start the server
EXPOSE 3001
CMD [ "npm", "start", "--prefix", "packages/backend" ]
