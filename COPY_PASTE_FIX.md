# ⚡ COPY & PASTE - Quick Fix Commands

## 🎯 Run These Commands In Order

### 1️⃣ Close All Running Terminals
Press `Ctrl+C` in any terminal running npm/node processes.

---

### 2️⃣ Open PowerShell and Run:

```powershell
# Navigate to server directory
cd "C:\Users\UBEDULLAH\Desktop\New folder\prepioneer-project\server"

# Generate Prisma client
npx prisma generate

# Run migration to add TestSession model
npx prisma migrate dev --name add_test_session

# Seed database with questions
npx prisma db seed
```

---

### 3️⃣ Start Backend (Keep this terminal open):

```powershell
cd "C:\Users\UBEDULLAH\Desktop\New folder\prepioneer-project\server"
npm run dev
```

**Wait for**: `🚀 Server running on port 5000`

---

### 4️⃣ Open NEW PowerShell Terminal and Run:

```powershell
cd "C:\Users\UBEDULLAH\Desktop\New folder\prepioneer-project\client"
npm run dev
```

**Wait for**: `Local: http://localhost:5173/`

---

### 5️⃣ Test Login:

Open browser: **http://localhost:5173/login**

```
Email:    student1@preppioneer.com
Password: StudentPass123
```

---

### 6️⃣ Create Test:

1. Click "Start New Test"
2. Topic: `Physics` (or anything)
3. Difficulty: `3`
4. Questions: `10`
5. Click "Start Test"

**Result**: ✅ Test loads with 10 questions from database!

---

## ⚠️ If Step 2 Fails with "File Lock Error"

### Option A: Restart VS Code
1. Close VS Code completely
2. Reopen project
3. Run Step 2 again

### Option B: Manual Cleanup
```powershell
# Stop all Node processes
Stop-Process -Name "node" -Force

# Then run Step 2 again
```

---

## ✅ What You Should See

### Backend Console:
```
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
✅ Database connected successfully
🚀 Server running on port 5000
```

### Frontend Console:
```
VITE v5.0.8  ready in 500 ms
➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Browser (After Login):
- Dashboard loads
- "Start New Test" button visible
- No errors in console (F12)

---

## 🔄 Quick Reset (If Needed)

```powershell
cd "C:\Users\UBEDULLAH\Desktop\New folder\prepioneer-project\server"
npx prisma migrate reset
# This drops DB, recreates schema, and runs seed automatically
```

---

## 📞 All Login Credentials

```
Admin:
  Email: admin@preppioneer.com
  Password: AdminPassword123

Instructor:
  Email: instructor@preppioneer.com
  Password: InstructorPass123

Student 1:
  Email: student1@preppioneer.com
  Password: StudentPass123

Student 2:
  Email: student2@preppioneer.com
  Password: StudentPass123
```

---

**THAT'S IT!** Copy and run the commands above. 🚀
