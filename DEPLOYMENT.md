# Deploying Accenture Interview Reviewer — GitHub + Vercel

A step-by-step walkthrough for getting this project from your computer onto
your GitHub account, and then live on Vercel. No prior Git experience assumed.

---

## Part 1 — Push the project to GitHub

### 1. Install Git (if you don't have it)

Check first:
```bash
git --version
```
If that errors, install Git from [git-scm.com/downloads](https://git-scm.com/downloads), then re-run the check.

### 2. Set your Git identity (one-time, if you haven't already)

```bash
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

### 3. Create a new (empty) repository on GitHub

1. Go to [github.com/new](https://github.com/new)
2. **Repository name:** `accenture-reviewer` (or whatever you like)
3. Leave it **Public** or **Private** — your choice, both work fine with Vercel
4. **Do NOT** check "Add a README file", "Add .gitignore", or "Choose a license" — this project already has those, and adding them on GitHub's side will conflict when you push
5. Click **Create repository**

GitHub will show you a page with setup commands — keep that page open, you'll need the repository URL from it in step 5.

### 4. Turn the project folder into a Git repository

Open a terminal in the `accenture-reviewer` folder (the one with `package.json` in it):

```bash
cd accenture-reviewer
git init
git add .
git commit -m "Initial commit"
```

> The project already has a `.gitignore` that excludes `node_modules/`,
> `.next/`, and `.env.local` — so your secrets and build artifacts won't
> accidentally get committed. Good practice either way: run `git status`
> after `git add .` and make sure `.env.local` is **not** in the list of
> files to be committed.

### 5. Connect your local repo to GitHub and push

GitHub's "quick setup" page (from step 3) shows your exact URL — it looks like `https://github.com/your-username/accenture-reviewer.git`. Use it here:

```bash
git branch -M main
git remote add origin https://github.com/your-username/accenture-reviewer.git
git push -u origin main
```

If this is your first time pushing from this machine, Git/GitHub will prompt you to authenticate — either a browser popup (if you have the GitHub CLI or Git Credential Manager set up) or a personal access token instead of a password. Follow the on-screen prompts.

### 6. Verify

Refresh your GitHub repository page in the browser — you should see all the project files there (`app/`, `components/`, `lib/`, `package.json`, etc.), and importantly **not** see a `.env.local` file or `node_modules/` folder.

---

## Part 2 — Deploy to Vercel

### 1. Create a Vercel account

Go to [vercel.com/signup](https://vercel.com/signup) and sign up — **choose "Continue with GitHub"** so your account is linked and Vercel can see your repositories.

### 2. Import the project

1. From the [Vercel dashboard](https://vercel.com/dashboard), click **Add New… → Project**
2. Under "Import Git Repository", find `accenture-reviewer` in the list (search if needed) and click **Import**
   - If you don't see it, click **Adjust GitHub App Permissions** and grant Vercel access to that repository (or all repositories)
3. Vercel will auto-detect this as a **Next.js** project — you shouldn't need to change the Framework Preset, Build Command, or Output Directory

### 3. Add environment variables (do this before the first deploy, or right after)

Still on the import screen, expand **Environment Variables** and add:

| Name | Value |
|---|---|
| `GEMINI_API_KEY` | your Gemini API key from [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| `DATABASE_URL` | leave blank for now (only needed once you wire up Postgres — see the main README, Stage 3) |
| `ADMIN_PASSWORD` | leave blank, or set a password if you want a basic admin PIN gate |

Click **Add** after typing each one so it actually saves before you deploy.

### 4. Deploy

Click **Deploy**. Vercel will install dependencies, build the project, and give you a live URL like `accenture-reviewer.vercel.app` within a minute or two.

### 5. If you added/changed an environment variable *after* the first deploy

Environment variable changes don't apply automatically to a deployment that's already built. To pick them up:

1. Go to your project on Vercel → **Settings → Environment Variables**, confirm the value is saved
2. Go to **Deployments**, click the **⋯** menu on the latest deployment, and choose **Redeploy**

### 6. Every future push auto-deploys

From now on, any `git push` to your `main` branch on GitHub automatically triggers a new Vercel deployment — you don't need to repeat the import step. A typical update workflow looks like:

```bash
git add .
git commit -m "Describe what you changed"
git push
```

Vercel picks it up within seconds and shows build progress on your dashboard.

---

## Quick reference — all commands in order

```bash
# One-time Git setup
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"

# Push to GitHub
cd accenture-reviewer
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/accenture-reviewer.git
git push -u origin main

# Every update after that
git add .
git commit -m "Describe what you changed"
git push
```

Vercel deployment itself happens through the dashboard (Part 2), not the terminal — though if you'd rather deploy from the command line instead of the website, the main project README also documents the `vercel` CLI as an alternative.

---

## Part 3 — Fixing "Results don't save in production" (set up a real database)

If everything works locally but Answer Reviewers / Typing Test / Versant
Test results **don't show up on Results/History once deployed to
Vercel**, this is expected at this stage, not a bug: the app ships with an
in-memory data store that only works within a single, long-running Node
process — like your local `npm run dev`. On Vercel, each API route
(`/api/grade`, `/api/attempts`, `/api/typing`, etc.) runs as its **own
separate serverless function** with its own isolated memory, so a result
saved by one route is invisible to another once deployed. Fixing this
means giving the app a real database both routes can read and write to.

The project already ships with a Prisma-backed data layer (`lib/db.js`)
that the app switches to automatically the moment `DATABASE_URL` is set —
you don't need to change any application code, just provision a database
and point the app at it.

There are two ways to end up with a Supabase database here — pick whichever matches what you did:

### Path A — You added Supabase through Vercel's Storage/Marketplace tab

If you clicked **Connect** or added Supabase from your Vercel project
(not supabase.com directly), Vercel already added several environment
variables for you automatically — you saw these in **Settings →
Environment Variables**: `POSTGRES_PRISMA_URL`, `POSTGRES_USER`,
`SUPABASE_URL`, `POSTGRES_PASSWORD`, and others. Two of these matter here:

- **`POSTGRES_PRISMA_URL`** — the pooled connection (port 6543), made specifically for Prisma. This becomes your `DATABASE_URL`.
- **`POSTGRES_URL_NON_POOLING`** — the direct connection (port 5432), needed for running migrations. Scroll down the Environment Variables list to find it (it's further down than the ones in the earlier screenshot). This becomes your `DIRECT_URL`.

**In Vercel:**
1. Click the eye/reveal icon (or **⋯ → Edit**) on `POSTGRES_PRISMA_URL` to see its value, and copy it
2. Click **Add Environment Variable**, name it `DATABASE_URL`, paste that value, select **Production, Preview, and Development**, save
3. Do the same for `POSTGRES_URL_NON_POOLING` → new variable named `DIRECT_URL`

**Locally**, the easiest way to get both into `.env.local` is to pull everything Vercel already has instead of copy-pasting by hand:
```bash
npm install -g vercel
vercel login
cd accenture-reviewer
vercel link
vercel env pull .env.local
```
Then open `.env.local` and confirm `DATABASE_URL` and `DIRECT_URL` are both there (rename/add them if the pulled names don't match exactly — the app's `prisma/schema.prisma` expects those exact two names).

### Path B — You created a Supabase project directly on supabase.com

1. Go to [supabase.com](https://supabase.com) and sign up (GitHub sign-in works)
2. Click **New Project**, give it a name, set a database password (save it somewhere), pick your region, and click **Create new project**
3. Once ready, go to **Project Settings → Database → Connection string → URI tab**
4. Copy the **Transaction pooler** connection (port `6543`) — this becomes `DATABASE_URL`:
   ```
   postgresql://postgres.xxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-region.pooler.supabase.com:6543/postgres
   ```
5. Also copy the **Session pooler** or direct connection (port `5432`) — this becomes `DIRECT_URL`:
   ```
   postgresql://postgres.xxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-region.pooler.supabase.com:5432/postgres
   ```
6. Replace `[YOUR-PASSWORD]` in both with the password you set in step 2

### Either way — run the first migration

In `accenture-reviewer/.env.local`:
```
DATABASE_URL=your-pooled-connection-string-port-6543
DIRECT_URL=your-direct-connection-string-port-5432
```

Then create the tables and seed starter data:
```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

The last command populates the new database with the same starter
reviewers/questions the in-memory version shipped with (Behavioral,
Cognitive, Technical, all 7 Communication sub-types, HR Initial/Final) —
skip it if you'd rather start from a completely empty Admin page.

Restart your dev server (`npm run dev`) — the app now reads/writes through Postgres even locally, so you can confirm results persist before deploying.

### Add both variables to Vercel and redeploy

1. Vercel dashboard → your project → **Settings → Environment Variables**
2. Confirm (or add) both `DATABASE_URL` and `DIRECT_URL` for **Production and Preview** — if you followed Path A you likely already added `DATABASE_URL` above; make sure `DIRECT_URL` is there too
3. Go to **Deployments**, open the **⋯** menu on the latest deployment, and click **Redeploy**

That's it — Results/History should now persist correctly in production, since every API route is reading and writing to the same external database instead of its own private memory.

