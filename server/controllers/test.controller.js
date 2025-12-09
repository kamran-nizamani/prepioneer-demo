const prisma = require('../db');
const gptService = require('../services/gpt.service');
const freeQuestionGenerator = require('../services/free-question-generator.service');

/**
 * Start a new test session
 * Generates questions using FREE AI-like generator (no API costs) or paid GPT-4
 */
const startTest = async (req, res) => {
  try {
    const { topic, difficulty, count, testCatalogId } = req.body;
    const userId = req.user.userId; // From verifyToken middleware

    // Input validation
    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({ 
        error: 'Bad Request', 
        message: 'Topic is required and must be a string' 
      });
    }

    if (!difficulty || typeof difficulty !== 'number' || difficulty < 1 || difficulty > 5) {
      return res.status(400).json({ 
        error: 'Bad Request', 
        message: 'Difficulty must be a number between 1 and 5' 
      });
    }

    if (!count || typeof count !== 'number' || count < 1 || count > 50) {
      return res.status(400).json({ 
        error: 'Bad Request', 
        message: 'Count must be a number between 1 and 50' 
      });
    }

    console.log(`🎯 Starting test for user ${userId}: ${topic} (Difficulty: ${difficulty}, Count: ${count})`);

    // PRIORITY 1: Use FREE Question Generator (NO API COSTS - Always generates NEW questions)
    let generatedQuestions;
    
    try {
      console.log('🎲 Using FREE Question Generator (No API costs)...');
      generatedQuestions = freeQuestionGenerator.generateQuestions(topic, difficulty, count);
      
      if (generatedQuestions && generatedQuestions.length > 0) {
        console.log(`✅ FREE Generator created ${generatedQuestions.length} NEW unique questions!`);
      }
    } catch (error) {
      console.error('⚠️ FREE generator error:', error.message);
      generatedQuestions = null;
    }
    
    // PRIORITY 2: Try OpenAI GPT-4 if FREE generator fails AND API key is available
    if (!generatedQuestions || generatedQuestions.length === 0) {
      const hasOpenAIKey = process.env.OPENAI_API_KEY && 
                           process.env.OPENAI_API_KEY !== 'YOUR_GPT_4_API_KEY_HERE';
      
      if (hasOpenAIKey) {
        try {
          console.log('🤖 Trying paid OpenAI GPT-4 generation...');
          generatedQuestions = await gptService.generateQuestions(topic, difficulty, count);
          console.log(`✅ GPT-4 generated ${generatedQuestions.length} questions`);
        } catch (error) {
          console.error('⚠️ GPT-4 generation failed:', error.message);
          generatedQuestions = null;
        }
      } else {
        console.log('ℹ️ OpenAI API key not configured (optional)');
      }
    }
    
    // PRIORITY 3: Last resort - fallback to database questions
    if (!generatedQuestions || generatedQuestions.length === 0) {
      console.log('📚 Falling back to database questions...');
      
      const dbQuestions = await prisma.question.findMany({
        where: {
          difficulty: {
            gte: Math.max(1, difficulty - 1),
            lte: Math.min(5, difficulty + 1)
          }
        },
        take: count,
        orderBy: {
          id: 'asc'
        }
      });

      if (dbQuestions.length === 0) {
        return res.status(404).json({ 
          error: 'Not Found', 
          message: 'No questions available. Please contact administrator.' 
        });
      }

      // Transform database questions to match expected format
      generatedQuestions = dbQuestions.map((q) => ({
        id: q.id,
        topic: q.category,
        difficulty: q.difficulty,
        type: q.questionType === 'MULTIPLE_CHOICE' ? 'MCQ' : q.questionType,
        text: q.questionText,
        options: q.options ? JSON.parse(q.options) : [],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || 'No explanation available'
      }));
      
      console.log(`✅ Loaded ${generatedQuestions.length} questions from database`);
    }

    if (!generatedQuestions || generatedQuestions.length === 0) {
      return res.status(500).json({ 
        error: 'Internal Server Error', 
        message: 'No questions were generated. Please try again.' 
      });
    }

    // Generate test name with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const testName = `${topic} - ${timestamp}`;

    // Save test session to database
    const testSession = await prisma.testSession.create({
      data: {
        userId,
        testName,
        topic,
        testCatalogId: testCatalogId ? parseInt(testCatalogId) : null, // Link to catalog if provided
        questions: JSON.stringify(generatedQuestions), // Store complete questions (immutable)
        answers: JSON.stringify([]), // Empty initially
        status: 'PENDING',
        scorePercentage: null,
        feedbackSummary: null,
        startTime: new Date()
      }
    });

    console.log(`✅ Test session created: ID ${testSession.id}`);

    // Filter questions for client (remove answers and explanations to prevent cheating)
    const filteredQuestions = generatedQuestions.map((q, index) => ({
      questionNumber: index + 1,
      id: q.id || index + 1, // Use generated ID or index
      topic: q.topic,
      difficulty: q.difficulty,
      type: q.type,
      text: q.text,
      options: q.options
      // Deliberately exclude: correctAnswer, explanation
    }));

    // Return response
    return res.status(201).json({
      message: 'Test session created successfully',
      sessionId: testSession.id,
      testName: testSession.testName,
      topic: testSession.topic,
      questionCount: filteredQuestions.length,
      difficulty,
      startTime: testSession.startTime,
      questions: filteredQuestions
    });

  } catch (error) {
    console.error('❌ Start test error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'An error occurred while starting the test',
      details: error.message
    });
  }
};

/**
 * Submit test answers and calculate score
 */
const submitTest = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { answers } = req.body; // Array of { questionNumber, selectedAnswer }
    const userId = req.user.userId;

    // Input validation
    if (!sessionId) {
      return res.status(400).json({ 
        error: 'Bad Request', 
        message: 'Session ID is required' 
      });
    }

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ 
        error: 'Bad Request', 
        message: 'Answers must be an array' 
      });
    }

    // Find test session
    const testSession = await prisma.testSession.findUnique({
      where: { id: sessionId }
    });

    if (!testSession) {
      return res.status(404).json({ 
        error: 'Not Found', 
        message: 'Test session not found' 
      });
    }

    // Verify ownership
    if (testSession.userId !== userId) {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: 'You do not have permission to submit this test' 
      });
    }

    // Check if already submitted
    if (testSession.status === 'COMPLETED') {
      return res.status(400).json({ 
        error: 'Bad Request', 
        message: 'This test has already been submitted' 
      });
    }

    // Parse stored questions
    const storedQuestions = JSON.parse(testSession.questions);

    // Grade the test
    let correctCount = 0;
    const gradedAnswers = answers.map((answer, index) => {
      const question = storedQuestions[index];
      const isCorrect = question && answer.selectedAnswer === question.correctAnswer;
      
      if (isCorrect) correctCount++;

      return {
        questionNumber: answer.questionNumber || index + 1,
        selectedAnswer: answer.selectedAnswer,
        correctAnswer: question?.correctAnswer,
        isCorrect,
        explanation: question?.explanation
      };
    });

    // Calculate score percentage
    const scorePercentage = (correctCount / storedQuestions.length) * 100;

    // Prepare data for AI feedback
    const incorrectQuestions = gradedAnswers
      .filter(a => !a.isCorrect)
      .map((a, idx) => ({
        topic: storedQuestions[idx]?.topic || testSession.topic,
        question: storedQuestions[idx]?.text
      }));

    // Generate AI-powered feedback summary
    let feedbackSummary;
    try {
      feedbackSummary = await gptService.generateFeedbackSummary({
        correctCount,
        totalQuestions: storedQuestions.length,
        incorrectQuestions
      }, testSession.topic);
    } catch (error) {
      console.error('Feedback generation failed, using default:', error.message);
      // Fallback to simple feedback
      feedbackSummary = scorePercentage >= 80 
        ? `Excellent performance! You scored ${scorePercentage.toFixed(1)}%. Keep up the great work!`
        : scorePercentage >= 60
        ? `Good effort! You scored ${scorePercentage.toFixed(1)}%. Review the explanations to improve further.`
        : `You scored ${scorePercentage.toFixed(1)}%. Focus on understanding the concepts and practice more.`;
    }

    // Update test session
    const updatedSession = await prisma.testSession.update({
      where: { id: sessionId },
      data: {
        answers: JSON.stringify(gradedAnswers),
        scorePercentage,
        status: 'COMPLETED',
        feedbackSummary,
        endTime: new Date()
      }
    });

    console.log(`✅ Test submitted: Session ${sessionId}, Score: ${scorePercentage.toFixed(1)}%`);

    // UPDATE: Build weakness profile based on test performance
    try {
      // Fetch current user's weakness profile
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { currentWeaknessProfile: true }
      });

      let weaknessProfile = {};
      try {
        weaknessProfile = JSON.parse(user.currentWeaknessProfile || '{}');
      } catch (e) {
        console.warn('Failed to parse existing weakness profile, starting fresh');
      }

      // Calculate time per question (if timing data available)
      const totalTestTime = updatedSession.endTime - testSession.startTime; // milliseconds
      const avgTimePerQuestion = totalTestTime / storedQuestions.length / 1000; // seconds

      // Update weakness profile by topic/category
      storedQuestions.forEach((question, idx) => {
        const topic = question.topic || testSession.topic || 'General';
        const answer = gradedAnswers[idx];
        
        if (!weaknessProfile[topic]) {
          weaknessProfile[topic] = {
            totalAttempts: 0,
            correctAttempts: 0,
            averageScore: 0,
            averageTime: 0,
            lastUpdated: new Date().toISOString()
          };
        }

        // Update statistics
        weaknessProfile[topic].totalAttempts += 1;
        if (answer.isCorrect) {
          weaknessProfile[topic].correctAttempts += 1;
        }
        
        // Recalculate average score
        weaknessProfile[topic].averageScore = 
          (weaknessProfile[topic].correctAttempts / weaknessProfile[topic].totalAttempts) * 100;
        
        // Update average time (rolling average)
        const currentAvgTime = weaknessProfile[topic].averageTime || avgTimePerQuestion;
        weaknessProfile[topic].averageTime = (currentAvgTime + avgTimePerQuestion) / 2;
        
        weaknessProfile[topic].lastUpdated = new Date().toISOString();
      });

      // Save updated weakness profile
      await prisma.user.update({
        where: { id: userId },
        data: {
          currentWeaknessProfile: JSON.stringify(weaknessProfile)
        }
      });

      console.log(`📊 Updated weakness profile for user ${userId} with ${storedQuestions.length} questions`);

    } catch (weaknessError) {
      console.error('⚠️ Failed to update weakness profile:', weaknessError.message);
      // Don't fail the entire request if weakness profile update fails
    }

    // Return results
    return res.status(200).json({
      message: 'Test submitted successfully',
      sessionId: updatedSession.id,
      scorePercentage,
      correctCount,
      totalQuestions: storedQuestions.length,
      status: 'COMPLETED',
      feedbackSummary,
      gradedAnswers,
      startTime: updatedSession.startTime,
      endTime: updatedSession.endTime
    });

  } catch (error) {
    console.error('❌ Submit test error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'An error occurred while submitting the test',
      details: error.message
    });
  }
};

/**
 * Get user's test history
 */
const getTestHistory = async (req, res) => {
  try {
    const userId = req.user.userId;

    const sessions = await prisma.testSession.findMany({
      where: { userId },
      orderBy: { startTime: 'desc' },
      select: {
        id: true,
        testName: true,
        topic: true,
        scorePercentage: true,
        status: true,
        startTime: true,
        endTime: true
      }
    });

    return res.status(200).json({
      message: 'Test history retrieved successfully',
      count: sessions.length,
      sessions
    });

  } catch (error) {
    console.error('❌ Get test history error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'An error occurred while retrieving test history' 
    });
  }
};

/**
 * Get specific test session details
 */
const getTestSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.userId;

    const session = await prisma.testSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return res.status(404).json({ 
        error: 'Not Found', 
        message: 'Test session not found' 
      });
    }

    // Verify ownership
    if (session.userId !== userId) {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: 'You do not have permission to view this test' 
      });
    }

    // Parse JSON fields
    const questions = JSON.parse(session.questions);
    const answers = session.answers ? JSON.parse(session.answers) : [];

    return res.status(200).json({
      message: 'Test session retrieved successfully',
      session: {
        id: session.id,
        testName: session.testName,
        topic: session.topic,
        scorePercentage: session.scorePercentage,
        status: session.status,
        feedbackSummary: session.feedbackSummary,
        startTime: session.startTime,
        endTime: session.endTime,
        questions,
        answers
      }
    });

  } catch (error) {
    console.error('❌ Get test session error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'An error occurred while retrieving the test session' 
    });
  }
};

/**
 * Grade LAT essay using FREE grader first, then GPT fallback
 */
const freeEssayGrader = require('../services/free-essay-grader.service');

const gradeLatEssay = async (req, res) => {
  try {
    const { essayText, topic, prompt } = req.body;
    const userId = req.user.userId;

    // Input validation
    if (!essayText || typeof essayText !== 'string') {
      return res.status(400).json({ 
        error: 'Bad Request', 
        message: 'Essay text is required and must be a string' 
      });
    }

    if (essayText.length < 50) {
      return res.status(400).json({ 
        error: 'Bad Request', 
        message: 'Essay must be at least 50 characters long' 
      });
    }

    if (essayText.length > 5000) {
      return res.status(400).json({ 
        error: 'Bad Request', 
        message: 'Essay must not exceed 5000 characters' 
      });
    }

    console.log(`📝 Grading LAT essay for user ${userId}: ${topic || 'General'} (${essayText.length} chars)`);

    // PRIMARY: Use free essay grader (no API key required)
    let gradingResult = null;
    try {
      gradingResult = freeEssayGrader.gradeEssay(essayText, topic || prompt || 'General LAT Essay');
      console.log(`✅ Free grader produced score: ${gradingResult.overallScore}/10`);
    } catch (freeErr) {
      console.warn('⚠️ Free grader failed, will try GPT fallback if available:', freeErr.message);
      gradingResult = null;
    }

    // FALLBACK: If free grader failed, try GPT service (optional)
    if (!gradingResult) {
      const hasOpenAIKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'YOUR_GPT_4_API_KEY_HERE';
      if (hasOpenAIKey) {
        try {
          gradingResult = await gptService.gradeEssay(essayText, topic || prompt || 'General LAT Essay');
          console.log(`✅ GPT grader produced score: ${gradingResult.overallScore}/10`);
        } catch (gptErr) {
          console.error('❌ GPT grader also failed:', gptErr.message);
          return res.status(500).json({ error: 'Internal Server Error', message: 'Failed to grade essay. Please try again later.' });
        }
      } else {
        return res.status(500).json({ error: 'Internal Server Error', message: 'Failed to grade essay. Free grader error and no OpenAI key configured.' });
      }
    }

    // Save essay submission to database
    const essaySubmission = await prisma.latEssaySubmission.create({
      data: {
        userId: userId,
        topic: topic || prompt || 'General LAT Essay',
        essayText: essayText,
        essayLength: gradingResult.essayLength || essayText.length,
        wordCount: gradingResult.wordCount || essayText.split(/\s+/).length,
        overallScore: gradingResult.overallScore,
        thesisScore: gradingResult.rawScores?.thesis || 0,
        organizationScore: gradingResult.rawScores?.organization || 0,
        evidenceScore: gradingResult.rawScores?.evidence || 0,
        analysisScore: gradingResult.rawScores?.analysis || 0,
        languageScore: gradingResult.rawScores?.language || 0,
        feedback: JSON.stringify(gradingResult.feedback || []),
        sampleIntro: gradingResult.sampleIntro || null,
        sampleConclusion: gradingResult.sampleConclusion || null,
        improvedEssay: gradingResult.improvedEssay || null
      }
    });

    console.log(`💾 Essay submission saved: ${essaySubmission.id}`);

    // Build response with rubric and sample guidance
    return res.status(200).json({
      message: 'Essay graded successfully',
      submissionId: essaySubmission.id,
      grading: {
        overallScore: gradingResult.overallScore,
        maxScore: 10,
        percentage: (gradingResult.overallScore / 10) * 100,
        rubric: gradingResult.rubric || null,
        rawScores: gradingResult.rawScores || null,
        weightedScores: gradingResult.weightedScores || null,
        feedback: gradingResult.feedback || null,
        sampleIntro: gradingResult.sampleIntro || null,
        sampleConclusion: gradingResult.sampleConclusion || null,
        improvedEssay: gradingResult.improvedEssay || null,
        essayLength: gradingResult.essayLength || essayText.length,
        wordCount: gradingResult.wordCount || essayText.split(/\s+/).length
      }
    });

  } catch (error) {
    console.error('❌ Grade LAT essay error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'An error occurred while grading the essay',
      details: error.message
    });
  }
};

/**
 * Get user's LAT essay submission history
 */
const getEssayHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 10, offset = 0 } = req.query;

    const essays = await prisma.latEssaySubmission.findMany({
      where: { userId: userId },
      orderBy: { submittedAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
      select: {
        id: true,
        topic: true,
        essayLength: true,
        wordCount: true,
        overallScore: true,
        submittedAt: true
      }
    });

    const totalCount = await prisma.latEssaySubmission.count({
      where: { userId: userId }
    });

    return res.status(200).json({
      message: 'Essay history retrieved successfully',
      essays,
      totalCount,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
    console.error('❌ Get essay history error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'Failed to retrieve essay history' 
    });
  }
};

/**
 * Get detailed essay submission by ID
 */
const getEssaySubmission = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { submissionId } = req.params;

    const essay = await prisma.latEssaySubmission.findFirst({
      where: { 
        id: submissionId,
        userId: userId // Ensure user can only access their own essays
      }
    });

    if (!essay) {
      return res.status(404).json({ 
        error: 'Not Found', 
        message: 'Essay submission not found' 
      });
    }

    // Parse feedback JSON
    const parsedFeedback = essay.feedback ? JSON.parse(essay.feedback) : [];

    return res.status(200).json({
      message: 'Essay submission retrieved successfully',
      essay: {
        ...essay,
        feedback: parsedFeedback
      }
    });

  } catch (error) {
    console.error('❌ Get essay submission error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'Failed to retrieve essay submission' 
    });
  }
};

module.exports = {
  startTest,
  submitTest,
  getTestHistory,
  getTestSession,
  gradeLatEssay,
  getEssayHistory,
  getEssaySubmission
};
