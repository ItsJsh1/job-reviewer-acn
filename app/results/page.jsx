"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AttemptSummary from "@/components/AttemptSummary";
import TypingAttemptSummary from "@/components/TypingAttemptSummary";
import VersantAttemptSummary from "@/components/VersantAttemptSummary";

export default function ResultsPage() {
  const router = useRouter();
  const [attempts, setAttempts] = useState([]);
  const [reviewerTitles, setReviewerTitles] = useState({});
  const [apiLoaded, setApiLoaded] = useState(false);
  const [localFallback, setLocalFallback] = useState(false);
  const [page, setPage] = useState(1);
  const RESULTS_PER_PAGE = 10;

  useEffect(() => {
    async function load() {
      const [attemptsRes, reviewersRes] = await Promise.all([
        fetch("/api/attempts").then((r) => (r.ok ? r.json() : [])).catch(() => []),
        fetch("/api/reviewers").then((r) => r.json()).catch(() => []),
      ]);

      const saved = typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("accenture-attempts") || "[]")
        : [];

      const combined = [
        ...(attemptsRes || []),
        ...saved.filter((item) => !(attemptsRes || []).some((existing) => existing.id === item.id)),
      ];

      setReviewerTitles(Object.fromEntries((reviewersRes || []).map((r) => [r.id, r.title])));
      setAttempts(combined);
      setLocalFallback(Boolean(saved.length && !(attemptsRes || []).length));
      setApiLoaded(true);
      setPage(1);
    }
    load();
  }, []);

  const totalPages = Math.max(1, Math.ceil(attempts.length / RESULTS_PER_PAGE));
  const visibleAttempts = attempts.slice((page - 1) * RESULTS_PER_PAGE, page * RESULTS_PER_PAGE);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-mono text-xs tracking-widest text-violet uppercase mb-2">History</p>
          <h1 className="font-display text-3xl font-bold text-ink">Your Results</h1>
        </div>
        <Link href="/" className="text-sm text-slate hover:text-violet">Home</Link>
      </div>

      {localFallback && apiLoaded && (
        <div className="rounded-card border border-amber bg-amber-50 p-4 text-sm text-amber-900">
          Showing stored history from your browser because the results API did not return any saved attempts.
        </div>
      )}

      <div className="space-y-4">
        {attempts.length === 0 && (
          <p className="text-sm text-slate">No attempts yet — answer a reviewer, or try the Typing or Versant test, to see your scores here.</p>
        )}
        {visibleAttempts.map((a) => {
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
      {attempts.length > RESULTS_PER_PAGE && (
        <div className="mt-8 flex items-center justify-center gap-3 text-xs text-slate">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-slate-light px-3 py-2 disabled:opacity-50"
          >
            Previous
          </button>
          <span>Page {page} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-lg border border-slate-light px-3 py-2 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </main>
  );
}
