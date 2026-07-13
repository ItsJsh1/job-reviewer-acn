import { NextResponse } from "next/server";
import { listReviewers, createReviewer, deleteReviewer } from "@/lib/data";

export async function GET() {
  return NextResponse.json(await listReviewers());
}

export async function POST(request) {
  const body = await request.json();
  if (!body.title || !body.category) {
    return NextResponse.json(
      { error: "title and category are required" },
      { status: 400 }
    );
  }
  const reviewer = await createReviewer({
    title: body.title,
    category: body.category,
    subType: body.subType || null,
  });
  return NextResponse.json(reviewer, { status: 201 });
}

export async function DELETE(request) {
  const body = await request.json();
  const reviewerId = body?.reviewerId;
  if (!reviewerId) {
    return NextResponse.json({ error: "reviewerId is required" }, { status: 400 });
  }
  const ok = await deleteReviewer(reviewerId);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ deleted: true });
}
