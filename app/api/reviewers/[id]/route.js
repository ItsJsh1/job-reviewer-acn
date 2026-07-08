import { NextResponse } from "next/server";
import { getReviewer, updateReviewer, deleteReviewer } from "@/lib/data";

export async function GET(_request, { params }) {
  const reviewer = await getReviewer(params.id);
  if (!reviewer) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(reviewer);
}

export async function PUT(request, { params }) {
  const body = await request.json();
  const reviewer = await updateReviewer(params.id, body);
  if (!reviewer) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(reviewer);
}

export async function DELETE(_request, { params }) {
  const ok = await deleteReviewer(params.id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ deleted: true });
}
