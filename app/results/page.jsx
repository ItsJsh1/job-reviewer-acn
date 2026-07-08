"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AttemptSummary from "@/components/AttemptSummary";
import TypingAttemptSummary from "@/components/TypingAttemptSummary";
import VersantAttemptSummary from "@/components/VersantAttemptSummary";

export default function ResultsPage() {
  const [attempts, setAttempts] = useState([]);
  const [reviewerTitles, setReviewerTitles] = useState({});

  useEffect(() => {
    async function load() {
      const [attemptsRes, reviewersRes] = await Promise.all([
        fetch("/api/attempts").then((r) => (r.ok ? r.json() : [])).catch(() => []),
        fetch("/api/reviewers").then((r) => r.json()),
      ]);
      setReviewerTitles(Object.fromEntries(reviewersRes.map((r) => [r.id, r.title])));
      setAttempts(attemptsRes);
    }
    load();
  }, []);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-mono text-xs tracking-widest text-violet uppercase mb-2">History</p>
          <h1 className="font-display text-3xl font-bold text-ink">Your Results</h1>
        </div>
        <Link href="/" className="text-sm text-slate hover:text-violet">← Home</Link>
      </div>

      <div className="space-y-4">
        {attempts.length === 0 && (
          <p className="text-sm text-slate">No attempts yet — answer a reviewer, or try the Typing or Versant test, to see your scores here.</p>
        )}
        {attempts.map((a) => {
          if (a.kind === "typing") return <TypingAttemptSummary key={a.id} attempt={a} />;
          if (a.kind === "versant") return <VersantAttemptSummary key={a.id} attempt={a} />;
          return (
            <AttemptSummary
              key={a.id}
              attempt={a}
              reviewerTitle={reviewerTitles[a.reviewerId] || "Unknown reviewer"}
            />
          );
        })}
      </div>
    </main>
  );
}
