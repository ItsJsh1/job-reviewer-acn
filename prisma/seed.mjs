// Run with: npx prisma db seed
// Populates a fresh database with the same starter reviewers/questions the
// in-memory store (lib/store.js) ships with, so switching to a real
// database doesn't leave you with an empty Admin/Reviewers page.

import { PrismaClient } from "@prisma/client";
import { seedReviewers } from "../lib/seedData.js";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.reviewer.count();
  if (existing > 0) {
    console.log(`Database already has ${existing} reviewer(s) — skipping seed.`);
    return;
  }

  for (const r of seedReviewers) {
    await prisma.reviewer.create({
      data: {
        title: r.title,
        category: r.category,
        subType: r.subType,
        questions: {
          create: r.questions.map((q, i) => ({
            prompt: q.prompt,
            type: q.type,
            rubric: q.rubric || null,
            options: q.options || null,
            order: i,
          })),
        },
      },
    });
  }

  console.log(`Seeded ${seedReviewers.length} reviewers.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
