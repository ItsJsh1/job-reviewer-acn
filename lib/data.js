// Every API route imports from this file instead of lib/store.js or
// lib/db.js directly.
//
// Locally, if you haven't set up a database yet, this falls back to the
// in-memory store so you can keep developing without extra setup — that's
// fine for local testing, but IMPORTANT: it will NOT persist correctly in
// production on Vercel, because each API route runs as its own separate
// serverless function with its own memory. Data saved by one route (e.g.
// /api/grade) is invisible to another (e.g. /api/attempts) once deployed.
//
// Setting DATABASE_URL (see DEPLOYMENT.md) switches this to the real
// Postgres-backed implementation in lib/db.js, which is what you need for
// Results/History to actually work once deployed.

const usingDatabase = Boolean(process.env.DATABASE_URL);

const impl = usingDatabase ? await import("./db.js") : await import("./store.js");

export const listReviewers = impl.listReviewers;
export const getReviewer = impl.getReviewer;
export const createReviewer = impl.createReviewer;
export const updateReviewer = impl.updateReviewer;
export const deleteReviewer = impl.deleteReviewer;
export const addQuestion = impl.addQuestion;
export const updateQuestion = impl.updateQuestion;
export const deleteQuestion = impl.deleteQuestion;
export const createAttempt = impl.createAttempt;
export const addResponse = impl.addResponse;
export const finishAttempt = impl.finishAttempt;
export const listAttempts = impl.listAttempts;
export const getAttempt = impl.getAttempt;
