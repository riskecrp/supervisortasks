# Vercel Deployment Configuration

This document explains how to deploy this Next.js monorepo to Vercel.

## Configuration Options

There are two ways to deploy this project to Vercel:

### Option 1: Set Root Directory in Vercel Dashboard (Recommended)

1. Go to your Vercel Project Settings
2. Navigate to **General** → **Build & Output Settings**
3. Set **Root Directory** to `frontend`
4. Set **Framework Preset** to **Next.js**
5. Leave **Output Directory** as default (or set to `.next`)
6. Save settings

With this configuration, Vercel will:
- Build from the `frontend` directory
- Automatically detect Next.js configuration
- Find the `.next` output directory

### Option 2: Use Monorepo Configuration (Current Setup)

The current setup uses `vercel.json` files to configure the build:

- **Root `/vercel.json`**: Specifies the build command and output directory relative to the repo root
- **Frontend `/frontend/vercel.json`**: Specifies the framework as Next.js

With this setup, Vercel will:
- Run `npm install && npm run build --workspace=frontend` from the repo root
- Look for the output in `frontend/.next`

## Troubleshooting

If you encounter the error "No Output Directory named '.next' found":

1. Ensure the **Framework Preset** in Vercel is set to **Next.js**
2. Verify the **Root Directory** is set correctly (either repo root with proper `vercel.json` or `frontend`)
3. Check that the build completes successfully and creates the `.next` directory
4. Ensure `outputDirectory` in `vercel.json` matches where the build output is created

## Build Process

The build process:
1. Installs dependencies using `npm install` (handles workspace dependencies)
2. Builds the frontend using `npm run build --workspace=frontend`
3. Outputs to `frontend/.next`

## Local Testing

To test the build locally:

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Verify output directory exists
ls -la frontend/.next
```
