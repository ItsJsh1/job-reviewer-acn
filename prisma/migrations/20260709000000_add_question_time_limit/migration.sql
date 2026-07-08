-- Add optional per-question timer support for reviewers.
ALTER TABLE "Question"
ADD COLUMN "timeLimitSeconds" INTEGER;
