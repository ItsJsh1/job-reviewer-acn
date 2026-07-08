"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ReviewerCard from "@/components/ReviewerCard";

export default function ReviewersListPage() {
  const [reviewers, setReviewers] = useState([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetch("/api/reviewers").then((r) => r.json()).then(setReviewers);
  }, []);

  const categories = ["All", ...new Set(reviewers.map((r) => r.category))];
  const filtered = filter === "All" ? reviewers : reviewers.filter((r) => r.category === filter);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-mono text-xs tracking-widest text-violet uppercase mb-2">Candidate</p>
          <h1 className="font-display text-3xl font-bold text-ink">Answer a Reviewer</h1>
        </div>
        <Link href="/" className="text-sm text-slate hover:text-violet">← Home</Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`font-mono text-xs px-3 py-1.5 rounded-full border transition-colors ${
              filter === c ? "bg-ink text-paper border-ink" : "border-slate-light text-slate hover:border-violet"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-sm text-slate">No reviewers yet — create one from the Admin page.</p>
        )}
        {filtered.map((r) => (
          <ReviewerCard key={r.id} reviewer={r} href={`/reviewers/${r.id}`} actionLabel="Start" />
        ))}
      </div>
    </main>
  );
}
