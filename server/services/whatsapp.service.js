/**
 * WhatsApp Messaging Service using Twilio
 * 
 * This service handles all WhatsApp message sending via Twilio API.
 * Supports daily quizzes, reminders, and notifications.
 */

const twilio = require('twilio');

// Initialize Twilio client
let twilioClient = null;

/**
 * Initialize Twilio client with credentials from environment
 */
function initializeTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

  if (!accountSid || !authToken || !whatsappNumber) {
    console.warn('⚠️  Twilio credentials not configured. WhatsApp messaging disabled.');
    console.warn('   Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_NUMBER in .env');
    return null;
  }

  try {
    twilioClient = twilio(accountSid, authToken);
    console.log('✅ Twilio client initialized successfully');
    console.log(`📱 WhatsApp sender number: ${whatsappNumber}`);
    return twilioClient;
  } catch (error) {
    console.error('❌ Failed to initialize Twilio client:', error.message);
    return null;
  }
}

/**
 * Send a WhatsApp message to a user
 * 
 * @param {string} to - Recipient's phone number in E.164 format (e.g., "+14155551234")
 * @param {string} body - Message content
 * @returns {Promise<Object>} Twilio message response or null if failed
 */
async function sendWhatsAppMessage(to, body) {
  // Ensure client is initialized
  if (!twilioClient) {
    twilioClient = initializeTwilioClient();
  }

  if (!twilioClient) {
    console.error('❌ Cannot send message: Twilio client not initialized');
    return null;
  }

  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

  try {
    // Format numbers for WhatsApp (must include "whatsapp:" prefix)
    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    const formattedFrom = fromNumber.startsWith('whatsapp:') ? fromNumber : `whatsapp:${fromNumber}`;

    console.log(`📤 Sending WhatsApp message to ${to}...`);

    const message = await twilioClient.messages.create({
      from: formattedFrom,
      to: formattedTo,
      body: body
    });

    console.log(`✅ Message sent successfully! SID: ${message.sid}`);
    return {
      success: true,
      messageSid: message.sid,
      status: message.status,
      to: to
    };

  } catch (error) {
    console.error(`❌ Failed to send WhatsApp message to ${to}:`, error.message);
    
    // Log specific Twilio errors
    if (error.code) {
      console.error(`   Twilio Error Code: ${error.code}`);
    }
    if (error.moreInfo) {
      console.error(`   More Info: ${error.moreInfo}`);
    }

    return {
      success: false,
      error: error.message,
      errorCode: error.code,
      to: to
    };
  }
}

/**
 * Send a batch of WhatsApp messages to multiple users
 * 
 * @param {Array<{to: string, body: string}>} messages - Array of message objects
 * @returns {Promise<Object>} Summary of sent/failed messages
 */
async function sendBatchMessages(messages) {
  console.log(`📬 Sending batch of ${messages.length} WhatsApp messages...`);

  const results = {
    sent: 0,
    failed: 0,
    details: []
  };

  for (const message of messages) {
    const result = await sendWhatsAppMessage(message.to, message.body);
    
    if (result && result.success) {
      results.sent++;
    } else {
      results.failed++;
    }
    
    results.details.push(result);

    // Add small delay between messages to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`📊 Batch complete: ${results.sent} sent, ${results.failed} failed`);
  return results;
}

/**
 * Format a quiz question into a WhatsApp message
 * 
 * @param {Object} question - Question object from GPT service
 * @param {string} userName - User's name for personalization
 * @returns {string} Formatted message text
 */
function formatQuizMessage(question, userName = 'Student') {
  const greeting = `🎯 Good morning, ${userName}!\n\n`;
  const intro = `Here's your daily PrepPioneer quiz question:\n\n`;
  
  const questionText = `📝 ${question.text}\n\n`;
  
  let optionsText = '';
  question.options.forEach((option, index) => {
    const letter = String.fromCharCode(65 + index); // A, B, C, D
    optionsText += `${letter}. ${option}\n`;
  });
  
  const footer = `\n💡 Reply with your answer (A, B, C, or D) to see if you're correct!\n\n`;
  const signature = `Keep learning with PrepPioneer! 🚀`;
  
  return greeting + intro + questionText + optionsText + footer + signature;
}

/**
 * Format a reminder message
 * 
 * @param {string} userName - User's name
 * @param {string} reminderText - Custom reminder text
 * @returns {string} Formatted message text
 */
function formatReminderMessage(userName, reminderText) {
  return `🔔 Hi ${userName}!\n\n${reminderText}\n\nStay focused with PrepPioneer! 🎯`;
}

/**
 * Format a test completion notification
 * 
 * @param {string} userName - User's name
 * @param {number} score - Test score percentage
 * @param {string} testName - Name of the test
 * @returns {string} Formatted message text
 */
function formatTestNotification(userName, score, testName) {
  let emoji = '📊';
  let message = '';

  if (score >= 80) {
    emoji = '🎉';
    message = 'Excellent work!';
  } else if (score >= 60) {
    emoji = '👍';
    message = 'Good effort!';
  } else {
    emoji = '💪';
    message = 'Keep practicing!';
  }

  return `${emoji} Hi ${userName}!\n\nYou scored ${score.toFixed(1)}% on "${testName}"\n\n${message}\n\nView detailed results in your PrepPioneer dashboard. 📱`;
}

/**
 * Test the WhatsApp service by sending a test message
 * 
 * @param {string} testNumber - Phone number to send test message to
 * @returns {Promise<Object>} Result of test message
 */
async function testWhatsAppService(testNumber) {
  console.log('🧪 Testing WhatsApp service...');
  
  if (!testNumber) {
    console.error('❌ No test number provided');
    return null;
  }

  const testMessage = `🎯 PrepPioneer Test Message\n\nThis is a test message from your PrepPioneer platform. If you receive this, WhatsApp integration is working correctly!\n\n✅ Service is operational.`;

  return await sendWhatsAppMessage(testNumber, testMessage);
}

// Initialize client on module load
initializeTwilioClient();

module.exports = {
  sendWhatsAppMessage,
  sendBatchMessages,
  formatQuizMessage,
  formatReminderMessage,
  formatTestNotification,
  testWhatsAppService,
  initializeTwilioClient
};
