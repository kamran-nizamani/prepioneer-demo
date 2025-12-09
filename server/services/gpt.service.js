const OpenAI = require('openai');

/**
 * GPT Service - AI Question Generator
 * Interfaces with OpenAI's GPT-4 Turbo to generate exam questions
 */

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * JSON Schema for Question Output
 * Matches the Prisma Question model structure
 */
const QUESTION_SCHEMA = {
  type: "object",
  properties: {
    questions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          topic: {
            type: "string",
            description: "The specific topic/subject area of the question"
          },
          difficulty: {
            type: "integer",
            description: "Difficulty level from 1 (easiest) to 5 (hardest)",
            minimum: 1,
            maximum: 5
          },
          type: {
            type: "string",
            description: "Question type (e.g., 'MCQ', 'Long Answer')",
            enum: ["MCQ", "Long Answer"]
          },
          text: {
            type: "string",
            description: "The main question text"
          },
          options: {
            type: "array",
            description: "Array of 4 possible answer options",
            items: {
              type: "string"
            },
            minItems: 4,
            maxItems: 4
          },
          correctAnswer: {
            type: "string",
            description: "The correct answer (must match one of the options)"
          },
          explanation: {
            type: "string",
            description: "Detailed explanation of why the answer is correct"
          }
        },
        required: ["topic", "difficulty", "type", "text", "options", "correctAnswer", "explanation"]
      }
    }
  },
  required: ["questions"]
};

/**
 * Generate exam questions using GPT-4 Turbo
 * @param {string} topic - The subject topic (e.g., "Physics - Current Electricity")
 * @param {number} difficulty - Difficulty level (1-5)
 * @param {number} count - Number of questions to generate
 * @returns {Promise<Array>} Array of question objects
 */
async function generateQuestions(topic, difficulty, count = 5) {
  try {
    // Validate inputs
    if (!topic || typeof topic !== 'string') {
      throw new Error('Topic is required and must be a string');
    }

    if (!difficulty || difficulty < 1 || difficulty > 5) {
      throw new Error('Difficulty must be between 1 and 5');
    }

    if (!count || count < 1 || count > 20) {
      throw new Error('Count must be between 1 and 20');
    }

    // Check API key
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'YOUR_GPT_4_API_KEY_HERE') {
      throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY in .env file');
    }

    console.log(`🤖 Generating ${count} questions for "${topic}" at difficulty ${difficulty}...`);

    // System prompt - Define GPT's role and constraints
    const systemPrompt = `You are an expert MDCAT (Medical and Dental College Admission Test) and LAT (Law Admission Test) question author for Pakistani students. 

Your task is to generate high-quality, accurate multiple-choice questions (MCQs) that:
1. Are appropriate for Pakistani medical/law entrance exams
2. Follow the exact difficulty level specified (1=Very Easy, 2=Easy, 3=Medium, 4=Hard, 5=Very Hard)
3. Have exactly 4 options with only ONE correct answer
4. Include detailed explanations that help students understand the concept
5. Are factually accurate and educational
6. Use clear, concise language suitable for exam conditions

You must respond ONLY with valid JSON matching the schema provided. Do not include any text outside the JSON structure.`;

    // User prompt - Specific generation request
    const userPrompt = `Generate exactly ${count} multiple-choice questions (MCQs) on the topic: "${topic}"

Requirements:
- Difficulty Level: ${difficulty} out of 5
- Number of Questions: ${count}
- Each question must have exactly 4 options
- Include a detailed explanation for each correct answer
- Ensure questions test understanding, not just memorization
- Make the questions challenging but fair for the difficulty level

Return the questions as a JSON object with a "questions" array containing all generated questions.`;

    // Call OpenAI API with GPT-4 Turbo
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8, // Slightly creative but still focused
      max_tokens: 3000,  // Enough for multiple questions with explanations
    });

    // Extract and parse the response
    const responseText = completion.choices[0].message.content;
    
    if (!responseText) {
      throw new Error('Empty response from OpenAI API');
    }

    // Parse JSON response
    const parsedResponse = JSON.parse(responseText);
    
    if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
      throw new Error('Invalid response format: missing questions array');
    }

    const questions = parsedResponse.questions;

    // Validate each question
    questions.forEach((q, index) => {
      if (!q.topic || !q.text || !q.options || !q.correctAnswer || !q.explanation) {
        throw new Error(`Invalid question at index ${index}: missing required fields`);
      }

      if (!Array.isArray(q.options) || q.options.length !== 4) {
        throw new Error(`Invalid question at index ${index}: must have exactly 4 options`);
      }

      if (!q.options.includes(q.correctAnswer)) {
        throw new Error(`Invalid question at index ${index}: correctAnswer must be one of the options`);
      }

      // Ensure difficulty matches requested level
      q.difficulty = difficulty;
      q.type = q.type || "MCQ";
    });

    console.log(`✅ Successfully generated ${questions.length} questions`);
    
    return questions;

  } catch (error) {
    console.error('❌ Error generating questions:', error.message);
    
    // Provide helpful error messages
    if (error.response) {
      // OpenAI API error
      console.error('OpenAI API Error:', error.response.data);
      throw new Error(`OpenAI API Error: ${error.response.data.error?.message || 'Unknown error'}`);
    } else if (error instanceof SyntaxError) {
      // JSON parsing error
      throw new Error('Failed to parse GPT response as JSON');
    } else {
      // Other errors
      throw error;
    }
  }
}

/**
 * Generate a single question (convenience function)
 * @param {string} topic - The subject topic
 * @param {number} difficulty - Difficulty level (1-5)
 * @returns {Promise<Object>} Single question object
 */
async function generateSingleQuestion(topic, difficulty) {
  const questions = await generateQuestions(topic, difficulty, 1);
  return questions[0];
}

/**
 * Test function to verify GPT service is working
 * Call this to test the service before integration
 */
async function testGptService() {
  try {
    console.log('\n🧪 Testing GPT Service...\n');
    
    const testTopic = "Biology - Cell Structure";
    const testDifficulty = 3;
    const testCount = 2;

    console.log(`📝 Generating ${testCount} questions on "${testTopic}" (Difficulty: ${testDifficulty})\n`);

    const questions = await generateQuestions(testTopic, testDifficulty, testCount);

    console.log('\n📋 Generated Questions:\n');
    console.log(JSON.stringify(questions, null, 2));

    console.log('\n✅ GPT Service test completed successfully!\n');
    
    return questions;

  } catch (error) {
    console.error('\n❌ GPT Service test failed:', error.message);
    throw error;
  }
}

/**
 * Generate personalized feedback based on test performance
 * @param {Object} results - Test results with correct/incorrect breakdown
 * @param {string} topic - The test topic
 * @returns {Promise<string>} Personalized feedback summary
 */
async function generateFeedbackSummary(results, topic) {
  try {
    const { correctCount, totalQuestions, incorrectQuestions } = results;
    const scorePercentage = (correctCount / totalQuestions) * 100;

    // Check API key
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'YOUR_GPT_4_API_KEY_HERE') {
      // Return basic feedback if no API key
      if (scorePercentage >= 80) {
        return `Excellent performance! You scored ${scorePercentage.toFixed(1)}%. Keep up the great work!`;
      } else if (scorePercentage >= 60) {
        return `Good effort! You scored ${scorePercentage.toFixed(1)}%. Review the explanations to improve further.`;
      } else {
        return `You scored ${scorePercentage.toFixed(1)}%. Focus on understanding the concepts and practice more.`;
      }
    }

    console.log(`🤖 Generating feedback for ${topic} test (Score: ${scorePercentage.toFixed(1)}%)...`);

    // Prepare analysis data
    const weakAreas = incorrectQuestions.map(q => q.topic).join(', ');

    // System prompt for feedback generation
    const systemPrompt = `You are an expert educational advisor for MDCAT and LAT preparation in Pakistan. 
Your role is to provide constructive, personalized feedback to students based on their test performance.

Your feedback should:
1. Be encouraging and supportive
2. Identify specific weak areas
3. Provide actionable study recommendations
4. Be concise (2-3 sentences maximum)
5. Focus on improvement, not just the score`;

    // User prompt with test data
    const userPrompt = `Generate personalized feedback for a student who took a test on "${topic}".

Test Results:
- Score: ${scorePercentage.toFixed(1)}%
- Correct Answers: ${correctCount}/${totalQuestions}
- Weak Areas: ${weakAreas || 'None identified'}

Provide brief, actionable feedback focusing on:
1. Overall performance assessment
2. Specific areas needing improvement
3. One concrete study recommendation`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 200
    });

    const feedback = completion.choices[0].message.content.trim();

    console.log(`✅ Feedback generated successfully`);
    
    return feedback;

  } catch (error) {
    console.error('❌ Error generating feedback:', error.message);
    
    // Fallback to basic feedback
    const { correctCount, totalQuestions } = results;
    const scorePercentage = (correctCount / totalQuestions) * 100;
    
    if (scorePercentage >= 80) {
      return `Excellent performance! You scored ${scorePercentage.toFixed(1)}%. Keep up the great work!`;
    } else if (scorePercentage >= 60) {
      return `Good effort! You scored ${scorePercentage.toFixed(1)}%. Review the explanations to improve further.`;
    } else {
      return `You scored ${scorePercentage.toFixed(1)}%. Focus on understanding the concepts and practice more.`;
    }
  }
}

/**
 * Grade LAT essay using AI
 * @param {string} essayText - The student's essay
 * @param {string} topic - The essay prompt/topic
 * @returns {Promise<Object>} Grading results with scores and feedback
 */
async function gradeEssay(essayText, topic) {
  try {
    // Input validation
    if (!essayText || essayText.length < 50) {
      throw new Error('Essay text must be at least 50 characters long');
    }

    // Check API key
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'YOUR_GPT_4_API_KEY_HERE') {
      throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY in .env file');
    }

    console.log(`🤖 Grading LAT essay on "${topic}" (${essayText.length} characters)...`);

    // System prompt for essay grading
    const systemPrompt = `You are a qualified LAT (Law Admission Test) examiner for Pakistani universities with expertise in evaluating analytical and argumentative essays.

Your task is to grade essays based on LAT criteria:
1. Content & Argumentation (40%) - Logical reasoning, depth of analysis, relevance
2. Structure & Organization (30%) - Clear introduction, body, conclusion, coherence
3. Language & Grammar (30%) - Vocabulary, sentence structure, grammar accuracy

Grade on a scale of 1-10 and provide detailed, constructive feedback.

You MUST respond with ONLY valid JSON in this exact format:
{
  "overallScore": <number 1-10>,
  "contentFeedback": "<detailed feedback on argument and analysis>",
  "structureFeedback": "<detailed feedback on organization and flow>",
  "grammarFeedback": "<detailed feedback on language and grammar>"
}`;

    // User prompt with essay
    const userPrompt = `Grade this LAT essay:

Topic: ${topic || 'General analytical essay'}

Essay:
${essayText}

Provide comprehensive feedback following LAT grading standards.`;

    // Call OpenAI API with JSON mode
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.6,
      max_tokens: 800
    });

    const responseText = completion.choices[0].message.content;
    const gradingResult = JSON.parse(responseText);

    // Validate response
    if (!gradingResult.overallScore || !gradingResult.contentFeedback || 
        !gradingResult.structureFeedback || !gradingResult.grammarFeedback) {
      throw new Error('Invalid grading response format');
    }

    console.log(`✅ Essay graded successfully: ${gradingResult.overallScore}/10`);
    
    return gradingResult;

  } catch (error) {
    console.error('❌ Error grading essay:', error.message);
    throw error;
  }
}

// Export functions
module.exports = {
  generateQuestions,
  generateSingleQuestion,
  generateFeedbackSummary,
  gradeEssay,
  testGptService,
  QUESTION_SCHEMA
};

// Uncomment to run test when file is executed directly
// if (require.main === module) {
//   testGptService();
// }
