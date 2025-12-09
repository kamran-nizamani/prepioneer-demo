# 📚 Database Schema Documentation - Question Bank & Test Sessions

## 🎯 Overview

This document describes the database models for the PrepPioneer question bank and test tracking system.

---

## 📊 Database Models

### 1. **User Model** (Updated)

Extended to include relationship with test sessions.

```prisma
model User {
  id           Int           @id @default(autoincrement())
  email        String        @unique
  name         String
  passwordHash String
  role         Role          @default(STUDENT)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  
  // Relationships
  testSessions TestSession[]
}
```

**Fields:**
- `id`: Primary key
- `email`: Unique email address
- `name`: User's full name
- `passwordHash`: Encrypted password
- `role`: STUDENT | INSTRUCTOR | ADMIN | INSTITUTIONAL_PARTNER
- `testSessions`: All test attempts by this user

---

### 2. **Question Model** (NEW)

Stores exam questions with metadata for adaptive learning.

```prisma
model Question {
  id             Int      @id @default(autoincrement())
  topic          String
  difficulty     Int
  type           String
  text           String
  options        String   // JSON array stored as string
  correctAnswer  String
  explanation    String
  createdAt      DateTime @default(now())
}
```

**Fields:**

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | Int | Primary key | 1, 2, 3... |
| `topic` | String | Subject/topic category | "Physics - Current Electricity" |
| `difficulty` | Int | Difficulty level (1-5) | 3 |
| `type` | String | Question type | "MCQ", "Long Answer" |
| `text` | String | Question text | "What is Ohm's Law?" |
| `options` | String | JSON array of choices | `["V=IR", "P=VI", "R=V/I", "I=V/R"]` |
| `correctAnswer` | String | Correct option | "V=IR" |
| `explanation` | String | Why the answer is correct | "Ohm's Law states..." |
| `createdAt` | DateTime | Creation timestamp | 2025-11-17T... |

**Example Question JSON Structure:**
```json
{
  "id": 1,
  "topic": "Physics - Current Electricity",
  "difficulty": 3,
  "type": "MCQ",
  "text": "What is Ohm's Law?",
  "options": ["V=IR", "P=VI", "R=V/I", "I=V/R"],
  "correctAnswer": "V=IR",
  "explanation": "Ohm's Law states that voltage (V) equals current (I) times resistance (R).",
  "createdAt": "2025-11-17T10:00:00Z"
}
```

**Usage:**
- AI will generate questions in this format
- Used for MDCAT, LAT, and custom tests
- Difficulty used for adaptive test generation
- Topic used for targeted practice

---

### 3. **TestSession Model** (NEW)

Tracks student test attempts and performance.

```prisma
model TestSession {
  id              Int      @id @default(autoincrement())
  userId          Int
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  testName        String
  topic           String
  questions       String   // JSON: Array of question objects
  answers         String   // JSON: Array of student answers
  scorePercentage Float?
  status          String
  feedbackSummary String?
  
  startTime       DateTime @default(now())
  endTime         DateTime?
}
```

**Fields:**

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | Int | Primary key | 1, 2, 3... |
| `userId` | Int | Foreign key to User | 5 |
| `user` | User | User relationship | {...} |
| `testName` | String | Name of the test | "MDCAT Physics Mock Test 1" |
| `topic` | String | Primary subject | "Physics" |
| `questions` | String | JSON array of questions | `[{id:1, text:"...", ...}, ...]` |
| `answers` | String | JSON array of answers | `[{questionId:1, answer:"V=IR"}, ...]` |
| `scorePercentage` | Float? | Final score | 85.5 |
| `status` | String | Test status | "PENDING", "COMPLETED", "FAILED" |
| `feedbackSummary` | String? | AI-generated feedback | "Weak in: Thermodynamics..." |
| `startTime` | DateTime | When test started | 2025-11-17T10:00:00Z |
| `endTime` | DateTime? | When test submitted | 2025-11-17T11:30:00Z |

**Status Values:**
- `PENDING`: Test started but not completed
- `COMPLETED`: Test finished and graded
- `FAILED`: Test abandoned or error occurred

**Example TestSession:**
```json
{
  "id": 1,
  "userId": 5,
  "testName": "MDCAT Physics Mock Test 1",
  "topic": "Physics",
  "questions": [
    {
      "id": 1,
      "text": "What is Ohm's Law?",
      "options": ["V=IR", "P=VI", "R=V/I", "I=V/R"],
      "correctAnswer": "V=IR"
    }
  ],
  "answers": [
    {
      "questionId": 1,
      "selectedAnswer": "V=IR",
      "isCorrect": true,
      "timeSpent": 45
    }
  ],
  "scorePercentage": 85.5,
  "status": "COMPLETED",
  "feedbackSummary": "Strong performance! Review: Thermodynamics concepts.",
  "startTime": "2025-11-17T10:00:00Z",
  "endTime": "2025-11-17T11:30:00Z"
}
```

---

## 🔗 Relationships

```
User (1) ----< (Many) TestSession
  ↑
  |
  └── One user can have many test sessions
```

**Cascade Deletion:**
- When a user is deleted, all their test sessions are automatically deleted

---

## 🎯 Use Cases

### Question Bank:
1. **AI Generation**: GPT generates questions in the `Question` format
2. **Manual Creation**: Instructors can add questions via admin panel
3. **Test Generation**: System selects questions by topic/difficulty
4. **Adaptive Learning**: Adjust difficulty based on performance

### Test Sessions:
1. **Track Progress**: Monitor student performance over time
2. **Immutable Record**: Questions stored in JSON (can't be changed after test)
3. **Performance Analysis**: Calculate scores and identify weak areas
4. **AI Feedback**: Generate personalized improvement suggestions
5. **Resume Tests**: Track `status` to allow resuming incomplete tests

---

## 📝 JSON Structure Examples

### Questions Field (in TestSession):
```json
[
  {
    "id": 1,
    "topic": "Physics - Current Electricity",
    "difficulty": 3,
    "text": "What is Ohm's Law?",
    "options": ["V=IR", "P=VI", "R=V/I", "I=V/R"],
    "correctAnswer": "V=IR"
  },
  {
    "id": 2,
    "topic": "Physics - Thermodynamics",
    "difficulty": 4,
    "text": "What is the first law of thermodynamics?",
    "options": ["Energy is conserved", "Entropy increases", "Heat flows hot to cold", "Work = Force × Distance"],
    "correctAnswer": "Energy is conserved"
  }
]
```

### Answers Field (in TestSession):
```json
[
  {
    "questionId": 1,
    "selectedAnswer": "V=IR",
    "isCorrect": true,
    "timeSpent": 45
  },
  {
    "questionId": 2,
    "selectedAnswer": "Entropy increases",
    "isCorrect": false,
    "timeSpent": 120
  }
]
```

---

## 🔧 Prisma Operations

### Create a Question:
```javascript
const question = await prisma.question.create({
  data: {
    topic: "Physics - Current Electricity",
    difficulty: 3,
    type: "MCQ",
    text: "What is Ohm's Law?",
    options: JSON.stringify(["V=IR", "P=VI", "R=V/I", "I=V/R"]),
    correctAnswer: "V=IR",
    explanation: "Ohm's Law states that V=IR..."
  }
});
```

### Create a Test Session:
```javascript
const session = await prisma.testSession.create({
  data: {
    userId: 5,
    testName: "MDCAT Physics Mock Test 1",
    topic: "Physics",
    questions: JSON.stringify(questionsArray),
    answers: JSON.stringify([]),
    status: "PENDING"
  }
});
```

### Update Test Session (Submit):
```javascript
const updated = await prisma.testSession.update({
  where: { id: sessionId },
  data: {
    answers: JSON.stringify(answersArray),
    scorePercentage: 85.5,
    status: "COMPLETED",
    endTime: new Date()
  }
});
```

### Get User's Test History:
```javascript
const sessions = await prisma.testSession.findMany({
  where: { userId: 5 },
  include: { user: true },
  orderBy: { startTime: 'desc' }
});
```

---

## 🚀 Next Steps

With these models in place, you can now:
1. ✅ Generate questions using AI (Step 6)
2. ✅ Create test sessions for students
3. ✅ Track and grade test attempts
4. ✅ Generate personalized feedback
5. ✅ Implement adaptive learning algorithms

---

## ⚠️ Important Notes

### SQLite Limitations:
- Arrays stored as JSON strings (not native arrays)
- Parse JSON when reading: `JSON.parse(question.options)`
- Stringify when writing: `JSON.stringify(["option1", "option2"])`

### Data Integrity:
- Questions in TestSession are immutable (stored as JSON snapshot)
- Original Question records can be updated without affecting past tests
- Cascade delete ensures no orphaned test sessions

### Performance:
- Index on `userId` for faster test history queries
- Index on `topic` and `difficulty` for efficient question selection
- Consider pagination for large question banks

---

**📅 Last Updated:** November 17, 2025  
**✅ Status:** Models defined and migrated
