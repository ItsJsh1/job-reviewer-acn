// Stage 1/2 in-memory store. Data resets whenever the dev server restarts,
// AND — important — is NOT shared across separate serverless function
// instances on Vercel, so results won't show up reliably in production.
// This file is only used as a fallback when DATABASE_URL isn't set; see
// lib/data.js (the actual entry point every API route imports from) and
// lib/db.js for the real Postgres-backed implementation used once you set
// DATABASE_URL. See DEPLOYMENT.md for how to set that up.

import { randomUUID } from "crypto";
import { seedReviewers } from "./seedData.js";

function withIds(reviewer) {
  const id = randomUUID();
  return {
    id,
    title: reviewer.title,
    category: reviewer.category,
    subType: reviewer.subType,
    createdAt: new Date().toISOString(),
    questions: reviewer.questions.map((q, i) => ({
      id: randomUUID(),
      reviewerId: id,
      order: i,
      options: null,
      rubric: null,
      timeLimitSeconds: q.timeLimitSeconds ?? null,
      ...q,
    })),
  };
}

const globalStore = globalThis;

function seed() {
  return {
    reviewers: seedReviewers.map(withIds),
    attempts: [],
  };
}

if (!globalStore.__accentureStore) {
  globalStore.__accentureStore = seed();
}

export const store = globalStore.__accentureStore;

export function listReviewers() {
  return store.reviewers.map(({ questions, ...rest }) => ({
    ...rest,
    questionCount: questions.length,
  }));
}

export function getReviewer(id) {
  return store.reviewers.find((r) => r.id === id) || null;
}

export function createReviewer({ title, category, subType }) {
  const reviewer = withIds({ title, category, subType, questions: [] });
  store.reviewers.push(reviewer);
  return reviewer;
}

export function updateReviewer(id, updates) {
  const reviewer = getReviewer(id);
  if (!reviewer) return null;
  Object.assign(reviewer, updates);
  return reviewer;
}

export function deleteReviewer(id) {
  const idx = store.reviewers.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  store.reviewers.splice(idx, 1);
  return true;
}

export function addQuestion(reviewerId, question) {
  const reviewer = getReviewer(reviewerId);
  if (!reviewer) return null;
  const q = {
    id: randomUUID(),
    reviewerId,
    order: reviewer.questions.length,
    options: null,
    rubric: null,
    timeLimitSeconds: null,
    ...question,
  };
  reviewer.questions.push(q);
  return q;
}

export function updateQuestion(reviewerId, questionId, updates) {
  const reviewer = getReviewer(reviewerId);
  if (!reviewer) return null;
  const q = reviewer.questions.find((q) => q.id === questionId);
  if (!q) return null;
  Object.assign(q, updates);
  return q;
}

export function deleteQuestion(reviewerId, questionId) {
  const reviewer = getReviewer(reviewerId);
  if (!reviewer) return false;
  const idx = reviewer.questions.findIndex((q) => q.id === questionId);
  if (idx === -1) return false;
  reviewer.questions.splice(idx, 1);
  return true;
}

export function createAttempt(reviewerId, meta = {}) {
  const attempt = {
    id: randomUUID(),
    reviewerId: reviewerId || null,
    // For standalone attempts (typing test, Versant test) that aren't tied
    // to an admin-created reviewer — these carry their own title/category
    // so the Results page can display them without a reviewer lookup.
    kind: meta.kind || "reviewer", // "reviewer" | "typing" | "versant"
    standaloneTitle: meta.title || null,
    standaloneCategory: meta.category || null,
    startedAt: new Date().toISOString(),
    finishedAt: null,
    overallScore: null,
    responses: [],
    // Freeform extra data for standalone test types (e.g. wpm/accuracy for
    // typing, subscores for Versant) that doesn't fit the Response shape.
    extra: null,
  };
  store.attempts.push(attempt);
  return attempt;
}

export function addResponse(attemptId, response) {
  const attempt = store.attempts.find((a) => a.id === attemptId);
  if (!attempt) return null;
  const r = { id: randomUUID(), attemptId, ...response };
  attempt.responses.push(r);
  return r;
}

export function finishAttempt(attemptId, overrides = {}) {
  const attempt = store.attempts.find((a) => a.id === attemptId);
  if (!attempt) return null;

  if (typeof overrides.overallScore === "number") {
    attempt.overallScore = overrides.overallScore;
  } else {
    const scores = attempt.responses.map((r) => r.aiScore).filter((s) => typeof s === "number");
    attempt.overallScore = scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null;
  }
  if (overrides.extra) attempt.extra = overrides.extra;

  attempt.finishedAt = new Date().toISOString();
  return attempt;
}

export function listAttempts() {
  return [...store.attempts].sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
}

export function getAttempt(id) {
  return store.attempts.find((a) => a.id === id) || null;
}
