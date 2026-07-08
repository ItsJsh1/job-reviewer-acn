// Standalone Versant-style spoken English test. Deliberately not tied to
// the Admin reviewer/question CRUD or the Communication reviewers — this
// is a fixed, self-contained set of tasks mirroring the real Versant test
// format Accenture uses, graded holistically by Gemini in one pass.

export const VERSANT_TASKS = [
  {
    id: "read-aloud",
    type: "Reading",
    prompt: "Read this sentence aloud clearly and at a natural pace: \"Please schedule the client review for Thursday morning before the deadline.\"",
  },
  {
    id: "repeat",
    type: "Repeat",
    prompt: "Repeat this sentence exactly as spoken: \"The quarterly report needs to be finalized by end of day Friday.\"",
  },
  {
    id: "sentence-build",
    type: "Sentence Build",
    prompt: "Build one natural sentence using all of these words: \"team\", \"deadline\", \"communicate\".",
  },
  {
    id: "story-retell",
    type: "Story Retelling",
    prompt: "In your own words, briefly retell this story: \"A new employee missed an important deadline because she didn't ask for help early enough. After talking to her manager, she learned to flag risks sooner, and her next project went much more smoothly.\"",
  },
  {
    id: "open-ended",
    type: "Open-Ended",
    prompt: "In 30-60 seconds, describe what good teamwork looks like to you.",
  },
  {
    id: "conversation",
    type: "Conversation",
    prompt: "A coworker asks why a report is late. Respond to them as you would in person.",
  },
];
