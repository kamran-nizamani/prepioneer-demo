# 🧪 Admin & Instructor Features Testing Guide

## Quick Test Workflow

### Step 1: Create Admin User

**Option A: Direct Database Update (Fastest)**
```powershell
cd server
npx prisma studio
# Navigate to User table
# Find your user (by email)
# Change 'role' field from 'STUDENT' to 'ADMIN'
# Save changes
```

**Option B: SQL Query**
```sql
-- In SQLite database (server/dev.db)
UPDATE User SET role = 'ADMIN' WHERE email = 'your@email.com';
```

### Step 2: Test Admin Dashboard

1. **Start servers** (if not running):
   ```powershell
   # Terminal 1: Backend
   cd server
   npm run dev

   # Terminal 2: Frontend
   cd client
   npm run dev
   ```

2. **Login as admin** user

3. **Navigate** to http://localhost:5173/admin

4. **Verify you see**:
   - Platform health metrics (4 cards)
   - User management table
   - Your user with ADMIN role

5. **Test role change**:
   - Find another user in table
   - Change dropdown from STUDENT to INSTRUCTOR
   - Verify success message appears
   - Verify role badge updates

### Step 3: Test Instructor Dashboard

1. **Keep admin logged in** or **logout and login as instructor**

2. **Navigate** to http://localhost:5173/instructor

3. **Verify you see**:
   - Platform overview (3 metrics)
   - "Create Question" button
   - Student performance table

4. **Test question creation**:
   - Click "+ Create Question"
   - Fill in form:
     - Question Type: Multiple Choice
     - Difficulty: Medium
     - Category: Mathematics
     - Question Text: "What is 2 + 2?"
     - Options: "2", "3", "4", "5"
     - Correct Answer: "4"
     - Explanation: "Basic arithmetic"
   - Click "Create Question"
   - Verify success message

### Step 4: Test Role-Based Access

1. **Logout**

2. **Login as STUDENT** (regular user)

3. **Try accessing** http://localhost:5173/admin
   - Should see "Access Denied" page with clear message

4. **Try accessing** http://localhost:5173/instructor
   - Should see "Access Denied" page

5. **Verify** regular dashboard at http://localhost:5173/dashboard
   - Should NOT see "Management Dashboards" section
   - Should see regular feature cards

---

## 📋 Comprehensive Test Checklist

### Backend API Tests

#### Admin Endpoints

**1. GET /api/admin/users**
```powershell
# Test with admin token
$token = "your_admin_jwt_token"
Invoke-RestMethod -Uri "http://localhost:5000/api/admin/users" `
  -Method GET `
  -Headers @{"Authorization"="Bearer $token"} | ConvertTo-Json
```

**Expected Response:**
```json
{
  "success": true,
  "count": 5,
  "users": [...]
}
```

**Test Cases:**
- ✅ Returns all users with admin token
- ✅ Returns 403 with instructor token
- ✅ Returns 401 with no token

**2. PATCH /api/admin/users/:userId/role**
```powershell
# Update user role
$body = @{role="INSTRUCTOR"} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5000/api/admin/users/2/role" `
  -Method PATCH `
  -ContentType "application/json" `
  -Headers @{"Authorization"="Bearer $token"} `
  -Body $body | ConvertTo-Json
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User role updated successfully",
  "user": {...}
}
```

**Test Cases:**
- ✅ Updates role successfully with valid role
- ✅ Returns 400 with invalid role ("INVALID_ROLE")
- ✅ Returns 400 when trying to change own admin role
- ✅ Returns 403 with non-admin token
- ✅ Returns 404 with non-existent user ID

**3. GET /api/admin/metrics**
```powershell
# Get platform metrics
Invoke-RestMethod -Uri "http://localhost:5000/api/admin/metrics" `
  -Method GET `
  -Headers @{"Authorization"="Bearer $token"} | ConvertTo-Json
```

**Expected Response:**
```json
{
  "success": true,
  "metrics": {
    "totalUsers": 10,
    "totalTests": 50,
    "averageScore": 75.5,
    ...
  }
}
```

**Test Cases:**
- ✅ Returns metrics with admin token
- ✅ Returns metrics with instructor token
- ✅ Returns 401 with student token

**4. POST /api/admin/content/create**
```powershell
# Create manual question
$question = @{
  questionText = "What is the capital of France?"
  questionType = "MULTIPLE_CHOICE"
  options = @("London", "Berlin", "Paris", "Madrid")
  correctAnswer = "Paris"
  difficulty = "EASY"
  category = "Geography"
  explanation = "Paris is the capital and largest city of France"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/admin/content/create" `
  -Method POST `
  -ContentType "application/json" `
  -Headers @{"Authorization"="Bearer $token"} `
  -Body $question | ConvertTo-Json
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Question created successfully",
  "test": {...},
  "question": {...}
}
```

**Test Cases:**
- ✅ Creates question with valid data (instructor/admin)
- ✅ Returns 400 with missing required fields
- ✅ Returns 400 with invalid questionType
- ✅ Returns 400 with invalid difficulty
- ✅ Returns 400 with <2 options for multiple choice
- ✅ Returns 403 with student token

**5. GET /api/admin/performance**
```powershell
# Get student performance
Invoke-RestMethod -Uri "http://localhost:5000/api/admin/performance" `
  -Method GET `
  -Headers @{"Authorization"="Bearer $token"} | ConvertTo-Json
```

**Expected Response:**
```json
{
  "success": true,
  "count": 20,
  "performance": [
    {
      "id": 1,
      "name": "Alice",
      "averageScore": 85.5,
      "weakestCategory": "Science (65%)",
      "strongestCategory": "Math (92%)"
    }
  ]
}
```

**Test Cases:**
- ✅ Returns performance with instructor token
- ✅ Returns performance with admin token
- ✅ Returns 403 with student token
- ✅ Handles students with no attempts (0%)
- ✅ Calculates category averages correctly

---

### Frontend Component Tests

#### Protected Route Component

**Test Case 1: Unauthenticated Access**
- **Action:** Navigate to /admin without login
- **Expected:** Redirect to /login

**Test Case 2: Wrong Role Access**
- **Action:** Login as STUDENT, navigate to /admin
- **Expected:** Access Denied page with clear message

**Test Case 3: Correct Role Access**
- **Action:** Login as ADMIN, navigate to /admin
- **Expected:** Admin Dashboard loads successfully

**Test Case 4: Multiple Role Access**
- **Action:** Login as INSTRUCTOR, navigate to /instructor
- **Expected:** Instructor Dashboard loads
- **Action:** Login as ADMIN, navigate to /instructor
- **Expected:** Instructor Dashboard loads

#### Admin Dashboard Component

**Test Case 1: Metrics Display**
- **Action:** Load /admin as ADMIN
- **Expected:** All 6 metrics display with correct values

**Test Case 2: User Table Display**
- **Action:** Scroll to user management section
- **Expected:** All users displayed with correct data

**Test Case 3: Role Update Success**
- **Action:** Change user role from STUDENT to INSTRUCTOR
- **Expected:** 
  - Success message appears
  - Table refreshes
  - Role badge updates

**Test Case 4: Role Update Error**
- **Action:** Try to change own admin role
- **Expected:** Error message (cannot change own role)

**Test Case 5: Loading State**
- **Action:** Refresh page
- **Expected:** Loading spinner appears, then data loads

#### Instructor Dashboard Component

**Test Case 1: Metrics Display**
- **Action:** Load /instructor as INSTRUCTOR
- **Expected:** 3 overview metrics display

**Test Case 2: Form Toggle**
- **Action:** Click "+ Create Question"
- **Expected:** Form expands
- **Action:** Click "Close Form"
- **Expected:** Form collapses

**Test Case 3: Question Creation Success**
- **Action:** Fill form with valid data, submit
- **Expected:**
  - Success message appears
  - Form resets
  - Form collapses

**Test Case 4: Question Creation Validation**
- **Action:** Submit form with missing fields
- **Expected:** Error message displays

**Test Case 5: Performance Table Display**
- **Action:** Scroll to student performance section
- **Expected:** Students sorted by average score (descending)

**Test Case 6: Empty State**
- **Action:** View performance with no student data
- **Expected:** "No data available" message displays

#### Dashboard Navigation

**Test Case 1: Admin Sees Admin Button**
- **Action:** Login as ADMIN, view dashboard
- **Expected:** "Admin Dashboard" button visible

**Test Case 2: Instructor Sees Instructor Button**
- **Action:** Login as INSTRUCTOR, view dashboard
- **Expected:** "Instructor Dashboard" button visible

**Test Case 3: Student Sees No Management Buttons**
- **Action:** Login as STUDENT, view dashboard
- **Expected:** No "Management Dashboards" section

**Test Case 4: Admin Sees Both Buttons**
- **Action:** Login as ADMIN, view dashboard
- **Expected:** Both Admin and Instructor buttons visible

**Test Case 5: Navigation Works**
- **Action:** Click "Admin Dashboard" button
- **Expected:** Navigate to /admin
- **Action:** Click "Instructor Dashboard" button
- **Expected:** Navigate to /instructor

---

## 🔒 Security Tests

### Test 1: JWT Verification
```powershell
# Try accessing admin endpoint without token
Invoke-RestMethod -Uri "http://localhost:5000/api/admin/users" `
  -Method GET
# Expected: 401 Unauthorized
```

### Test 2: Invalid Token
```powershell
# Try with invalid token
Invoke-RestMethod -Uri "http://localhost:5000/api/admin/users" `
  -Method GET `
  -Headers @{"Authorization"="Bearer invalid_token_here"}
# Expected: 403 Forbidden
```

### Test 3: Role Authorization
```powershell
# Get student token, try admin endpoint
$studentToken = "student_jwt_token"
Invoke-RestMethod -Uri "http://localhost:5000/api/admin/users" `
  -Method GET `
  -Headers @{"Authorization"="Bearer $studentToken"}
# Expected: 403 Forbidden with clear message
```

### Test 4: Self-Demotion Protection
```powershell
# Admin tries to change own role to STUDENT
$body = @{role="STUDENT"} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5000/api/admin/users/1/role" `
  -Method PATCH `
  -ContentType "application/json" `
  -Headers @{"Authorization"="Bearer $adminToken"} `
  -Body $body
# Expected: 400 Bad Request (cannot change own admin role)
```

---

## 🎯 Integration Tests

### Test Scenario 1: New Institution Setup

**Steps:**
1. ✅ Create 3 users (signup)
2. ✅ Set user1 role to ADMIN (database)
3. ✅ Login as user1
4. ✅ Access /admin dashboard
5. ✅ Change user2 role to INSTRUCTOR
6. ✅ Logout, login as user2
7. ✅ Access /instructor dashboard
8. ✅ Create manual question
9. ✅ Verify question appears in system

### Test Scenario 2: Student Performance Tracking

**Steps:**
1. ✅ Login as student (user3)
2. ✅ Take 3 tests in different categories
3. ✅ Complete all tests with varying scores
4. ✅ Logout, login as instructor (user2)
5. ✅ Access /instructor dashboard
6. ✅ View student performance table
7. ✅ Verify user3 appears with correct scores
8. ✅ Verify weakest/strongest categories calculated

### Test Scenario 3: Full Role Hierarchy

**Steps:**
1. ✅ Login as STUDENT
2. ✅ Verify cannot access /admin
3. ✅ Verify cannot access /instructor
4. ✅ Logout, login as INSTRUCTOR
5. ✅ Verify cannot access /admin
6. ✅ Verify CAN access /instructor
7. ✅ Logout, login as ADMIN
8. ✅ Verify CAN access /admin
9. ✅ Verify CAN access /instructor

---

## 📊 Expected Results Summary

### Admin Dashboard
- **Metrics Load:** <2 seconds
- **User Table:** Shows all users correctly
- **Role Update:** Instant feedback, <1 second
- **No Errors:** Clean console, no warnings

### Instructor Dashboard
- **Metrics Load:** <2 seconds
- **Form Display:** Instant toggle
- **Question Creation:** <3 seconds (with API call)
- **Performance Table:** Accurate calculations
- **No Errors:** Clean console

### API Responses
- **Success Status:** 200 (GET), 201 (POST), 200 (PATCH)
- **Error Status:** 400 (bad request), 401 (unauthorized), 403 (forbidden)
- **Response Time:** <500ms for most endpoints
- **Data Accuracy:** 100% correct calculations

---

## 🐛 Common Issues & Solutions

### Issue 1: Access Denied on /admin
**Cause:** User role is not ADMIN  
**Solution:**
```sql
UPDATE User SET role = 'ADMIN' WHERE email = 'your@email.com';
```
Then logout and login again.

### Issue 2: "Cannot read property 'role' of undefined"
**Cause:** User object not loading properly  
**Solution:** Check AuthContext is providing user data. Verify token is valid.

### Issue 3: Performance table empty
**Cause:** No students have completed tests  
**Solution:** Have students complete some tests first. Ensure tests are marked as completed.

### Issue 4: Role dropdown not responding
**Cause:** Not logged in as ADMIN  
**Solution:** Verify your role is ADMIN in database.

### Issue 5: Question creation fails
**Cause:** Missing required fields or validation error  
**Solution:** 
- Fill all required fields
- For multiple choice, provide at least 2 options
- Check difficulty and type are valid enum values

---

## ✅ Full Test Checklist

### Backend Tests (25 tests)
- [ ] GET /api/admin/users - Success (ADMIN)
- [ ] GET /api/admin/users - Forbidden (INSTRUCTOR)
- [ ] GET /api/admin/users - Unauthorized (no token)
- [ ] PATCH /api/admin/users/:id/role - Success
- [ ] PATCH /api/admin/users/:id/role - Invalid role
- [ ] PATCH /api/admin/users/:id/role - Self-demotion blocked
- [ ] PATCH /api/admin/users/:id/role - User not found
- [ ] PATCH /api/admin/users/:id/role - Forbidden (non-admin)
- [ ] GET /api/admin/metrics - Success (ADMIN)
- [ ] GET /api/admin/metrics - Success (INSTRUCTOR)
- [ ] GET /api/admin/metrics - Forbidden (STUDENT)
- [ ] POST /api/admin/content/create - Success (INSTRUCTOR)
- [ ] POST /api/admin/content/create - Success (ADMIN)
- [ ] POST /api/admin/content/create - Missing fields
- [ ] POST /api/admin/content/create - Invalid type
- [ ] POST /api/admin/content/create - Invalid difficulty
- [ ] POST /api/admin/content/create - Too few options (MC)
- [ ] POST /api/admin/content/create - Forbidden (STUDENT)
- [ ] GET /api/admin/performance - Success (INSTRUCTOR)
- [ ] GET /api/admin/performance - Success (ADMIN)
- [ ] GET /api/admin/performance - Forbidden (STUDENT)
- [ ] GET /api/admin/performance - Correct calculations
- [ ] GET /api/admin/performance - Empty state handling
- [ ] All endpoints - Invalid token
- [ ] All endpoints - Expired token

### Frontend Tests (20 tests)
- [ ] ProtectedRoute - Unauthenticated redirect
- [ ] ProtectedRoute - Wrong role access denied
- [ ] ProtectedRoute - Correct role access
- [ ] ProtectedRoute - Multiple allowed roles
- [ ] AdminDashboard - Metrics display
- [ ] AdminDashboard - User table display
- [ ] AdminDashboard - Role update success
- [ ] AdminDashboard - Role update error (self)
- [ ] AdminDashboard - Loading state
- [ ] AdminDashboard - Error handling
- [ ] InstructorDashboard - Metrics display
- [ ] InstructorDashboard - Form toggle
- [ ] InstructorDashboard - Question creation success
- [ ] InstructorDashboard - Form validation
- [ ] InstructorDashboard - Performance table
- [ ] InstructorDashboard - Empty state
- [ ] Dashboard - Admin sees admin button
- [ ] Dashboard - Instructor sees instructor button
- [ ] Dashboard - Student sees no management buttons
- [ ] Dashboard - Navigation works

### Integration Tests (3 scenarios)
- [ ] New institution setup workflow
- [ ] Student performance tracking workflow
- [ ] Full role hierarchy verification

### Security Tests (4 tests)
- [ ] JWT verification enforced
- [ ] Invalid token rejected
- [ ] Role authorization enforced
- [ ] Self-demotion protection works

---

## 🎉 Success Criteria

All tests passing indicates:
✅ **Backend:** All API endpoints functional and secure  
✅ **Frontend:** All components rendering and interactive  
✅ **Security:** Authentication and authorization working  
✅ **Integration:** Full workflows execute successfully  
✅ **Ready for Production:** Platform institutional-ready  

---

**Use this guide to systematically test all admin and instructor features!** 🚀
