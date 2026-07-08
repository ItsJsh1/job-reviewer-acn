"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AudioRecorder from "@/components/AudioRecorder";
import ScoreBadge from "@/components/ScoreBadge";

export default function AnswerReviewerPage() {
  const { id } = useParams();
  const router = useRouter();

  const [reviewer, setReviewer] = useState(null);
  const [step, setStep] = useState(0);
  const [textAnswer, setTextAnswer] = useState("");
  const [audioBlob, setAudioBlob] = useState(null);
  const [answers, setAnswers] = useState([]); // { questionId, answerText?, transcript?, audioUrl? }
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetch(`/api/reviewers/${id}`).then((r) => r.json()).then(setReviewer);
  }, [id]);

  if (!reviewer) return <main className="mx-auto max-w-2xl px-6 py-12 text-slate text-sm">Loading…</main>;

  const question = reviewer.questions[step];
  const isLast = step === reviewer.questions.length - 1;

  async function handleNext() {
    let entry = { questionId: question.id };

    if (question.type === "audio") {
      if (!audioBlob) return alert("Please record an answer first.");
      const formData = new FormData();
      formData.append("audio", audioBlob, "answer.webm");
      const res = await fetch("/api/transcribe", { method: "POST", body: formData });
      const { transcript } = await res.json();
      entry.transcript = transcript;
    } else {
      if (!textAnswer.trim()) return alert("Please write an answer first.");
      entry.answerText = textAnswer;
    }

    const nextAnswers = [...answers, entry];
    setAnswers(nextAnswers);
    setTextAnswer("");
    setAudioBlob(null);

    if (isLast) {
      await submitAll(nextAnswers);
    } else {
      setStep(step + 1);
    }
  }

  async function submitAll(finalAnswers) {
    setSubmitting(true);
    const res = await fetch("/api/grade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewerId: reviewer.id, answers: finalAnswers }),
    });
    const attempt = await res.json();
    setResult(attempt);
    setSubmitting(false);
  }

  if (result) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-12">
        <p className="font-mono text-xs tracking-widest text-violet uppercase mb-2">Result</p>
        <div className="flex items-center gap-3 mb-6">
          <h1 className="font-display text-3xl font-bold text-ink">{reviewer.title}</h1>
          <ScoreBadge score={result.overallScore} />
        </div>

        <div className="space-y-4">
          {result.responses.map((r, i) => {
            let feedback = {};
            try { feedback = JSON.parse(r.aiFeedback); } catch {}
            return (
              <div key={r.id} className="rounded-card border border-slate-light bg-white/70 p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-slate">Q{i + 1} · {reviewer.questions[i].prompt}</span>
                  <ScoreBadge score={r.aiScore} />
                </div>
                {feedback.strengths?.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-mono text-teal mb-1">Strengths</p>
                    <ul className="text-sm text-ink list-disc list-inside">
                      {feedback.strengths.map((s, idx) => <li key={idx}>{s}</li>)}
                    </ul>
                  </div>
                )}
                {feedback.improvements?.length > 0 && (
                  <div>
                    <p className="text-xs font-mono text-amber mb-1">Improvements</p>
                    <ul className="text-sm text-ink list-disc list-inside">
                      {feedback.improvements.map((s, idx) => <li key={idx}>{s}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex gap-4">
          <button
            onClick={() => router.push("/results")}
            className="font-mono text-xs px-4 py-2 rounded-lg bg-ink text-paper hover:bg-violet transition-colors"
          >
            View all results
          </button>
          <button
            onClick={() => router.push("/reviewers")}
            className="font-mono text-xs px-4 py-2 rounded-lg border border-slate-light hover:border-violet hover:text-violet transition-colors"
          >
            Answer another reviewer
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <p className="font-mono text-xs tracking-widest text-violet uppercase mb-2">
        {reviewer.category}{reviewer.subType ? ` · ${reviewer.subType}` : ""} · Question {step + 1} of {reviewer.questions.length}
      </p>
      <h1 className="font-display text-2xl font-bold text-ink mb-6">{reviewer.title}</h1>

      <div className="rounded-card border border-slate-light bg-white/70 ticket-notch p-6 mb-6">
        <p className="text-ink text-lg">{question.prompt}</p>
        {question.type === "mcq" && question.options && (
          <div className="mt-4 space-y-2">
            {question.options.map((opt) => (
              <label key={opt} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="mcq"
                  value={opt}
                  checked={textAnswer === opt}
                  onChange={(e) => setTextAnswer(e.target.value)}
                />
                {opt}
              </label>
            ))}
          </div>
        )}
      </div>

      {question.type === "audio" ? (
        <AudioRecorder onRecorded={setAudioBlob} />
      ) : question.type !== "mcq" ? (
        <textarea
          value={textAnswer}
          onChange={(e) => setTextAnswer(e.target.value)}
          rows={question.type === "coding" ? 10 : 5}
          className={`w-full rounded-card border border-slate-light p-4 text-sm outline-none focus:border-violet ${
            question.type === "coding" ? "font-mono" : ""
          }`}
          placeholder={question.type === "coding" ? "// write your solution here" : "Type your answer here…"}
        />
      ) : null}

      <div className="mt-6">
        <button
          onClick={handleNext}
          disabled={submitting}
          className="font-mono text-xs px-5 py-2.5 rounded-lg bg-ink text-paper hover:bg-violet transition-colors disabled:opacity-50"
        >
          {submitting ? "Grading…" : isLast ? "Submit & Grade" : "Next question →"}
        </button>
      </div>
    </main>
  );
}
