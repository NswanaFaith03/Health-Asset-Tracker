# Vercel Deployment Guide for Health Asset Tracker

## Overview
This guide documents the deployment process for the Health Asset Tracker mockup-sandbox project to Vercel, addressing specific challenges with the monorepo/workspace setup.

## Current Setup Challenges

### Monorepo/Workspace Issues
- Project uses pnpm workspace with catalog dependencies
- Vercel struggles with workspace dependency resolution
- `minimumReleaseAge` security policies in `pnpm-workspace.yaml` cause build failures
- Workspace dependencies like `@workspace/api-client-react` don't resolve properly on Vercel

### Solution: Prebuilt Deployment
We use a **prebuilt deployment approach** to bypass Vercel's dependency installation issues:
1. Build the project locally using the full workspace setup
2. Deploy the prebuilt `.vercel/output` directory directly to Vercel
3. This skips dependency installation on Vercel servers

## Step-by-Step Deployment Process

### 1. Make Your Changes
```bash
# Make your code changes
# Test locally with: npm run dev
```

### 2. Build Locally
```bash
cd artifacts/mockup-sandbox

# Clean previous builds
rm -rf dist .vercel/output

# Build the project
npm run build
```

### 3. Create Vercel Prebuilt Output
```bash
# Build with Vercel CLI for production
vercel build --prod
```

This will:
- Install dependencies using local pnpm workspace
- Run the build command from package.json
- Create `.vercel/output` directory with production-ready files
- Use the existing `dist/` directory as the build output

### 4. Deploy to Vercel
```bash
# Deploy the prebuilt output
vercel --prod --prebuilt
```

This will:
- Upload the prebuilt `.vercel/output` directory
- Skip dependency installation on Vercel
- Deploy directly to production
- Provide the deployment URL

### 5. Verify Deployment
```bash
# Check deployment logs
vercel inspect <deployment-url> --logs

# Test the deployment URL
curl <deployment-url>
```

## Current Vercel Configuration

### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/assets/(.*)",
      "dest": "/dist/assets/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/index.html"
    }
  ]
}
```

### Why This Configuration Works
- Uses `@vercel/static-build` for better compatibility
- Routes handle both static assets and SPA routing
- Supports the Vite build output structure
- Works with prebuilt deployment approach

## Git Workflow

### Commit and Push Changes
```bash
# Stage changes
git add src/ vercel.json

# Commit with proper message
git commit -m "Describe your changes"

# Push to GitHub
git push origin replit-agent
```

### After Git Push
Since we use prebuilt deployment, we still need to manually deploy:
```bash
# Rebuild and deploy
vercel build --prod
vercel --prod --prebuilt
```

## Common Issues and Solutions

### Issue: Build fails with dependency errors
**Solution**: Use prebuilt deployment approach
```bash
vercel build --prod
vercel --prod --prebuilt
```

### Issue: Deployment shows old UI
**Solution**: Ensure you're building the correct branch/commit
```bash
# Check current git status
git status
git log --oneline -5

# Rebuild from clean state
rm -rf dist .vercel/output
vercel build --prod
vercel --prod --prebuilt
```

### Issue: Vercel deployment succeeds but shows wrong content
**Solution**: Verify the build output
```bash
# Check what's in the build output
ls -la dist/
cat dist/index.html

# Ensure the right files are being built
```

### Issue: Workspace dependencies not found
**Solution**: Always build locally first
```bash
# Local build uses workspace correctly
npm run build

# Then use Vercel prebuilt
vercel build --prod
```

## Project Structure

```
artifacts/mockup-sandbox/
├── src/
│   ├── components/
│   │   ├── Sidebar.tsx          # New sidebar navigation
│   │   ├── Header.tsx           # Updated header with toggle
│   │   └── StudentLayout.tsx    # Layout with sidebar integration
│   ├── pages/
│   │   └── student/
│   │       ├── NewConsultation.tsx  # New consultation form
│   │       └── ... (other student pages)
│   ├── routes/
│   │   └── index.tsx            # Router configuration
│   ├── main.tsx                 # App entry point
│   └── App.tsx                  # Main app component
├── dist/                        # Vite build output (gitignored)
├── .vercel/output/              # Vercel prebuilt output (gitignored)
├── vercel.json                  # Vercel configuration
└── package.json                 # Project dependencies
```

## Deployment URLs

### Current Production URLs
- Primary: https://mockup-sandbox-zeta-lime.vercel.app
- Direct: https://mockup-sandbox-n1g5bw826-dee123.vercel.app

### Vercel Dashboard
- Project: mockup-sandbox
- Team: dee123
- Branch: replit-agent

## Automation Opportunities

### Future Improvements
1. **GitHub Actions**: Set up CI/CD to build and deploy automatically
2. **Environment Variables**: Configure for different environments
3. **Preview Deployments**: Automatic preview deployments for PRs
4. **Build Caching**: Optimize build times with caching

### Example GitHub Action (Future)
```yaml
name: Deploy to Vercel
on:
  push:
    branches: [replit-agent]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: cd artifacts/mockup-sandbox && pnpm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## Troubleshooting Checklist

Before deploying, ensure:
- [ ] Local development server works (`npm run dev`)
- [ ] Local build succeeds (`npm run build`)
- [ ] All changes are committed to git
- [ ] Vercel CLI is authenticated (`vercel whoami`)
- [ ] Using correct project/team in Vercel
- [ ] Clean build directory (`rm -rf dist .vercel/output`)

## Contact and Support

- Vercel Documentation: https://vercel.com/docs
- Vercel CLI Issues: https://github.com/vercel/vercel/issues
- Project Repository: https://github.com/NswanaFaith03/Health-Asset-Tracker

## Revision History

- **2026-09-13**: Initial documentation of prebuilt deployment approach
- **2026-09-13**: Added troubleshooting guide and common issues
- **2026-09-13**: Documented workspace setup challenges and solutions