-- CreateTable
CREATE TABLE "lat_essay_submissions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "topic" TEXT NOT NULL,
    "essayText" TEXT NOT NULL,
    "essayLength" INTEGER NOT NULL,
    "wordCount" INTEGER NOT NULL,
    "overallScore" REAL NOT NULL,
    "thesisScore" INTEGER NOT NULL,
    "organizationScore" INTEGER NOT NULL,
    "evidenceScore" INTEGER NOT NULL,
    "analysisScore" INTEGER NOT NULL,
    "languageScore" INTEGER NOT NULL,
    "feedback" TEXT NOT NULL,
    "sampleIntro" TEXT,
    "sampleConclusion" TEXT,
    "improvedEssay" TEXT,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "lat_essay_submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
