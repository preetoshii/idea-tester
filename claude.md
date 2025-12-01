# Idea Voting Canvas - Project Overview

## Concept

This is a **Voting Canvas** application for collecting and ranking activity ideas across three journey phases: Planning, Action, and Integration. The app allows users to vote on ideas by dragging stars onto idea cards, with results saved to a GitHub repository.

### Key Features

- **Three-Phase Voting System**: Users vote on ideas for Planning, Action, and Integration phases
- **Drag-and-Drop Voting**: Users have 5 stars per phase to distribute by dragging them onto idea cards (max 2 stars per card)
- **Zoomable Canvas**: Ideas are displayed on a FigJam-like canvas that can be panned and zoomed
- **GitHub Integration**: Voting results are automatically saved to `votes.json` in the GitHub repo
- **Rankings View**: After voting, users can view aggregated rankings of all ideas by total stars
- **Sound Effects & Animations**: Interactive feedback with audio cues and smooth transitions

### Tech Stack

- **Frontend**: React + Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Canvas**: react-zoom-pan-pinch
- **Backend**: Vercel Serverless Functions
- **Storage**: GitHub API (saves to `votes.json`)

## Local Development

### Prerequisites

- Node.js installed
- Vercel CLI installed (`npm i -g vercel`)
- GitHub Personal Access Token (for API routes)

### Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Create `.env.local` file:**
   ```bash
   echo "GITHUB_TOKEN=your_github_token_here" > .env.local
   ```

3. **Run the development server:**
   ```bash
   vercel dev
   ```
   
   **Important**: Use `vercel dev` (not `npm run dev`) because the API routes (`/api/save-vote` and `/api/get-votes`) are Vercel serverless functions that only work with the Vercel CLI.

4. **Access the app:**
   - Open http://localhost:3000 (or the port shown by Vercel)

### Why `vercel dev` instead of `npm run dev`?

- `npm run dev` only runs the Vite dev server, which doesn't handle serverless functions
- `vercel dev` runs both Vite and the Vercel serverless function runtime
- The API routes (`/api/*`) require the Vercel runtime to work

### Production Deployment

The app is deployed to Vercel and automatically builds on push to the `master` branch.

**Environment Variables (Vercel Dashboard):**
- `GITHUB_TOKEN`: GitHub Personal Access Token with `repo` scope
- `GITHUB_REPO`: (Optional) Repository in format `owner/repo`, defaults to `preetoshii/idea-tester`

## Project Structure

```
frontend/
├── api/                    # Vercel serverless functions
│   ├── save-vote.js       # Saves votes to GitHub
│   └── get-votes.js        # Fetches votes from GitHub
├── public/                 # Static assets
│   ├── *.wav              # Sound effects
│   ├── *.mp4              # Video assets
│   └── og-image.png       # Social sharing image
├── src/
│   ├── App.jsx            # Main application component
│   └── data/
│       └── ideas.json     # Idea data (parsed from ideas.md)
└── .env.local             # Local environment variables (gitignored)
```

## Data Flow

1. **Voting**: User drags stars onto cards → votes stored in React state
2. **Submission**: On completion, votes sent to `/api/save-vote`
3. **Storage**: Serverless function appends vote to `votes.json` in GitHub repo
4. **Rankings**: `/api/get-votes` fetches all votes, aggregates by idea, and returns ranked list

## Key Components

- **App.jsx**: Main component managing all state and views (intro, canvas, completion)
- **DetailModal**: Shows full idea details when card is clicked
- **DraggableStar**: Star component with drag-and-drop functionality
- **CanvasCard**: Idea card displayed on the canvas
- **RankingOverlay**: Full-screen overlay showing aggregated vote rankings
- **TransitionOverlay**: Animated transitions between phases

