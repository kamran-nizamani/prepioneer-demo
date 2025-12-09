# 🎓 Admin & Instructor Features Documentation

## Overview

PrepPioneer includes comprehensive **Role-Based Access Control (RBAC)** with dedicated dashboards for **Administrators** and **Instructors**, enabling institutional partnerships and professional education management.

---

## 🔐 User Roles

### 1. STUDENT (Default)
- Access to core learning features
- Take AI-generated tests
- View personal analytics
- Use LAT essay grader
- Access test history

### 2. INSTRUCTOR
- **All STUDENT features**
- Create manual curriculum questions
- View aggregated student performance
- Monitor platform metrics
- Identify weak areas across students
- Track student progress

### 3. ADMIN
- **All INSTRUCTOR features**
- Full user management
- Change user roles
- System health monitoring
- Platform-wide analytics
- User activity tracking

---

## 🛡️ Admin Dashboard

**Access:** Restricted to `ADMIN` role only  
**Route:** `/admin`

### Features

#### 1. Platform Health Metrics
- **Total Users**: Count of all registered users
- **Total Tests**: Number of tests created
- **Completed Tests**: Number of finished test attempts
- **Average Score**: Platform-wide average score percentage
- **Recent Activity**: Tests taken in last 7 days
- **Active Users**: Users who took tests in last 30 days

#### 2. User Management
- **View All Users**: Comprehensive user list with details
  - Name, Email, Role
  - Tests Created & Completed
  - Join Date
- **Role Management**: Change user roles via dropdown
  - STUDENT → INSTRUCTOR
  - INSTRUCTOR → ADMIN
  - Protection: Cannot change own admin role
- **Real-time Updates**: Instant role changes with confirmation

#### 3. System Monitoring
- User activity tracking
- Performance overview
- System health indicators

---

## 👨‍🏫 Instructor Dashboard

**Access:** Restricted to `INSTRUCTOR` and `ADMIN` roles  
**Route:** `/instructor`

### Features

#### 1. Platform Overview
- Total tests created
- Completed test attempts
- Average score across all students

#### 2. Content Management
**Create Manual Questions**

Instructors can create curriculum-specific questions without AI generation:

**Form Fields:**
- **Question Type**: Multiple Choice, True/False, Short Answer
- **Difficulty**: Easy, Medium, Hard
- **Category**: Custom subject/topic (e.g., Mathematics, History)
- **Question Text**: The question content
- **Answer Options**: For multiple choice (minimum 2 options)
- **Correct Answer**: The right answer
- **Explanation**: Optional explanation for learning

**Validation:**
- All required fields must be filled
- Multiple choice must have at least 2 options
- Proper difficulty and type selection

**Use Cases:**
- Add institution-specific curriculum content
- Create standardized test questions
- Build question banks for specific courses
- Supplement AI-generated content

#### 3. Student Performance Monitoring

**Aggregated Performance Table:**
- **Student Name & Email**
- **Total Test Attempts**
- **Average Score** (color-coded)
  - Green: 80%+
  - Yellow: 60-79%
  - Red: <60%
- **Weakest Category**: Lowest performing subject
- **Strongest Category**: Highest performing subject

**Features:**
- Sorted by average score (descending)
- Quick identification of struggling students
- Category-level performance insights
- Actionable data for intervention

---

## 🔗 API Endpoints

### Authentication Required
All endpoints require valid JWT token in `Authorization: Bearer <token>` header.

### Admin Endpoints

#### 1. Get All Users
```
GET /api/admin/users
Role: ADMIN only
```

**Response:**
```json
{
  "success": true,
  "count": 25,
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "STUDENT",
      "joinedDate": "2024-01-15T10:00:00Z",
      "testsCreated": 5,
      "testsCompleted": 12
    }
  ]
}
```

#### 2. Update User Role
```
PATCH /api/admin/users/:userId/role
Role: ADMIN only
Body: { "role": "INSTRUCTOR" }
```

**Response:**
```json
{
  "success": true,
  "message": "User role updated successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "INSTRUCTOR"
  }
}
```

#### 3. Get Platform Metrics
```
GET /api/admin/metrics
Role: ADMIN, INSTRUCTOR
```

**Response:**
```json
{
  "success": true,
  "metrics": {
    "totalUsers": 150,
    "totalTests": 500,
    "totalAttempts": 1250,
    "completedAttempts": 980,
    "averageScore": 75.5,
    "recentTests": 45,
    "activeUsers": 78
  }
}
```

### Instructor Endpoints

#### 4. Create Manual Question
```
POST /api/admin/content/create
Role: INSTRUCTOR, ADMIN
Body: {
  "questionText": "What is 2 + 2?",
  "questionType": "MULTIPLE_CHOICE",
  "options": ["2", "3", "4", "5"],
  "correctAnswer": "4",
  "difficulty": "EASY",
  "category": "Mathematics",
  "explanation": "Basic arithmetic addition"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Question created successfully",
  "test": { ... },
  "question": { ... }
}
```

#### 5. Get Aggregated Performance
```
GET /api/admin/performance
Role: INSTRUCTOR, ADMIN
```

**Response:**
```json
{
  "success": true,
  "count": 50,
  "performance": [
    {
      "id": 1,
      "name": "Alice Smith",
      "email": "alice@example.com",
      "totalAttempts": 15,
      "averageScore": 85.5,
      "weakestCategory": "Science (65.0%)",
      "strongestCategory": "Mathematics (92.3%)"
    }
  ]
}
```

---

## 🛠️ Backend Implementation

### 1. Role Authorization Middleware

**File:** `server/middleware/auth.middleware.js`

```javascript
const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'User authentication required' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}` 
      });
    }

    next();
  };
};
```

**Usage:**
```javascript
router.get('/users', 
  verifyToken, 
  authorizeRole(['ADMIN']), 
  adminController.getAllUsers
);
```

### 2. Admin Controller

**File:** `server/controllers/admin.controller.js`

**Functions:**
- `getAllUsers`: Fetch all users with test counts
- `updateUserRole`: Change user role (with self-protection)
- `getPlatformMetrics`: Calculate system-wide statistics
- `createQuestion`: Add manual curriculum question
- `getAggregatedPerformance`: Calculate student performance metrics

### 3. Routes Configuration

**File:** `server/routes/admin.routes.js`

All routes use:
1. `verifyToken` - Verify JWT authentication
2. `authorizeRole([...])` - Check role authorization
3. Controller function - Handle business logic

---

## 🎨 Frontend Implementation

### 1. Protected Route Enhancement

**File:** `client/src/components/ProtectedRoute.jsx`

```jsx
const ProtectedRoute = ({ allowedRoles = null }) => {
  const { isAuthenticated, user } = useAuth();
  
  // Check authentication
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <AccessDeniedPage />;
  }

  return <Outlet />;
};
```

### 2. Admin Dashboard

**File:** `client/src/pages/AdminDashboard.jsx`

**Components:**
- Platform health cards (4 metrics)
- Additional activity metrics (2 cards)
- User management table with role dropdowns
- Real-time role updates with feedback

**Features:**
- Color-coded metrics
- Sortable user table
- Inline role editing
- Success/error notifications

### 3. Instructor Dashboard

**File:** `client/src/pages/InstructorDashboard.jsx`

**Components:**
- Platform overview (3 metrics)
- Question creation form (collapsible)
- Student performance table

**Features:**
- Dynamic form validation
- Multiple choice option management
- Performance color coding (green/yellow/red)
- Category-based insights

### 4. Dashboard Navigation

**File:** `client/src/pages/Dashboard.jsx`

**Enhancement:**
- Conditional rendering based on role
- Admin button → `/admin`
- Instructor button → `/instructor`
- Gradient purple/indigo styling for prominence

---

## 🚀 Usage Examples

### For Students
1. Sign up → Default role: STUDENT
2. Access core learning features
3. No access to admin/instructor routes

### For Instructors
1. Admin upgrades user to INSTRUCTOR role
2. Access `/instructor` dashboard
3. Create custom questions
4. Monitor student performance
5. View platform metrics

### For Admins
1. Admin upgrades user to ADMIN role (or manual DB update)
2. Access both `/admin` and `/instructor` dashboards
3. Manage all users
4. Change any user's role
5. Monitor system health

---

## 🔒 Security Features

### 1. Role Verification
- **Backend**: Double verification (verifyToken + authorizeRole)
- **Frontend**: ProtectedRoute with allowedRoles check
- **Database**: Role stored in User model

### 2. Protection Mechanisms
- Cannot change own admin role
- JWT token required for all operations
- Role checked on every protected request
- Clear error messages for unauthorized access

### 3. Access Control
- 403 Forbidden for wrong role
- 401 Unauthorized for missing auth
- Graceful frontend access denial page

---

## 📊 Use Cases

### Educational Institutions
- **Admin**: IT staff managing platform
- **Instructors**: Teachers creating curriculum content
- **Students**: Learners taking tests

### Corporate Training
- **Admin**: HR/Training department
- **Instructors**: Senior employees/trainers
- **Students**: New hires/employees

### Test Prep Companies
- **Admin**: Platform managers
- **Instructors**: Content creators/subject experts
- **Students**: Test prep customers

---

## 🎯 Benefits

### For Administrators
✅ Complete platform control  
✅ User management dashboard  
✅ Real-time analytics  
✅ System health monitoring  
✅ Scalable user role system  

### For Instructors
✅ Create custom questions  
✅ Track student progress  
✅ Identify struggling students  
✅ Category-level insights  
✅ Performance analytics  

### For Students
✅ AI-generated tests  
✅ Manual curriculum content  
✅ Comprehensive feedback  
✅ Performance tracking  
✅ Professional instruction  

---

## 🔧 Configuration

### Database Schema

**User Model (Prisma):**
```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  name      String
  role      Role     @default(STUDENT)
  createdAt DateTime @default(now())
  
  tests         Test[]
  testAttempts  TestAttempt[]
}

enum Role {
  STUDENT
  INSTRUCTOR
  ADMIN
}
```

### Environment Variables

No additional environment variables required. Uses existing JWT_SECRET.

---

## 🐛 Troubleshooting

### Issue 1: "Access Denied" when accessing admin dashboard
**Solution:** Verify user role in database is set to 'ADMIN'
```sql
-- Update user role to ADMIN
UPDATE User SET role = 'ADMIN' WHERE email = 'your@email.com';
```

### Issue 2: Role dropdown not updating
**Solution:** Check network tab for 403 error. Ensure JWT token is valid and user is ADMIN.

### Issue 3: Student performance not showing
**Solution:** Ensure students have completed tests (completed=true, score not null)

### Issue 4: Cannot create manual questions
**Solution:** 
- Verify role is INSTRUCTOR or ADMIN
- Check all required fields are filled
- For multiple choice, ensure at least 2 options

---

## 📝 Future Enhancements

### Planned Features
- [ ] Bulk user import (CSV)
- [ ] Advanced analytics (charts, trends)
- [ ] Email notifications for role changes
- [ ] Audit logs for admin actions
- [ ] Custom role creation
- [ ] Permission granularity
- [ ] Student communication tools
- [ ] Assignment management
- [ ] Grade book integration
- [ ] Parent/guardian portal

---

## 📚 Related Documentation

- [README.md](./README.md) - Main project documentation
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Deployment instructions
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Database structure
- [AUTH_TESTING.md](./AUTH_TESTING.md) - Authentication testing

---

## 🎉 Summary

The **Admin & Instructor Features** complete PrepPioneer's transformation from a student-focused platform to a **full institutional education management system**. With role-based access control, custom content creation, and comprehensive analytics, the platform is ready for:

- **K-12 Schools**
- **Universities**
- **Corporate Training Programs**
- **Test Prep Companies**
- **Online Education Platforms**

**PrepPioneer is now enterprise-ready!** 🚀

---

*Last Updated: Admin & Instructor Features Complete*  
*Version: 1.1.0 - Institutional Ready*
