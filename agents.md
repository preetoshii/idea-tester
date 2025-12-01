# Idea Voting Canvas - Agent Documentation

## Quick Start

### Running Locally

**Use `vercel dev` (NOT `npm run dev`):**

```bash
cd frontend
vercel dev
```

**Why?** The API routes (`/api/save-vote` and `/api/get-votes`) are Vercel serverless functions that require the Vercel CLI runtime. Regular `npm run dev` will give 404 errors on API calls.

### Environment Setup

1. Create `frontend/.env.local`:
   ```
   GITHUB_TOKEN=your_token_here
   ```

2. Ensure Vercel CLI is installed:
   ```bash
   npm i -g vercel
   ```

## Project Overview

A voting canvas application where users drag stars onto idea cards to vote. Results are saved to GitHub via serverless functions.

### Architecture

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Vercel Serverless Functions (in `/api/`)
- **Storage**: GitHub API (reads/writes `votes.json`)
- **Deployment**: Vercel (auto-deploys on push to `master`)

### Key Files

- `frontend/src/App.jsx` - Main application logic
- `frontend/api/save-vote.js` - Saves votes to GitHub
- `frontend/api/get-votes.js` - Fetches votes from GitHub
- `frontend/src/data/ideas.json` - Idea data source

### Development Workflow

1. **Local Testing**: Use `vercel dev` to test with API routes
2. **Deploy**: Push to `master` branch → Vercel auto-deploys
3. **Environment**: Set `GITHUB_TOKEN` in Vercel dashboard

### Common Issues

**404 on `/api/*` routes:**
- Solution: Use `vercel dev` instead of `npm run dev`

**GitHub API errors:**
- Check `GITHUB_TOKEN` is set in `.env.local` (local) and Vercel dashboard (production)
- Ensure token has `repo` scope

**Build errors:**
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`

