# 🌱 Database Seeding - Quick Reference Card

## 📋 One-Command Setup

```powershell
cd server
npx prisma db seed
```

> **⚠️ PowerShell Execution Policy Issue?** If you get "running scripts is disabled", use this alternative:
> ```powershell
> cd server
> node prisma/seed.js
> ```

---

## 👥 Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| 🛡️ **Admin** | admin@preppioneer.com | AdminPassword123 |
| 👨‍🏫 **Instructor** | instructor@preppioneer.com | InstructorPass123 |
| 🎓 **Student 1** | student1@preppioneer.com | StudentPass123 |
| 🎓 **Student 2** | student2@preppioneer.com | StudentPass123 |

> ⚠️ **Important**: Copy credentials exactly as shown - passwords are case-sensitive!

---

## 📚 What Gets Seeded

- ✅ **4 User Accounts** (1 Admin, 1 Instructor, 2 Students)
- ✅ **8 Pakistani Competitive Exams** (CSS, MDCAT, ECAT, LAT, NAT, PMS, GAT, NTS-NAT)
- ✅ **15 Sample Questions** (Physics, Biology, Math, Chemistry, History)
- ✅ **1 Sample Test** ("Sample Science & Math Quiz")

---

## 🚀 Quick Start After Seeding

```powershell
# Terminal 1 - Start Backend
cd server
npm run dev

# Terminal 2 - Start Frontend  
cd client
npm run dev
```

Then visit: **http://localhost:5173/login**

---

## ⚠️ Production Security Checklist

- [ ] Change admin password immediately after first login
- [ ] Update admin email to your organization's domain
- [ ] Delete sample student accounts (student1@, student2@)
- [ ] Generate strong passwords (use password manager)
- [ ] Run seed script on production database only once

---

## 🔄 Reset Database (Development Only)

```powershell
# ⚠️ WARNING: Deletes ALL data
npx prisma migrate reset
```

This will:
1. Drop database
2. Create new database
3. Run migrations
4. Automatically run seed script

---

## 🧪 Test Your Seeded Data

1. **Admin Test**: Login → Go to `/admin` → Manage users
2. **Instructor Test**: Login → Go to `/instructor` → Create question
3. **Test Catalog**: Go to `/tests/catalog` → Browse 8 Pakistani exams
4. **Student Test**: Login → Select exam from catalog → Create test
5. **Take Test**: Complete test → View detailed results

---

## 📖 Full Documentation

- **DATABASE_SEEDING_GUIDE.md** - Complete guide with troubleshooting
- **DATABASE_SEEDING_SUMMARY.md** - Implementation details
- **ADMIN_INSTRUCTOR_TESTING.md** - 52 test cases for features

---

## ❓ Common Issues

**Problem**: "prisma.user.upsert is not a function"
**Solution**: Run `npx prisma generate` then retry

**Problem**: Questions not appearing
**Solution**: Questions already exist - script skips duplicates

**Problem**: Seed command not found
**Solution**: Verify `package.json` has `"prisma": { "seed": "node prisma/seed.js" }`

**Problem**: Login failing with correct credentials
**Solution**: 
1. Verify backend is running: `cd server && npm run dev` (should show port 5000)
2. Verify frontend is running: `cd client && npm run dev` (should show port 5173)
3. Test backend directly: 
   ```powershell
   $body = @{email='admin@preppioneer.com'; password='AdminPassword123'} | ConvertTo-Json
   Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/login' -Method POST -Body $body -ContentType 'application/json'
   ```
4. Check browser console (F12) for CORS or network errors
5. Verify `.env` file has `JWT_SECRET` set
6. Clear browser localStorage: Open DevTools → Application → Local Storage → Clear All

---

## 🎉 Success Output

```
🌱 Starting database seeding...
✅ Admin created: admin@preppioneer.com
✅ Instructor created: instructor@preppioneer.com
✅ Students created: student1@..., student2@...
✅ Test Catalog seeded successfully with 8 Pakistani competitive exams
   - CSS (FPSC)
   - MDCAT (PMC)
   - ECAT (UET Lahore)
   - LAT (HEC)
   - NAT (NTS)
   - PMS (Provincial PSCs)
   - GAT-General (NTS)
   - NTS-NAT (NTS/Business Schools)
✅ Created 15 sample questions
✅ Sample test created

🎉 Database seeding completed successfully!
```

---

## ✍️ LAT Essay Requirements & Sample

When grading LAT essays, the system expects essays to meet the following criteria:

- Length: Minimum 200 words recommended (system accepts 50+ chars but quality scoring improves with >=200 words)
- Structure: Clear introduction with thesis, 2–4 body paragraphs with evidence and analysis, concise conclusion
- Evidence: Use examples, case law, or facts where appropriate ("for example", "for instance", "because")
- Analysis: Explain why evidence matters and connect to your thesis (use words like "therefore", "thus", "consequently")
- Language: Use formal academic tone, watch grammar and sentence structure

### Sample Intro / Conclusion Format (Use as guidance)

Introduction (Sample):
> The essay examines [topic]. I argue that [state your position clearly], because [brief reason 1] and [brief reason 2]. This essay will explore these points and conclude with a recommendation.

Conclusion (Sample):
> In conclusion, considering the arguments above, I maintain that [restate position]. The evidence suggests [brief summary]. Therefore, [final recommendation].

---

**Ready to Launch!** 🚀
