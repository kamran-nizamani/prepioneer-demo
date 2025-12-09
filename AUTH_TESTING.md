# 🔐 Authentication API Testing Guide

## 📍 Base URL
```
http://localhost:5000/api
```

## 🛣️ Available Endpoints

### 1. **User Signup** (Create New Account)
**Endpoint:** `POST /api/auth/signup`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Success Response (201):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "role": "STUDENT",
    "createdAt": "2025-11-17T..."
  }
}
```

**Error Responses:**
- `400` - Missing required fields
- `409` - User already exists

---

### 2. **User Login** (Get JWT Token)
**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "role": "STUDENT"
  }
}
```

**Error Responses:**
- `400` - Missing email or password
- `401` - Invalid credentials

---

### 3. **Protected Route Test** (Token Verification)
**Endpoint:** `GET /api/test/protected`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Success Response (200):**
```json
{
  "message": "Access Granted",
  "user": {
    "userId": 1,
    "role": "STUDENT"
  }
}
```

**Error Responses:**
- `401` - No token provided
- `403` - Invalid or expired token

---

## 🧪 Testing with cURL

### Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"John Doe\",\"email\":\"john@example.com\",\"password\":\"securePassword123\"}"
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"john@example.com\",\"password\":\"securePassword123\"}"
```

### Protected Route
```bash
curl -X GET http://localhost:5000/api/test/protected \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

---

## 🧪 Testing with PowerShell

### Signup
```powershell
$body = @{
    name = "John Doe"
    email = "john@example.com"
    password = "securePassword123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/signup" -Method Post -Body $body -ContentType "application/json"
```

### Login
```powershell
$body = @{
    email = "john@example.com"
    password = "securePassword123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $body -ContentType "application/json"
$token = $response.token
Write-Host "Token: $token"
```

### Protected Route
```powershell
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/test/protected" -Method Get -Headers $headers
```

---

## 🔑 User Roles
Based on the Prisma schema, the following roles are available:
- `STUDENT` (default)
- `INSTRUCTOR`
- `ADMIN`
- `INSTITUTIONAL_PARTNER`

---

## 🔒 Security Features
- ✅ Password hashing with bcryptjs (salt rounds: 10)
- ✅ JWT tokens with 24-hour expiration
- ✅ Token verification middleware
- ✅ Protected routes with role extraction
- ✅ Secure error messages (no sensitive data leakage)

---

## 📝 Environment Variables
Ensure these are set in `server/.env`:
```env
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_2024
PORT=5000
CLIENT_URL=http://localhost:5173
DATABASE_URL="file:./dev.db"
```

**⚠️ IMPORTANT:** Change `JWT_SECRET` in production!
