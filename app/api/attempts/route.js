import { NextResponse } from "next/server";
import { listAttempts } from "@/lib/data";

export async function GET() {
  return NextResponse.json(await listAttempts());
}
