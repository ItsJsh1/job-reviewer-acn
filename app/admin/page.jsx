"use client";

import { useEffect, useState, useRef } from "react";
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
  const [editingReviewer, setEditingReviewer] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [reviewerEditDraft, setReviewerEditDraft] = useState({ title: "", category: CATEGORIES[0], subType: "" });
  const [reviewerPage, setReviewerPage] = useState(1);
  const [questionPage, setQuestionPage] = useState(1);
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

  const REVIEWERS_PER_PAGE = 10;
  const QUESTIONS_PER_PAGE = 10;

  useEffect(() => {
    refreshList();
  }, []);

  const dragReviewerIdRef = useRef(null);
  const dragQuestionIdRef = useRef(null);

  useEffect(() => {
    refreshSelected(selectedId);
    setQuestionPage(1);
  }, [selectedId]);

  const totalReviewerPages = Math.max(1, Math.ceil(reviewers.length / REVIEWERS_PER_PAGE));
  const totalQuestionPages = selected
    ? Math.max(1, Math.ceil(selected.questions.length / QUESTIONS_PER_PAGE))
    : 1;
  const visibleReviewers = reviewers.slice(
    (reviewerPage - 1) * REVIEWERS_PER_PAGE,
    reviewerPage * REVIEWERS_PER_PAGE
  );
  const visibleQuestions = selected
    ? selected.questions.slice(
        (questionPage - 1) * QUESTIONS_PER_PAGE,
        questionPage * QUESTIONS_PER_PAGE
      )
    : [];

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
    const res = await fetch("/api/reviewers", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewerId: id }),
    });
    if (!res.ok) {
      alert("Failed to delete reviewer.");
      return;
    }
    if (selectedId === id) {
      setSelectedId(null);
      setSelected(null);
      setQuestionPage(1);
    }
    await refreshList();
    setReviewerPage(1);
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
    if (editingQuestion?.id === questionId) setEditingQuestion(null);
    await refreshSelected(selectedId);
    await refreshList();
  }

  async function handleUpdateReviewerDraft(e) {
    e.preventDefault();
    await fetch(`/api/reviewers/${selectedId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: reviewerEditDraft.title,
        category: reviewerEditDraft.category,
        subType: reviewerEditDraft.subType || null,
      }),
    });
    setEditingReviewer(false);
    await refreshList();
    await refreshSelected(selectedId);
  }

  async function handleUpdateQuestion(question) {
    await fetch("/api/questions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reviewerId: selectedId,
        questionId: editingQuestion.id,
        ...question,
      }),
    });
    setEditingQuestion(null);
    await refreshSelected(selectedId);
    await refreshList();
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      {(showNewQuestion || editingQuestion || editingReviewer) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-2xl">
            <div className="rounded-card border border-slate-light bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-display text-xl font-semibold text-ink">
                    {editingReviewer ? "Edit reviewer" : editingQuestion ? "Edit question" : "New question"}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setShowNewQuestion(false);
                    setEditingQuestion(null);
                    setEditingReviewer(false);
                  }}
                  className="text-xs font-mono uppercase text-slate hover:text-violet"
                >
                  Close
                </button>
              </div>
              {editingReviewer ? (
                <form onSubmit={handleUpdateReviewerDraft} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-slate mb-1">Title</label>
                    <input
                      value={reviewerEditDraft.title}
                      onChange={(e) => setReviewerEditDraft({ ...reviewerEditDraft, title: e.target.value })}
                      className="w-full rounded-lg border border-slate-light p-3 text-sm outline-none focus:border-violet"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-slate mb-1">Category</label>
                      <select
                        value={reviewerEditDraft.category}
                        onChange={(e) => setReviewerEditDraft({ ...reviewerEditDraft, category: e.target.value, subType: "" })}
                        className="w-full rounded-lg border border-slate-light p-3 text-sm outline-none focus:border-violet"
                      >
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    {SUBTYPES[reviewerEditDraft.category] && (
                      <div>
                        <label className="block text-xs font-mono text-slate mb-1">Sub-type</label>
                        <select
                          value={reviewerEditDraft.subType}
                          onChange={(e) => setReviewerEditDraft({ ...reviewerEditDraft, subType: e.target.value })}
                          className="w-full rounded-lg border border-slate-light p-3 text-sm outline-none focus:border-violet"
                        >
                          <option value="">Select sub-type</option>
                          {SUBTYPES[reviewerEditDraft.category].map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" className="font-mono text-xs px-4 py-2 rounded-lg bg-ink text-paper hover:bg-violet transition-colors">Save</button>
                    <button
                      type="button"
                      onClick={() => setEditingReviewer(false)}
                      className="font-mono text-xs px-4 py-2 rounded-lg border border-slate-light text-slate hover:border-violet hover:text-violet transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <QuestionForm
                  initial={editingQuestion || undefined}
                  onSubmit={editingQuestion ? handleUpdateQuestion : handleAddQuestion}
                  onCancel={() => {
                    setShowNewQuestion(false);
                    setEditingQuestion(null);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
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
            {visibleReviewers.map((r) => (
              <li key={r.id}>
                <button
                  draggable
                  onDragStart={(e) => {
                    dragReviewerIdRef.current = r.id;
                    e.dataTransfer?.setData("text/plain", r.id);
                    e.dataTransfer?.setData("application/my-app", r.id);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={async (e) => {
                    e.preventDefault();
                    const draggedId = dragReviewerIdRef.current || e.dataTransfer?.getData("text/plain");
                    if (!draggedId || draggedId === r.id) return;
                    const arr = [...reviewers];
                    const draggedIdx = arr.findIndex((x) => x.id === draggedId);
                    const targetIdx = arr.findIndex((x) => x.id === r.id);
                    if (draggedIdx === -1 || targetIdx === -1) return;
                    const [dragged] = arr.splice(draggedIdx, 1);
                    arr.splice(targetIdx, 0, dragged);
                    const base = Date.now();
                    // Persist new ordering (higher = top)
                    await Promise.all(
                      arr.map((item, i) =>
                        fetch(`/api/reviewers/${item.id}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ order: base + (arr.length - i) }),
                        })
                      )
                    );
                    await refreshList();
                    dragReviewerIdRef.current = null;
                  }}
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
          {reviewers.length > REVIEWERS_PER_PAGE && (
            <div className="flex items-center justify-between text-xs text-slate mt-3">
              <button
                onClick={() => setReviewerPage((p) => Math.max(1, p - 1))}
                disabled={reviewerPage === 1}
                className="rounded-lg border border-slate-light px-3 py-2 text-left disabled:opacity-50"
              >
                Previous
              </button>
              <span>Page {reviewerPage} / {totalReviewerPages}</span>
              <button
                onClick={() => setReviewerPage((p) => Math.min(totalReviewerPages, p + 1))}
                disabled={reviewerPage === totalReviewerPages}
                className="rounded-lg border border-slate-light px-3 py-2 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </aside>

        {/* Selected reviewer detail */}
        <section>
          {!selected ? (
            <p className="text-slate text-sm">Select a reviewer on the left, or create a new one.</p>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl font-semibold text-ink">{selected.title}</h2>
                  <p className="text-xs text-slate">{selected.category}{selected.subType ? ` · ${selected.subType}` : ""}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setReviewerEditDraft({ title: selected.title, category: selected.category, subType: selected.subType || "" });
                      setEditingReviewer(true);
                      setShowNewQuestion(false);
                      setEditingQuestion(null);
                    }}
                    className="text-xs text-slate hover:text-violet"
                  >
                    Edit reviewer
                  </button>
                  <button
                    onClick={() => handleDeleteReviewer(selected.id)}
                    className="text-xs text-slate hover:text-red-600"
                  >
                    Delete reviewer
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {visibleQuestions.map((q, index) => (
                  <div
                    key={q.id}
                    draggable
                    onDragStart={(e) => {
                      dragQuestionIdRef.current = q.id;
                      e.dataTransfer?.setData("text/plain", q.id);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={async (e) => {
                      e.preventDefault();
                      const draggedId = dragQuestionIdRef.current || e.dataTransfer?.getData("text/plain");
                      if (!draggedId || draggedId === q.id) return;
                      const arr = selected ? [...selected.questions] : [];
                      const draggedIdx = arr.findIndex((x) => x.id === draggedId);
                      const targetIdx = arr.findIndex((x) => x.id === q.id);
                      if (draggedIdx === -1 || targetIdx === -1) return;
                      const [dragged] = arr.splice(draggedIdx, 1);
                      arr.splice(targetIdx, 0, dragged);
                      const base = Date.now();
                      // Persist new ordering for all questions in this reviewer
                      await Promise.all(
                        arr.map((item, i) =>
                          fetch(`/api/questions`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ reviewerId: selectedId, questionId: item.id, order: base + (arr.length - i) }),
                          })
                        )
                      );
                      await refreshSelected(selectedId);
                      await refreshList();
                      dragQuestionIdRef.current = null;
                    }}
                    className="rounded-card border border-slate-light bg-white/70 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="font-mono text-xs text-violet">Q{(questionPage - 1) * QUESTIONS_PER_PAGE + index + 1} · {q.type}</span>
                        <p className="text-sm text-ink mt-1">{q.prompt}</p>
                        {q.rubric && <p className="text-xs text-slate mt-1">Rubric: {q.rubric}</p>}
                        {q.timeLimitSeconds && (
                          <p className="text-xs text-slate mt-1">Suggested time: {q.timeLimitSeconds}s</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setEditingQuestion(q);
                            setShowNewQuestion(false);
                          }}
                          className="text-xs text-slate hover:text-violet"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="text-xs text-slate hover:text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {selected && selected.questions.length > QUESTIONS_PER_PAGE && (
                <div className="flex items-center justify-between text-xs text-slate mt-3">
                  <button
                    onClick={() => setQuestionPage((p) => Math.max(1, p - 1))}
                    disabled={questionPage === 1}
                    className="rounded-lg border border-slate-light px-3 py-2 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span>Page {questionPage} / {totalQuestionPages}</span>
                  <button
                    onClick={() => setQuestionPage((p) => Math.min(totalQuestionPages, p + 1))}
                    disabled={questionPage === totalQuestionPages}
                    className="rounded-lg border border-slate-light px-3 py-2 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}

              <button
                onClick={() => {
                  setShowNewQuestion(true);
                  setEditingQuestion(null);
                }}
                className="font-mono text-xs px-3 py-2 rounded-lg border border-slate-light hover:border-violet hover:text-violet transition-colors"
              >
                + Add question
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
