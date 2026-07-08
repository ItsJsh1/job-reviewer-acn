"use client";

import { useState } from "react";

const TYPES = [
  { value: "text", label: "Text" },
  { value: "audio", label: "Audio / Mic" },
  { value: "mcq", label: "Multiple Choice" },
  { value: "coding", label: "Coding" },
];

export default function QuestionForm({ initial, onSubmit, onCancel }) {
  const [prompt, setPrompt] = useState(initial?.prompt || "");
  const [type, setType] = useState(initial?.type || "text");
  const [rubric, setRubric] = useState(initial?.rubric || "");
  const [optionsText, setOptionsText] = useState(
    initial?.options ? initial.options.join(", ") : ""
  );

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      prompt,
      type,
      rubric: rubric || null,
      options: type === "mcq" && optionsText.trim()
        ? optionsText.split(",").map((s) => s.trim()).filter(Boolean)
        : null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-card border border-slate-light bg-white/70 p-5 space-y-4">
      <div>
        <label className="block text-xs font-mono text-slate mb-1">Prompt</label>
        <textarea
          required
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-slate-light p-3 text-sm focus:border-violet outline-none"
          placeholder="e.g. Tell me about a time you handled conflict."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-mono text-slate mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-lg border border-slate-light p-2.5 text-sm focus:border-violet outline-none"
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        {type === "mcq" && (
          <div>
            <label className="block text-xs font-mono text-slate mb-1">Options (comma separated)</label>
            <input
              value={optionsText}
              onChange={(e) => setOptionsText(e.target.value)}
              className="w-full rounded-lg border border-slate-light p-2.5 text-sm focus:border-violet outline-none"
              placeholder="42, 40, 36, 44"
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs font-mono text-slate mb-1">
          Rubric / expected answer (used by the AI grader)
        </label>
        <textarea
          value={rubric}
          onChange={(e) => setRubric(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-slate-light p-3 text-sm focus:border-violet outline-none"
          placeholder="What should a strong answer include?"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="font-mono text-xs px-4 py-2 rounded-lg bg-ink text-paper hover:bg-violet transition-colors"
        >
          Save question
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="font-mono text-xs px-4 py-2 rounded-lg border border-slate-light text-slate hover:border-violet hover:text-violet transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
