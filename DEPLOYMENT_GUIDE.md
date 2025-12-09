# PrepPioneer Deployment Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Local Development with Docker](#local-development-with-docker)
4. [Running Tests](#running-tests)
5. [Production Deployment](#production-deployment)
6. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

### Required Software
- **Docker**: v20.10 or higher ([Download](https://docs.docker.com/get-docker/))
- **Docker Compose**: v2.0 or higher (included with Docker Desktop)
- **Node.js**: v20 or higher (for local development)
- **Git**: Latest version

### Required Accounts & API Keys
- **OpenAI API Key**: [Get from OpenAI Platform](https://platform.openai.com/)
- **Twilio Account**: [Sign up at Twilio](https://www.twilio.com/)
  - Account SID
  - Auth Token
  - WhatsApp Enabled Phone Number

---

## Environment Configuration

### 1. Create Environment File

Create a `.env` file in the `server` directory:

```bash
# Navigate to server directory
cd server

# Create .env file (PowerShell)
New-Item -Path .env -ItemType File
```

### 2. Configure Environment Variables

Add the following to `server/.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DATABASE_URL="file:./dev.db"

# JWT Secret (CHANGE THIS IN PRODUCTION!)
JWT_SECRET=your_super_secret_jwt_key_change_this_to_random_string

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-twilio-auth-token-here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173
```

### 3. Security Best Practices

⚠️ **NEVER commit `.env` files to Git!**

- Use strong, random JWT_SECRET (32+ characters)
- Rotate API keys regularly
- Use different secrets for dev/staging/production
- Store production secrets in secure vault (AWS Secrets Manager, Azure Key Vault, etc.)

---

## Local Development with Docker

### Option 1: Docker Compose (Recommended)

**Start all services:**
```powershell
# From project root
docker-compose up --build
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/api/health

**Stop services:**
```powershell
docker-compose down
```

**Clean rebuild:**
```powershell
docker-compose down -v
docker-compose up --build
```

### Option 2: Individual Containers

**Build images:**
```powershell
# Backend
docker build -t prepioneer-server ./server

# Frontend
docker build -t prepioneer-client ./client
```

**Run containers:**
```powershell
# Backend
docker run -d `
  -p 5000:5000 `
  -e DATABASE_URL="file:./dev.db" `
  -e JWT_SECRET="your_secret" `
  -e OPENAI_API_KEY="your_key" `
  --name prepioneer-server `
  prepioneer-server

# Frontend
docker run -d `
  -p 3000:80 `
  --name prepioneer-client `
  prepioneer-client
```

### Option 3: Local Development (No Docker)

**Backend:**
```powershell
cd server
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

**Frontend:**
```powershell
cd client
npm install
npm run dev
```

---

## Running Tests

### Automated Testing with Jest

**Run all tests:**
```powershell
cd server
npm test
```

**Run with coverage report:**
```powershell
npm test -- --coverage
```

**Watch mode (for development):**
```powershell
npm run test:watch
```

**Run specific test file:**
```powershell
npm test -- auth.test
```

### Test Coverage Goals

- **Auth Tests**: 15+ test cases covering signup, login, JWT verification
- **Target Coverage**: >80% for critical paths
- **Security Tests**: Password hashing, token validation, data protection

### Manual API Testing

**Using curl (PowerShell):**

```powershell
# Signup
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/signup" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"name":"Test User","email":"test@example.com","password":"SecurePass123!"}' | ConvertTo-Json

# Login
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"test@example.com","password":"SecurePass123!"}' | ConvertTo-Json
```

---

## Production Deployment

### Deployment Platforms

#### Option 1: Fly.io (Recommended for MVP)

**Install Fly CLI:**
```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

**Deploy Backend:**
```powershell
cd server
fly launch --name prepioneer-api
fly secrets set JWT_SECRET="your_production_secret"
fly secrets set OPENAI_API_KEY="your_key"
fly secrets set TWILIO_ACCOUNT_SID="your_sid"
fly secrets set TWILIO_AUTH_TOKEN="your_token"
fly secrets set TWILIO_WHATSAPP_NUMBER="whatsapp:+1234567890"
fly deploy
```

**Deploy Frontend:**
```powershell
cd client
fly launch --name prepioneer-app
fly deploy
```

#### Option 2: AWS ECS (Elastic Container Service)

1. Push images to ECR (Elastic Container Registry)
2. Create ECS task definitions
3. Configure Application Load Balancer
4. Set up environment variables in ECS
5. Deploy services to ECS cluster

#### Option 3: Google Cloud Run

```powershell
# Backend
gcloud run deploy prepioneer-api `
  --source ./server `
  --region us-central1 `
  --set-env-vars JWT_SECRET="your_secret"

# Frontend
gcloud run deploy prepioneer-app `
  --source ./client `
  --region us-central1
```

#### Option 4: Azure Container Apps

```powershell
# Create resource group
az group create --name prepioneer-rg --location eastus

# Deploy backend
az containerapp create `
  --name prepioneer-api `
  --resource-group prepioneer-rg `
  --image prepioneer-server:latest `
  --target-port 5000 `
  --env-vars JWT_SECRET="your_secret"
```

### Database Migration for Production

**Before first deployment:**
```powershell
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy
```

**For PostgreSQL (instead of SQLite):**

Update `DATABASE_URL` in production:
```env
DATABASE_URL="postgresql://user:password@host:5432/prepioneer_db?schema=public"
```

### SSL/HTTPS Configuration

Most platforms (Fly.io, Vercel, Cloud Run) provide automatic HTTPS.

For custom domains:
1. Add custom domain in platform dashboard
2. Update DNS records (CNAME or A record)
3. Wait for SSL certificate provisioning (automatic)

---

## Monitoring & Maintenance

### Health Checks

Both services include health check endpoints:

- **Backend**: `GET http://your-domain:5000/api/health`
- **Frontend**: `GET http://your-domain/health`

### Logging

**View Docker logs:**
```powershell
docker-compose logs -f server
docker-compose logs -f client
```

**Production logging:**
- Use platform-native logging (Fly.io logs, CloudWatch, etc.)
- Consider logging services: Datadog, New Relic, Sentry

### Monitoring Metrics

**Key metrics to track:**
- Response times (target: <200ms for API)
- Error rates (target: <1%)
- Database query performance
- Memory usage
- CPU utilization

### Backup Strategy

**SQLite Database (Development):**
```powershell
# Backup
Copy-Item server/dev.db server/backups/dev.db.backup
```

**PostgreSQL (Production):**
```powershell
# Automated backups with pg_dump
docker exec prepioneer_postgres pg_dump -U prepioneer_user prepioneer_db > backup.sql
```

### Scheduled Tasks

WhatsApp quiz scheduler runs automatically with node-cron:
- Daily quizzes sent at 9:00 AM
- Check logs for delivery status
- Monitor Twilio console for message failures

### Security Updates

**Regular maintenance tasks:**
1. Update dependencies monthly: `npm audit fix`
2. Rebuild Docker images with latest base images
3. Rotate API keys quarterly
4. Review user access logs
5. Update JWT_SECRET annually

### Scaling Considerations

**Horizontal Scaling:**
- Add more container instances behind load balancer
- Use Redis for session management
- Implement caching layer (Redis/Memcached)

**Database Scaling:**
- Migrate from SQLite to PostgreSQL for production
- Implement connection pooling
- Add read replicas for heavy read workloads

---

## Troubleshooting

### Common Issues

**1. Container won't start:**
```powershell
# Check logs
docker-compose logs server

# Verify environment variables
docker exec prepioneer_server env | grep API_KEY
```

**2. Database connection errors:**
- Verify DATABASE_URL format
- Check Prisma migration status: `npx prisma migrate status`
- Regenerate client: `npx prisma generate`

**3. CORS errors:**
- Ensure CLIENT_URL is set correctly in backend .env
- Check browser console for specific origin issues

**4. WhatsApp messages not sending:**
- Verify Twilio credentials in .env
- Check Twilio console for error messages
- Ensure phone number is WhatsApp-enabled

**5. Tests failing:**
```powershell
# Clear test database
Remove-Item server/dev.db -ErrorAction SilentlyContinue
npx prisma migrate dev
npm test
```

---

## Support & Resources

- **Project Repository**: [GitHub Link]
- **Documentation**: All MD files in project root
- **OpenAI Docs**: https://platform.openai.com/docs
- **Twilio Docs**: https://www.twilio.com/docs
- **Docker Docs**: https://docs.docker.com/
- **Prisma Docs**: https://www.prisma.io/docs

---

## Checklist Before Production Launch

- [ ] All environment variables configured securely
- [ ] JWT_SECRET is strong and random (32+ characters)
- [ ] Database migrations tested and working
- [ ] All automated tests passing (`npm test`)
- [ ] Docker images build successfully
- [ ] Health checks responding correctly
- [ ] CORS configured for production domain
- [ ] SSL/HTTPS enabled
- [ ] API rate limiting configured
- [ ] Backup strategy implemented
- [ ] Monitoring and alerting set up
- [ ] Error tracking configured (e.g., Sentry)
- [ ] Load testing completed
- [ ] Security audit performed
- [ ] Documentation updated with production URLs

---

**Ready to deploy? Start with `docker-compose up --build` to test locally!** 🚀
