import ScoreBadge from "./ScoreBadge";

export default function TypingAttemptSummary({ attempt }) {
  const { targetWpm, actualWpm, accuracy, feedback } = attempt.extra || {};

  return (
    <div className="rounded-card border border-slate-light bg-white/70 ticket-notch p-5">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <span className="font-mono text-xs text-violet">Typing Test</span>
          <h3 className="font-display font-semibold text-ink mt-1">
            {actualWpm} WPM · {accuracy}% accuracy
          </h3>
          <p className="text-xs text-slate mt-1">
            Target {targetWpm} WPM · {new Date(attempt.startedAt).toLocaleString()}
          </p>
        </div>
        <ScoreBadge score={attempt.overallScore} />
      </div>
      {feedback?.improvements?.length > 0 && (
        <ul className="text-sm text-ink list-disc list-inside mt-2">
          {feedback.improvements.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      )}
    </div>
  );
}
