/**
 * WhatsApp Controller
 * Handles WhatsApp messaging endpoints for the PrepPioneer platform
 */

const whatsappService = require('../services/whatsapp.service');
const prisma = require('../db');

/**
 * Send a test WhatsApp message
 * POST /api/whatsapp/test
 */
const sendTestMessage = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // Validate phone number format (E.164)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format. Use E.164 format (e.g., +14155551234)'
      });
    }

    const result = await whatsappService.testWhatsAppService(phoneNumber);

    if (!result || !result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send test message',
        error: result?.error || 'Unknown error'
      });
    }

    res.json({
      success: true,
      message: 'Test message sent successfully',
      data: result
    });

  } catch (error) {
    console.error('Error sending test message:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Send a quiz question via WhatsApp
 * POST /api/whatsapp/send-quiz
 */
const sendQuizQuestion = async (req, res) => {
  try {
    const { phoneNumber, question, userName } = req.body;

    if (!phoneNumber || !question) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and question are required'
      });
    }

    const messageBody = whatsappService.formatQuizMessage(question, userName || 'Student');
    const result = await whatsappService.sendWhatsAppMessage(phoneNumber, messageBody);

    if (!result || !result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send quiz question',
        error: result?.error || 'Unknown error'
      });
    }

    res.json({
      success: true,
      message: 'Quiz question sent successfully',
      data: result
    });

  } catch (error) {
    console.error('Error sending quiz question:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Send a reminder via WhatsApp
 * POST /api/whatsapp/send-reminder
 */
const sendReminder = async (req, res) => {
  try {
    const { phoneNumber, reminderText, userName } = req.body;

    if (!phoneNumber || !reminderText) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and reminder text are required'
      });
    }

    const messageBody = whatsappService.formatReminderMessage(userName || 'Student', reminderText);
    const result = await whatsappService.sendWhatsAppMessage(phoneNumber, messageBody);

    if (!result || !result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send reminder',
        error: result?.error || 'Unknown error'
      });
    }

    res.json({
      success: true,
      message: 'Reminder sent successfully',
      data: result
    });

  } catch (error) {
    console.error('Error sending reminder:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Send test completion notification
 * POST /api/whatsapp/send-test-notification
 */
const sendTestNotification = async (req, res) => {
  try {
    const { phoneNumber, userName, score, testName } = req.body;

    if (!phoneNumber || score === undefined || !testName) {
      return res.status(400).json({
        success: false,
        message: 'Phone number, score, and test name are required'
      });
    }

    const messageBody = whatsappService.formatTestNotification(
      userName || 'Student',
      score,
      testName
    );
    const result = await whatsappService.sendWhatsAppMessage(phoneNumber, messageBody);

    if (!result || !result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send test notification',
        error: result?.error || 'Unknown error'
      });
    }

    res.json({
      success: true,
      message: 'Test notification sent successfully',
      data: result
    });

  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Send custom WhatsApp message
 * POST /api/whatsapp/send-message
 */
const sendCustomMessage = async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;

    if (!phoneNumber || !message) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and message are required'
      });
    }

    const result = await whatsappService.sendWhatsAppMessage(phoneNumber, message);

    if (!result || !result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send message',
        error: result?.error || 'Unknown error'
      });
    }

    res.json({
      success: true,
      message: 'Message sent successfully',
      data: result
    });

  } catch (error) {
    console.error('Error sending custom message:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Send batch messages to multiple users
 * POST /api/whatsapp/send-batch
 */
const sendBatchMessages = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Messages array is required'
      });
    }

    // Validate each message
    for (const msg of messages) {
      if (!msg.to || !msg.body) {
        return res.status(400).json({
          success: false,
          message: 'Each message must have "to" and "body" properties'
        });
      }
    }

    const result = await whatsappService.sendBatchMessages(messages);

    res.json({
      success: true,
      message: `Batch sending complete: ${result.sent} sent, ${result.failed} failed`,
      data: result
    });

  } catch (error) {
    console.error('Error sending batch messages:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get WhatsApp service status
 * GET /api/whatsapp/status
 */
const getServiceStatus = async (req, res) => {
  try {
    const isConfigured = !!(
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_WHATSAPP_NUMBER
    );

    res.json({
      success: true,
      configured: isConfigured,
      whatsappNumber: isConfigured ? process.env.TWILIO_WHATSAPP_NUMBER : null,
      message: isConfigured
        ? 'WhatsApp service is configured and ready'
        : 'WhatsApp service is not configured. Please set Twilio credentials in .env file'
    });

  } catch (error) {
    console.error('Error checking service status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Opt-in a user to receive WhatsApp messages
 * POST /api/whatsapp/opt-in
 */
const optInUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // Validate phone number format
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format. Use E.164 format (e.g., +14155551234)'
      });
    }

    // Update user's phone number and opt-in status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        phoneNumber: phoneNumber,
        whatsappOptIn: true
      }
    });

    // Send welcome message
    const welcomeMessage = `🎉 Welcome to PrepPioneer WhatsApp notifications, ${updatedUser.name}!\n\nYou'll now receive:\n• Daily quiz questions\n• Study reminders\n• Test completion updates\n\nReply STOP anytime to unsubscribe.\n\nGood luck with your studies! 🚀`;
    
    await whatsappService.sendWhatsAppMessage(phoneNumber, welcomeMessage);

    res.json({
      success: true,
      message: 'Successfully opted in to WhatsApp notifications',
      data: {
        phoneNumber: updatedUser.phoneNumber,
        whatsappOptIn: updatedUser.whatsappOptIn
      }
    });

  } catch (error) {
    console.error('Error opting in user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Opt-out a user from WhatsApp messages
 * POST /api/whatsapp/opt-out
 */
const optOutUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        whatsappOptIn: false
      }
    });

    res.json({
      success: true,
      message: 'Successfully opted out of WhatsApp notifications',
      data: {
        whatsappOptIn: updatedUser.whatsappOptIn
      }
    });

  } catch (error) {
    console.error('Error opting out user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  sendTestMessage,
  sendQuizQuestion,
  sendReminder,
  sendTestNotification,
  sendCustomMessage,
  sendBatchMessages,
  getServiceStatus,
  optInUser,
  optOutUser
};
