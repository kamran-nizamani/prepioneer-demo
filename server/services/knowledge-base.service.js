const fs = require('fs').promises;
const path = require('path');

/**
 * Knowledge Base Service
 * Loads exam content from markdown files to enhance AI responses
 */

// Cache for loaded exam content
const examContentCache = {};

/**
 * Load exam content from EXAM_CONTENT directory
 * @param {string} examAcronym - Exam acronym (CSS, MDCAT, LAT, etc.)
 * @returns {Promise<string>} - Exam content as string
 */
async function loadExamContent(examAcronym) {
  if (!examAcronym) return null;

  // Check cache first
  if (examContentCache[examAcronym]) {
    return examContentCache[examAcronym];
  }

  try {
    const acronymUpper = examAcronym.toUpperCase();
    const filePath = path.join(__dirname, '..', 'EXAM_CONTENT', `${acronymUpper}.md`);
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Cache the content
    examContentCache[acronymUpper] = content;
    
    console.log(`✅ Loaded exam content for ${acronymUpper} (${content.length} characters)`);
    return content;
  } catch (error) {
    console.warn(`⚠️ Could not load exam content for ${examAcronym}:`, error.message);
    return null;
  }
}

/**
 * Extract specific section from exam content
 * @param {string} content - Full exam content
 * @param {string} sectionName - Section to extract (e.g., "Test Pattern", "Syllabus")
 * @returns {string} - Extracted section or null
 */
function extractSection(content, sectionName) {
  if (!content) return null;

  const sectionRegex = new RegExp(`## ${sectionName}[\\s\\S]*?(?=\\n## |$)`, 'i');
  const match = content.match(sectionRegex);
  
  return match ? match[0] : null;
}

/**
 * Detect question intent and extract relevant information
 * @param {string} question - User's question
 * @param {string} examAcronym - Optional exam context
 * @returns {Promise<object>} - { intent, examInfo, relevantContent }
 */
async function analyzeQuestion(question, examAcronym = null) {
  const questionLower = question.toLowerCase();
  
  // Detect exam mention in question
  const examMentions = {
    'lat': 'LAT',
    'law admission': 'LAT',
    'mdcat': 'MDCAT',
    'medical': 'MDCAT',
    'ecat': 'ECAT',
    'engineering': 'ECAT',
    'css': 'CSS',
    'civil services': 'CSS',
    'nat': 'NAT',
    'nts': 'NTS-NAT',
    'gat': 'GAT',
    'pms': 'PMS'
  };

  let detectedExam = examAcronym;
  for (const [keyword, acronym] of Object.entries(examMentions)) {
    if (questionLower.includes(keyword)) {
      detectedExam = acronym;
      break;
    }
  }

  // Detect question intent
  const intents = {
    procedure: /procedure|process|application|registration|apply|how to register|exam process/i,
    pattern: /pattern|structure|format|questions|marking|duration|time|sections/i,
    syllabus: /syllabus|topics|subjects|what to study|content|curriculum/i,
    difficulty: /difficult|hard|easy|competition|merit|passing marks/i,
    preparation: /prepare|preparation|study|strategy|tips|how to|best way/i,
    resources: /books|material|resources|notes|where to find/i,
    eligibility: /eligibility|qualify|criteria|requirement|who can apply/i,
    dates: /date|when|deadline|schedule|exam date|result/i,
    career: /career|job|opportunities|scope|after|future/i
  };

  let detectedIntent = 'general';
  for (const [intent, regex] of Object.entries(intents)) {
    if (regex.test(questionLower)) {
      detectedIntent = intent;
      break;
    }
  }

  // Load relevant exam content
  let relevantContent = null;
  if (detectedExam) {
    const fullContent = await loadExamContent(detectedExam);
    
    if (fullContent) {
      // Extract relevant sections based on intent
      const sectionMap = {
        procedure: ['Conducting Body', 'Test Pattern'],
        pattern: ['Test Pattern', 'Syllabus Breakdown'],
        syllabus: ['Subjects Covered', 'Syllabus Breakdown'],
        difficulty: ['Difficulty Level', 'Test Pattern'],
        preparation: ['Roadmap', 'Study Strategy'],
        resources: ['Resources', 'Books'],
        eligibility: ['Category & Description', 'Conducting Body'],
        dates: ['Conducting Body', 'Test Pattern'],
        career: ['Category & Description', 'Career Opportunities']
      };

      const relevantSections = sectionMap[detectedIntent] || ['Category & Description'];
      const extractedSections = [];

      for (const section of relevantSections) {
        const sectionContent = extractSection(fullContent, section);
        if (sectionContent) {
          extractedSections.push(sectionContent);
        }
      }

      relevantContent = extractedSections.join('\n\n');
      
      // If no specific sections found, provide first 2000 chars
      if (!relevantContent || relevantContent.length < 100) {
        relevantContent = fullContent.substring(0, 2000);
      }
    }
  }

  return {
    intent: detectedIntent,
    detectedExam: detectedExam,
    relevantContent: relevantContent,
    hasSpecificInfo: !!relevantContent
  };
}

/**
 * Get all available exam acronyms
 * @returns {Promise<string[]>} - Array of exam acronyms
 */
async function getAvailableExams() {
  try {
    const examContentDir = path.join(__dirname, '..', 'EXAM_CONTENT');
    const files = await fs.readdir(examContentDir);
    return files
      .filter(file => file.endsWith('.md'))
      .map(file => file.replace('.md', ''));
  } catch (error) {
    console.warn('Could not read EXAM_CONTENT directory:', error.message);
    return ['CSS', 'MDCAT', 'ECAT', 'LAT', 'NAT', 'PMS', 'GAT', 'NTS-NAT'];
  }
}

module.exports = {
  loadExamContent,
  extractSection,
  analyzeQuestion,
  getAvailableExams
};
