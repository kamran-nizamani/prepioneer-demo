const counselingService = require('../services/counseling.service');
const prisma = require('../db');

/**
 * AI Counseling Controller
 * Handles personalized guidance and study plan generation
 */

/**
 * Get AI guidance for student question
 * POST /api/counseling/ask
 */
const getGuidance = async (req, res) => {
  try {
    const { question, examId } = req.body;
    const userId = req.user.userId; // From verifyToken middleware

    // Input validation
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Question is required and must be a non-empty string'
      });
    }

    if (question.length > 1000) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Question must be less than 1000 characters'
      });
    }

    console.log(`💬 Counseling request from user ${userId}: "${question.substring(0, 50)}..."`);

    // Fetch additional context if examId provided
    let context = {};
    if (examId) {
      const examInfo = await prisma.testCatalog.findUnique({
        where: { id: parseInt(examId) }
      });
      if (examInfo) {
        context.exam = {
          title: examInfo.title,
          acronym: examInfo.acronym,
          conductingBody: examInfo.conductingBody
        };
      }
    }

    // Get AI guidance
    const guidance = await counselingService.getGuidance(userId, question, context);

    res.status(200).json({
      success: true,
      question,
      guidance,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error in getGuidance:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get guidance. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Generate personalized study plan
 * GET /api/counseling/plan
 */
const getStudyPlan = async (req, res) => {
  try {
    const { examId } = req.query;
    const userId = req.user.userId; // From verifyToken middleware

    console.log(`📚 Study plan request from user ${userId} for exam ${examId || 'general'}`);

    // Fetch user's current weakness profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        currentWeaknessProfile: true,
        studyPlanPreferences: true,
        name: true
      }
    });

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    // Parse weakness profile
    let weaknessProfile = {};
    try {
      weaknessProfile = JSON.parse(user.currentWeaknessProfile || '{}');
    } catch (e) {
      console.warn('Failed to parse weakness profile, using empty object');
    }

    // Check if user has taken any tests
    if (Object.keys(weaknessProfile).length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No test data available yet. Take some practice tests to generate a personalized study plan!',
        hasData: false,
        plan: null
      });
    }

    // Generate study plan
    const studyPlan = await counselingService.generateStudyPlan(
      userId,
      weaknessProfile,
      examId ? parseInt(examId) : null
    );

    res.status(200).json({
      success: true,
      hasData: true,
      plan: studyPlan,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error in getStudyPlan:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to generate study plan. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update study plan preferences
 * POST /api/counseling/preferences
 */
const updatePreferences = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { dailyStudyHours, preferredPace, focusAreas, goals } = req.body;

    // Input validation
    if (dailyStudyHours && (typeof dailyStudyHours !== 'number' || dailyStudyHours < 1 || dailyStudyHours > 16)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'dailyStudyHours must be a number between 1 and 16'
      });
    }

    if (preferredPace && !['slow', 'moderate', 'fast', 'intensive'].includes(preferredPace)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'preferredPace must be one of: slow, moderate, fast, intensive'
      });
    }

    if (focusAreas && !Array.isArray(focusAreas)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'focusAreas must be an array'
      });
    }

    console.log(`⚙️ Updating study preferences for user ${userId}`);

    // Build preferences object
    const preferences = {
      dailyStudyHours: dailyStudyHours || 3,
      preferredPace: preferredPace || 'moderate',
      focusAreas: focusAreas || [],
      goals: goals || '',
      updatedAt: new Date().toISOString()
    };

    // Update user preferences
    await prisma.user.update({
      where: { id: userId },
      data: {
        studyPlanPreferences: JSON.stringify(preferences)
      }
    });

    res.status(200).json({
      success: true,
      message: 'Study preferences updated successfully',
      preferences
    });

  } catch (error) {
    console.error('❌ Error in updatePreferences:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update preferences. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get current weakness profile
 * GET /api/counseling/weaknesses
 */
const getWeaknesses = async (req, res) => {
  try {
    const userId = req.user.userId;

    console.log(`📊 Fetching weakness profile for user ${userId}`);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        currentWeaknessProfile: true,
        name: true
      }
    });

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    // Parse weakness profile
    let weaknessProfile = {};
    try {
      weaknessProfile = JSON.parse(user.currentWeaknessProfile || '{}');
    } catch (e) {
      console.warn('Failed to parse weakness profile');
    }

    res.status(200).json({
      success: true,
      hasData: Object.keys(weaknessProfile).length > 0,
      weaknesses: weaknessProfile,
      studentName: user.name
    });

  } catch (error) {
    console.error('❌ Error in getWeaknesses:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch weakness profile. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getGuidance,
  getStudyPlan,
  updatePreferences,
  getWeaknesses
};
