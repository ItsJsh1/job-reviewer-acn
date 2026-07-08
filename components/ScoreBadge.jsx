export default function ScoreBadge({ score }) {
  if (score === null || score === undefined) {
    return (
      <span className="font-mono text-xs px-2 py-1 rounded-full bg-slate-light text-slate">
        — —
      </span>
    );
  }

  const ready = score >= 70;
  return (
    <span
      className={`font-mono text-xs px-2 py-1 rounded-full ${
        ready ? "bg-teal-tint text-teal" : "bg-amber-tint text-amber"
      }`}
    >
      {Math.round(score)} · {ready ? "Ready" : "Needs Practice"}
    </span>
  );
}
