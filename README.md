# Accenture Interview Reviewer

A self-hosted practice platform for Accenture-style interviews — Behavioral,
Cognitive, Technical, Communication (7 sub-types), and HR (Initial/Final) —
with an admin side to manage questions, a candidate side to answer them
(text or mic), a standalone Typing Test and Versant-style spoken test, and
AI grading via Google's Gemini API.

> **Fixed:** the audio recorder used to always label recordings as
> `audio/webm` regardless of what the browser actually recorded, which
> made playback show "Error" in some browsers. It now detects and tags the
> real codec the browser used, and shows a clear message instead of
> silently failing if the mic can't be accessed.

This build ships in **Stage 2 of the recommended build order**: a fully
working app with hardcoded/in-memory data (seeded reviewers across every
category) and real Gemini-powered grading + transcription. The Prisma
schema for a real Postgres database is included and ready to wire in
whenever you want persistence across restarts/devices (see below).

## 1. Requirements

- Node.js 18.17 or later ([nodejs.org](https://nodejs.org))
- A free Gemini API key ([aistudio.google.com/apikey](https://aistudio.google.com/apikey)) — no credit card needed. Optional for local testing (mock grading works without it), required for real AI grading/transcription
- (Optional, for Stage 3) A free Postgres database from [Supabase](https://supabase.com) or [Vercel Postgres](https://vercel.com/storage/postgres)

> **Free tier note:** Gemini's free tier (as of mid-2026) runs on the Flash
> and Flash-Lite models — Pro models are paid-only. Rate limits are per
> minute and per day and change periodically, so if you hit a `429` error
> while testing, wait a minute or check your current limits in
> [Google AI Studio](https://aistudio.google.com). This is plenty for
> practicing interviews solo; it's not meant for production traffic.

## 2. Install and run locally

```bash
# 1. Unzip the project, then move into it
cd accenture-reviewer

# 2. Install dependencies
npm install

# 3. Copy the env template and fill in your key(s)
cp .env.example .env.local
# then edit .env.local and set GEMINI_API_KEY (DATABASE_URL / ADMIN_PASSWORD optional for now)

# 4. Run the dev server
npm run dev
```

Open **http://localhost:3000** — you'll see the landing page with five
buttons: Create & Edit Questions, Answer Reviewers, Review Results,
Typing Test, and Versant Test.

> Without `GEMINI_API_KEY` set, `/api/grade`, `/api/transcribe`,
> `/api/typing`, and `/api/versant` still work — they return clearly
> labeled mock scores/transcripts so you can test every flow for free
> before spending on API credits.

## 3. What's already seeded

The in-memory store (`lib/store.js`) starts with one reviewer per category
from the spec, so you can try the candidate flow immediately:

- Behavioral, Cognitive, Technical
- Communication — Reading, Repeat, Short Answer, Sentence Build, Story
  Retelling, Open-Ended, Conversation
- HR — Initial, Final

**Note:** this data lives in server memory and resets whenever the dev
server restarts. That's expected at this stage — see the section below for
moving to a real database.

## 3b. Typing Test & Versant Test (standalone, no Admin setup needed)

These two practice modes are intentionally **not** built from Admin-created
reviewers/questions — they're self-contained, so there's nothing to set up
before using them:

- **Typing Test** (`/typing-test`) — pick a target WPM (25/35/45/60, or a
  custom number), type a random passage for 60 seconds, and get WPM +
  accuracy computed instantly in the browser, plus Gemini-written coaching
  feedback on top of the raw numbers. Passages live in
  `lib/typingPassages.js` — add more any time.
- **Versant Test** (`/versant-test`) — six hardcoded spoken-English tasks
  (Reading, Repeat, Sentence Build, Story Retelling, Open-Ended,
  Conversation), styled after the real Versant assessment format Accenture
  uses. Each answer is recorded, transcribed by Gemini, and then all six
  transcripts are graded together in one holistic pass, returning Versant-
  style subscores (Sentence Mastery, Vocabulary, Fluency, Pronunciation,
  each on a 20-80 scale) plus per-task feedback. Tasks live in
  `lib/versantTasks.js`.

  **Honesty note:** true pronunciation scoring needs acoustic analysis of
  the audio itself. Gemini here only sees the *transcript* of your speech,
  so "pronunciation" and "fluency" scores are inferred from text-visible
  signals (filler words, false starts, sentence completeness) rather than
  actual audio quality — useful for practicing content and fluency of
  thought, less precise as a pronunciation grader than the real Versant
  test.

Both feed their results into `/results` alongside reviewer attempts,
tagged with their own card styles so you can tell them apart at a glance.

## 4. Project structure

```
accenture-reviewer/
├─ app/
│  ├─ page.jsx                     # Landing page (5 buttons)
│  ├─ admin/page.jsx               # Create/Edit/Delete reviewers & questions
│  ├─ reviewers/page.jsx           # List of reviewers to answer
│  ├─ reviewers/[id]/page.jsx      # Answer flow for one reviewer
│  ├─ results/page.jsx             # Attempt history & scores (all 3 test types)
│  ├─ typing-test/page.jsx         # Standalone WPM typing test
│  ├─ versant-test/page.jsx        # Standalone Versant-style spoken test
│  └─ api/
│     ├─ reviewers/route.js        # GET/POST reviewers
│     ├─ reviewers/[id]/route.js   # GET/PUT/DELETE one reviewer
│     ├─ questions/route.js        # POST/PUT/DELETE questions
│     ├─ attempts/route.js         # GET attempt history (all 3 test types)
│     ├─ transcribe/route.js       # POST audio -> Gemini (native audio input) -> text
│     ├─ grade/route.js            # POST answer(s) -> Gemini -> score+feedback
│     ├─ typing/route.js           # POST typing stats -> Gemini coaching -> stored attempt
│     └─ versant/route.js          # POST transcripts -> Gemini holistic score -> stored attempt
├─ components/
│  ├─ QuestionForm.jsx
│  ├─ ReviewerCard.jsx
│  ├─ AudioRecorder.jsx            # mic record/stop/playback
│  ├─ ScoreBadge.jsx
│  ├─ AttemptSummary.jsx           # results card for reviewer attempts
│  ├─ TypingAttemptSummary.jsx     # results card for typing test attempts
│  └─ VersantAttemptSummary.jsx    # results card for Versant test attempts
├─ lib/
│  ├─ data.js                      # Data-layer switch — every API route imports from here
│  ├─ store.js                     # In-memory fallback (Stage 1/2, local dev only — NOT for production)
│  ├─ db.js                        # Real Postgres-backed implementation (Stage 3, via Prisma)
│  ├─ seedData.js                  # Shared hardcoded reviewer/question content (used by both store.js and prisma/seed.mjs)
│  ├─ typingPassages.js            # Hardcoded typing-test passages + WPM options
│  ├─ versantTasks.js              # Hardcoded Versant-style task set
│  ├─ prisma.js                    # Prisma client singleton (Stage 3)
│  └─ gemini.js                    # Gemini client + grading/transcription helpers
├─ prisma/
│  ├─ schema.prisma                # Ready for Stage 3
│  └─ seed.mjs                     # Populates a fresh DB with the starter reviewers (npx prisma db seed)
├─ .env.example
└─ package.json
```

> **Important — this matters for production.** `lib/store.js` keeps data
> in server memory, which only works within a single long-running process
> (like `npm run dev`). On Vercel, each API route runs as its own separate
> serverless function with separate memory, so in-memory data written by
> one route is invisible to another — Results/History will look broken
> once deployed, even though everything works locally. `lib/data.js`
> automatically switches to the real Postgres-backed `lib/db.js` the
> moment `DATABASE_URL` is set, with no code changes needed elsewhere —
> see Section 5 below (and `DEPLOYMENT.md`) for how to set that up. This
> is not optional if you're deploying to Vercel and want results to
> actually persist.

## 5. Moving to a real database (Stage 3 — required for production)

1. Create a free Postgres database on Supabase or Vercel Postgres, copy its
   connection string into `.env.local` as `DATABASE_URL`. (Full walkthrough
   with screenshots-worth of detail in `DEPLOYMENT.md`, Part 3.)
2. Generate the client, run the first migration, and seed the starter data:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   npx prisma db seed
   ```
3. That's it — no code changes needed. `lib/data.js` detects `DATABASE_URL`
   and switches every API route over to `lib/db.js` automatically.
4. Add the same `DATABASE_URL` to your Vercel project's environment
   variables and redeploy — see `DEPLOYMENT.md`.
5. Optional: `npx prisma studio` gives you a GUI to browse/edit data.

## 6. Adding an admin PIN gate (optional)

Set `ADMIN_PASSWORD` in `.env.local`, then add a small check at the top of
`app/admin/page.jsx` (or wrap it in middleware) that prompts for a
password and compares it against `process.env.ADMIN_PASSWORD` via a tiny
`/api/auth` route. This is intentionally left out of this scaffold since
it's a personal-project nicety, not core functionality — happy to add it
if you want it wired in.

## 7. Deploying to Vercel

```bash
npm install -g vercel   # if you don't have it
vercel login
vercel                  # first deploy, follow the prompts
```

Then in the Vercel dashboard → your project → **Settings → Environment
Variables**, add:

```
GEMINI_API_KEY=AIza...
DATABASE_URL=postgres://...     # once you've done Stage 3
ADMIN_PASSWORD=choose-something
```

Redeploy (`vercel --prod`) after adding env vars.

## 8. Useful commands reference

```bash
npm install              # install all dependencies
npm run dev               # start local dev server (http://localhost:3000)
npm run build              # production build
npm start                 # run the production build locally
npx prisma generate         # regenerate Prisma client after schema changes
npx prisma migrate dev      # create/apply a migration (needs DATABASE_URL)
npx prisma db seed          # populate a fresh database with starter reviewers
npx prisma studio           # open a GUI to browse your database
vercel                    # deploy to Vercel (preview)
vercel --prod              # deploy to Vercel (production)
```
