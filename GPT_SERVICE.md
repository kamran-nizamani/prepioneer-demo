# 🤖 AI Question Generator Service Documentation

## 📚 Overview

The GPT Service (`server/services/gpt.service.js`) interfaces with OpenAI's GPT-4 Turbo API to dynamically generate exam-style questions for MDCAT and LAT preparation.

---

## 🎯 Key Features

- ✅ **GPT-4 Turbo Integration** - Latest AI model for high-quality questions
- ✅ **Structured JSON Output** - Strict schema enforcement
- ✅ **Difficulty Levels** - 5 levels from Very Easy to Very Hard
- ✅ **Topic-Specific** - Generates questions for any specified topic
- ✅ **Validation** - Comprehensive input/output validation
- ✅ **Error Handling** - Robust error management
- ✅ **MDCAT/LAT Focused** - Optimized for Pakistani entrance exams

---

## 🔧 Configuration

### 1. Environment Variables

Add to `server/.env`:

```env
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

**⚠️ IMPORTANT:** Replace with your actual OpenAI API key from https://platform.openai.com/api-keys

### 2. Install Dependencies

```bash
cd server
npm install openai
```

---

## 📖 API Reference

### `generateQuestions(topic, difficulty, count)`

Generates multiple exam questions using GPT-4 Turbo.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `topic` | String | Yes | The subject topic (e.g., "Physics - Current Electricity") |
| `difficulty` | Number | Yes | Difficulty level (1-5) |
| `count` | Number | Yes | Number of questions (1-20) |

**Returns:** `Promise<Array<Question>>`

**Example:**

```javascript
const { generateQuestions } = require('./services/gpt.service');

const questions = await generateQuestions(
  "Biology - Cell Structure",
  3,
  5
);
```

**Output Structure:**

```javascript
[
  {
    "topic": "Biology - Cell Structure",
    "difficulty": 3,
    "type": "MCQ",
    "text": "What is the function of mitochondria?",
    "options": [
      "Protein synthesis",
      "Energy production",
      "DNA replication",
      "Cell division"
    ],
    "correctAnswer": "Energy production",
    "explanation": "Mitochondria are known as the powerhouse of the cell..."
  },
  // ... more questions
]
```

---

### `generateSingleQuestion(topic, difficulty)`

Convenience function to generate a single question.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `topic` | String | Yes | The subject topic |
| `difficulty` | Number | Yes | Difficulty level (1-5) |

**Returns:** `Promise<Question>`

**Example:**

```javascript
const question = await generateSingleQuestion(
  "Physics - Thermodynamics",
  4
);
```

---

### `testGptService()`

Test function to verify the service is working correctly.

**Returns:** `Promise<Array<Question>>`

**Example:**

```javascript
const { testGptService } = require('./services/gpt.service');

// Run test
await testGptService();
```

**Test Output:**
```
🧪 Testing GPT Service...

📝 Generating 2 questions on "Biology - Cell Structure" (Difficulty: 3)

🤖 Generating 2 questions for "Biology - Cell Structure" at difficulty 3...
✅ Successfully generated 2 questions

📋 Generated Questions:
[
  { ... question 1 ... },
  { ... question 2 ... }
]

✅ GPT Service test completed successfully!
```

---

## 🎓 Difficulty Levels

| Level | Description | Example Topics |
|-------|-------------|----------------|
| **1** | Very Easy | Basic definitions, simple concepts |
| **2** | Easy | Straightforward application of concepts |
| **3** | Medium | Requires understanding and analysis |
| **4** | Hard | Complex problem-solving |
| **5** | Very Hard | Advanced reasoning and synthesis |

---

## 📝 Question Schema

Each generated question follows this structure:

```typescript
interface Question {
  topic: string;          // "Physics - Current Electricity"
  difficulty: number;     // 1-5
  type: string;          // "MCQ" or "Long Answer"
  text: string;          // Question text
  options: string[];     // Array of 4 options
  correctAnswer: string; // Must match one option
  explanation: string;   // Detailed explanation
}
```

---

## 🔍 Validation Rules

### Input Validation:
- ✅ `topic` must be a non-empty string
- ✅ `difficulty` must be between 1 and 5
- ✅ `count` must be between 1 and 20

### Output Validation:
- ✅ All required fields present
- ✅ Exactly 4 options per question
- ✅ `correctAnswer` matches one of the options
- ✅ Difficulty matches requested level
- ✅ Valid JSON structure

---

## 🚨 Error Handling

### Common Errors:

#### 1. Missing API Key
```javascript
Error: OpenAI API key not configured. Please set OPENAI_API_KEY in .env file
```
**Solution:** Add your OpenAI API key to `server/.env`

#### 2. Invalid Parameters
```javascript
Error: Difficulty must be between 1 and 5
Error: Count must be between 1 and 20
```
**Solution:** Check input parameters

#### 3. API Rate Limit
```javascript
OpenAI API Error: Rate limit exceeded
```
**Solution:** Wait and retry, or upgrade OpenAI plan

#### 4. Invalid JSON Response
```javascript
Error: Failed to parse GPT response as JSON
```
**Solution:** Retry the request (rare edge case)

---

## 💡 Usage Examples

### Example 1: Generate Physics Questions

```javascript
const { generateQuestions } = require('./services/gpt.service');

async function generatePhysicsTest() {
  try {
    const questions = await generateQuestions(
      "Physics - Mechanics",
      3,
      10
    );
    
    console.log(`Generated ${questions.length} questions`);
    return questions;
  } catch (error) {
    console.error('Failed:', error.message);
  }
}
```

### Example 2: Generate Mixed Difficulty

```javascript
async function generateMixedTest() {
  const easy = await generateQuestions("Biology - Genetics", 2, 5);
  const medium = await generateQuestions("Biology - Genetics", 3, 5);
  const hard = await generateQuestions("Biology - Genetics", 4, 5);
  
  return [...easy, ...medium, ...hard];
}
```

### Example 3: Save to Database

```javascript
const prisma = require('./db');
const { generateQuestions } = require('./services/gpt.service');

async function generateAndSaveQuestions() {
  // Generate questions
  const questions = await generateQuestions(
    "Chemistry - Organic Chemistry",
    3,
    5
  );
  
  // Save to database
  for (const q of questions) {
    await prisma.question.create({
      data: {
        topic: q.topic,
        difficulty: q.difficulty,
        type: q.type,
        text: q.text,
        options: JSON.stringify(q.options),
        correctAnswer: q.correctAnswer,
        explanation: q.explanation
      }
    });
  }
  
  console.log(`✅ Saved ${questions.length} questions to database`);
}
```

---

## 🎯 System Prompt Strategy

The service uses a carefully crafted system prompt that:

1. **Defines Role**: Expert MDCAT/LAT question author
2. **Sets Context**: Pakistani medical/law entrance exams
3. **Enforces Quality**: 
   - Factually accurate
   - Educationally valuable
   - Clear and concise
4. **Ensures Format**: Strict JSON output only
5. **Difficulty Scaling**: Explicit level definitions

---

## ⚙️ GPT-4 Configuration

```javascript
{
  model: "gpt-4-turbo-preview",
  response_format: { type: "json_object" },
  temperature: 0.8,        // Balanced creativity
  max_tokens: 3000         // Sufficient for detailed questions
}
```

**Why these settings?**
- **GPT-4 Turbo**: Latest model with best reasoning
- **JSON Mode**: Ensures structured output
- **Temperature 0.8**: Creative but focused
- **3000 tokens**: Enough for multiple questions with explanations

---

## 🧪 Testing

### Manual Test:

```bash
cd server
node -e "require('./services/gpt.service').testGptService()"
```

### Integration Test:

```javascript
const { generateQuestions } = require('./services/gpt.service');

describe('GPT Service', () => {
  it('should generate valid questions', async () => {
    const questions = await generateQuestions("Physics", 3, 2);
    
    expect(questions).toHaveLength(2);
    expect(questions[0]).toHaveProperty('text');
    expect(questions[0].options).toHaveLength(4);
    expect(questions[0].difficulty).toBe(3);
  });
});
```

---

## 💰 Cost Estimation

**GPT-4 Turbo Pricing (as of 2025):**
- Input: ~$0.01 per 1K tokens
- Output: ~$0.03 per 1K tokens

**Estimated cost per question:**
- ~500 tokens per question (input + output)
- **~$0.02 per question**

**Example:**
- 100 questions = ~$2.00
- 1000 questions = ~$20.00

---

## 🚀 Next Steps

With the GPT Service ready, you can now:

1. ✅ **Create API endpoint** to generate questions on demand
2. ✅ **Save questions** to the database
3. ✅ **Build question bank** for different topics
4. ✅ **Generate adaptive tests** based on student performance
5. ✅ **Create practice sessions** with AI-generated content

---

## 📋 Checklist

Before using the service:

- [ ] OpenAI API key added to `.env`
- [ ] `openai` package installed
- [ ] API key has sufficient credits
- [ ] Test function runs successfully
- [ ] Output matches expected schema

---

## 🔗 Related Documentation

- [OpenAI API Docs](https://platform.openai.com/docs)
- [GPT-4 Turbo Guide](https://platform.openai.com/docs/models/gpt-4-turbo-and-gpt-4)
- [JSON Mode](https://platform.openai.com/docs/guides/text-generation/json-mode)
- Database Schema: `DATABASE_SCHEMA.md`

---

**📅 Last Updated:** November 17, 2025  
**✅ Status:** Service implemented and ready for integration
