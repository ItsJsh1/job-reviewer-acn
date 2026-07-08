import ScoreBadge from "./ScoreBadge";

export default function VersantAttemptSummary({ attempt }) {
  const feedback = attempt.extra?.feedback || {};
  const sub = feedback.subscores || {};

  return (
    <div className="rounded-card border border-slate-light bg-white/70 ticket-notch p-5">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <span className="font-mono text-xs text-violet">Versant Test</span>
          <h3 className="font-display font-semibold text-ink mt-1">Spoken English Assessment</h3>
          <p className="text-xs text-slate mt-1">{new Date(attempt.startedAt).toLocaleString()}</p>
        </div>
        <ScoreBadge score={attempt.overallScore} />
      </div>
      {feedback.subscores && (
        <div className="flex flex-wrap gap-2 mt-2">
          {Object.entries(sub).map(([key, value]) => (
            <span key={key} className="font-mono text-xs px-2 py-1 rounded-full bg-violet-tint text-violet">
              {key.replace(/([A-Z])/g, " $1")}: {value}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
