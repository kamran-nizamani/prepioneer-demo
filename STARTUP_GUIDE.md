# 🚀 PrepPioneer - Complete Startup Guide

## ✅ Pre-Flight Checklist

Before starting the application, ensure:

- [ ] Node.js installed (v18 or higher)
- [ ] PostgreSQL OR SQLite ready
- [ ] All environment variables configured in `server/.env`
- [ ] Dependencies installed in both server and client

---

## 📋 Step-by-Step Startup Instructions

### **Step 1: Environment Configuration**

Ensure `server/.env` file exists with these variables:

```env
# Server Configuration
PORT=5000
CLIENT_URL=http://localhost:5173

# Database (SQLite for development, PostgreSQL for production)
DATABASE_URL="file:./dev.db"
# For PostgreSQL: DATABASE_URL="postgresql://user:password@localhost:5432/preppioneer"

# JWT Secret (CHANGE THIS!)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_2024

# OpenAI API Key (required for AI features)
OPENAI_API_KEY=YOUR_GPT_4_API_KEY_HERE

# Twilio WhatsApp (optional - for notifications)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

---

### **Step 2: Backend Setup**

Open **Terminal 1** (PowerShell) and run:

```powershell
# Navigate to server directory
cd "C:\Users\UBEDULLAH\Desktop\New folder\prepioneer-project\server"

# Install dependencies (if not already installed)
npm install

# Generate Prisma Client
npx prisma generate

# Create/Update database schema
npx prisma migrate dev --name initial_setup

# Seed database with admin, instructor, students, and questions
npx prisma db seed

# Start the backend server
npm run dev
```

**Expected Output:**
```
✅ Database connected successfully
🚀 Server running on port 5000
📡 Accepting requests from http://localhost:5173
🕐 Starting daily quiz scheduler...
✅ Daily quiz scheduler started (runs at 9:00 AM every day)
```

**✅ Leave Terminal 1 running!**

---

### **Step 3: Frontend Setup**

Open **Terminal 2** (PowerShell) and run:

```powershell
# Navigate to client directory
cd "C:\Users\UBEDULLAH\Desktop\New folder\prepioneer-project\client"

# Install dependencies (if not already installed)
npm install

# Start the frontend development server
npm run dev
```

**Expected Output:**
```
VITE v5.0.0  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**✅ Leave Terminal 2 running!**

---

### **Step 4: Access the Application**

Open your browser and navigate to:

**🌐 http://localhost:5173**

You should see the PrepPioneer login page.

---

## 🔑 Test Login Credentials

Use these seeded accounts to test the platform:

### **Admin Account**
- **Email**: admin@preppioneer.com
- **Password**: AdminPassword123
- **Access**: Full platform control, user management

### **Instructor Account**
- **Email**: instructor@preppioneer.com
- **Password**: InstructorPass123
- **Access**: Question creation, student performance monitoring

### **Student Accounts**
- **Email**: student1@preppioneer.com
- **Password**: StudentPass123
- **Access**: Test taking, results viewing

- **Email**: student2@preppioneer.com
- **Password**: StudentPass123
- **Access**: Test taking, results viewing

---

## 🧪 Quick Feature Test

### **Test 1: Login as Student**
1. Navigate to http://localhost:5173/login
2. Login with student1@preppioneer.com / StudentPass123
3. You should see the student dashboard
4. ✅ Authentication works!

### **Test 2: Admin Dashboard**
1. Logout (if logged in as student)
2. Login with admin@preppioneer.com / AdminPassword123
3. Click "Admin Dashboard" button
4. Navigate to `/admin`
5. You should see:
   - Platform health metrics (4 users, 0 tests initially)
   - User management table with all 4 seeded users
   - Ability to change user roles
6. ✅ Admin features work!

### **Test 3: Instructor Dashboard**
1. Login with instructor@preppioneer.com / InstructorPass123
2. Click "Instructor Dashboard" button
3. Navigate to `/instructor`
4. You should see:
   - Platform overview metrics
   - Question creation form
   - Student performance table (empty initially)
5. Try creating a new question
6. ✅ Instructor features work!

### **Test 4: Create and Take a Test** (Requires OpenAI API Key)
1. Login as student1@preppioneer.com
2. Click "Create Test" or navigate to `/test-setup`
3. Select:
   - Subject: Physics
   - Difficulty: 3
   - Questions: 5
4. Click "Generate Test"
5. AI will generate 5 Physics questions
6. Take the test and submit answers
7. View detailed results with scores and feedback
8. ✅ AI test generation works!

### **Test 5: LAT Essay Grader** (Requires OpenAI API Key)
1. Login as any student
2. Navigate to "LAT Essay Grader"
3. Write a sample essay
4. Submit for grading
5. Receive AI-powered feedback with score
6. ✅ Essay grading works!

---

## 🐛 Troubleshooting

### **Problem: Backend won't start**

**Error**: "Cannot find module '@prisma/client'"
```powershell
cd server
npm install
npx prisma generate
npm run dev
```

**Error**: "Database connection failed"
```powershell
cd server
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### **Problem: Frontend won't start**

**Error**: "Cannot find module 'vite'"
```powershell
cd client
npm install
npm run dev
```

**Error**: "Port 5173 already in use"
```powershell
# Kill the process using port 5173
netstat -ano | findstr :5173
taskkill /PID <PID_NUMBER> /F
# Then restart
npm run dev
```

### **Problem: Login fails with "Network Error"**

**Cause**: Backend server not running or wrong URL

**Solution**:
1. Ensure backend is running on port 5000
2. Check Terminal 1 for errors
3. Verify `CLIENT_URL` in server/.env is http://localhost:5173
4. Check browser console for specific errors

### **Problem: "Invalid OpenAI API Key"**

**Cause**: OPENAI_API_KEY not set or invalid

**Solution**:
1. Get API key from https://platform.openai.com/api-keys
2. Update `server/.env`:
   ```env
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
   ```
3. Restart backend server

### **Problem: Seeding fails**

**Error**: "Unique constraint violation"

**Solution**: Database already seeded. Skip seeding or reset:
```powershell
cd server
npx prisma migrate reset  # ⚠️ Deletes all data
```

---

## 📊 Platform Features Checklist

### **Core Features**
- [x] User registration and authentication (JWT)
- [x] Role-based access control (Student, Instructor, Admin)
- [x] Protected routes with middleware
- [x] SQLite database with Prisma ORM

### **AI Features**
- [x] GPT-4 powered question generation
- [x] Adaptive difficulty questions
- [x] LAT essay AI grading
- [x] Personalized feedback

### **Student Features**
- [x] Test setup and configuration
- [x] Interactive test-taking interface
- [x] Countdown timer
- [x] Instant scoring and results
- [x] Detailed answer review
- [x] Performance analytics dashboard
- [x] Category-wise performance tracking

### **Instructor Features**
- [x] Manual question creation
- [x] Student performance monitoring
- [x] Category analytics
- [x] Platform overview metrics

### **Admin Features**
- [x] User management (view all users)
- [x] Role assignment and modification
- [x] Platform health metrics
- [x] System-wide analytics

### **External Integrations**
- [x] WhatsApp messaging (Twilio)
- [x] Automated daily quiz scheduler
- [x] Test reminder notifications
- [x] Result delivery via WhatsApp

---

## 🔄 Database Reset (If Needed)

If you encounter database issues, you can completely reset:

```powershell
cd server

# NUCLEAR OPTION - Deletes ALL data!
npx prisma migrate reset

# This will:
# 1. Drop the database
# 2. Create new database
# 3. Run all migrations
# 4. Automatically seed with initial data
```

Then restart the server:
```powershell
npm run dev
```

---

## 🎯 Quick Start Commands (Copy-Paste Ready)

### **Terminal 1 - Backend**
```powershell
cd "C:\Users\UBEDULLAH\Desktop\New folder\prepioneer-project\server" ; npm install ; npx prisma generate ; npx prisma migrate dev ; npx prisma db seed ; npm run dev
```

### **Terminal 2 - Frontend**
```powershell
cd "C:\Users\UBEDULLAH\Desktop\New folder\prepioneer-project\client" ; npm install ; npm run dev
```

---

## 📚 Additional Resources

- **Full Documentation**: See all `.md` files in project root
- **API Documentation**: `TEST_API.md`
- **Testing Guide**: `ADMIN_INSTRUCTOR_TESTING.md`
- **Deployment Guide**: `DEPLOYMENT_GUIDE.md`
- **Database Schema**: `DATABASE_SCHEMA.md`

---

## 🎉 You're Ready to Go!

PrepPioneer should now be running at:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000

**Login with admin account and start exploring! 🚀**

---

## 💡 Pro Tips

1. **Keep both terminals running** - Don't close them
2. **Check terminal logs** - They show helpful error messages
3. **Use browser DevTools** - Check Console for frontend errors
4. **Test incrementally** - Start with login, then move to other features
5. **Change default passwords** - Especially before production!

---

**Happy Teaching & Learning! 📚✨**
