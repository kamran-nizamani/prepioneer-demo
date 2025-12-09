const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// GET /api/public/exam-content/:acronym
// Fetch markdown content for a specific exam
router.get('/:acronym', async (req, res) => {
  try {
    const { acronym } = req.params;
    
    // Map acronyms to filenames
    const validAcronyms = {
      'CSS': 'CSS.md',
      'MDCAT': 'MDCAT.md',
      'ECAT': 'ECAT.md',
      'LAT': 'LAT.md',
      'NAT': 'NAT.md',
      'PMS': 'PMS.md',
      'GAT-General': 'GAT.md',
      'NTS-NAT': 'NTS-NAT.md'
    };

    const filename = validAcronyms[acronym];
    
    if (!filename) {
      return res.status(404).json({ 
        error: 'Exam not found',
        message: `No content available for exam: ${acronym}`
      });
    }

    // Read markdown file from EXAM_CONTENT directory
    const filePath = path.join(__dirname, '..', '..', 'EXAM_CONTENT', filename);
    const markdownContent = await fs.readFile(filePath, 'utf-8');

    res.json({
      acronym,
      filename,
      content: markdownContent,
      contentType: 'markdown'
    });

  } catch (error) {
    console.error('Error reading exam content:', error);
    
    if (error.code === 'ENOENT') {
      return res.status(404).json({ 
        error: 'Content file not found',
        message: 'The requested exam content file does not exist.'
      });
    }
    
    res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to load exam content. Please try again later.'
    });
  }
});

// GET /api/public/exam-content
// List all available exam content
router.get('/', async (req, res) => {
  try {
    const examsList = [
      { acronym: 'CSS', title: 'Central Superior Services Exam', filename: 'CSS.md' },
      { acronym: 'MDCAT', title: 'National Medical & Dental College Admission Test', filename: 'MDCAT.md' },
      { acronym: 'ECAT', title: 'Engineering College Admission Test', filename: 'ECAT.md' },
      { acronym: 'LAT', title: 'Law Admission Test', filename: 'LAT.md' },
      { acronym: 'NAT', title: 'National Aptitude Test', filename: 'NAT.md' },
      { acronym: 'PMS', title: 'Provincial Management Service', filename: 'PMS.md' },
      { acronym: 'GAT-General', title: 'Graduate Assessment Test', filename: 'GAT.md' },
      { acronym: 'NTS-NAT', title: 'Business Schools Admission Test', filename: 'NTS-NAT.md' }
    ];

    res.json({
      count: examsList.length,
      exams: examsList
    });

  } catch (error) {
    console.error('Error listing exam content:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to list exam content.'
    });
  }
});

module.exports = router;
