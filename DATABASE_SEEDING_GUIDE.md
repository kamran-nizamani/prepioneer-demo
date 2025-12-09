# 🌱 PrepPioneer Database Seeding Guide

## 📋 Overview

This guide explains how to populate your PrepPioneer database with essential initial data, including admin users, instructor accounts, sample students, and a comprehensive question bank. This seeding process ensures the platform is immediately functional upon deployment.

---

## 🎯 What Gets Seeded

### 1. **User Accounts**

| Role | Email | Password | Name |
|------|-------|----------|------|
| **ADMIN** | admin@preppioneer.com | AdminPassword123 | Super Admin |
| **INSTRUCTOR** | instructor@preppioneer.com | InstructorPass123 | John Instructor |
| **STUDENT** | student1@preppioneer.com | StudentPass123 | Alice Student |
| **STUDENT** | student2@preppioneer.com | StudentPass123 | Bob Student |

### 2. **Sample Questions (15 Total)**

- **Physics** (4 questions): Force, Newton's Laws, Light, Einstein's E=mc²
- **Biology** (3 questions): Cell structure, DNA, Photosynthesis
- **Mathematics** (3 questions): Pi, Functions, Square roots
- **Chemistry** (3 questions): Water formula, pH levels, Reactivity
- **History** (2 questions): World War II, US Presidents

### 3. **Sample Test**

- **Title**: "Sample Science & Math Quiz"
- **Subject**: Mixed Sciences
- **Questions**: 5 questions from Physics, Biology, and Mathematics
- **Created By**: Instructor account

---

## 🚀 How to Run the Seed Script

### **Prerequisites**

1. Database must be set up and migrated:
   ```powershell
   cd server
   npx prisma migrate dev
   ```

2. Environment variables configured in `server/.env`:
   ```env
   DATABASE_URL="your-database-connection-string"
   JWT_SECRET="your-secret-key"
   ```

### **Seeding Command**

Run the following command from the **server directory**:

```powershell
cd server
npx prisma db seed
```

### **Expected Output**

```
🌱 Starting database seeding...
👤 Creating Super Admin account...
✅ Admin created: admin@preppioneer.com (ID: 1)
👨‍🏫 Creating Instructor account...
✅ Instructor created: instructor@preppioneer.com (ID: 2)
🎓 Creating sample student accounts...
✅ Students created: student1@preppioneer.com, student2@preppioneer.com
📚 Creating sample questions...
✅ Created 15 sample questions across multiple categories.
📝 Creating sample test...
✅ Sample test created: Sample Science & Math Quiz (ID: sample-test-001)

🎉 Database seeding completed successfully!

📋 Summary:
   - Admin account: admin@preppioneer.com / AdminPassword123
   - Instructor account: instructor@preppioneer.com / InstructorPass123
   - Student accounts: student1@preppioneer.com, student2@preppioneer.com / StudentPass123
   - Sample questions: 15 questions across 5 categories
   - Sample test: Mixed Sciences quiz

🚀 You can now start the application and log in with these credentials!
```

---

## 🔄 Re-running the Seed Script

The seed script uses **`upsert`** operations, which means:

- ✅ **Safe to run multiple times** - Won't create duplicate users
- ✅ **Idempotent** - Running twice produces the same result
- ✅ **Skips existing questions** - Checks if questions exist before creating

If you want to **completely reset** the database:

```powershell
# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# This will:
# 1. Drop the database
# 2. Create a new database
# 3. Run all migrations
# 4. Automatically run the seed script
```

---

## 🧪 Testing After Seeding

### 1. **Test Admin Login**

```powershell
# Start the server
cd server
npm run dev
```

```powershell
# Start the client (in a new terminal)
cd client
npm run dev
```

Navigate to `http://localhost:5173/login` and login with:
- **Email**: admin@preppioneer.com
- **Password**: AdminPassword123

### 2. **Verify Admin Dashboard**

1. Click "Admin Dashboard" from the main dashboard
2. You should see:
   - Platform health metrics (4 users total)
   - User management table with all 4 seeded users
   - Ability to change user roles

### 3. **Test Instructor Features**

Login as the instructor:
- **Email**: instructor@preppioneer.com
- **Password**: InstructorPass123

Navigate to `/instructor` and verify:
- Platform overview metrics
- Question creation form
- Student performance table (empty initially)

### 4. **Test Question Bank**

As a student, create a test:
- Login as `student1@preppioneer.com`
- Go to "Create Test"
- You should see 15 sample questions available

---

## 📝 Customizing the Seed Data

### **Add More Questions**

Edit `server/prisma/seed.js` and add to the `sampleQuestions` array:

```javascript
{
  questionType: 'MULTIPLE_CHOICE',
  difficulty: 3,
  category: 'Your Category',
  questionText: 'Your question?',
  options: JSON.stringify(['Option A', 'Option B', 'Option C', 'Option D']),
  correctAnswer: 'Option A',
  explanation: 'Explanation of the correct answer.',
}
```

### **Change Default Passwords**

Locate these lines in `seed.js`:

```javascript
const adminPassword = await bcrypt.hash('AdminPassword123', 10);
const instructorPassword = await bcrypt.hash('InstructorPass123', 10);
const studentPassword = await bcrypt.hash('StudentPass123', 10);
```

Change the strings to your preferred passwords (must be re-run to take effect).

### **Add More User Roles**

Add more instructors or students by copying the `upsert` blocks:

```javascript
const instructor2 = await prisma.user.upsert({
  where: { email: 'instructor2@preppioneer.com' },
  update: {},
  create: {
    email: 'instructor2@preppioneer.com',
    password: instructorPassword,
    name: 'Jane Instructor',
    role: 'INSTRUCTOR',
  },
});
```

---

## 🔒 Production Considerations

### **Security Best Practices**

1. **Change Default Passwords**: Immediately change all seeded passwords after first login in production.

2. **Remove Sample Accounts**: Delete sample students and instructors after setting up real users:
   ```sql
   DELETE FROM User WHERE email LIKE '%@preppioneer.com' AND role = 'STUDENT';
   ```

3. **Custom Admin Email**: Update the admin email to your organization's email before deploying:
   ```javascript
   where: { email: 'admin@yourschool.edu' }
   ```

### **Production Seeding Workflow**

1. Deploy application with empty database
2. Run migrations: `npx prisma migrate deploy`
3. Run seed script: `npx prisma db seed`
4. Login as admin and change password immediately
5. Create real instructor and student accounts
6. Delete sample accounts if not needed

---

## 🐛 Troubleshooting

### **Error: `prisma.user.upsert is not a function`**

**Cause**: Prisma Client not generated.

**Solution**:
```powershell
cd server
npx prisma generate
npx prisma db seed
```

### **Error: `P2002: Unique constraint failed`**

**Cause**: User with that email already exists.

**Solution**: The seed script handles this with `upsert`. If it still fails, check for manual database entries.

### **Error: `bcrypt` module not found**

**Cause**: Dependencies not installed.

**Solution**:
```powershell
cd server
npm install
npx prisma db seed
```

### **No Questions Created**

**Cause**: Questions already exist in database.

**Solution**: The script skips question creation if any exist. To add more:
1. Manually delete existing questions, or
2. Modify the seed script to always insert new questions

### **Seed Script Doesn't Run Automatically**

**Cause**: `package.json` not configured.

**Solution**: Verify `server/package.json` contains:
```json
"prisma": {
  "seed": "node prisma/seed.js"
}
```

---

## 📚 Related Documentation

- **Testing Guide**: `ADMIN_INSTRUCTOR_TESTING.md` - Test all admin and instructor features
- **Deployment Guide**: `DEPLOYMENT_GUIDE.md` - Deploy to production
- **Database Schema**: `DATABASE_SCHEMA.md` - Understand data structure
- **API Documentation**: `TEST_API.md` - API endpoint reference

---

## ✅ Post-Seeding Checklist

- [ ] Seed script executed successfully
- [ ] Admin login works (admin@preppioneer.com)
- [ ] Instructor login works (instructor@preppioneer.com)
- [ ] Student login works (student1@preppioneer.com)
- [ ] 15 sample questions visible in question bank
- [ ] Admin dashboard shows 4 users
- [ ] Instructor dashboard loads without errors
- [ ] Sample test appears in test list
- [ ] Changed admin password after first login (PRODUCTION ONLY)
- [ ] Deleted sample accounts (PRODUCTION ONLY)

---

## 🎉 Success!

Your PrepPioneer database is now seeded with essential data. The platform is ready for:

- ✅ Immediate testing of all features
- ✅ Admin and instructor onboarding
- ✅ Student test-taking with pre-loaded questions
- ✅ Demonstration to stakeholders
- ✅ Production deployment

**Next Steps**: Follow the `ADMIN_INSTRUCTOR_TESTING.md` guide to thoroughly test all features with the seeded data!
