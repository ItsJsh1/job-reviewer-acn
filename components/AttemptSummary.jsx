import ScoreBadge from "./ScoreBadge";

export default function AttemptSummary({ attempt, reviewerTitle }) {
  return (
    <div className="rounded-card border border-slate-light bg-white/70 ticket-notch p-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h3 className="font-display font-semibold text-ink">{reviewerTitle}</h3>
          <p className="text-xs text-slate mt-1">
            {new Date(attempt.startedAt).toLocaleString()}
          </p>
        </div>
        <ScoreBadge score={attempt.overallScore} />
      </div>

      <div className="space-y-3">
        {attempt.responses.map((r, i) => (
          <div key={r.id} className="border-t border-slate-light pt-3 first:border-t-0 first:pt-0">
            <p className="text-xs font-mono text-slate mb-1">Q{i + 1}</p>
            {r.aiFeedback && (
              <ul className="text-sm text-ink list-disc list-inside space-y-0.5">
                {(() => {
                  try {
                    const parsed = typeof r.aiFeedback === "string" ? JSON.parse(r.aiFeedback) : r.aiFeedback;
                    return [...(parsed.strengths || []), ...(parsed.improvements || [])].map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ));
                  } catch {
                    return <li>{r.aiFeedback}</li>;
                  }
                })()}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
