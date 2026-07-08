import { NextResponse } from "next/server";
import { gradeAnswer } from "@/lib/gemini";
import { getReviewer, createAttempt, addResponse, finishAttempt } from "@/lib/data";

/**
 * Body shape:
 * {
 *   reviewerId: string,
 *   answers: [{ questionId: string, answerText?: string, transcript?: string }]
 * }
 */
export async function POST(request) {
  const body = await request.json();
  const { reviewerId, answers } = body;

  const reviewer = await getReviewer(reviewerId);
  if (!reviewer) {
    return NextResponse.json({ error: "Reviewer not found" }, { status: 404 });
  }
  if (!Array.isArray(answers) || answers.length === 0) {
    return NextResponse.json({ error: "answers array is required" }, { status: 400 });
  }

  const attempt = await createAttempt(reviewerId);

  for (const a of answers) {
    const question = reviewer.questions.find((q) => q.id === a.questionId);
    if (!question) continue;

    const answerContent = a.transcript || a.answerText || "";

    let result;
    try {
      result = await gradeAnswer({
        prompt: question.prompt,
        rubric: question.rubric,
        answer: answerContent,
        questionType: question.type,
      });
    } catch (err) {
      console.error("Grading error:", err);
      result = {
        score: null,
        strengths: [],
        improvements: ["Grading failed — please try submitting again."],
        verdict: "Needs Practice",
      };
    }

    await addResponse(attempt.id, {
      questionId: question.id,
      answerText: a.answerText || null,
      audioUrl: a.audioUrl || null,
      transcript: a.transcript || null,
      aiScore: result.score,
      aiFeedback: JSON.stringify(result),
    });
  }

  const finished = await finishAttempt(attempt.id);
  return NextResponse.json(finished, { status: 201 });
}
