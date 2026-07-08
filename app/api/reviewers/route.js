import { NextResponse } from "next/server";
import { listReviewers, createReviewer } from "@/lib/data";

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
