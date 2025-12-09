/**
 * Authentication API Tests
 * 
 * Tests for signup, login, and JWT token verification
 */

const request = require('supertest');
const express = require('express');
const authRouter = require('../routes/auth.routes');
const { verifyToken } = require('../middleware/auth.middleware');
const prisma = require('../db');

// Create a test Express app
const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

// Test protected route
app.get('/api/test/protected', verifyToken, (req, res) => {
  res.json({ 
    message: 'Access Granted', 
    user: req.user 
  });
});

// Mock data for testing
const testUser = {
  name: 'Test User',
  email: `test${Date.now()}@example.com`, // Unique email for each test run
  password: 'TestPassword123'
};

let authToken = null;
let createdUserId = null;

// Setup: Clear test data before all tests
beforeAll(async () => {
  await prisma.$connect();
});

// Cleanup: Disconnect and clear test data after all tests
afterAll(async () => {
  // Clean up test user if created
  if (createdUserId) {
    try {
      await prisma.user.delete({
        where: { id: createdUserId }
      });
    } catch (error) {
      console.error('Cleanup error:', error.message);
    }
  }
  await prisma.$disconnect();
});

// ====================
// SIGNUP TESTS
// ====================

describe('POST /api/auth/signup', () => {
  
  test('should successfully create a new user and return 201', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send(testUser)
      .expect('Content-Type', /json/)
      .expect(201);

    expect(response.body).toHaveProperty('message', 'User registered successfully');
    expect(response.body).toHaveProperty('userId');
    expect(response.body).toHaveProperty('email', testUser.email);
    expect(response.body).toHaveProperty('name', testUser.name);
    expect(response.body).toHaveProperty('role', 'STUDENT');

    // Store for cleanup and further tests
    createdUserId = response.body.userId;
  });

  test('should reject signup with existing email (409 Conflict)', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send(testUser) // Same email as previous test
      .expect('Content-Type', /json/)
      .expect(409);

    expect(response.body).toHaveProperty('error', 'Conflict');
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toMatch(/already exists/i);
  });

  test('should reject signup with missing fields (400 Bad Request)', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'incomplete@example.com'
        // Missing name and password
      })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('error', 'Bad Request');
    expect(response.body).toHaveProperty('message');
  });

  test('should reject signup with invalid email format', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Test User',
        email: 'invalid-email-format',
        password: 'TestPassword123'
      })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('error', 'Bad Request');
  });

  test('should reject signup with weak password (too short)', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Test User',
        email: 'newuser@example.com',
        password: '123' // Too short
      })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('error', 'Bad Request');
    expect(response.body.message).toMatch(/password.*6 characters/i);
  });
});

// ====================
// LOGIN TESTS
// ====================

describe('POST /api/auth/login', () => {
  
  test('should successfully login with correct credentials and return JWT token', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('message', 'Login successful');
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('id', createdUserId);
    expect(response.body.user).toHaveProperty('email', testUser.email);
    expect(response.body.user).toHaveProperty('name', testUser.name);
    expect(response.body.user).toHaveProperty('role', 'STUDENT');
    expect(response.body.user).not.toHaveProperty('passwordHash');

    // Verify token format (JWT has 3 parts separated by dots)
    expect(response.body.token.split('.')).toHaveLength(3);

    // Store token for protected route tests
    authToken = response.body.token;
  });

  test('should reject login with incorrect password (401 Unauthorized)', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'WrongPassword123'
      })
      .expect('Content-Type', /json/)
      .expect(401);

    expect(response.body).toHaveProperty('error', 'Unauthorized');
    expect(response.body.message).toMatch(/invalid/i);
  });

  test('should reject login with non-existent email (401 Unauthorized)', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'SomePassword123'
      })
      .expect('Content-Type', /json/)
      .expect(401);

    expect(response.body).toHaveProperty('error', 'Unauthorized');
  });

  test('should reject login with missing credentials (400 Bad Request)', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email
        // Missing password
      })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('error', 'Bad Request');
  });
});

// ====================
// JWT VERIFICATION TESTS
// ====================

describe('JWT Token Verification (verifyToken middleware)', () => {
  
  test('should allow access to protected route with valid token', async () => {
    const response = await request(app)
      .get('/api/test/protected')
      .set('Authorization', `Bearer ${authToken}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('message', 'Access Granted');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('userId', createdUserId);
    expect(response.body.user).toHaveProperty('email', testUser.email);
  });

  test('should reject request without token (401 Unauthorized)', async () => {
    const response = await request(app)
      .get('/api/test/protected')
      .expect('Content-Type', /json/)
      .expect(401);

    expect(response.body).toHaveProperty('error', 'Unauthorized');
    expect(response.body.message).toMatch(/token.*required/i);
  });

  test('should reject request with invalid token (403 Forbidden)', async () => {
    const response = await request(app)
      .get('/api/test/protected')
      .set('Authorization', 'Bearer invalid.token.here')
      .expect('Content-Type', /json/)
      .expect(403);

    expect(response.body).toHaveProperty('error', 'Forbidden');
    expect(response.body.message).toMatch(/invalid.*token/i);
  });

  test('should reject request with malformed Authorization header', async () => {
    const response = await request(app)
      .get('/api/test/protected')
      .set('Authorization', 'InvalidFormat')
      .expect('Content-Type', /json/)
      .expect(401);

    expect(response.body).toHaveProperty('error', 'Unauthorized');
  });

  test('should reject request with expired token', async () => {
    // Create a token that expires immediately
    const jwt = require('jsonwebtoken');
    const expiredToken = jwt.sign(
      { userId: createdUserId, email: testUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '0s' } // Expires immediately
    );

    // Wait a moment to ensure expiration
    await new Promise(resolve => setTimeout(resolve, 100));

    const response = await request(app)
      .get('/api/test/protected')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect('Content-Type', /json/)
      .expect(403);

    expect(response.body).toHaveProperty('error', 'Forbidden');
    expect(response.body.message).toMatch(/expired|invalid/i);
  });
});

// ====================
// SECURITY TESTS
// ====================

describe('Security and Data Protection', () => {
  
  test('should not return password hash in signup response', async () => {
    const newEmail = `security-test-${Date.now()}@example.com`;
    const response = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Security Test User',
        email: newEmail,
        password: 'SecurePassword123'
      })
      .expect(201);

    expect(response.body).not.toHaveProperty('passwordHash');
    expect(response.body).not.toHaveProperty('password');

    // Cleanup
    await prisma.user.delete({ where: { email: newEmail } });
  });

  test('should not return password hash in login response', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      })
      .expect(200);

    expect(response.body.user).not.toHaveProperty('passwordHash');
    expect(response.body.user).not.toHaveProperty('password');
  });

  test('should store hashed password in database (not plaintext)', async () => {
    const user = await prisma.user.findUnique({
      where: { id: createdUserId }
    });

    expect(user.passwordHash).toBeDefined();
    expect(user.passwordHash).not.toBe(testUser.password);
    expect(user.passwordHash.length).toBeGreaterThan(20); // Bcrypt hashes are long
    expect(user.passwordHash).toMatch(/^\$2[aby]\$/); // Bcrypt hash pattern
  });
});

// ====================
// INTEGRATION TESTS
// ====================

describe('Full Authentication Flow', () => {
  
  test('should complete full flow: signup → login → access protected route', async () => {
    const uniqueEmail = `flow-test-${Date.now()}@example.com`;
    let userId, token;

    // Step 1: Signup
    const signupRes = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Flow Test User',
        email: uniqueEmail,
        password: 'FlowTestPassword123'
      })
      .expect(201);

    userId = signupRes.body.userId;
    expect(userId).toBeDefined();

    // Step 2: Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: uniqueEmail,
        password: 'FlowTestPassword123'
      })
      .expect(200);

    token = loginRes.body.token;
    expect(token).toBeDefined();

    // Step 3: Access Protected Route
    const protectedRes = await request(app)
      .get('/api/test/protected')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(protectedRes.body.user.userId).toBe(userId);
    expect(protectedRes.body.user.email).toBe(uniqueEmail);

    // Cleanup
    await prisma.user.delete({ where: { id: userId } });
  });
});
