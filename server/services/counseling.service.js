const OpenAI = require('openai');
const prisma = require('../db');
const knowledgeBase = require('./knowledge-base.service');

/**
 * AI Counseling Service
 * Provides personalized guidance and study plan generation using GPT-4
 * Enhanced with exam-specific knowledge base for accurate answers
 */

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate a personalized 7-day study plan based on weakness profile
 * @param {number} userId - User ID
 * @param {object} weaknessProfile - Detailed weakness map (topics, scores, time metrics)
 * @param {number} examId - Target exam catalog ID
 * @returns {Promise<object>} 7-day study plan with daily topics and resources
 */
async function generateStudyPlan(userId, weaknessProfile, examId) {
  try {
    console.log(`📚 Generating study plan for user ${userId}, exam ${examId}...`);

    // Fetch user preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        studyPlanPreferences: true,
        currentWeaknessProfile: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Parse preferences (or use defaults)
    let preferences = {};
    try {
      preferences = JSON.parse(user.studyPlanPreferences || '{}');
    } catch (e) {
      console.warn('Failed to parse study plan preferences, using defaults');
      preferences = {
        dailyStudyHours: 3,
        preferredPace: 'moderate',
        focusAreas: []
      };
    }

    // Parse weakness profile
    let weaknesses = {};
    try {
      weaknesses = weaknessProfile || JSON.parse(user.currentWeaknessProfile || '{}');
    } catch (e) {
      console.warn('Failed to parse weakness profile, using defaults');
      weaknesses = {};
    }

    // Fetch exam details
    let examInfo = null;
    if (examId) {
      examInfo = await prisma.testCatalog.findUnique({
        where: { id: examId }
      });
    }

    // Check API key availability
    const hasOpenAIKey = process.env.OPENAI_API_KEY && 
                         process.env.OPENAI_API_KEY !== 'YOUR_GPT_4_API_KEY_HERE';

    if (!hasOpenAIKey) {
      console.log('ℹ️ OpenAI API key not configured, generating basic study plan...');
      return generateBasicStudyPlan(weaknesses, preferences, examInfo);
    }

    // System prompt for study plan generation
    const systemPrompt = `You are Dr. Ahmad Khan, a renowned educational counselor with 15+ years of experience coaching students for Pakistani competitive exams (CSS, MDCAT, ECAT, LAT, NAT, PMS, GAT).

Your expertise includes:
- Understanding Pakistani exam patterns and syllabus requirements
- Evidence-based study techniques (Pomodoro, active recall, spaced repetition)
- Psychology of exam preparation and stress management
- Subject-specific strategies for each competitive exam

Your task is to create a highly personalized, scientifically-backed 7-day study plan that:
1. PRIORITIZES weakest areas (lowest scores first) with specific sub-topics
2. BALANCES difficulty progression (easy → medium → hard) to build confidence
3. INCORPORATES spaced repetition intervals (review on Day 1, 3, 7)
4. PROVIDES actionable resources (specific book chapters, YouTube channels, websites)
5. ADAPTS to daily study hours with realistic break schedules
6. INCLUDES varied practice (MCQs, conceptual questions, past papers)
7. SETS measurable goals for each day (e.g., "Master 20 Physics formulas")
8. ADDRESSES exam-specific requirements (MDCAT negative marking, CSS essay structure, etc.)

Return ONLY valid JSON with no additional text or markdown formatting.`;

    // Analyze weakness profile for insights
    const weakTopics = Object.entries(weaknesses)
      .sort(([, a], [, b]) => (a.averageScore || 0) - (b.averageScore || 0))
      .slice(0, 5);
    
    const strongTopics = Object.entries(weaknesses)
      .sort(([, a], [, b]) => (b.averageScore || 0) - (a.averageScore || 0))
      .slice(0, 3);

    const totalAttempts = Object.values(weaknesses).reduce((sum, w) => sum + (w.totalAttempts || 0), 0);
    const overallScore = totalAttempts > 0 
      ? Object.values(weaknesses).reduce((sum, w) => sum + ((w.averageScore || 0) * (w.totalAttempts || 0)), 0) / totalAttempts
      : 0;

    // User prompt with all context
    const userPrompt = `Generate a 7-day personalized study plan for ${user.name}.

**Target Exam**: ${examInfo ? `${examInfo.title} (${examInfo.acronym})` : 'General Competitive Exam'}
**Conducting Body**: ${examInfo ? examInfo.conductingBody : 'N/A'}
**Exam Type**: ${examInfo ? examInfo.type : 'Competitive'}

**Student Profile**:
- Name: ${user.name}
- Overall Score: ${overallScore.toFixed(1)}%
- Total Questions Attempted: ${totalAttempts}
- Study Hours Available: ${preferences.dailyStudyHours || 3} hours/day
- Preferred Pace: ${preferences.preferredPace || 'moderate'}
- Priority Subjects: ${preferences.focusAreas?.join(', ') || 'All subjects'}

**Performance Analysis**:

🔴 WEAKEST AREAS (Need immediate attention):
${weakTopics.map(([topic, data], idx) => 
  `${idx + 1}. ${topic}: ${(data.averageScore || 0).toFixed(1)}% (${data.totalAttempts} attempts, avg time: ${(data.averageTime || 0).toFixed(1)}s)`
).join('\n') || 'No data yet'}

🟢 STRONGEST AREAS (Maintain proficiency):
${strongTopics.map(([topic, data], idx) => 
  `${idx + 1}. ${topic}: ${(data.averageScore || 0).toFixed(1)}% (${data.totalAttempts} attempts)`
).join('\n') || 'No data yet'}

**Current Weakness Profile**:
${JSON.stringify(weaknesses, null, 2)}

**Requirements**:
1. Create exactly 7 days of study schedule
2. Each day should include:
   - Date (relative: Day 1, Day 2, etc.)
   - 2-4 study sessions with specific topics
   - Time allocation per session (in minutes)
   - Difficulty level (easy/medium/hard)
   - Recommended resources or techniques
   - Practice question count
3. Prioritize weakest topics (lowest scores) in first 3 days
4. Include review sessions on days 4-5
5. Add mock tests or full practice on days 6-7
6. Ensure total daily time doesn't exceed student's daily study hours

**Output Format** (JSON):
{
  "examTitle": "string",
  "studentName": "string",
  "totalDays": 7,
  "plan": [
    {
      "day": 1,
      "label": "Day 1",
      "focusArea": "string (e.g., Weakest Topics - Physics)",
      "sessions": [
        {
          "topic": "string",
          "duration": number (minutes),
          "difficulty": "easy|medium|hard",
          "resources": ["string"],
          "practiceQuestions": number,
          "tips": "string"
        }
      ],
      "totalMinutes": number,
      "goalForDay": "string"
    }
  ],
  "overallGoal": "string",
  "weeklyTarget": "string"
}`;

    // Call OpenAI GPT-4
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4000
    });

    const responseText = completion.choices[0].message.content;
    
    if (!responseText) {
      throw new Error('Empty response from OpenAI API');
    }

    const studyPlan = JSON.parse(responseText);

    console.log(`✅ Study plan generated successfully for ${user.name}`);
    return studyPlan;

  } catch (error) {
    console.error('❌ Error generating study plan:', error.message);
    
    // Fallback to basic plan on error
    return generateBasicStudyPlan(weaknessProfile, {}, null);
  }
}

/**
 * Generate a basic study plan without GPT (fallback)
 * @param {object} weaknessProfile - Weakness data
 * @param {object} preferences - User preferences
 * @param {object} examInfo - Exam information
 * @returns {object} Basic 7-day study plan
 */
function generateBasicStudyPlan(weaknessProfile, preferences, examInfo) {
  const dailyHours = preferences.dailyStudyHours || 3;
  const dailyMinutes = dailyHours * 60;

  // Extract weakest topics
  const topics = Object.keys(weaknessProfile).sort((a, b) => {
    const scoreA = weaknessProfile[a]?.averageScore || 100;
    const scoreB = weaknessProfile[b]?.averageScore || 100;
    return scoreA - scoreB;
  }).slice(0, 10);

  const plan = [];
  
  for (let day = 1; day <= 7; day++) {
    const sessions = [];
    const topicsForDay = topics.slice((day - 1) * 2, (day - 1) * 2 + 2);

    topicsForDay.forEach((topic, idx) => {
      sessions.push({
        topic: topic || 'General Review',
        duration: Math.floor(dailyMinutes / 2),
        difficulty: day <= 3 ? 'medium' : 'hard',
        resources: ['Textbook chapter', 'Online videos', 'Practice questions'],
        practiceQuestions: day <= 3 ? 10 : 20,
        tips: day <= 3 ? 'Focus on understanding core concepts' : 'Apply concepts to solve problems'
      });
    });

    plan.push({
      day,
      label: `Day ${day}`,
      focusArea: day <= 3 ? 'Weak Topics' : day <= 5 ? 'Review & Practice' : 'Mock Tests',
      sessions,
      totalMinutes: dailyMinutes,
      goalForDay: day <= 3 ? 'Master fundamentals' : day <= 5 ? 'Build confidence' : 'Test readiness'
    });
  }

  return {
    examTitle: examInfo ? examInfo.title : 'Competitive Exam Preparation',
    studentName: 'Student',
    totalDays: 7,
    plan,
    overallGoal: 'Improve weak areas and build exam confidence',
    weeklyTarget: 'Complete 7-day intensive preparation cycle'
  };
}

/**
 * Get AI guidance response for student question
 * @param {number} userId - User ID
 * @param {string} question - Student's question
 * @param {object} context - Additional context (exam, profile, etc.)
 * @returns {Promise<string>} AI counselor response
 */
async function getGuidance(userId, question, context = {}) {
  try {
    console.log(`💬 Getting guidance for user ${userId}: "${question}"`);

    // Fetch user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        role: true,
        currentWeaknessProfile: true,
        studyPlanPreferences: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Parse weakness profile
    let weaknesses = {};
    try {
      weaknesses = JSON.parse(user.currentWeaknessProfile || '{}');
    } catch (e) {
      console.warn('Failed to parse weakness profile');
    }

    // ENHANCED: Analyze question with knowledge base
    const examAcronym = context.exam?.acronym || null;
    const questionAnalysis = await knowledgeBase.analyzeQuestion(question, examAcronym);
    
    console.log(`📚 Question analysis: intent=${questionAnalysis.intent}, exam=${questionAnalysis.detectedExam}, hasInfo=${questionAnalysis.hasSpecificInfo}`);

    // Check API key availability
    const hasOpenAIKey = process.env.OPENAI_API_KEY && 
                         process.env.OPENAI_API_KEY !== 'YOUR_GPT_4_API_KEY_HERE';

    if (!hasOpenAIKey) {
      console.log('ℹ️ OpenAI API key not configured, providing basic guidance...');
      return getBasicGuidance(question, weaknesses);
    }

    // System prompt for counseling
    const systemPrompt = `You are Dr. Ayesha Rahman, a senior educational psychologist and exam counselor with 20+ years of experience guiding Pakistani students through competitive exams (CSS, MDCAT, ECAT, LAT, NAT, PMS, GAT).

**Your Expertise**:
- Deep knowledge of Pakistani education system (FPSC, HEC, NTS, UET, NUST, LUMS)
- Complete mastery of exam patterns, syllabus, procedures, and marking schemes
- Evidence-based study techniques and cognitive learning strategies
- Stress management, motivation psychology, and exam anxiety handling
- Career counseling for government services, medical, engineering, and law fields
- Understanding of student challenges (language barriers, resource limitations, time pressure)

**Your Communication Style**:
1. EMPATHETIC - Acknowledge student's feelings and struggles
2. SPECIFIC - Give concrete, accurate information from official sources
3. EVIDENCE-BASED - Reference proven study techniques and strategies
4. ACCURATE - Use the provided exam documentation for factual answers
5. REALISTIC - Set achievable goals based on current performance
6. MOTIVATIONAL - Encourage without false promises
7. CONTEXTUAL - Use Pakistani examples and cultural understanding

**Response Guidelines**:
- If asked about exam procedures, patterns, syllabus, or dates: Provide EXACT information from the knowledge base
- If asked about preparation strategies: Combine knowledge base info with personalized advice
- If asked about performance: Use student's weakness profile data
- Start with direct answer to their question
- Add context and actionable steps
- End with encouragement

**CRITICAL**: When specific exam information is provided in the context below, use it EXACTLY as written. Don't improvise or guess about exam details.

Keep responses conversational (3-5 paragraphs), accurate, and supportive.`;

    // Analyze performance for insights
    const weakTopics = Object.entries(weaknesses)
      .sort(([, a], [, b]) => (a.averageScore || 0) - (b.averageScore || 0))
      .slice(0, 5);
    
    const totalAttempts = Object.values(weaknesses).reduce((sum, w) => sum + (w.totalAttempts || 0), 0);
    const avgScore = totalAttempts > 0
      ? Object.values(weaknesses).reduce((sum, w) => sum + ((w.averageScore || 0) * (w.totalAttempts || 0)), 0) / totalAttempts
      : 0;

    const performanceSummary = weakTopics.length > 0
      ? weakTopics.map(([topic, data]) => 
          `- ${topic}: ${(data.averageScore || 0).toFixed(0)}% (${data.totalAttempts} questions)`
        ).join('\n')
      : 'No test history yet - student is just starting';

    // User prompt with context
    const userPrompt = `**Student Profile**:
- Name: ${user.name}
- Role: ${user.role}
- Overall Performance: ${avgScore.toFixed(1)}% across ${totalAttempts} questions
- Tests Taken: ${Object.keys(weaknesses).length} different topics

**Current Weakness Areas**:
${performanceSummary}

**Exam Context**:
${context.exam ? `Preparing for: ${context.exam.title} (${context.exam.acronym})\nConducted by: ${context.exam.conductingBody}` : 'General preparation'}

${questionAnalysis.hasSpecificInfo ? `**OFFICIAL EXAM INFORMATION**:
\`\`\`
${questionAnalysis.relevantContent}
\`\`\`
**IMPORTANT**: Use this official information EXACTLY as provided above to answer factual questions about the exam. This is verified, accurate content from official sources.
` : ''}

**Student's Question**:
"${question}"

**Instructions**:
Provide a personalized, empathetic response that:
1. ${questionAnalysis.hasSpecificInfo ? 'Answer their question using the OFFICIAL EXAM INFORMATION provided above (use exact facts, numbers, dates)' : 'Acknowledges their current situation and feelings'}
2. Analyzes their performance data (if available)
3. Gives 2-3 specific, actionable recommendations
4. Encourages them with realistic optimism
5. Suggests concrete next steps

Be warm, professional, and culturally aware of Pakistani student challenges.`;

    // Call OpenAI GPT-4
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 800
    });

    const guidance = completion.choices[0].message.content;

    console.log(`✅ Guidance generated successfully`);
    return guidance;

  } catch (error) {
    console.error('❌ Error getting guidance:', error.message);
    return getBasicGuidance(question, {});
  }
}

/**
 * Get basic guidance without GPT (fallback)
 * @param {string} question - Student's question
 * @param {object} weaknesses - Weakness profile
 * @returns {string} Basic guidance response
 */
function getBasicGuidance(question, weaknesses) {
  const hasWeaknesses = Object.keys(weaknesses).length > 0;
  
  let response = `Thank you for your question! Here's some guidance:\n\n`;
  
  if (hasWeaknesses) {
    const weakestTopics = Object.keys(weaknesses)
      .sort((a, b) => (weaknesses[a]?.averageScore || 100) - (weaknesses[b]?.averageScore || 100))
      .slice(0, 3);
    
    response += `Based on your test performance, I notice you're facing challenges in: ${weakestTopics.join(', ')}. `;
    response += `I recommend dedicating extra time to these topics with focused practice and review.\n\n`;
  }
  
  response += `For your specific question about "${question}", I suggest:\n`;
  response += `1. Break down the problem into smaller, manageable parts\n`;
  response += `2. Practice regularly with mock tests to build confidence\n`;
  response += `3. Review your mistakes and understand the underlying concepts\n`;
  response += `4. Seek help from instructors or study groups when stuck\n\n`;
  response += `Keep working hard - consistent effort leads to improvement! 🎯`;
  
  return response;
}

module.exports = {
  generateStudyPlan,
  getGuidance
};
