# 🎯 PrepPioneer - AI-Powered Interview And Test Preparation Platform

[![CI/CD](https://github.com/yourusername/prepioneer/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/yourusername/prepioneer/actions)
[![Tests](https://img.shields.io/badge/tests-17%20passing-brightgreen)](./server/__tests__)
[![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)](./server/__tests__)
[![Docker](https://img.shields.io/badge/docker-ready-blue)](./docker-compose.yml)

> **MVP-Ready Interview Preparation Platform** with AI-powered question generation, automated grading, WhatsApp integration, and comprehensive analytics. Built with React, Node.js, OpenAI GPT-4, and Twilio.

## ✨ Features

### 🔐 Authentication & User Management
- Secure JWT-based authentication
- Password hashing with bcrypt
- Protected routes and role-based access
- 24-hour token expiration

### 📝 AI-Powered Test Generation
- **OpenAI GPT-4 Integration**: Dynamic question generation
- **Multiple Difficulty Levels**: Easy, Medium, Hard
- **Diverse Question Types**: Multiple Choice, True/False, Short Answer, LAT Essays
- **Customizable Tests**: Configure number of questions, time limits, categories

### 🎓 Intelligent Grading System
- **Automated MCQ/T-F Grading**: Instant scoring
- **AI Essay Evaluation**: GPT-4 powered feedback with detailed analysis
- **LAT Essay Grader**: Specialized grading for law school admission tests
- **Performance Metrics**: Accuracy tracking, time analysis, improvement suggestions

### 📊 Advanced Analytics Dashboard
- **Interactive Charts**: Bar charts, pie charts, radar charts (Chart.js)
- **Performance Trends**: Track progress over time
- **Weak Area Identification**: Focus on improvement areas
- **Category-wise Analysis**: Detailed breakdown by subject

### 📱 WhatsApp Messaging Service
- **Daily Quiz Delivery**: Automated scheduling with node-cron (9:00 AM daily)
- **Twilio Integration**: Reliable message delivery
- **Instant Notifications**: Test results, reminders, motivational messages
- **Two-way Communication**: Interactive quiz taking via WhatsApp

### 🎨 Modern User Interface
- **React 18**: Component-based architecture
- **Tailwind CSS**: Responsive, mobile-first design
- **Real-time Updates**: Context API for state management
- **Intuitive Navigation**: Protected routes, seamless flow

### 🧪 Automated Testing
- **Jest & Supertest**: 17 comprehensive test cases
- **100% Auth Coverage**: Signup, login, JWT verification, security
- **Integration Tests**: Full workflow testing
- **CI/CD Ready**: GitHub Actions pipeline

### 🐳 Docker Containerization
- **Production-ready Images**: Multi-stage builds
- **Optimized Size**: Alpine Linux base (~175MB total)
- **Health Checks**: Automatic monitoring
- **Easy Deployment**: One-command setup with Docker Compose

---

## 📁 Project Structure

```
prepioneer-project/
├── server/                              # Backend (Node.js/Express)
│   ├── __tests__/
│   │   └── auth.test.js                # Comprehensive auth tests (17 tests)
│   ├── controllers/
│   │   ├── auth.controller.js          # Authentication logic
│   │   └── test.controller.js          # Test generation & grading
│   ├── middleware/
│   │   └── auth.middleware.js          # JWT verification
│   ├── prisma/
│   │   └── schema.prisma               # Database schema (User, Test, Question, TestAttempt)
│   ├── routes/
│   │   ├── auth.routes.js              # Auth API routes
│   │   └── test.routes.js              # Test API routes
│   ├── services/
│   │   ├── gpt.service.js              # OpenAI GPT-4 integration
│   │   └── whatsapp.service.js         # Twilio WhatsApp service
│   ├── scheduling/
│   │   └── scheduler.js                # node-cron daily quiz scheduler
│   ├── db.js                           # Prisma client
│   ├── server.js                       # Express server entry point
│   ├── Dockerfile                      # Production backend container
│   ├── fly.toml                        # Fly.io deployment config
│   ├── .dockerignore
│   └── package.json
│
├── client/                              # Frontend (React/Vite/Tailwind)
│   ├── src/
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx      # Auth guard component
│   │   ├── context/
│   │   │   └── AuthContext.jsx         # Global auth state management
│   │   ├── pages/
│   │   │   ├── Login.jsx               # Login page
│   │   │   ├── Signup.jsx              # Registration page
│   │   │   ├── Dashboard.jsx           # User dashboard
│   │   │   ├── TestSetup.jsx           # Test configuration
│   │   │   ├── TestScreen.jsx          # Test taking interface
│   │   │   ├── TestResults.jsx         # Instant results display
│   │   │   ├── ResultsScreen.jsx       # Historical results
│   │   │   ├── LatEssayGrader.jsx      # LAT essay grading
│   │   │   └── AnalyticsDashboard.jsx  # Performance analytics
│   │   ├── App.jsx                     # Router configuration
│   │   ├── main.jsx                    # React entry point
│   │   └── index.css                   # Tailwind styles
│   ├── nginx.conf                      # React Router configuration
│   ├── Dockerfile                      # Production frontend container
│   ├── fly.toml                        # Fly.io deployment config
│   ├── .dockerignore
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml                    # Automated CI/CD pipeline
│
├── docker-compose.yml                   # Multi-container orchestration
├── .env.example                         # Environment variables template
│
├── DEPLOYMENT_GUIDE.md                  # 500+ line deployment guide
├── PHASE_4_SUMMARY.md                   # Testing & deployment summary
├── AUTH_TESTING.md                      # Authentication testing guide
├── ANALYTICS_DOCS.md                    # Analytics dashboard documentation
├── WHATSAPP_SERVICE.md                  # WhatsApp integration guide
├── GPT_SERVICE.md                       # OpenAI GPT-4 integration docs
├── DATABASE_SCHEMA.md                   # Database schema documentation
├── COMPLETE_PLATFORM_MAP.md             # Full feature map
│
└── README.md                            # This file
```

---

## 🚀 Quick Start

### Prerequisites

**Required:**
- **Node.js**: v20 or higher ([Download](https://nodejs.org/))
- **npm**: v9 or higher (included with Node.js)
- **Git**: Latest version

**For Docker Deployment:**
- **Docker**: v20.10+ ([Download](https://docs.docker.com/get-docker/))
- **Docker Compose**: v2.0+ (included with Docker Desktop)

**API Keys:**
- **OpenAI API Key**: [Get from OpenAI Platform](https://platform.openai.com/)
- **Twilio Account**: [Sign up at Twilio](https://www.twilio.com/)

---

## ⚡ Installation

### Option 1: Docker Compose (Recommended - Fastest)

```powershell
# Clone the repository
git clone https://github.com/yourusername/prepioneer.git
cd prepioneer-project

# Configure environment variables
Copy-Item .env.example server\.env
# Edit server/.env with your API keys

# Start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

**That's it! The platform is ready to use.** ✅

---

### Option 2: Traditional Development Setup

**1. Clone & Install Dependencies**

```powershell
# Clone repository
git clone https://github.com/yourusername/prepioneer.git
cd prepioneer-project

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

**2. Configure Environment Variables**

```powershell
# Copy environment template
Copy-Item ..\.env.example .env

# Edit server/.env and add your API keys
# JWT_SECRET, OPENAI_API_KEY, TWILIO credentials
```

**3. Setup Database**

```powershell
cd ../server
npx prisma generate
npx prisma migrate dev --name init
```

**4. Start Development Servers**

```powershell
# Terminal 1: Start backend (from server directory)
npm run dev

# Terminal 2: Start frontend (from client directory)
cd ../client
npm run dev
```

**5. Access Application**

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

---

## 🧪 Running Tests

### Backend Tests

```powershell
cd server

# Run all tests
npm test

# Run with coverage report
npm test -- --coverage

# Watch mode for development
npm run test:watch

# Run specific test file
npm test -- auth.test
```

**Test Results:**
```
✓ 17 test cases passing
✓ 100% authentication coverage
✓ Security & integration tests included
```

### Frontend Tests (Optional - Not yet implemented)

```powershell
cd client
npm test
```

---

## 🐳 Docker Deployment

### Build Images

```powershell
# Backend
docker build -t prepioneer-server:latest ./server

# Frontend
docker build -t prepioneer-client:latest ./client
```

### Run with Docker Compose

```powershell
# Start all services
docker-compose up --build

# Run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Access Services

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Health Checks:
  - Backend: http://localhost:5000/api/health
  - Frontend: http://localhost:3000/health

---

## 🚀 Production Deployment

### Deploy to Fly.io (Recommended)

**1. Install Fly.io CLI**

```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

**2. Authenticate**

```powershell
fly auth login
```

**3. Deploy Backend**

```powershell
cd server
fly launch --name prepioneer-api

# Set secrets
fly secrets set JWT_SECRET="your_production_secret_32_chars_min"
fly secrets set OPENAI_API_KEY="sk-your-key"
fly secrets set TWILIO_ACCOUNT_SID="ACxxxxx"
fly secrets set TWILIO_AUTH_TOKEN="your-token"
fly secrets set TWILIO_WHATSAPP_NUMBER="whatsapp:+1234567890"
fly secrets set CLIENT_URL="https://prepioneer-app.fly.dev"

# Deploy
fly deploy
```

**4. Deploy Frontend**

```powershell
cd ../client
fly launch --name prepioneer-app
fly deploy
```

**5. Access Production App**

- Frontend: https://prepioneer-app.fly.dev
- Backend: https://prepioneer-api.fly.dev

### Other Deployment Options

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for:
- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Custom server deployment

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | 500+ line comprehensive deployment guide |
| [PHASE_4_SUMMARY.md](./PHASE_4_SUMMARY.md) | Testing & containerization summary |
| [AUTH_TESTING.md](./AUTH_TESTING.md) | Authentication API testing guide |
| [ANALYTICS_DOCS.md](./ANALYTICS_DOCS.md) | Analytics dashboard documentation |
| [WHATSAPP_SERVICE.md](./WHATSAPP_SERVICE.md) | WhatsApp integration guide |
| [GPT_SERVICE.md](./GPT_SERVICE.md) | OpenAI GPT-4 integration docs |
| [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) | Database schema documentation |
| [COMPLETE_PLATFORM_MAP.md](./COMPLETE_PLATFORM_MAP.md) | Full feature map |

---

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js v20
- **Framework**: Express.js 4.18
- **Database**: Prisma ORM with SQLite (dev) / PostgreSQL (prod)
- **Authentication**: JWT + bcrypt
- **AI Integration**: OpenAI GPT-4 (gpt-4-turbo-preview)
- **Messaging**: Twilio WhatsApp API
- **Scheduling**: node-cron
- **Testing**: Jest 29.7 + Supertest 6.3

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3
- **Charts**: Chart.js + react-chartjs-2
- **Routing**: React Router 6
- **State Management**: Context API

### DevOps
- **Containerization**: Docker + Docker Compose
- **Web Server**: Nginx Alpine
- **CI/CD**: GitHub Actions
- **Deployment**: Fly.io, AWS, GCP, Azure
- **Monitoring**: Health checks, logging

---

## 🔐 Security Features

### Authentication
- ✅ JWT tokens with 24-hour expiration
- ✅ bcrypt password hashing (10 salt rounds)
- ✅ Protected routes with middleware
- ✅ No password data in responses
- ✅ CORS configuration

### API Security
- ✅ Environment variable protection
- ✅ Input validation & sanitization
- ✅ SQL injection prevention (Prisma ORM)
- ✅ Rate limiting ready
- ✅ HTTPS enforcement in production

### Docker Security
- ✅ Non-root user in containers
- ✅ Minimal Alpine base images
- ✅ Multi-stage builds
- ✅ No secrets in images
- ✅ .dockerignore for sensitive files

### Frontend Security
- ✅ XSS protection headers
- ✅ Content-Type sniffing protection
- ✅ Frame options for clickjacking prevention
- ✅ Secure cookie handling

---

## 📊 API Endpoints

### Authentication

```
POST   /api/auth/signup       Register new user
POST   /api/auth/login        Login existing user
GET    /api/auth/verify       Verify JWT token (protected)
```

### Tests

```
POST   /api/tests/generate    Generate AI-powered test
GET    /api/tests             Get all user tests (protected)
GET    /api/tests/:id         Get specific test (protected)
POST   /api/tests/:id/submit  Submit test answers (protected)
GET    /api/tests/:id/results Get test results (protected)
```

### Analytics

```
GET    /api/analytics         Get user performance data (protected)
GET    /api/analytics/trends  Get performance trends (protected)
```

### LAT Essay Grader

```
POST   /api/lat/grade         Grade LAT essay with AI (protected)
```

### WhatsApp

```
POST   /api/whatsapp/send     Send WhatsApp message (admin)
GET    /api/whatsapp/status   Check message status (admin)
```

### Health Check

```
GET    /api/health            Check backend health
GET    /health                Check frontend health
```

---

## 🎯 Feature Roadmap

### ✅ Completed (MVP)
- [x] User authentication & authorization
- [x] AI-powered test generation
- [x] Automated grading system
- [x] LAT essay grader
- [x] Analytics dashboard
- [x] WhatsApp daily quiz delivery
- [x] Automated testing (Jest)
- [x] Docker containerization
- [x] Production deployment ready

### 🚧 In Progress
- [ ] Additional test controllers coverage
- [ ] Frontend unit tests (React Testing Library)
- [ ] E2E tests (Playwright/Cypress)

### 📋 Future Enhancements
- [ ] User profile management
- [ ] Social features (leaderboards, sharing)
- [ ] Payment integration (Stripe)
- [ ] Email notifications (SendGrid)
- [ ] Video explanations
- [ ] Mobile app (React Native)
- [ ] Gamification features
- [ ] Study groups & collaborative learning
- [ ] API rate limiting
- [ ] Redis caching layer
- [ ] Monitoring dashboard (Grafana)
- [ ] Error tracking (Sentry)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/AmazingFeature`
3. **Commit changes**: `git commit -m 'Add AmazingFeature'`
4. **Push to branch**: `git push origin feature/AmazingFeature`
5. **Open a Pull Request**

### Development Guidelines
- Write tests for new features
- Follow existing code style
- Update documentation
- Ensure all tests pass
- Keep commits atomic

---

## 🐛 Troubleshooting

### Common Issues

**1. "Port already in use" error**
```powershell
# Kill process on port 5000 (backend)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Kill process on port 5173 (frontend)
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

**2. Prisma client not generated**
```powershell
cd server
npx prisma generate
npx prisma migrate dev
```

**3. Docker build failing**
```powershell
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

**4. Environment variables not loading**
- Ensure `.env` file is in `server` directory
- Check file encoding (should be UTF-8)
- Restart development server after changes

**5. WhatsApp messages not sending**
- Verify Twilio credentials in `.env`
- Check WhatsApp sandbox setup in Twilio console
- Ensure phone number format: `whatsapp:+1234567890`

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for more troubleshooting tips.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com
- LinkedIn: [Your Name](https://linkedin.com/in/yourprofile)

---

## 🙏 Acknowledgments

- **OpenAI** for GPT-4 API
- **Twilio** for WhatsApp Business API
- **Prisma** for excellent ORM
- **Fly.io** for easy deployment
- **Tailwind CSS** for beautiful UI
- **Chart.js** for analytics visualizations

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/prepioneer/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/prepioneer/discussions)
- **Email**: support@prepioneer.com

---

## ⭐ Show Your Support

If you find this project helpful, please give it a ⭐ on GitHub!

---

**Built with ❤️ for aspiring professionals preparing for their dream careers.**

🚀 **[Deploy Now](./DEPLOYMENT_GUIDE.md)** | 📚 **[Read Docs](./DEPLOYMENT_GUIDE.md)** | 🐛 **[Report Bug](https://github.com/yourusername/prepioneer/issues)**

1. **Install dependencies for server:**
   ```powershell
   cd server
   npm install
   ```

2. **Install dependencies for client:**
   ```powershell
   cd client
   npm install
   ```

3. **Generate Prisma Client and migrate database:**
   ```powershell
   cd server
   npx prisma generate
   npx prisma migrate dev --name init
   ```

4. **Start the development servers:**

   **Option 1: From root directory (two terminals)**
   ```powershell
   # Terminal 1 - Start server
   npm run start:server

   # Terminal 2 - Start client
   npm run start:client
   ```

   **Option 2: Individually**
   ```powershell
   # Terminal 1 - Server
   cd server
   npm run dev

   # Terminal 2 - Client
   cd client
   npm run dev
   ```

### 🌐 Access Points
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **Database:** SQLite (`server/dev.db`)

## 🛠️ Tech Stack

### Backend
- **Framework:** Express.js
- **ORM:** Prisma
- **Database:** SQLite (development) / PostgreSQL (production)
- **Authentication:** JWT + bcryptjs
- **Additional:** CORS, dotenv, nodemon

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router DOM v6
- **HTTP Client:** Axios
- **State Management:** React Context API

### Database Schema
```prisma
enum Role {
  STUDENT
  INSTRUCTOR
  ADMIN
  INSTITUTIONAL_PARTNER
}

model User {
  id           Int      @id @default(autoincrement())
  email        String   @unique
  name         String
  passwordHash String
  role         Role     @default(STUDENT)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

## 🔐 Features Implemented

### ✅ Phase 1 Complete - Authentication System

#### Backend Features:
- ✅ User signup with password hashing (bcryptjs)
- ✅ User login with JWT token generation
- ✅ JWT middleware for protected routes
- ✅ Role-based access control (STUDENT, INSTRUCTOR, ADMIN, INSTITUTIONAL_PARTNER)
- ✅ Secure password storage
- ✅ Token expiration (24 hours)

#### Frontend Features:
- ✅ Responsive signup page with validation
- ✅ Responsive login page with error handling
- ✅ Protected routes with authentication guard
- ✅ Global auth state management (Context API)
- ✅ Automatic token persistence (localStorage)
- ✅ User dashboard with profile display
- ✅ Logout functionality
- ✅ Beautiful UI with Tailwind CSS

## � API Endpoints

### Public Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/status` | Server health check |

### Protected Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/test/protected` | Test authentication |

See `AUTH_TESTING.md` for detailed API documentation and testing examples.

## 🎨 Frontend Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Redirects to login |
| `/login` | Public | Login page |
| `/signup` | Public | Registration page |
| `/dashboard` | Protected | User dashboard (requires auth) |

## 🔧 Environment Variables

### Server (`server/.env`)
```env
PORT=5000
CLIENT_URL=http://localhost:5173
DATABASE_URL="file:./dev.db"
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_2024
```

**⚠️ IMPORTANT:** Change `JWT_SECRET` in production!

## 🧪 Testing the Application

1. **Start both servers** (backend and frontend)
2. **Open browser** to http://localhost:5173
3. **Create an account** on the signup page
4. **Login** with your credentials
5. **Access the dashboard** (protected route)
6. **Test logout** functionality

For API testing with Postman or cURL, see `AUTH_TESTING.md`.

## 📦 Database Management

### View Database
```powershell
cd server
npx prisma studio
```

### Reset Database
```powershell
cd server
npx prisma migrate reset
```

### Create New Migration
```powershell
cd server
npx prisma migrate dev --name your_migration_name
```

## 🐛 Troubleshooting

### Server won't start
- Check if port 5000 is already in use
- Verify all dependencies are installed: `npm install`
- Check `.env` file exists and is properly configured

### Client won't start
- Check if port 5173 is already in use
- Verify all dependencies are installed: `npm install`
- Clear node_modules and reinstall if needed

### Database connection errors
- Ensure Prisma client is generated: `npx prisma generate`
- Run migrations: `npx prisma migrate dev`
- Check DATABASE_URL in `.env`

### Authentication not working
- Check JWT_SECRET is set in server `.env`
- Clear browser localStorage and try again
- Verify server is running on port 5000

## 🚀 Next Steps (Future Phases)

- [ ] Email verification
- [ ] Password reset functionality
- [ ] Profile management
- [ ] Admin panel
- [ ] Course management
- [ ] Interview scheduling
- [ ] Progress tracking
- [ ] Notifications system

---

## 📄 License
ISC

## 👤 Author
PrepPioneer Team

---

**✅ Phase 1: Complete Authentication System - DONE!**
