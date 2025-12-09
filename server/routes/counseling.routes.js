const express = require('express');
const router = express.Router();
const counselingController = require('../controllers/counseling.controller');
const { verifyToken } = require('../middleware/auth.middleware');

/**
 * AI Counseling Routes
 * All routes require authentication
 */

/**
 * @route   POST /api/counseling/ask
 * @desc    Get AI guidance for student question
 * @access  Private (Student, Instructor, Admin)
 * @body    { question: string, examId?: number }
 */
router.post('/ask', verifyToken, counselingController.getGuidance);

/**
 * @route   GET /api/counseling/plan
 * @desc    Generate personalized 7-day study plan
 * @access  Private (Student, Instructor, Admin)
 * @query   examId?: number
 */
router.get('/plan', verifyToken, counselingController.getStudyPlan);

/**
 * @route   POST /api/counseling/preferences
 * @desc    Update study plan preferences
 * @access  Private (Student, Instructor, Admin)
 * @body    { dailyStudyHours?: number, preferredPace?: string, focusAreas?: string[], goals?: string }
 */
router.post('/preferences', verifyToken, counselingController.updatePreferences);

/**
 * @route   GET /api/counseling/weaknesses
 * @desc    Get current weakness profile
 * @access  Private (Student, Instructor, Admin)
 */
router.get('/weaknesses', verifyToken, counselingController.getWeaknesses);

module.exports = router;
