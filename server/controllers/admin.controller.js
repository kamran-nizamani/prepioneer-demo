const prisma = require('../db');

/**
 * Admin Controller - Administrative Functions
 * Restricted to ADMIN and INSTRUCTOR roles
 */

/**
 * Get all users in the system
 * @route GET /api/admin/users
 * @access ADMIN only
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            tests: true,
            testAttempts: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format the response with additional computed data
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      joinedDate: user.createdAt,
      testsCreated: user._count.tests,
      testsCompleted: user._count.testAttempts
    }));

    res.status(200).json({
      success: true,
      count: formattedUsers.length,
      users: formattedUsers
    });
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ 
      error: 'Server Error', 
      message: 'Failed to retrieve users' 
    });
  }
};

/**
 * Update user role
 * @route PATCH /api/admin/users/:userId/role
 * @access ADMIN only
 */
const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ['STUDENT', 'INSTRUCTOR', 'ADMIN'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ 
        error: 'Bad Request', 
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}` 
      });
    }

    // Prevent self-demotion from admin
    if (req.user.userId === parseInt(userId) && role !== 'ADMIN') {
      return res.status(400).json({ 
        error: 'Bad Request', 
        message: 'Cannot change your own admin role' 
      });
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        error: 'Not Found', 
        message: 'User not found' 
      });
    }

    res.status(500).json({ 
      error: 'Server Error', 
      message: 'Failed to update user role' 
    });
  }
};

/**
 * Get platform-wide metrics
 * @route GET /api/admin/metrics
 * @access ADMIN and INSTRUCTOR
 */
const getPlatformMetrics = async (req, res) => {
  try {
    // Get total users
    const totalUsers = await prisma.user.count();

    // Get total tests created
    const totalTests = await prisma.test.count();

    // Get total test sessions (includes both completed and in-progress)
    const totalAttempts = await prisma.testSession.count();

    // Get completed test sessions with scores
    const completedSessions = await prisma.testSession.findMany({
      where: {
        status: 'COMPLETED',
        scorePercentage: {
          not: null
        }
      },
      select: {
        scorePercentage: true
      }
    });

    // Calculate average score percentage
    let averageScore = 0;
    if (completedSessions.length > 0) {
      const totalPercentage = completedSessions.reduce((sum, session) => {
        return sum + session.scorePercentage;
      }, 0);
      averageScore = (totalPercentage / completedSessions.length).toFixed(2);
    }

    // Get test sessions created in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentTests = await prisma.testSession.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    });

    // Get active users (users who took a test in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeUsers = await prisma.testSession.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      select: {
        userId: true
      },
      distinct: ['userId']
    });

    res.status(200).json({
      success: true,
      metrics: {
        totalUsers,
        totalTests,
        totalAttempts,
        completedSessions: completedSessions.length,
        averageScore: parseFloat(averageScore),
        recentTests,
        activeUsers: activeUsers.length
      }
    });
  } catch (error) {
    console.error('Error fetching platform metrics:', error);
    res.status(500).json({ 
      error: 'Server Error', 
      message: 'Failed to retrieve platform metrics' 
    });
  }
};

/**
 * Create a manual question (for instructors to add curriculum content)
 * @route POST /api/admin/content/create
 * @access INSTRUCTOR and ADMIN
 */
const createQuestion = async (req, res) => {
  try {
    const { 
      questionText, 
      questionType, 
      options, 
      correctAnswer, 
      difficulty, 
      category,
      explanation 
    } = req.body;

    // Validate required fields
    if (!questionText || !questionType || !correctAnswer || !difficulty || !category) {
      return res.status(400).json({ 
        error: 'Bad Request', 
        message: 'Missing required fields: questionText, questionType, correctAnswer, difficulty, category' 
      });
    }

    // Validate question type
    const validTypes = ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER'];
    if (!validTypes.includes(questionType)) {
      return res.status(400).json({ 
        error: 'Bad Request', 
        message: `Invalid questionType. Must be one of: ${validTypes.join(', ')}` 
      });
    }

    // Validate difficulty (must be 1-5)
    if (typeof difficulty !== 'number' || difficulty < 1 || difficulty > 5) {
      return res.status(400).json({ 
        error: 'Bad Request', 
        message: 'Difficulty must be a number between 1 and 5' 
      });
    }

    // For multiple choice, validate options
    if (questionType === 'MULTIPLE_CHOICE') {
      if (!options || !Array.isArray(options) || options.length < 2) {
        return res.status(400).json({ 
          error: 'Bad Request', 
          message: 'Multiple choice questions must have at least 2 options' 
        });
      }
    }

    // Create standalone question
    const question = await prisma.question.create({
      data: {
        questionText,
        questionType,
        options: questionType === 'MULTIPLE_CHOICE' ? JSON.stringify(options) : null,
        correctAnswer,
        difficulty,
        category,
        explanation: explanation || null
      }
    });

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      question
    });
  } catch (error) {
    console.error('Error creating manual question:', error);
    res.status(500).json({ 
      error: 'Server Error', 
      message: 'Failed to create question' 
    });
  }
};

/**
 * Get aggregated student performance data
 * @route GET /api/admin/performance
 * @access INSTRUCTOR and ADMIN
 */
const getAggregatedPerformance = async (req, res) => {
  try {
    // Get all students (non-admin, non-instructor users)
    const students = await prisma.user.findMany({
      where: {
        role: 'STUDENT'
      },
      select: {
        id: true,
        name: true,
        email: true,
        testSessions: {
          where: {
            status: 'COMPLETED',
            scorePercentage: {
              not: null
            }
          },
          select: {
            scorePercentage: true,
            topic: true,
            questions: true
          }
        }
      }
    });

    // Calculate performance metrics for each student
    const performanceData = students.map(student => {
      const sessions = student.testSessions;
      
      if (sessions.length === 0) {
        return {
          id: student.id,
          name: student.name,
          email: student.email,
          totalAttempts: 0,
          averageScore: 0,
          weakestCategory: 'N/A',
          strongestCategory: 'N/A'
        };
      }

      // Calculate average score
      const totalPercentage = sessions.reduce((sum, session) => {
        return sum + session.scorePercentage;
      }, 0);
      const averageScore = (totalPercentage / sessions.length).toFixed(2);

      // Find weakest and strongest categories
      const categoryScores = {};
      sessions.forEach(session => {
        const category = session.topic;
        const percentage = session.scorePercentage;
        
        if (!categoryScores[category]) {
          categoryScores[category] = { total: 0, count: 0 };
        }
        categoryScores[category].total += percentage;
        categoryScores[category].count += 1;
      });

      // Calculate average per category
      const categoryAverages = Object.entries(categoryScores).map(([category, data]) => ({
        category,
        average: data.total / data.count
      }));

      // Sort by average to find weakest and strongest
      categoryAverages.sort((a, b) => a.average - b.average);

      const weakestCategory = categoryAverages.length > 0 
        ? `${categoryAverages[0].category} (${categoryAverages[0].average.toFixed(1)}%)`
        : 'N/A';
      
      const strongestCategory = categoryAverages.length > 0 
        ? `${categoryAverages[categoryAverages.length - 1].category} (${categoryAverages[categoryAverages.length - 1].average.toFixed(1)}%)`
        : 'N/A';

      return {
        id: student.id,
        name: student.name,
        email: student.email,
        totalAttempts: sessions.length,
        averageScore: parseFloat(averageScore),
        weakestCategory,
        strongestCategory
      };
    });

    // Sort by average score descending
    performanceData.sort((a, b) => b.averageScore - a.averageScore);

    res.status(200).json({
      success: true,
      count: performanceData.length,
      performance: performanceData
    });
  } catch (error) {
    console.error('Error fetching aggregated performance:', error);
    res.status(500).json({ 
      error: 'Server Error', 
      message: 'Failed to retrieve performance data' 
    });
  }
};

module.exports = {
  getAllUsers,
  updateUserRole,
  getPlatformMetrics,
  createQuestion,
  getAggregatedPerformance
};
