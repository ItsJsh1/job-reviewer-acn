import { NextResponse } from "next/server";
import { addQuestion, updateQuestion, deleteQuestion } from "@/lib/data";

export async function POST(request) {
  const body = await request.json();
  const { reviewerId, ...question } = body;
  if (!reviewerId || !question.prompt || !question.type) {
    return NextResponse.json(
      { error: "reviewerId, prompt, and type are required" },
      { status: 400 }
    );
  }
  const q = await addQuestion(reviewerId, question);
  if (!q) return NextResponse.json({ error: "Reviewer not found" }, { status: 404 });
  return NextResponse.json(q, { status: 201 });
}

export async function PUT(request) {
  const body = await request.json();
  const { reviewerId, questionId, ...updates } = body;
  const q = await updateQuestion(reviewerId, questionId, updates);
  if (!q) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(q);
}

export async function DELETE(request) {
  const { reviewerId, questionId } = await request.json();
  const ok = await deleteQuestion(reviewerId, questionId);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ deleted: true });
}
