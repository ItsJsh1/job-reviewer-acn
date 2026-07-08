import { NextResponse } from "next/server";
import { transcribeAudio } from "@/lib/gemini";

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get("audio");

  if (!file) {
    return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
  }

  try {
    // Gemini accepts the audio as inline base64 data — transcribeAudio()
    // reads the File/Blob's bytes directly, no separate upload step needed.
    const transcript = await transcribeAudio(file);
    return NextResponse.json({ transcript });
  } catch (err) {
    console.error("Transcription error:", err);
    return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
  }
}
