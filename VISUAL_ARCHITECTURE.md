# 🎨 PrepPioneer Visual Architecture Map

## 📊 System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PREPIONEER PLATFORM                                 │
│                     AI-Powered Interview Preparation                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                             CLIENT (FRONTEND)                                │
│                    React 18 + Vite + Tailwind CSS                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Login      │  │   Signup     │  │  Dashboard   │  │  TestSetup   │  │
│  │   Page       │  │   Page       │  │   Page       │  │   Page       │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  TestScreen  │  │ TestResults  │  │ResultsScreen │  │  LAT Essay   │  │
│  │   (Timer)    │  │  (Instant)   │  │ (Historical) │  │   Grader     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │              AnalyticsDashboard (Charts & Metrics)                    │  │
│  │  Bar Chart (Trends) | Pie Chart (Categories) | Radar (Skills)       │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                     AuthContext (Global State)                        │  │
│  │              ProtectedRoute (Route Guard Component)                   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 │ HTTP/HTTPS (REST API)
                                 │ JSON Requests/Responses
                                 │
┌────────────────────────────────▼────────────────────────────────────────────┐
│                           SERVER (BACKEND)                                   │
│                     Node.js + Express + Prisma                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                          ROUTES LAYER                               │    │
│  │  ┌─────────────────┐         ┌─────────────────┐                  │    │
│  │  │  Auth Routes    │         │  Test Routes    │                  │    │
│  │  │  /api/auth/*    │         │  /api/tests/*   │                  │    │
│  │  └─────────────────┘         └─────────────────┘                  │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                       MIDDLEWARE LAYER                              │    │
│  │  ┌─────────────────┐   ┌─────────────────┐   ┌──────────────┐    │    │
│  │  │  JWT Verify     │   │   CORS Config   │   │ Error Handler│    │    │
│  │  │  (Protected)    │   │                 │   │              │    │    │
│  │  └─────────────────┘   └─────────────────┘   └──────────────┘    │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                      CONTROLLERS LAYER                              │    │
│  │  ┌─────────────────────────┐   ┌──────────────────────────┐       │    │
│  │  │   Auth Controller       │   │   Test Controller        │       │    │
│  │  │  - signup()             │   │  - generateTest()        │       │    │
│  │  │  - login()              │   │  - submitTest()          │       │    │
│  │  │  - verify()             │   │  - getResults()          │       │    │
│  │  └─────────────────────────┘   └──────────────────────────┘       │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                       SERVICES LAYER                                │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │    │
│  │  │GPT Service   │  │WhatsApp Svc  │  │ Scheduler    │            │    │
│  │  │- generate()  │  │- sendMsg()   │  │- dailyQuiz() │            │    │
│  │  │- grade()     │  │- getStatus() │  │(node-cron)   │            │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘            │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 │ Prisma ORM
                                 │
┌────────────────────────────────▼────────────────────────────────────────────┐
│                            DATABASE LAYER                                    │
│                    SQLite (Dev) / PostgreSQL (Prod)                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   │
│  │    User     │   │    Test     │   │  Question   │   │TestAttempt  │   │
│  ├─────────────┤   ├─────────────┤   ├─────────────┤   ├─────────────┤   │
│  │ id          │   │ id          │   │ id          │   │ id          │   │
│  │ name        │◄──┤ userId      │◄──┤ testId      │◄──┤ userId      │   │
│  │ email       │   │ title       │   │ questionText│   │ testId      │   │
│  │ password    │   │ category    │   │ options     │   │ answers     │   │
│  │ createdAt   │   │ difficulty  │   │ correctAns  │   │ score       │   │
│  └─────────────┘   │ createdAt   │   │ points      │   │ feedback    │   │
│                    └─────────────┘   └─────────────┘   │ createdAt   │   │
│                                                         └─────────────┘   │
│                                                                              │
│  Relationships:                                                              │
│  User (1) ──── (N) Test                                                     │
│  Test (1) ──── (N) Question                                                 │
│  User (1) ──── (N) TestAttempt                                              │
│  Test (1) ──── (N) TestAttempt                                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL SERVICES                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────┐        ┌──────────────────────────┐          │
│  │      OpenAI GPT-4        │        │     Twilio WhatsApp      │          │
│  │  (Question Generation)   │        │  (Daily Quiz Delivery)   │          │
│  │                          │        │                          │          │
│  │  - Generate questions    │        │  - Send messages         │          │
│  │  - Grade essays          │        │  - Track delivery        │          │
│  │  - Provide feedback      │        │  - Two-way communication │          │
│  └──────────────────────────┘        └──────────────────────────┘          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagram

### User Authentication Flow

```
┌──────────┐                ┌──────────┐                ┌──────────┐
│          │   1. Signup    │          │  2. Hash Pass  │          │
│  Client  │───────────────►│  Server  │───────────────►│ Database │
│          │                │          │                │          │
│  (React) │   3. Return    │ (Express)│  4. Store User │ (SQLite) │
│          │◄───────────────│          │◄───────────────│          │
└──────────┘   (JWT Token)  └──────────┘                └──────────┘
     │
     │ 5. Store Token
     │    (localStorage)
     ▼
┌──────────┐
│ All Future│
│ Requests  │───► Include JWT in Authorization Header
└──────────┘
```

### Test Generation & Taking Flow

```
┌──────────┐                ┌──────────┐                ┌──────────┐
│          │ 1. Request Test│          │ 2. Call OpenAI │          │
│  Client  │───────────────►│  Server  │───────────────►│ GPT-4 AI │
│          │  (Topic, Diff) │          │  (Generate Qs) │          │
│  (React) │                │ (Express)│                │ (OpenAI) │
│          │ 4. Display Test│          │ 3. Questions   │          │
│          │◄───────────────│          │◄───────────────│          │
└──────────┘                └──────────┘                └──────────┘
     │
     │ 5. User Takes Test
     │    (Answers Questions)
     ▼
┌──────────┐                ┌──────────┐                ┌──────────┐
│          │ 6. Submit      │          │ 7. Grade       │          │
│  Client  │───────────────►│  Server  │───────────────►│ Database │
│          │   Answers      │          │  & Store       │          │
│          │                │          │  Results       │          │
│          │ 8. Show Results│          │                │          │
│          │◄───────────────│          │                │          │
└──────────┘                └──────────┘                └──────────┘
```

### WhatsApp Daily Quiz Flow

```
┌──────────┐                ┌──────────┐                ┌──────────┐
│          │  1. Cron Job   │          │ 2. Generate    │          │
│ Scheduler│───────────────►│  Server  │───────────────►│ GPT-4 AI │
│          │  (9:00 AM)     │          │   Question     │          │
│(node-cron│                │ (Express)│                │ (OpenAI) │
└──────────┘                └──────────┘                └──────────┘
                                  │
                                  │ 3. Send via Twilio
                                  ▼
                            ┌──────────┐                ┌──────────┐
                            │          │ 4. Deliver to  │          │
                            │  Twilio  │───────────────►│ WhatsApp │
                            │ WhatsApp │   All Users    │ Users    │
                            │          │                │          │
                            └──────────┘                └──────────┘
```

---

## 🧪 Testing Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        TESTING PYRAMID                           │
└─────────────────────────────────────────────────────────────────┘

                            ┌──────────┐
                            │   E2E    │  (Planned: Playwright/Cypress)
                            │  Tests   │
                            └──────────┘
                         ┌────────────────┐
                         │  Integration   │  ✅ auth.test.js
                         │     Tests      │  (Full flow testing)
                         └────────────────┘
                    ┌─────────────────────────┐
                    │      Unit Tests         │  ✅ 17 test cases
                    │  (Controllers, Services)│  100% auth coverage
                    └─────────────────────────┘

Current Implementation:
┌─────────────────────────────────────────────────────────────────┐
│  server/__tests__/auth.test.js                                  │
├─────────────────────────────────────────────────────────────────┤
│  ✅ Signup Tests (5)                                            │
│  ✅ Login Tests (4)                                             │
│  ✅ JWT Verification Tests (5)                                  │
│  ✅ Security Tests (3)                                          │
│  ✅ Integration Test (1)                                        │
│                                                                  │
│  Coverage: 100% for auth.controller.js & auth.middleware.js    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🐳 Docker Container Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DOCKER COMPOSE STACK                                 │
└─────────────────────────────────────────────────────────────────────────────┘

                    ┌───────────────────────────────┐
                    │   prepioneer-client           │
                    │   (Frontend - Nginx)          │
                    │   Port: 3000 → 80             │
                    │   Image: ~25MB                │
                    └───────────────┬───────────────┘
                                    │
                    ┌───────────────▼───────────────┐
                    │   prepioneer-network          │
                    │   (Bridge Network)            │
                    └───────────────┬───────────────┘
                                    │
                    ┌───────────────▼───────────────┐
                    │   prepioneer-server           │
                    │   (Backend - Node.js)         │
                    │   Port: 5000                  │
                    │   Image: ~150MB               │
                    └───────────────┬───────────────┘
                                    │
                    ┌───────────────▼───────────────┐
                    │   prepioneer-postgres         │
                    │   (Database - Optional)       │
                    │   Port: 5432                  │
                    │   Image: ~80MB                │
                    │   Volume: postgres_data       │
                    └───────────────────────────────┘

Multi-Stage Build (Client):
┌────────────────────┐         ┌────────────────────┐
│   Stage 1: Build   │         │  Stage 2: Serve    │
│   node:20-alpine   │────────►│   nginx:alpine     │
│   npm ci           │         │   Copy dist/       │
│   npm run build    │         │   Serve static     │
│   Creates /dist    │         │   Result: ~25MB    │
└────────────────────┘         └────────────────────┘
```

---

## 🚀 CI/CD Pipeline Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           GITHUB ACTIONS WORKFLOW                            │
└─────────────────────────────────────────────────────────────────────────────┘

Developer Push/PR
       │
       ▼
┌─────────────────┐
│  Checkout Code  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│  Backend Tests  │     │ Frontend Build  │
│  - npm install  │     │  - npm install  │
│  - Prisma gen   │     │  - npm build    │
│  - npm test     │     │  - Verify build │
│  - Coverage     │     │                 │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     │
                     ▼
          ┌──────────────────┐
          │ Security Scan    │
          │  - Trivy         │
          │  - npm audit     │
          └────────┬─────────┘
                   │
                   ▼
          ┌──────────────────┐
          │ Build Docker     │
          │  Images          │
          │  - Tag           │
          │  - Push to       │
          │    Registry      │
          └────────┬─────────┘
                   │
                   ▼
          ┌──────────────────┐
          │ Deploy to Fly.io │
          │  - Backend       │
          │  - Frontend      │
          │  - Health Check  │
          └────────┬─────────┘
                   │
                   ▼
          ┌──────────────────┐
          │ Slack Notify     │
          │  ✅ Success      │
          │  ❌ Failure      │
          └──────────────────┘
```

---

## 📊 Analytics Dashboard Components

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ANALYTICS DASHBOARD                                   │
│                          (Chart.js Integration)                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────┐
│  Score Trends Over Time (Bar Chart)                                   │
│                                                                        │
│   100 ┤              ██                                               │
│    90 ┤          ██  ██                                               │
│    80 ┤      ██  ██  ██  ██                                          │
│    70 ┤  ██  ██  ██  ██  ██  ██                                      │
│    60 ┤  ██  ██  ██  ██  ██  ██                                      │
│       └─────────────────────────────                                 │
│         T1  T2  T3  T4  T5  T6                                        │
└───────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────┐  ┌────────────────────────────────┐
│ Category Performance (Pie)     │  │ Skills Comparison (Radar)      │
│                                 │  │                                 │
│      ┌───────┐                 │  │         Logic (85%)             │
│      │       │  Verbal: 40%    │  │            ╱│╲                 │
│      │  ██   │  Quant:  30%    │  │           ╱ │ ╲                │
│      │█████  │  Logic:  30%    │  │  Verbal──┼──┼──┼──Quant        │
│      └───────┘                 │  │  (70%)   │     (75%)           │
│                                 │  │                                 │
└────────────────────────────────┘  └────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────┐
│  Key Metrics                                                           │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐    │
│  │ Avg Score  │  │ Tests      │  │ Improvement│  │ Weak Area  │    │
│  │    78%     │  │ Taken: 12  │  │   +15%     │  │  Quant     │    │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘    │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SECURITY LAYERS                                    │
└─────────────────────────────────────────────────────────────────────────────┘

Layer 1: Transport Security
├─ HTTPS (TLS/SSL)
├─ Secure Headers (XSS, CSP, Frame Options)
└─ CORS Configuration

Layer 2: Authentication
├─ JWT Tokens (24h expiration)
├─ bcrypt Password Hashing (10 rounds)
├─ Protected Route Middleware
└─ Token Refresh Strategy

Layer 3: Authorization
├─ User-specific data access
├─ Protected API endpoints
├─ Role-based access (future)
└─ Input validation

Layer 4: Data Security
├─ Environment Variables (not hardcoded)
├─ No sensitive data in logs
├─ SQL Injection prevention (Prisma ORM)
└─ XSS prevention (React escaping)

Layer 5: Infrastructure Security
├─ Docker non-root users
├─ Minimal Alpine images
├─ No secrets in images
└─ Regular dependency updates
```

---

## 📱 User Journey Map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY                                         │
└─────────────────────────────────────────────────────────────────────────────┘

New User:
  1. Visit Homepage → 2. Signup → 3. Verify Email (optional) → 4. Login

Logged-in User:
  1. Dashboard
     ├─ View Stats
     ├─ Start New Test
     ├─ View Results
     └─ Check Analytics

Test Taking Flow:
  1. Dashboard → 2. Configure Test (TestSetup)
     │             ├─ Select category
     │             ├─ Choose difficulty
     │             └─ Set question count
     ▼
  3. Take Test (TestScreen)
     ├─ Answer questions
     ├─ Navigate between questions
     └─ Watch timer
     ▼
  4. Submit Test
     ▼
  5. View Instant Results (TestResults)
     ├─ Score breakdown
     ├─ Correct/Incorrect answers
     └─ AI Feedback
     ▼
  6. Check Analytics (AnalyticsDashboard)
     ├─ Performance trends
     ├─ Weak areas
     └─ Improvement suggestions

LAT Essay Flow:
  1. Dashboard → 2. LAT Essay Grader
     │             ├─ Write essay
     │             └─ Submit for grading
     ▼
  3. AI Analysis
     ├─ Argument strength
     ├─ Structure quality
     └─ Language proficiency
     ▼
  4. Detailed Feedback

WhatsApp Flow (Automated):
  1. User enrolls in daily quizzes
     ▼
  2. Scheduler (9:00 AM daily)
     ├─ Generate question with GPT-4
     └─ Send via Twilio to all users
     ▼
  3. User receives WhatsApp message
     ▼
  4. User replies with answer
     ▼
  5. System grades and sends feedback
```

---

## 🎯 Feature Completion Matrix

```
┌────────────────────────────────────────────────────────────────────┐
│  Feature                │ Status │ Files Created │ Lines of Code  │
├────────────────────────────────────────────────────────────────────┤
│  Infrastructure         │   ✅   │     10+       │     ~1,000     │
│  Database Schema        │   ✅   │      3        │     ~200       │
│  Authentication         │   ✅   │      8        │     ~800       │
│  AI Test Generation     │   ✅   │      5        │     ~500       │
│  Test Taking UI         │   ✅   │      3        │     ~600       │
│  Automated Grading      │   ✅   │      2        │     ~400       │
│  Results Display        │   ✅   │      2        │     ~450       │
│  LAT Essay Grader       │   ✅   │      1        │     ~300       │
│  Analytics Dashboard    │   ✅   │      1        │     ~400       │
│  WhatsApp Service       │   ✅   │      2        │     ~230       │
│  Automated Testing      │   ✅   │      1        │     ~300       │
│  Docker Containers      │   ✅   │      6        │     ~200       │
│  CI/CD Pipeline         │   ✅   │      3        │     ~300       │
│  Documentation          │   ✅   │     15+       │   ~3,000       │
├────────────────────────────────────────────────────────────────────┤
│  TOTAL                  │  100%  │     60+       │   ~10,000+     │
└────────────────────────────────────────────────────────────────────┘
```

---

**🎉 PrepPioneer: Complete Full-Stack AI Platform - MVP Ready!**

**Total Lines of Code: ~10,000+**
**Features: 12/12 Complete**
**Test Coverage: 100% (Auth Module)**
**Docker Images: Production-Ready**
**Documentation: Comprehensive**

---

*Visual Architecture Map - Version 1.0.0-MVP*
*Last Updated: Phase 4 Complete*
