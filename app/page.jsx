import Link from "next/link";

const actions = [
  {
    href: "/admin",
    code: "ADM-01",
    title: "Create & Edit Questions",
    description: "Build reviewers, add questions, set rubrics.",
  },
  {
    href: "/reviewers",
    code: "CAND-02",
    title: "Answer Reviewers",
    description: "Pick a set and start practicing — text or mic.",
  },
  {
    href: "/results",
    code: "RES-03",
    title: "Review Results",
    description: "See past attempts, scores, and AI feedback.",
  },
  {
    href: "/typing-test",
    code: "TYPE-04",
    title: "Typing Test",
    description: "Practice at 25-60+ WPM, graded by AI.",
  },
  {
    href: "/versant-test",
    code: "VER-05",
    title: "Versant Test",
    description: "Spoken English tasks, scored Versant-style by AI.",
  },
];

export default function LandingPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16 md:py-24">
      <p className="font-mono text-xs tracking-widest text-violet uppercase mb-3">
        Admission Ticket · Interview Prep
      </p>
      <h1 className="font-display text-4xl md:text-6xl font-bold leading-[1.05] text-ink mb-4">
        Accenture Interview
        <br />
        Reviewer
      </h1>
      <p className="text-slate max-w-xl mb-12 text-lg">
        Practice Behavioral, Cognitive, Technical, Communication, and HR
        rounds — graded instantly by AI, including your spoken answers.
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        {actions.map((a, i) => (
          <Link
            key={a.href}
            href={a.href}
            className="group relative rounded-card border border-slate-light bg-white/70 backdrop-blur-sm p-6 ticket-notch hover:border-violet hover:-translate-y-0.5 transition-all shadow-sm hover:shadow-md"
          >
            <span className="font-mono text-xs text-violet tracking-wider">
              {a.code}
            </span>
            <h2 className="font-display text-xl font-semibold text-ink mt-2 mb-1">
              {a.title}
            </h2>
            <p className="text-sm text-slate">{a.description}</p>
            <span className="absolute bottom-6 right-6 text-violet opacity-0 group-hover:opacity-100 transition-opacity">
              →
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
