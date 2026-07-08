"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AudioRecorder from "@/components/AudioRecorder";
import ScoreBadge from "@/components/ScoreBadge";
import { VERSANT_TASKS } from "@/lib/versantTasks";

export default function VersantTestPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcripts, setTranscripts] = useState([]); // { id, type, prompt, transcript }
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const task = VERSANT_TASKS[step];
  const isLast = step === VERSANT_TASKS.length - 1;

  async function handleNext() {
    if (!audioBlob) return alert("Please record an answer first.");

    const formData = new FormData();
    formData.append("audio", audioBlob, "answer.webm");
    const res = await fetch("/api/transcribe", { method: "POST", body: formData });
    const { transcript } = await res.json();

    const entry = { id: task.id, type: task.type, prompt: task.prompt, transcript };
    const nextTranscripts = [...transcripts, entry];
    setTranscripts(nextTranscripts);
    setAudioBlob(null);

    if (isLast) {
      await submitAll(nextTranscripts);
    } else {
      setStep(step + 1);
    }
  }

  async function submitAll(finalTranscripts) {
    setSubmitting(true);
    const res = await fetch("/api/versant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tasks: finalTranscripts }),
    });
    const attempt = await res.json();
    setResult(attempt);
    setSubmitting(false);
  }

  if (result) {
    const feedback = result.extra?.feedback || {};
    const sub = feedback.subscores || {};
    return (
      <main className="mx-auto max-w-2xl px-6 py-12">
        <p className="font-mono text-xs tracking-widest text-violet uppercase mb-2">Versant Test — Result</p>
        <div className="flex items-center gap-3 mb-6">
          <h1 className="font-display text-2xl font-bold text-ink">Overall Score</h1>
          <ScoreBadge score={result.overallScore} />
        </div>

        {feedback.subscores && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {Object.entries(sub).map(([key, value]) => (
              <div key={key} className="rounded-card border border-slate-light bg-white/70 p-4">
                <p className="text-xs font-mono text-slate capitalize">{key.replace(/([A-Z])/g, " $1")}</p>
                <p className="font-display text-xl font-semibold text-ink">{value}<span className="text-xs text-slate">/80</span></p>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3 mb-6">
          {(feedback.perTaskFeedback || []).map((t, i) => (
            <div key={i} className="rounded-card border border-slate-light bg-white/70 p-4">
              <span className="font-mono text-xs text-violet">{t.task}</span>
              <p className="text-sm text-ink mt-1">{t.feedback}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => router.push("/results")}
            className="font-mono text-xs px-4 py-2 rounded-lg bg-ink text-paper hover:bg-violet transition-colors"
          >
            View all results
          </button>
          <button
            onClick={() => { setResult(null); setStep(0); setTranscripts([]); }}
            className="font-mono text-xs px-4 py-2 rounded-lg border border-slate-light hover:border-violet hover:text-violet transition-colors"
          >
            Retake test
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-mono text-xs tracking-widest text-violet uppercase mb-2">
            VER-05 · Task {step + 1} of {VERSANT_TASKS.length}
          </p>
          <h1 className="font-display text-2xl font-bold text-ink">Versant-Style Spoken Test</h1>
        </div>
        <Link href="/" className="text-sm text-slate hover:text-violet">← Home</Link>
      </div>

      <div className="rounded-card border border-slate-light bg-white/70 ticket-notch p-6 mb-6">
        <span className="font-mono text-xs text-violet">{task.type}</span>
        <p className="text-ink text-lg mt-2">{task.prompt}</p>
      </div>

      <AudioRecorder onRecorded={setAudioBlob} />

      <div className="mt-6">
        <button
          onClick={handleNext}
          disabled={submitting}
          className="font-mono text-xs px-5 py-2.5 rounded-lg bg-ink text-paper hover:bg-violet transition-colors disabled:opacity-50"
        >
          {submitting ? "Grading…" : isLast ? "Submit & Grade" : "Next task →"}
        </button>
      </div>
    </main>
  );
}
