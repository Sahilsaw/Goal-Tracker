# Daily Coding Goals

A React app to set and track daily coding goals: videos to watch, DSA questions, and dev tasks. Data is stored in the browser (localStorage); no backend required.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
```

Output is in `dist/`.

## Deploy to GitHub Pages

1. In `vite.config.ts`, set `base` to your repo path:
   - Repo at `https://github.com/<user>/GoalPrj` → keep `base: '/GoalPrj/'`
   - User site `https://<user>.github.io` (repo name `username.github.io`) → use `base: '/'`

2. Deploy the `dist/` folder:
   - **Option A:** Push `dist/` to a `gh-pages` branch and in repo **Settings → Pages** set source to that branch (root).
   - **Option B:** Install and use [gh-pages](https://www.npmjs.com/package/gh-pages):  
     `npx gh-pages -d dist`

3. If using a project site, the app will be at `https://<user>.github.io/GoalPrj/`.
