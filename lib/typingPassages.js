// Standalone typing-test content — deliberately not tied to the Admin
// reviewer/question CRUD, since this feature doesn't need per-question
// setup. Add more passages here any time.

export const TARGET_WPM_OPTIONS = [25, 35, 45, 60];

export const TYPING_PASSAGES = [
  "Effective communication is the foundation of successful collaboration in any organization. Teams that listen carefully and respond thoughtfully tend to solve problems faster than those that do not.",
  "Accenture works with clients across every major industry to help them adapt to new technology, improve efficiency, and deliver better outcomes for their customers and employees alike.",
  "A strong first impression during an interview often comes down to preparation. Candidates who research the company, practice common questions, and stay calm under pressure tend to perform best.",
  "Time management is a skill that separates high performers from the rest. Breaking large tasks into smaller steps makes deadlines feel achievable instead of overwhelming.",
  "Good typing speed matters in many roles, from data entry to customer support, because it allows people to focus on the content of their work instead of the mechanics of typing it.",
  "Clear writing reflects clear thinking. When you can explain a complex idea simply, you usually understand it well enough to apply it in new and unexpected situations.",
];

export function getRandomPassage() {
  return TYPING_PASSAGES[Math.floor(Math.random() * TYPING_PASSAGES.length)];
}
