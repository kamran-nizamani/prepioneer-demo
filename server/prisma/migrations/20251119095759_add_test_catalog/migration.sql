-- CreateTable
CREATE TABLE "test_catalog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "acronym" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "conductingBody" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_questions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "questionType" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "options" TEXT,
    "correctAnswer" TEXT NOT NULL,
    "explanation" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "testCatalogId" INTEGER,
    CONSTRAINT "questions_testCatalogId_fkey" FOREIGN KEY ("testCatalogId") REFERENCES "test_catalog" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_questions" ("category", "correctAnswer", "createdAt", "difficulty", "explanation", "id", "options", "questionText", "questionType") SELECT "category", "correctAnswer", "createdAt", "difficulty", "explanation", "id", "options", "questionText", "questionType" FROM "questions";
DROP TABLE "questions";
ALTER TABLE "new_questions" RENAME TO "questions";
CREATE TABLE "new_test_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "testName" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "questions" TEXT NOT NULL,
    "answers" TEXT NOT NULL,
    "testCatalogId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "scorePercentage" REAL,
    "feedbackSummary" TEXT,
    "startTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "test_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "test_sessions_testCatalogId_fkey" FOREIGN KEY ("testCatalogId") REFERENCES "test_catalog" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_test_sessions" ("answers", "createdAt", "endTime", "feedbackSummary", "id", "questions", "scorePercentage", "startTime", "status", "testName", "topic", "updatedAt", "userId") SELECT "answers", "createdAt", "endTime", "feedbackSummary", "id", "questions", "scorePercentage", "startTime", "status", "testName", "topic", "updatedAt", "userId" FROM "test_sessions";
DROP TABLE "test_sessions";
ALTER TABLE "new_test_sessions" RENAME TO "test_sessions";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "test_catalog_title_key" ON "test_catalog"("title");
