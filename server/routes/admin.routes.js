const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRole } = require('../middleware/auth.middleware');
const adminController = require('../controllers/admin.controller');

/**
 * Admin & Instructor Routes
 * All routes require authentication via verifyToken
 * Specific routes require additional role authorization
 */

/**
 * @route   GET /api/admin/users
 * @desc    Get all users in the system
 * @access  ADMIN only
 */
router.get('/users', verifyToken, authorizeRole(['ADMIN']), adminController.getAllUsers);

/**
 * @route   PATCH /api/admin/users/:userId/role
 * @desc    Update a user's role
 * @access  ADMIN only
 */
router.patch('/users/:userId/role', verifyToken, authorizeRole(['ADMIN']), adminController.updateUserRole);

/**
 * @route   GET /api/admin/metrics
 * @desc    Get platform-wide metrics
 * @access  ADMIN and INSTRUCTOR
 */
router.get('/metrics', verifyToken, authorizeRole(['ADMIN', 'INSTRUCTOR']), adminController.getPlatformMetrics);

/**
 * @route   POST /api/admin/content/create
 * @desc    Create a manual question for curriculum content
 * @access  INSTRUCTOR and ADMIN
 */
router.post('/content/create', verifyToken, authorizeRole(['INSTRUCTOR', 'ADMIN']), adminController.createQuestion);

/**
 * @route   GET /api/admin/performance
 * @desc    Get aggregated student performance data
 * @access  INSTRUCTOR and ADMIN
 */
router.get('/performance', verifyToken, authorizeRole(['INSTRUCTOR', 'ADMIN']), adminController.getAggregatedPerformance);

module.exports = router;
