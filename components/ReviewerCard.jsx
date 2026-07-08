import Link from "next/link";

const CATEGORY_CODES = {
  Behavioral: "BEH",
  Cognitive: "COG",
  Technical: "TECH",
  Communication: "COMM",
  HR: "HR",
};

export default function ReviewerCard({ reviewer, href, actionLabel = "Open" }) {
  const code = CATEGORY_CODES[reviewer.category] || "GEN";

  return (
    <div className="rounded-card border border-slate-light bg-white/70 ticket-notch p-5 flex items-center justify-between gap-4">
      <div>
        <span className="font-mono text-xs text-violet tracking-wider">
          {code}-{reviewer.subType ? reviewer.subType.slice(0, 3).toUpperCase() : String(reviewer.questionCount ?? "").padStart(2, "0")}
        </span>
        <h3 className="font-display font-semibold text-ink mt-1">{reviewer.title}</h3>
        <p className="text-xs text-slate mt-1">
          {reviewer.category}
          {reviewer.subType ? ` · ${reviewer.subType}` : ""}
          {typeof reviewer.questionCount === "number" ? ` · ${reviewer.questionCount} questions` : ""}
        </p>
      </div>
      {href && (
        <Link
          href={href}
          className="shrink-0 font-mono text-xs px-3 py-2 rounded-lg bg-ink text-paper hover:bg-violet transition-colors"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
