"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TARGET_WPM_OPTIONS, getRandomPassage } from "@/lib/typingPassages";
import ScoreBadge from "@/components/ScoreBadge";

const TEST_DURATION_SECONDS = 60;

function computeAccuracy(passage, typed) {
  const a = passage.trim();
  const b = typed.trim();
  const len = Math.max(a.length, b.length);
  if (len === 0) return 100;
  let correct = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] === b[i]) correct++;
  }
  return Math.round((correct / len) * 100);
}

function computeWpm(typed, elapsedSeconds) {
  const words = typed.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(elapsedSeconds / 60, 1 / 60);
  return Math.round(words / minutes);
}

export default function TypingTestPage() {
  const router = useRouter();
  const [targetWpm, setTargetWpm] = useState(35);
  const [customWpm, setCustomWpm] = useState("");
  const [passage, setPassage] = useState("");
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState("setup"); // setup | running | submitting | done
  const [secondsLeft, setSecondsLeft] = useState(TEST_DURATION_SECONDS);
  const [result, setResult] = useState(null);
  const startTimeRef = useRef(null);
  const timerRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    setPassage(getRandomPassage());
  }, []);

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  function saveAttemptLocally(attempt) {
    if (typeof window === "undefined") return;
    try {
      const existing = JSON.parse(localStorage.getItem("accenture-attempts") || "[]");
      const updated = [attempt, ...existing.filter((item) => item.id !== attempt.id)];
      localStorage.setItem("accenture-attempts", JSON.stringify(updated.slice(0, 50)));
    } catch (error) {
      console.error("Failed to store typing attempt locally", error);
    }
  }

  function startTest() {
    setTyped("");
    setSecondsLeft(TEST_DURATION_SECONDS);
    startTimeRef.current = Date.now();
    setPhase("running");
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          finishTest();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    setTimeout(() => textareaRef.current?.focus(), 0);
  }

  async function finishTest() {
    clearInterval(timerRef.current);
    setPhase("submitting");
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const actualWpm = computeWpm(typed, elapsed);
    const accuracy = computeAccuracy(passage, typed);

    const res = await fetch("/api/typing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetWpm, actualWpm, accuracy, passage, typed }),
    });
    const attempt = await res.json();
    saveAttemptLocally(attempt);
    setResult({ attempt, actualWpm, accuracy });
    setPhase("done");
  }

  function handleTargetSelect(value) {
    setTargetWpm(value);
    setCustomWpm("");
  }

  function handleCustomChange(e) {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setCustomWpm(value);
    if (value) setTargetWpm(Number(value));
  }

  function tryAgain() {
    setPassage(getRandomPassage());
    setResult(null);
    setPhase("setup");
  }

  if (phase === "done" && result) {
    const feedback = result.attempt.extra?.feedback || {};
    return (
      <main className="mx-auto max-w-2xl px-6 py-12">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.back()}
            className="font-mono text-xs px-3 py-2 rounded-lg border border-slate-light hover:border-violet hover:text-violet transition-colors"
          >
            ← Back
          </button>
          <p className="font-mono text-xs tracking-widest text-violet uppercase">Typing Test — Result</p>
        </div>
        <div className="flex items-center gap-3 mb-6">
          <h1 className="font-display text-3xl font-bold text-ink">
            {result.actualWpm} WPM · {result.accuracy}% accuracy
          </h1>
          <ScoreBadge score={result.attempt.overallScore} />
        </div>

        <div className="rounded-card border border-slate-light bg-white/70 p-5 space-y-3">
          <p className="text-xs font-mono text-slate">Target: {targetWpm} WPM</p>
          {feedback.strengths?.length > 0 && (
            <div>
              <p className="text-xs font-mono text-teal mb-1">Strengths</p>
              <ul className="text-sm text-ink list-disc list-inside">
                {feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
          {feedback.improvements?.length > 0 && (
            <div>
              <p className="text-xs font-mono text-amber mb-1">Improvements</p>
              <ul className="text-sm text-ink list-disc list-inside">
                {feedback.improvements.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-8 flex gap-4">
          <button
            onClick={tryAgain}
            className="font-mono text-xs px-4 py-2 rounded-lg bg-ink text-paper hover:bg-violet transition-colors"
          >
            Try again
          </button>
          <button
            onClick={() => router.push("/results")}
            className="font-mono text-xs px-4 py-2 rounded-lg border border-slate-light hover:border-violet hover:text-violet transition-colors"
          >
            View all results
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-mono text-xs tracking-widest text-violet uppercase mb-2">TYPE-04</p>
          <h1 className="font-display text-3xl font-bold text-ink">Typing Test</h1>
        </div>
        <Link href="/" className="text-sm text-slate hover:text-violet">← Home</Link>
      </div>

      {phase === "setup" && (
        <div className="space-y-6">
          <div>
            <p className="text-xs font-mono text-slate mb-2">Choose a target WPM to practice with</p>
            <div className="flex flex-wrap gap-2">
              {TARGET_WPM_OPTIONS.map((wpm) => (
                <button
                  key={wpm}
                  onClick={() => handleTargetSelect(wpm)}
                  className={`font-mono text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    targetWpm === wpm && !customWpm
                      ? "bg-ink text-paper border-ink"
                      : "border-slate-light text-slate hover:border-violet"
                  }`}
                >
                  {wpm} WPM
                </button>
              ))}
              <input
                value={customWpm}
                onChange={handleCustomChange}
                placeholder="Custom"
                className="w-24 font-mono text-xs px-3 py-1.5 rounded-full border border-slate-light text-center outline-none focus:border-violet"
              />
            </div>
          </div>

          <div className="rounded-card border border-slate-light bg-white/70 ticket-notch p-6">
            <p className="text-xs font-mono text-slate mb-2">You'll type this passage for {TEST_DURATION_SECONDS} seconds:</p>
            <p className="text-ink">{passage}</p>
          </div>

          <button
            onClick={startTest}
            className="font-mono text-xs px-5 py-2.5 rounded-lg bg-ink text-paper hover:bg-violet transition-colors"
          >
            Start {TEST_DURATION_SECONDS}s test at {targetWpm} WPM →
          </button>
        </div>
      )}

      {(phase === "running" || phase === "submitting") && (
        <div className="space-y-4">
          <div className="rounded-card border border-slate-light bg-white/70 p-8">
            <div className="mb-6 space-y-2">
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="font-mono text-xs text-violet mb-1">Target</p>
                  <p className="font-display text-2xl font-bold text-ink">{targetWpm} WPM</p>
                </div>
                <div>
                  <p className="font-mono text-xs text-ink mb-1">Time left</p>
                  <p className="font-display text-2xl font-bold text-ink">{secondsLeft}s</p>
                </div>
                <div>
                  <p className="font-mono text-xs text-slate mb-1">Words typed</p>
                  <p className="font-display text-2xl font-bold text-ink">{typed.trim().split(/\s+/).filter(Boolean).length}</p>
                </div>
              </div>
              <div className="rounded-lg bg-slate-950/95 p-6 min-h-[140px]">
                <p className="text-base leading-7 text-white font-mono whitespace-pre-wrap break-words">{passage}</p>
              </div>
            </div>
            <textarea
              ref={textareaRef}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              disabled={phase === "submitting"}
              className="w-full min-h-[200px] rounded-xl border border-slate-light bg-slate-50 p-4 text-base leading-6 font-mono outline-none focus:border-violet"
              placeholder="Type the passage above…"
            />
          </div>
          <button
            onClick={finishTest}
            disabled={phase === "submitting"}
            className="font-mono text-xs px-5 py-2.5 rounded-lg bg-ink text-paper hover:bg-violet transition-colors disabled:opacity-50"
          >
            {phase === "submitting" ? "Grading…" : "Finish early & submit"}
          </button>
        </div>
      )}
    </main>
  );
}
