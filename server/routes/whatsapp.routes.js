/**
 * WhatsApp Routes
 * API endpoints for WhatsApp messaging functionality
 */

const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsapp.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Public routes (no authentication required)
router.get('/status', whatsappController.getServiceStatus);

// Protected routes (authentication required)
router.post('/test', verifyToken, whatsappController.sendTestMessage);
router.post('/send-quiz', verifyToken, whatsappController.sendQuizQuestion);
router.post('/send-reminder', verifyToken, whatsappController.sendReminder);
router.post('/send-test-notification', verifyToken, whatsappController.sendTestNotification);
router.post('/send-message', verifyToken, whatsappController.sendCustomMessage);
router.post('/send-batch', verifyToken, whatsappController.sendBatchMessages);

// User opt-in/opt-out routes
router.post('/opt-in', verifyToken, whatsappController.optInUser);
router.post('/opt-out', verifyToken, whatsappController.optOutUser);

module.exports = router;
