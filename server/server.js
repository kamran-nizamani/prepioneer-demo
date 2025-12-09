// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const prisma = require('./db');
const authRouter = require('./routes/auth.routes');
const testRouter = require('./routes/test.routes');
const adminRouter = require('./routes/admin.routes');
const publicRouter = require('./routes/public.routes');
const { verifyToken } = require('./middleware/auth.middleware');
const scheduler = require('./scheduling/scheduler');

// Initialize Express app
const app = express();

// Database connection function
async function connectDB() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

// Middleware
app.use(express.json());

// Configure CORS to allow requests only from CLIENT_URL
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

// Simple status route
app.get('/api/status', (req, res) => {
  res.json({ message: 'Server Running Smoothly' });
});

// Public routes (no authentication required)
app.use('/api/public', publicRouter);
app.use('/api/public/exam-content', require('./routes/examContent'));

// Authentication routes
app.use('/api/auth', authRouter);

// Test management routes
app.use('/api/tests', testRouter);

// AI Counseling routes (authenticated)
app.use('/api/counseling', require('./routes/counseling.routes'));

// WhatsApp messaging routes (authenticated)
app.use('/api/whatsapp', require('./routes/whatsapp.routes'));

// Admin & Instructor routes
app.use('/api/admin', adminRouter);

// Protected test route (for testing auth)
app.get('/api/test/protected', verifyToken, (req, res) => {
  res.json({ 
    message: 'Access Granted', 
    user: req.user 
  });
});

// Start server
const PORT = process.env.PORT || 5000;

// Connect to database and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Accepting requests from ${process.env.CLIENT_URL}`);
    
    // Start the daily quiz scheduler
    console.log('\n🕐 Starting daily quiz scheduler...');
    scheduler.startScheduler();
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('👋 Database disconnected');
  process.exit(0);
});
