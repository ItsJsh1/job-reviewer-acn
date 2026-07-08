// Stage 3 data layer — backed by a real Postgres database via Prisma.
// This is what actually persists in production: unlike lib/store.js
// (in-memory, only shared within a single Node process), this survives
// across the separate serverless function instances Vercel spins up for
// each API route. See DEPLOYMENT.md for how to provision the database and
// wire DATABASE_URL into both .env.local and Vercel.
//
// Function names/signatures intentionally match lib/store.js exactly —
// lib/data.js picks whichever of the two to use, so nothing else in the
// app needs to know which one is active.

import { prisma } from "./prisma";

export async function listReviewers() {
  const reviewers = await prisma.reviewer.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { questions: true } } },
  });
  return reviewers.map(({ _count, ...rest }) => ({
    ...rest,
    questionCount: _count.questions,
  }));
}

export async function getReviewer(id) {
  return prisma.reviewer.findUnique({
    where: { id },
    include: { questions: { orderBy: { order: "asc" } } },
  });
}

export async function createReviewer({ title, category, subType }) {
  return prisma.reviewer.create({
    data: { title, category, subType: subType || null },
  });
}

export async function updateReviewer(id, updates) {
  try {
    return await prisma.reviewer.update({ where: { id }, data: updates });
  } catch {
    return null;
  }
}

export async function deleteReviewer(id) {
  try {
    await prisma.reviewer.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

export async function addQuestion(reviewerId, question) {
  const count = await prisma.question.count({ where: { reviewerId } });
  try {
    return await prisma.question.create({
      data: {
        reviewerId,
        prompt: question.prompt,
        type: question.type,
        rubric: question.rubric || null,
        options: question.options ?? null,
        timeLimitSeconds: question.timeLimitSeconds ?? null,
        order: count,
      },
    });
  } catch {
    return null;
  }
}

export async function updateQuestion(_reviewerId, questionId, updates) {
  try {
    return await prisma.question.update({ where: { id: questionId }, data: updates });
  } catch {
    return null;
  }
}

export async function deleteQuestion(_reviewerId, questionId) {
  try {
    await prisma.question.delete({ where: { id: questionId } });
    return true;
  } catch {
    return false;
  }
}

export async function createAttempt(reviewerId, meta = {}) {
  return prisma.attempt.create({
    data: {
      reviewerId: reviewerId || null,
      kind: meta.kind || "reviewer",
      standaloneTitle: meta.title || null,
      standaloneCategory: meta.category || null,
    },
  });
}

export async function addResponse(attemptId, response) {
  return prisma.response.create({
    data: {
      attemptId,
      questionId: response.questionId,
      answerText: response.answerText || null,
      audioUrl: response.audioUrl || null,
      transcript: response.transcript || null,
      aiScore: typeof response.aiScore === "number" ? response.aiScore : null,
      aiFeedback: response.aiFeedback || null,
    },
  });
}

export async function finishAttempt(attemptId, overrides = {}) {
  let overallScore = overrides.overallScore;

  if (typeof overallScore !== "number") {
    const responses = await prisma.response.findMany({ where: { attemptId } });
    const scores = responses.map((r) => r.aiScore).filter((s) => typeof s === "number");
    overallScore = scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null;
  }

  return prisma.attempt.update({
    where: { id: attemptId },
    data: {
      overallScore,
      extra: overrides.extra ?? undefined,
      finishedAt: new Date(),
    },
    include: { responses: true },
  });
}

export async function listAttempts() {
  return prisma.attempt.findMany({
    orderBy: { startedAt: "desc" },
    include: { responses: true },
  });
}

export async function getAttempt(id) {
  return prisma.attempt.findUnique({ where: { id }, include: { responses: true } });
}
