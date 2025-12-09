# 🔥 EMERGENCY FIX - Test Generation Not Working

## Problem: "An error occurred while starting the test"

### Root Cause Analysis:
1. Backend server may not have Prisma client regenerated
2. TestSession model not in database
3. Backend might be running but not responding

---

## ✅ COMPLETE FIX - Copy & Paste These Commands

### Part 1: Clean Setup (Run in ONE PowerShell window)

```powershell
# Kill all node processes
taskkill /F /IM node.exe 2>$null

# Navigate to project
cd "C:\Users\UBEDULLAH\Desktop\New folder\prepioneer-project"

# Go to server
cd server

# Delete old Prisma client
Remove-Item -Path "node_modules\.prisma" -Recurse -Force -ErrorAction SilentlyContinue

# Regenerate everything
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

**Expected output:**
```
✔ Generated Prisma Client
Database migrations complete
✅ Admin created: admin@preppioneer.com
✅ Instructor created: instructor@preppioneer.com
✅ Students created: student1@..., student2@...
✅ Created 15 sample questions
```

---

### Part 2: Start Backend (Keep this window open)

```powershell
cd "C:\Users\UBEDULLAH\Desktop\New folder\prepioneer-project\server"
npm run dev
```

**Must see:**
```
✅ Database connected successfully
🚀 Server running on port 5000
📡 Accepting requests from http://localhost:5173
```

**If it hangs after "starting node server.js":**
- Press Ctrl+C
- Run: `npx prisma generate`
- Run: `npm run dev` again

---

### Part 3: Start Frontend (Open NEW PowerShell)

```powershell
cd "C:\Users\UBEDULLAH\Desktop\New folder\prepioneer-project\client"  
npm run dev
```

**Must see:**
```
VITE v5.x.x  ready in XXX ms
➜  Local:   http://localhost:5173/
```

---

### Part 4: Test Backend is Alive

Open **ANOTHER NEW PowerShell** and run:

```powershell
curl http://localhost:5000/api/status
```

**Expected:** `{"message":"Server Running Smoothly"}`

**If it fails:** Backend is not running properly. Go back to Part 2.

---

### Part 5: Test in Browser

1. Go to: **http://localhost:5173/login**

2. Login:
   - Email: `student1@preppioneer.com`
   - Password: `StudentPass123`

3. Dashboard loads → Click "Start New Test"

4. Configure test:
   - **Select Topic**: "Mathematics - Algebra"  
   - **Difficulty Level**: 3
   - **Number of Questions**: 10

5. Click **"Start Test"** button

6. **Expected Result**:
   - ✅ Loading spinner appears
   - ✅ Test loads with 10 questions
   - ✅ Each question has 4 options
   - ✅ Timer starts
   - ✅ Can select answers

---

## 🔍 Debugging - If Still Broken

### Check 1: Is Backend Running?

```powershell
netstat -ano | findstr :5000
```

**Should show:** `LISTENING` on port 5000

**If empty:** Backend not running. Go to Part 2.

---

### Check 2: Check Browser Console

1. Press `F12` in browser
2. Go to "Console" tab
3. Try creating test again
4. Look for errors:

**If you see:**
- `Network Error` or `ERR_CONNECTION_REFUSED` → Backend not running
- `500 Internal Server Error` → Check backend console for error
- `Failed to generate questions` → Check backend logs

---

### Check 3: Check Backend Logs

Look at the terminal running backend server. When you click "Start Test", you should see:

```
🎯 Starting test for user X: Mathematics - Algebra (Difficulty: 3, Count: 10)
📚 Using database questions...
✅ Loaded 10 questions from database
✅ Test session created: ID clxxx...
```

**If you see error instead**, copy the FULL error message.

---

## 🆘 Nuclear Option - Complete Reset

If nothing works, do this:

```powershell
# Stop everything
taskkill /F /IM node.exe

# Go to server
cd "C:\Users\UBEDULLAH\Desktop\New folder\prepioneer-project\server"

# Complete database reset
npx prisma migrate reset

# This will ask: "Are you sure? (y/N)"
# Type: y
# Then press Enter

# Wait for:
# - Database dropped
# - Migrations applied  
# - Seed completed automatically

# Start backend
npm run dev
```

Then go to Part 3 (start frontend).

---

## 📊 What Should Work After Fix

| Feature | Status |
|---------|--------|
| Login | ✅ Working |
| Dashboard | ✅ Working |
| Test Creation | ✅ Working (uses DB questions) |
| Test Taking | ✅ Working |
| Question Display | ✅ Working |
| Answer Selection | ✅ Working |
| Test Submission | ✅ Working |
| Results Display | ✅ Working |
| Score Calculation | ✅ Working |

---

## 🎯 Test Data Available

After seeding, you have **15 questions** in database:

- **Physics**: 4 questions (difficulty 2-5)
- **Biology**: 3 questions (difficulty 2-3)
- **Mathematics**: 3 questions (difficulty 2-4)  
- **Chemistry**: 3 questions (difficulty 2-4)
- **History**: 2 questions (difficulty 2-3)

When you request a test:
- System finds questions with difficulty ±1 of your selection
- Returns up to the requested count
- Randomizes order

---

## 📞 Login Credentials Reference

```
ADMIN:
Email: admin@preppioneer.com
Password: AdminPassword123
Can: Manage users, view all tests

INSTRUCTOR:
Email: instructor@preppioneer.com
Password: InstructorPass123
Can: Create questions, view student results

STUDENT 1:
Email: student1@preppioneer.com
Password: StudentPass123
Can: Take tests, view own results

STUDENT 2:
Email: student2@preppioneer.com
Password: StudentPass123
Can: Take tests, view own results
```

---

## ✅ Success Indicators

You'll know it's working when:

1. **Backend Terminal shows:**
   ```
   ✅ Database connected successfully
   🚀 Server running on port 5000
   ```

2. **Frontend Terminal shows:**
   ```
   ➜  Local:   http://localhost:5173/
   ```

3. **Browser shows:**
   - Login page loads fast
   - No errors in F12 console
   - After login, dashboard appears
   - "Start New Test" button visible

4. **Test Creation shows:**
   - Form loads
   - All dropdowns work
   - "Start Test" button enabled
   - After clicking, loading spinner appears
   - Test page loads with questions

---

## 🎉 Final Check

Run this command to verify everything:

```powershell
# Test backend
curl http://localhost:5000/api/status

# Should return:
# {"message":"Server Running Smoothly"}
```

If you get this response, backend is working perfectly!

---

**Last Updated**: November 18, 2025 - 16:00  
**Status**: All fixes applied, test generation uses database questions  
**Next**: Run Part 1, then Part 2, then Part 3, then Part 5
