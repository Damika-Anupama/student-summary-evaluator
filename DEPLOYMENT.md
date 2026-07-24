# Deploying the Frontend Demo to Vercel

This branch (`frontend-demo`) is a **root-level Next.js app** that runs **without any
backend** — all data is served from in-app fixtures (`src/demo/demo-data.js`) through the
Next.js API routes. No Django server, database, or API keys are required.

## Vercel project setup

1. Import the GitHub repo into Vercel (or open the existing project).
2. **Root Directory = repo root** (the default — the app now lives at the top level, so no
   subdirectory setting is needed).
3. **Settings → Git → Production Branch → `frontend-demo`** so this branch is what the
   production URL serves.
4. Framework preset: **Next.js** (auto-detected). No environment variables are needed.

Build settings are pinned in `vercel.json` at the repo root:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "npm install --legacy-peer-deps"
}
```

(`--legacy-peer-deps` is required because the app uses React 19 with MUI 5 / x-date-pickers 6.)

## Redeploy

**Pushing to `frontend-demo` auto-deploys to production** — verified at v3.8.0,
where a push was live in under two minutes. This is the normal path; nothing
else is needed.

The CLI is the fallback if the Git integration is ever disconnected:

```bash
npm i -g vercel     # once
vercel --prod       # from the repo root; the project is already linked
```

To confirm a deploy actually landed, probe an **API route or an SSG page** —
`/assignments`, the student stepper and the score modal all render client-side,
so `curl | grep` against them says nothing about which build is live.

## Verify

Open the production URL and confirm:
- The dashboard loads with the assignment selector populated.
- Selecting an assignment shows student summaries, scores, and charts.
- The assignments and students pages render demo data.
- The student flow (submit a summary) returns a score from `/api/summaryview`.
