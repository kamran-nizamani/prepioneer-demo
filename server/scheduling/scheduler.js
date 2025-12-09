/**
 * Daily Quiz Scheduler
 * 
 * This module handles automated daily quiz delivery via WhatsApp.
 * Uses node-cron for scheduling and integrates with GPT service for question generation.
 */

const cron = require('node-cron');
const prisma = require('../db');
const whatsappService = require('../services/whatsapp.service');
const gptService = require('../services/gpt.service');

// Store the cron job instance
let dailyQuizJob = null;

/**
 * Send daily quiz to a single user
 * 
 * @param {Object} user - User object from database
 * @returns {Promise<Object>} Result of message sending
 */
async function sendDailyQuizToUser(user) {
  try {
    console.log(`📚 Generating daily quiz for ${user.name} (${user.email})`);

    // Generate a single quiz question using GPT service
    // Use a random topic or rotate through common topics
    const topics = [
      'Physics',
      'Chemistry',
      'Biology',
      'Mathematics',
      'English',
      'General Knowledge',
      'Critical Thinking',
      'Law and Legal Studies'
    ];
    
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    const difficulty = 2; // Easy-medium for daily practice
    const questionCount = 1;

    // Generate question using GPT service
    const questions = await gptService.generateQuestions(
      randomTopic,
      difficulty,
      questionCount
    );

    if (!questions || questions.length === 0) {
      console.error(`❌ Failed to generate question for ${user.name}`);
      return {
        success: false,
        userId: user.id,
        error: 'Question generation failed'
      };
    }

    const question = questions[0];

    // Format the quiz message
    const messageBody = whatsappService.formatQuizMessage(question, user.name);

    // Send the message
    const result = await whatsappService.sendWhatsAppMessage(
      user.whatsappNumber,
      messageBody
    );

    return {
      ...result,
      userId: user.id,
      userName: user.name,
      topic: randomTopic
    };

  } catch (error) {
    console.error(`❌ Error sending daily quiz to ${user.name}:`, error.message);
    return {
      success: false,
      userId: user.id,
      error: error.message
    };
  }
}

/**
 * Send daily quizzes to all opted-in users
 * 
 * This is the main function that runs on schedule
 */
async function sendDailyQuizzes() {
  console.log('\n⏰ =====================================');
  console.log('⏰ Daily Quiz Scheduler Triggered');
  console.log(`⏰ Time: ${new Date().toLocaleString()}`);
  console.log('⏰ =====================================\n');

  try {
    // Query all users who have opted in to WhatsApp messages
    const optedInUsers = await prisma.user.findMany({
      where: {
        whatsappOptIn: true,
        whatsappNumber: {
          not: null
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        whatsappNumber: true,
        role: true
      }
    });

    console.log(`📊 Found ${optedInUsers.length} users opted in to daily quizzes`);

    if (optedInUsers.length === 0) {
      console.log('ℹ️  No users to send messages to. Scheduler will try again tomorrow.');
      return;
    }

    // Send quiz to each user
    const results = {
      total: optedInUsers.length,
      sent: 0,
      failed: 0,
      details: []
    };

    for (const user of optedInUsers) {
      const result = await sendDailyQuizToUser(user);
      
      if (result.success) {
        results.sent++;
        console.log(`✅ Quiz sent to ${user.name}`);
      } else {
        results.failed++;
        console.log(`❌ Failed to send quiz to ${user.name}`);
      }

      results.details.push(result);

      // Add delay between messages to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Log summary
    console.log('\n📊 ===== Daily Quiz Summary =====');
    console.log(`📊 Total users: ${results.total}`);
    console.log(`✅ Successfully sent: ${results.sent}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📊 Success rate: ${((results.sent / results.total) * 100).toFixed(1)}%`);
    console.log('📊 ================================\n');

    return results;

  } catch (error) {
    console.error('❌ Error in daily quiz scheduler:', error);
    console.error(error.stack);
    return null;
  }
}

/**
 * Start the daily quiz scheduler
 * 
 * Schedules daily quiz delivery at 9:00 AM every day
 * Cron format: "0 9 * * *" = At 9:00 AM every day
 */
function startScheduler() {
  console.log('\n🚀 ===================================');
  console.log('🚀 Initializing Daily Quiz Scheduler');
  console.log('🚀 ===================================\n');

  // Check if scheduler is already running
  if (dailyQuizJob) {
    console.log('⚠️  Scheduler already running');
    return;
  }

  try {
    // Create cron job: runs at 9:00 AM every day
    // Format: "minute hour day-of-month month day-of-week"
    // "0 9 * * *" = At minute 0, hour 9, every day
    dailyQuizJob = cron.schedule('0 9 * * *', async () => {
      await sendDailyQuizzes();
    }, {
      scheduled: true,
      timezone: "America/New_York" // Adjust timezone as needed
    });

    console.log('✅ Daily Quiz Scheduler started successfully!');
    console.log('⏰ Schedule: Every day at 9:00 AM (America/New_York)');
    console.log('📱 Will send quizzes to all opted-in users');
    console.log('💡 To test immediately, call sendDailyQuizzes() manually\n');

    // For development/testing: Uncomment to run immediately on startup
    // console.log('🧪 Running test delivery in 10 seconds...');
    // setTimeout(async () => {
    //   await sendDailyQuizzes();
    // }, 10000);

  } catch (error) {
    console.error('❌ Failed to start scheduler:', error);
    console.error(error.stack);
  }
}

/**
 * Stop the daily quiz scheduler
 */
function stopScheduler() {
  if (dailyQuizJob) {
    dailyQuizJob.stop();
    dailyQuizJob = null;
    console.log('🛑 Daily Quiz Scheduler stopped');
  }
}

/**
 * Manually trigger daily quiz delivery (for testing)
 * 
 * @returns {Promise<Object>} Results of quiz delivery
 */
async function triggerManualQuizDelivery() {
  console.log('🧪 Manual quiz delivery triggered');
  return await sendDailyQuizzes();
}

/**
 * Send a custom reminder to all opted-in users
 * 
 * @param {string} reminderText - Custom reminder message
 * @returns {Promise<Object>} Results of message sending
 */
async function sendCustomReminder(reminderText) {
  console.log('📢 Sending custom reminder to all opted-in users...');

  try {
    const optedInUsers = await prisma.user.findMany({
      where: {
        whatsappOptIn: true,
        whatsappNumber: { not: null }
      }
    });

    const messages = optedInUsers.map(user => ({
      to: user.whatsappNumber,
      body: whatsappService.formatReminderMessage(user.name, reminderText)
    }));

    return await whatsappService.sendBatchMessages(messages);

  } catch (error) {
    console.error('❌ Error sending custom reminder:', error);
    return null;
  }
}

/**
 * Send test completion notification to a specific user
 * 
 * @param {number} userId - User ID
 * @param {number} score - Test score percentage
 * @param {string} testName - Name of the test
 * @returns {Promise<Object>} Result of message sending
 */
async function sendTestCompletionNotification(userId, score, testName) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        whatsappNumber: true,
        whatsappOptIn: true
      }
    });

    if (!user || !user.whatsappOptIn || !user.whatsappNumber) {
      console.log(`ℹ️  User ${userId} not opted in for notifications`);
      return null;
    }

    const messageBody = whatsappService.formatTestNotification(
      user.name,
      score,
      testName
    );

    return await whatsappService.sendWhatsAppMessage(
      user.whatsappNumber,
      messageBody
    );

  } catch (error) {
    console.error(`❌ Error sending test notification to user ${userId}:`, error);
    return null;
  }
}

module.exports = {
  startScheduler,
  stopScheduler,
  sendDailyQuizzes,
  triggerManualQuizDelivery,
  sendCustomReminder,
  sendTestCompletionNotification
};
