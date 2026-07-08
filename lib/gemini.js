import { GoogleGenerativeAI } from "@google/generative-ai";

let client = null;

export function getGemini() {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!client) client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return client;
}

// gemini-2.5-flash is the current free-tier workhorse model (as of mid-2026).
// Swap to "gemini-2.5-flash-lite" if you want a higher free daily request
// cap at slightly lower quality, or "gemini-2.5-pro" if you've enabled
// billing and want stronger reasoning.
const MODEL_NAME = "gemini-2.5-flash";

const GRADING_SYSTEM_PROMPT = `You are an Accenture interview evaluator.
You will be given a question, an optional rubric describing the expected
qualities of a strong answer, and a candidate's answer (or transcript of a
spoken answer). Respond with ONLY a strict JSON object, no markdown
fences, no preamble, shaped exactly like this:

{
  "score": 0-100,
  "strengths": ["...", "..."],
  "improvements": ["...", "..."],
  "verdict": "Ready" | "Needs Practice"
}

Be specific and constructive. If the answer is a transcript of spoken
communication, also comment on pacing, filler words, and clarity within
"improvements" where relevant.`;

function extractJson(text) {
  // Gemini sometimes wraps JSON in ```json fences despite instructions —
  // strip them defensively before parsing.
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    const jsonMatch = cleaned.match(/({[\s\S]*})/);
    if (jsonMatch) return JSON.parse(jsonMatch[1]);
    throw new Error(`Unable to parse JSON grading output: ${error.message}`);
  }
}

/**
 * Grade a single answer with Gemini. Falls back to a deterministic mock
 * score if no GEMINI_API_KEY is configured, so the app still works during
 * local development without billing anything.
 */
export async function gradeAnswer({ prompt, rubric, answer, questionType }) {
  const genAI = getGemini();

  if (!genAI) {
    const length = (answer || "").trim().length;
    const score = Math.max(35, Math.min(95, length));
    return {
      score,
      strengths: ["Answer submitted and received by the grading pipeline."],
      improvements: [
        "Set GEMINI_API_KEY in .env.local to get real AI feedback instead of this mock score.",
      ],
      verdict: score >= 70 ? "Ready" : "Needs Practice",
      mock: true,
    };
  }

  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: GRADING_SYSTEM_PROMPT,
    generationConfig: { responseMimeType: "application/json", temperature: 0.3 },
  });

  const userContent = `Question type: ${questionType}
Question: ${prompt}
Rubric / expected qualities: ${rubric || "None provided — grade generally."}
Candidate answer: ${answer}`;

  const result = await model.generateContent(userContent);
  const text = result.response.text();
  return extractJson(text);
}

/**
 * Transcribe an audio blob using Gemini's native audio understanding —
 * Gemini 2.5 Flash accepts audio directly as inline data, so no separate
 * speech-to-text service (like Whisper) is needed.
 */
export async function transcribeAudio(fileLike) {
  const genAI = getGemini();

  if (!genAI) {
    return "[Mock transcript — set GEMINI_API_KEY to enable real Gemini transcription.]";
  }

  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const arrayBuffer = await fileLike.arrayBuffer();
  const base64Audio = Buffer.from(arrayBuffer).toString("base64");
  const mimeType = fileLike.type || "audio/webm";

  const result = await model.generateContent([
    {
      inlineData: { data: base64Audio, mimeType },
    },
    {
      text: "Transcribe this audio verbatim. Return ONLY the transcript text, with no extra commentary, labels, or quotation marks.",
    },
  ]);

  return result.response.text().trim();
}

const TYPING_SYSTEM_PROMPT = `You are a typing-speed coach. You will be
given a candidate's typing test stats: target WPM, actual WPM, accuracy
percentage, the passage they typed, and what they actually typed. Respond
with ONLY a strict JSON object, no markdown fences, shaped exactly like
this:

{
  "score": 0-100,
  "strengths": ["...", "..."],
  "improvements": ["...", "..."],
  "verdict": "Ready" | "Needs Practice"
}

Score should weigh both speed relative to the target WPM and accuracy —
a fast but inaccurate result should not score as highly as a slightly
slower but accurate one. Be specific: reference the actual numbers.`;

/**
 * Have Gemini give qualitative feedback on a typing test result. WPM and
 * accuracy are computed deterministically on the client — this just adds
 * a coaching layer on top, the same way gradeAnswer does for interview
 * questions.
 */
export async function gradeTyping({ targetWpm, actualWpm, accuracy, passage, typed }) {
  const genAI = getGemini();

  if (!genAI) {
    const meetsTarget = actualWpm >= targetWpm;
    const speedRatio = Math.min(actualWpm / Math.max(targetWpm, 1), 1.25);
    const score = Math.round(Math.max(0, Math.min(100, speedRatio * 50 + accuracy * 0.5)));
    return {
      score,
      strengths: [`Typed at ${actualWpm} WPM with ${accuracy}% accuracy.`],
      improvements: [
        "Set GEMINI_API_KEY in .env.local to get real AI coaching instead of this mock score.",
      ],
      verdict: meetsTarget && accuracy >= 90 ? "Ready" : "Needs Practice",
      mock: true,
    };
  }

  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: TYPING_SYSTEM_PROMPT,
    generationConfig: { responseMimeType: "application/json", temperature: 0.3 },
  });

  const userContent = `Target WPM: ${targetWpm}
Actual WPM: ${actualWpm}
Accuracy: ${accuracy}%
Original passage: ${passage}
What the candidate typed: ${typed}`;

  const result = await model.generateContent(userContent);
  return extractJson(result.response.text());
}

const VERSANT_SYSTEM_PROMPT = `You are an automated spoken-English
evaluator modeled on Versant-style assessments (as used in Accenture's
Communication/Versant interview round). You will receive transcripts from
several task types — Reading, Repeat, Sentence Build, Story Retelling,
Open-Ended, and Conversation — along with what each task asked for.

Score the overall performance across these four Versant-style subscores,
each 20-80 (Versant's real scale), plus an overall band:

{
  "subscores": {
    "sentenceMastery": 20-80,
    "vocabulary": 20-80,
    "fluency": 20-80,
    "pronunciation": 20-80
  },
  "overallScore": 20-80,
  "verdict": "Ready" | "Needs Practice",
  "perTaskFeedback": [
    { "task": "...", "feedback": "..." }
  ],
  "strengths": ["...", "..."],
  "improvements": ["...", "..."]
}

Base "pronunciation" and "fluency" judgments on transcript-visible signals
only — filler words, false starts, sentence completeness, word choice —
and note in your feedback that true acoustic pronunciation scoring would
need audio-level analysis beyond a transcript. Respond with ONLY the JSON
object, no markdown fences, no preamble.`;

/**
 * Holistic Versant-style grading across every task in a Versant Test
 * attempt. Unlike gradeAnswer (per-question), this takes the whole set of
 * transcripts at once since Versant scoring is inherently aggregate.
 */
export async function gradeVersant(tasks) {
  // tasks: [{ type, prompt, transcript }]
  const genAI = getGemini();

  if (!genAI) {
    const avgLen = tasks.reduce((sum, t) => sum + (t.transcript || "").length, 0) / tasks.length;
    const base = Math.max(20, Math.min(80, Math.round(avgLen / 2) + 20));
    return {
      subscores: {
        sentenceMastery: base,
        vocabulary: base,
        fluency: base,
        pronunciation: base,
      },
      overallScore: base,
      verdict: base >= 50 ? "Ready" : "Needs Practice",
      perTaskFeedback: tasks.map((t) => ({
        task: t.type,
        feedback: "Set GEMINI_API_KEY in .env.local to get real AI feedback instead of this mock score.",
      })),
      strengths: ["Completed all Versant-style tasks."],
      improvements: ["Set GEMINI_API_KEY in .env.local to get real AI feedback."],
      mock: true,
    };
  }

  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: VERSANT_SYSTEM_PROMPT,
    generationConfig: { responseMimeType: "application/json", temperature: 0.3 },
  });

  const userContent = tasks
    .map(
      (t, i) =>
        `Task ${i + 1} (${t.type}): ${t.prompt}\nCandidate transcript: ${t.transcript || "[no speech detected]"}`
    )
    .join("\n\n");

  const result = await model.generateContent(userContent);
  return extractJson(result.response.text());
}
