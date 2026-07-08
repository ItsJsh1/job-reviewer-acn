"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import QuestionForm from "@/components/QuestionForm";

const CATEGORIES = ["Behavioral", "Cognitive", "Technical", "Communication", "HR"];
const SUBTYPES = {
  Communication: ["Reading", "Repeat", "Short Answer", "Sentence Build", "Story Retelling", "Open-Ended", "Conversation"],
  HR: ["Initial", "Final"],
};

export default function AdminPage() {
  const [reviewers, setReviewers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [showNewReviewer, setShowNewReviewer] = useState(false);
  const [showNewQuestion, setShowNewQuestion] = useState(false);
  const [newReviewer, setNewReviewer] = useState({ title: "", category: CATEGORIES[0], subType: "" });

  async function refreshList() {
    const res = await fetch("/api/reviewers");
    setReviewers(await res.json());
  }

  async function refreshSelected(id) {
    if (!id) return setSelected(null);
    const res = await fetch(`/api/reviewers/${id}`);
    setSelected(await res.json());
  }

  useEffect(() => {
    refreshList();
  }, []);

  useEffect(() => {
    refreshSelected(selectedId);
  }, [selectedId]);

  async function handleCreateReviewer(e) {
    e.preventDefault();
    const res = await fetch("/api/reviewers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newReviewer),
    });
    const created = await res.json();
    setShowNewReviewer(false);
    setNewReviewer({ title: "", category: CATEGORIES[0], subType: "" });
    await refreshList();
    setSelectedId(created.id);
  }

  async function handleDeleteReviewer(id) {
    if (!confirm("Delete this reviewer and all its questions?")) return;
    await fetch(`/api/reviewers/${id}`, { method: "DELETE" });
    if (selectedId === id) setSelectedId(null);
    await refreshList();
  }

  async function handleAddQuestion(question) {
    await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewerId: selectedId, ...question }),
    });
    setShowNewQuestion(false);
    await refreshSelected(selectedId);
    await refreshList();
  }

  async function handleDeleteQuestion(questionId) {
    await fetch("/api/questions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewerId: selectedId, questionId }),
    });
    await refreshSelected(selectedId);
    await refreshList();
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-mono text-xs tracking-widest text-violet uppercase mb-2">Admin</p>
          <h1 className="font-display text-3xl font-bold text-ink">Reviewers & Questions</h1>
        </div>
        <Link href="/" className="text-sm text-slate hover:text-violet">← Home</Link>
      </div>

      <div className="grid md:grid-cols-[280px_1fr] gap-6">
        {/* Reviewer list */}
        <aside className="space-y-3">
          <button
            onClick={() => setShowNewReviewer((s) => !s)}
            className="w-full font-mono text-xs px-3 py-2 rounded-lg bg-ink text-paper hover:bg-violet transition-colors"
          >
            + New reviewer
          </button>

          {showNewReviewer && (
            <form onSubmit={handleCreateReviewer} className="rounded-card border border-slate-light bg-white/70 p-4 space-y-3">
              <input
                required
                placeholder="Reviewer title"
                value={newReviewer.title}
                onChange={(e) => setNewReviewer({ ...newReviewer, title: e.target.value })}
                className="w-full rounded-lg border border-slate-light p-2 text-sm outline-none focus:border-violet"
              />
              <select
                value={newReviewer.category}
                onChange={(e) => setNewReviewer({ ...newReviewer, category: e.target.value, subType: "" })}
                className="w-full rounded-lg border border-slate-light p-2 text-sm outline-none focus:border-violet"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {SUBTYPES[newReviewer.category] && (
                <select
                  value={newReviewer.subType}
                  onChange={(e) => setNewReviewer({ ...newReviewer, subType: e.target.value })}
                  className="w-full rounded-lg border border-slate-light p-2 text-sm outline-none focus:border-violet"
                >
                  <option value="">Select sub-type</option>
                  {SUBTYPES[newReviewer.category].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              )}
              <button type="submit" className="font-mono text-xs px-3 py-2 rounded-lg bg-violet text-paper w-full">
                Create
              </button>
            </form>
          )}

          <ul className="space-y-2">
            {reviewers.map((r) => (
              <li key={r.id}>
                <button
                  onClick={() => setSelectedId(r.id)}
                  className={`w-full text-left rounded-lg border p-3 text-sm transition-colors ${
                    selectedId === r.id ? "border-violet bg-violet-tint" : "border-slate-light bg-white/60 hover:border-violet"
                  }`}
                >
                  <span className="font-mono text-xs text-violet block mb-0.5">
                    {r.category}{r.subType ? ` · ${r.subType}` : ""}
                  </span>
                  {r.title}
                  <span className="block text-xs text-slate mt-0.5">{r.questionCount} questions</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Selected reviewer detail */}
        <section>
          {!selected ? (
            <p className="text-slate text-sm">Select a reviewer on the left, or create a new one.</p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold text-ink">{selected.title}</h2>
                <button
                  onClick={() => handleDeleteReviewer(selected.id)}
                  className="text-xs text-slate hover:text-red-600"
                >
                  Delete reviewer
                </button>
              </div>

              <div className="space-y-3">
                {selected.questions.map((q, i) => (
                  <div key={q.id} className="rounded-card border border-slate-light bg-white/70 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="font-mono text-xs text-violet">Q{i + 1} · {q.type}</span>
                        <p className="text-sm text-ink mt-1">{q.prompt}</p>
                        {q.rubric && <p className="text-xs text-slate mt-1">Rubric: {q.rubric}</p>}
                      </div>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="text-xs text-slate hover:text-red-600 shrink-0"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {showNewQuestion ? (
                <QuestionForm
                  onSubmit={handleAddQuestion}
                  onCancel={() => setShowNewQuestion(false)}
                />
              ) : (
                <button
                  onClick={() => setShowNewQuestion(true)}
                  className="font-mono text-xs px-3 py-2 rounded-lg border border-slate-light hover:border-violet hover:text-violet transition-colors"
                >
                  + Add question
                </button>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
