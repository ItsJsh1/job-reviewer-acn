import { NextResponse } from "next/server";
import { gradeTyping } from "@/lib/gemini";
import { createAttempt, finishAttempt } from "@/lib/data";

/**
 * Body shape:
 * {
 *   targetWpm: number,
 *   actualWpm: number,
 *   accuracy: number,      // 0-100
 *   passage: string,
 *   typed: string
 * }
 */
export async function POST(request) {
  const body = await request.json();
  const { targetWpm, actualWpm, accuracy, passage, typed } = body;

  if (typeof actualWpm !== "number" || typeof accuracy !== "number") {
    return NextResponse.json(
      { error: "actualWpm and accuracy are required numbers" },
      { status: 400 }
    );
  }

  const attempt = await createAttempt(null, {
    kind: "typing",
    title: `Typing Test — ${targetWpm} WPM target`,
    category: "Typing Test",
  });

  let result;
  try {
    result = await gradeTyping({ targetWpm, actualWpm, accuracy, passage, typed });
  } catch (err) {
    console.error("Typing grading error:", err);
    result = {
      score: null,
      strengths: [],
      improvements: ["Grading failed — please try submitting again."],
      verdict: "Needs Practice",
    };
  }

  const finished = await finishAttempt(attempt.id, {
    overallScore: result.score,
    extra: { targetWpm, actualWpm, accuracy, feedback: result },
  });

  return NextResponse.json(finished, { status: 201 });
}
