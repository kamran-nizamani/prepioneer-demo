const prisma = require('../db');

/**
 * Public Controller - No authentication required
 * Handles public-facing data like test catalog
 */

/**
 * @route GET /api/public/tests/catalog
 * @description Fetches the list of all active competitive exams
 * @access Public (no authentication required)
 */
const getTestCatalog = async (req, res) => {
  try {
    const catalog = await prisma.testCatalog.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        title: true,
        acronym: true,
        type: true,
        conductingBody: true,
        description: true,
      },
      orderBy: { title: 'asc' },
    });
    
    console.log(`📋 Fetched ${catalog.length} active test catalog entries`);
    
    // Respond with status 200 and the list of exams
    return res.status(200).json({
      success: true,
      count: catalog.length,
      catalog: catalog
    });
  } catch (error) {
    console.error('❌ Error fetching test catalog:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to retrieve test catalog.',
      error: error.message
    });
  }
};

/**
 * @route GET /api/public/tests/catalog/:id
 * @description Fetches detailed information about a specific exam
 * @access Public
 */
const getTestCatalogById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const exam = await prisma.testCatalog.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            questions: true,
            testSessions: true,
          }
        }
      }
    });
    
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found in catalog'
      });
    }
    
    return res.status(200).json({
      success: true,
      exam: exam
    });
  } catch (error) {
    console.error('❌ Error fetching exam details:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to retrieve exam details.',
      error: error.message
    });
  }
};

module.exports = {
  getTestCatalog,
  getTestCatalogById
};
