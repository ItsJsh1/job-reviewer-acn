import { NextResponse } from "next/server";
import { gradeVersant } from "@/lib/gemini";
import { createAttempt, finishAttempt } from "@/lib/data";

/**
 * Body shape:
 * {
 *   tasks: [{ id, type, prompt, transcript }]
 * }
 */
export async function POST(request) {
  const body = await request.json();
  const { tasks } = body;

  if (!Array.isArray(tasks) || tasks.length === 0) {
    return NextResponse.json({ error: "tasks array is required" }, { status: 400 });
  }

  const attempt = await createAttempt(null, {
    kind: "versant",
    title: "Versant-Style Spoken English Test",
    category: "Versant Test",
  });

  let result;
  try {
    result = await gradeVersant(tasks);
  } catch (err) {
    console.error("Versant grading error:", err);
    result = {
      subscores: null,
      overallScore: null,
      verdict: "Needs Practice",
      perTaskFeedback: [],
      strengths: [],
      improvements: ["Grading failed — please try submitting again."],
    };
  }

  const finished = await finishAttempt(attempt.id, {
    overallScore: result.overallScore,
    extra: { tasks, feedback: result },
  });

  return NextResponse.json(finished, { status: 201 });
}
