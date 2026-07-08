// Shared seed content for the hardcoded reviewers/questions — used by
// both the in-memory store (lib/store.js) and the Prisma seed script
// (prisma/seed.js), so there's one source of truth for this data.

export const seedReviewers = [
  {
    title: "Behavioral Assessment — Round 1",
    category: "Behavioral",
    subType: null,
    questions: [
      { prompt: "Tell me about a time you disagreed with a teammate. How did you handle it?", type: "text", rubric: "Uses STAR structure, shows self-awareness, resolves constructively." },
      { prompt: "Describe a situation where you had to adapt to a sudden change.", type: "text", rubric: "Concrete example, shows flexibility and initiative." },
    ],
  },
  {
    title: "Cognitive Assessment — Logic & Reasoning",
    category: "Cognitive",
    subType: null,
    questions: [
      { prompt: "A train leaves City A at 60km/h, another leaves City B (300km away) at 90km/h toward A. When do they meet?", type: "text", rubric: "Correct approach: combined speed 150km/h, 300/150 = 2 hours." },
      { prompt: "Which number comes next: 2, 6, 12, 20, 30, ?", type: "mcq", options: ["36", "40", "42", "44"], rubric: "Correct answer is 42 (differences increase by 2: n(n+1))." },
    ],
  },
  {
    title: "Technical Assessment — Web Fundamentals",
    category: "Technical",
    subType: null,
    questions: [
      { prompt: "Write a function that returns the first non-repeating character in a string.", type: "coding", rubric: "Correct logic, reasonable time complexity, handles edge cases (empty string, all repeats)." },
      { prompt: "Explain the difference between REST and GraphQL.", type: "text", rubric: "Covers endpoint structure, over/under-fetching, typing." },
    ],
  },
  {
    title: "Communication — Reading",
    category: "Communication",
    subType: "Reading",
    questions: [
      { prompt: "Read aloud: 'Effective communication is the foundation of successful collaboration in any organization.'", type: "audio", rubric: "Clear pronunciation, natural pacing, correct stress." },
    ],
  },
  {
    title: "Communication — Repeat",
    category: "Communication",
    subType: "Repeat",
    questions: [
      { prompt: "Listen and repeat: 'Please schedule the client call for Thursday afternoon.'", type: "audio", rubric: "Accurate repetition, clear articulation." },
    ],
  },
  {
    title: "Communication — Short Answer",
    category: "Communication",
    subType: "Short Answer",
    questions: [
      { prompt: "What did you do last weekend?", type: "audio", rubric: "Coherent, relevant, reasonably fluent response." },
    ],
  },
  {
    title: "Communication — Sentence Builds",
    category: "Communication",
    subType: "Sentence Build",
    questions: [
      { prompt: "Build a sentence using the words: 'deadline', 'team', 'communicate'.", type: "audio", rubric: "Grammatically correct, uses all three words naturally." },
    ],
  },
  {
    title: "Communication — Story Retelling",
    category: "Communication",
    subType: "Story Retelling",
    questions: [
      { prompt: "Listen to the short story and retell it in your own words.", type: "audio", rubric: "Captures key plot points in correct order, coherent narration." },
    ],
  },
  {
    title: "Communication — Open-Ended",
    category: "Communication",
    subType: "Open-Ended",
    questions: [
      { prompt: "What does good teamwork look like to you?", type: "audio", rubric: "Clear opinion, supporting reasoning, fluent delivery." },
    ],
  },
  {
    title: "Communication — Conversation",
    category: "Communication",
    subType: "Conversation",
    questions: [
      { prompt: "A coworker asks why the report is late. Respond as you would in person.", type: "audio", rubric: "Polite, clear, appropriately detailed response." },
    ],
  },
  {
    title: "HR Interview — Initial",
    category: "HR",
    subType: "Initial",
    questions: [
      { prompt: "Why do you want to work at Accenture?", type: "text", rubric: "Specific, shows research, aligns personal goals with company values." },
      { prompt: "Walk me through your resume.", type: "text", rubric: "Concise, relevant, chronological, highlights fit for role." },
    ],
  },
  {
    title: "HR Interview — Final",
    category: "HR",
    subType: "Final",
    questions: [
      { prompt: "What are your salary expectations and availability?", type: "text", rubric: "Realistic, clear, flexible framing." },
      { prompt: "Do you have any questions for us?", type: "text", rubric: "Thoughtful question(s) about the role or team, not generic." },
    ],
  },
];
