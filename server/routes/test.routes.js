const express = require('express');
const router = express.Router();
const testController = require('../controllers/test.controller');
const { verifyToken } = require('../middleware/auth.middleware');

/**
 * Test Routes
 * All routes require authentication (verifyToken middleware)
 */

// Start a new test session
router.post('/start', verifyToken, testController.startTest);

// Submit test answers
router.post('/:sessionId/submit', verifyToken, testController.submitTest);

// Get user's test history
router.get('/history', verifyToken, testController.getTestHistory);

// Get specific test session details
router.get('/:sessionId', verifyToken, testController.getTestSession);

// Grade LAT essay
router.post('/lat/grade-essay', verifyToken, testController.gradeLatEssay);

// Get LAT essay submission history
router.get('/lat/essays', verifyToken, testController.getEssayHistory);

// Get specific LAT essay submission
router.get('/lat/essays/:submissionId', verifyToken, testController.getEssaySubmission);

module.exports = router;
