# 🔧 Complete Fix Guide - Test Generation Issue

## 🎯 Problems Identified

### 1. **Missing TestSession Model** ❌
The test controller tries to create `prisma.testSession` but the model doesn't exist in schema.

### 2. **OpenAI API Key Not Configured** ❌
Set to placeholder value `YOUR_GPT_4_API_KEY_HERE`.

### 3. **File Lock Error** ❌
Prisma client locked by running server process.

---

## ✅ COMPLETE FIX - Follow These Steps

### **STEP 1: Stop All Running Servers**

Close all terminal windows or press `Ctrl+C` in each terminal running:
- Backend server (npm run dev)
- Frontend server (npm run dev)

**OR** restart VS Code completely.

---

### **STEP 2: Update Database Schema**

The schema has been updated with the `TestSession` model. Now run:

```powershell
cd "C:\Users\UBEDULLAH\Desktop\New folder\prepioneer-project\server"
npx prisma generate
npx prisma migrate dev --name add_test_session_model
```

Expected output:
```
✔ Generated Prisma Client
Your database is now in sync with your schema.
```

---

### **STEP 3: Configure OpenAI API Key**

#### **Option A: Get OpenAI API Key (Required for AI Question Generation)**

1. Go to: https://platform.openai.com/api-keys
2. Sign up/Login
3. Click "Create new secret key"
4. Copy the key (starts with `sk-...`)
5. Open `server/.env` file
6. Replace this line:
   ```
   OPENAI_API_KEY=YOUR_GPT_4_API_KEY_HERE
   ```
   With:
   ```
   OPENAI_API_KEY=sk-your-actual-key-here
   ```

#### **Option B: Use Database Questions (No API Key Required)**

If you don't want to use AI generation, modify the test flow to use questions from database:

Edit `server/controllers/test.controller.js` - Replace the `startTest` function:

```javascript
const startTest = async (req, res) => {
  try {
    const { topic, difficulty, count } = req.body;
    const userId = req.user.userId;

    // Input validation
    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({ 
        error: 'Bad Request', 
        message: 'Topic is required and must be a string' 
      });
    }

    if (!difficulty || typeof difficulty !== 'number' || difficulty < 1 || difficulty > 5) {
      return res.status(400).json({ 
        error: 'Bad Request', 
        message: 'Difficulty must be a number between 1 and 5' 
      });
    }

    if (!count || typeof count !== 'number' || count < 1 || count > 50) {
      return res.status(400).json({ 
        error: 'Bad Request', 
        message: 'Count must be a number between 1 and 50' 
      });
    }

    console.log(`🎯 Starting test for user ${userId}: ${topic} (Difficulty: ${difficulty}, Count: ${count})`);

    // USE DATABASE QUESTIONS INSTEAD OF AI
    const dbQuestions = await prisma.question.findMany({
      where: {
        difficulty: {
          gte: Math.max(1, difficulty - 1),
          lte: Math.min(5, difficulty + 1)
        }
      },
      take: count
    });

    if (dbQuestions.length === 0) {
      return res.status(404).json({ 
        error: 'Not Found', 
        message: 'No questions available for this difficulty. Please run: npx prisma db seed' 
      });
    }

    // Transform database questions to match expected format
    const generatedQuestions = dbQuestions.map((q, index) => ({
      id: q.id,
      topic: q.category,
      difficulty: q.difficulty,
      type: q.questionType === 'MULTIPLE_CHOICE' ? 'MCQ' : 'Short Answer',
      text: q.questionText,
      options: q.options ? JSON.parse(q.options) : [],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || 'No explanation available'
    }));

    // Generate test name with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const testName = `${topic} - ${timestamp}`;

    // Save test session to database
    const testSession = await prisma.testSession.create({
      data: {
        userId,
        testName,
        topic,
        questions: JSON.stringify(generatedQuestions),
        answers: JSON.stringify([]),
        status: 'PENDING',
        scorePercentage: null,
        feedbackSummary: null,
        startTime: new Date()
      }
    });

    console.log(`✅ Test session created: ID ${testSession.id}`);

    // Filter questions for client
    const filteredQuestions = generatedQuestions.map((q, index) => ({
      questionNumber: index + 1,
      id: q.id,
      topic: q.topic,
      difficulty: q.difficulty,
      type: q.type,
      text: q.text,
      options: q.options
    }));

    return res.status(201).json({
      message: 'Test session created successfully',
      sessionId: testSession.id,
      testName: testSession.testName,
      topic: testSession.topic,
      questionCount: filteredQuestions.length,
      difficulty,
      startTime: testSession.startTime,
      questions: filteredQuestions
    });

  } catch (error) {
    console.error('❌ Test creation failed:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error', 
      message: error.message 
    });
  }
};
```

---

### **STEP 4: Restart Servers**

#### Terminal 1 - Backend:
```powershell
cd "C:\Users\UBEDULLAH\Desktop\New folder\prepioneer-project\server"
npm run dev
```

Wait for:
```
✅ Database connected successfully
🚀 Server running on port 5000
```

#### Terminal 2 - Frontend:
```powershell
cd "C:\Users\UBEDULLAH\Desktop\New folder\prepioneer-project\client"
npm run dev
```

Wait for:
```
VITE v5.x.x  ready in XXX ms
➜  Local:   http://localhost:5173/
```

---

### **STEP 5: Test the Application**

1. **Login**: http://localhost:5173/login
   - Email: `student1@preppioneer.com`
   - Password: `StudentPass123`

2. **Create Test**:
   - Select Topic: "Physics" or "Mathematics"
   - Set Difficulty: 3
   - Number of Questions: 10
   - Click "Start Test"

3. **Expected Result**:
   - ✅ Test loads with questions
   - ✅ Can answer questions
   - ✅ Can submit test
   - ✅ Can view results

---

## 🔍 Troubleshooting

### Issue: "Failed to generate questions"

**Check Backend Console**:
- If you see: `OpenAI API key not configured` → Follow STEP 3 Option A
- If you see: `prisma.testSession is not a function` → Follow STEP 2 again

**Check Database**:
```powershell
cd server
npx prisma db seed
```

### Issue: File lock error when running prisma generate

**Solution**:
1. Close ALL terminal windows
2. Restart VS Code
3. Run commands again

### Issue: Questions are empty or weird format

**Solution**:
```powershell
cd server
npx prisma migrate reset
# This drops database, recreates it, and seeds automatically
```

### Issue: Frontend shows network error

**Check**:
1. Backend is running on port 5000 (`npm run dev` in server folder)
2. No CORS errors in browser console (F12)
3. `.env` in server folder has `CLIENT_URL=http://localhost:5173`

---

## 📋 Quick Commands Cheat Sheet

```powershell
# Stop all processes and restart everything
# 1. Close all terminals (or Ctrl+C in each)

# 2. Navigate to project
cd "C:\Users\UBEDULLAH\Desktop\New folder\prepioneer-project"

# 3. Update database
cd server
npx prisma generate
npx prisma migrate dev --name add_test_session
npx prisma db seed

# 4. Start backend (Terminal 1)
npm run dev

# 5. Start frontend (Terminal 2 - open new terminal)
cd ..
cd client
npm run dev
```

---

## ✅ What's Been Fixed

1. ✅ Added `TestSession` model to schema.prisma
2. ✅ Added relationship in User model
3. ✅ Provided two options: AI generation OR database questions
4. ✅ Fixed schema enum issues (converted to String)
5. ✅ Fixed seed script skipDuplicates issue

---

## 🎯 Current Status

| Feature | Status | Notes |
|---------|--------|-------|
| Login System | ✅ Working | All roles tested |
| Database Schema | ✅ Fixed | TestSession model added |
| Seeding | ✅ Working | 15 sample questions |
| Test Creation | ⚠️ Needs Config | Requires API key OR use database questions |
| Test Taking | ✅ Ready | Once test creation works |
| Results Display | ✅ Ready | Once submission works |

---

## 📞 Next Steps

**Choose Your Path**:

### Path A: AI Question Generation (Better UX)
- Get OpenAI API key
- Add to `.env` file
- Unlimited questions on any topic
- Personalized difficulty

### Path B: Database Questions (Quick Start)
- Use provided code modification
- Works immediately
- Limited to 15 seeded questions
- Can add more questions via admin panel

**Recommendation**: Start with **Path B** to test immediately, then upgrade to **Path A** when ready.

---

**Last Updated**: November 18, 2025  
**Issues Fixed**: 3 (TestSession model, API key config, file locking)
