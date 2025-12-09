# 🧪 Test API Documentation

## 📚 Overview

The Test API provides endpoints for creating, submitting, and managing test sessions. It integrates with the GPT service to dynamically generate questions and tracks student performance.

---

## 🔐 Authentication

All endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🛣️ API Endpoints

### 1. Start a New Test

**Endpoint:** `POST /api/tests/start`

**Description:** Generates AI questions and creates a new test session.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "topic": "Physics - Current Electricity",
  "difficulty": 3,
  "count": 10
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `topic` | String | Yes | Subject topic (e.g., "Biology - Cell Structure") |
| `difficulty` | Number | Yes | Difficulty level (1-5) |
| `count` | Number | Yes | Number of questions (1-50) |

**Success Response (201):**
```json
{
  "message": "Test session created successfully",
  "sessionId": 1,
  "testName": "Physics - Current Electricity - 2025-11-17",
  "topic": "Physics - Current Electricity",
  "questionCount": 10,
  "difficulty": 3,
  "startTime": "2025-11-17T10:00:00.000Z",
  "questions": [
    {
      "questionNumber": 1,
      "id": 1,
      "topic": "Physics - Current Electricity",
      "difficulty": 3,
      "type": "MCQ",
      "text": "What is Ohm's Law?",
      "options": [
        "V=IR",
        "P=VI",
        "R=V/I",
        "I=V/R"
      ]
    }
  ]
}
```

**Error Responses:**

- `400 Bad Request` - Invalid parameters
- `401 Unauthorized` - Missing or invalid token
- `500 Internal Server Error` - Question generation failed

**Example cURL:**
```bash
curl -X POST http://localhost:5000/api/tests/start \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Biology - Cell Structure",
    "difficulty": 3,
    "count": 5
  }'
```

**Example PowerShell:**
```powershell
$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

$body = @{
    topic = "Biology - Cell Structure"
    difficulty = 3
    count = 5
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/tests/start" -Method Post -Headers $headers -Body $body
```

---

### 2. Submit Test Answers

**Endpoint:** `POST /api/tests/:sessionId/submit`

**Description:** Submit answers and receive graded results.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "answers": [
    {
      "questionNumber": 1,
      "selectedAnswer": "V=IR"
    },
    {
      "questionNumber": 2,
      "selectedAnswer": "Energy production"
    }
  ]
}
```

**Success Response (200):**
```json
{
  "message": "Test submitted successfully",
  "sessionId": 1,
  "scorePercentage": 85.5,
  "correctCount": 8,
  "totalQuestions": 10,
  "status": "COMPLETED",
  "feedbackSummary": "Excellent performance! You scored 85.5%. Keep up the great work!",
  "gradedAnswers": [
    {
      "questionNumber": 1,
      "selectedAnswer": "V=IR",
      "correctAnswer": "V=IR",
      "isCorrect": true,
      "explanation": "Ohm's Law states that voltage equals current times resistance..."
    }
  ],
  "startTime": "2025-11-17T10:00:00.000Z",
  "endTime": "2025-11-17T10:30:00.000Z"
}
```

**Error Responses:**

- `400 Bad Request` - Invalid data or test already submitted
- `403 Forbidden` - Not authorized to submit this test
- `404 Not Found` - Test session not found

**Example cURL:**
```bash
curl -X POST http://localhost:5000/api/tests/1/submit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [
      {"questionNumber": 1, "selectedAnswer": "V=IR"},
      {"questionNumber": 2, "selectedAnswer": "Energy production"}
    ]
  }'
```

---

### 3. Get Test History

**Endpoint:** `GET /api/tests/history`

**Description:** Retrieve all test sessions for the authenticated user.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Success Response (200):**
```json
{
  "message": "Test history retrieved successfully",
  "count": 5,
  "sessions": [
    {
      "id": 1,
      "testName": "Physics - Current Electricity - 2025-11-17",
      "topic": "Physics - Current Electricity",
      "scorePercentage": 85.5,
      "status": "COMPLETED",
      "startTime": "2025-11-17T10:00:00.000Z",
      "endTime": "2025-11-17T10:30:00.000Z"
    },
    {
      "id": 2,
      "testName": "Biology - Cell Structure - 2025-11-16",
      "topic": "Biology - Cell Structure",
      "scorePercentage": null,
      "status": "PENDING",
      "startTime": "2025-11-16T14:00:00.000Z",
      "endTime": null
    }
  ]
}
```

**Example cURL:**
```bash
curl -X GET http://localhost:5000/api/tests/history \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 4. Get Test Session Details

**Endpoint:** `GET /api/tests/:sessionId`

**Description:** Get detailed information about a specific test session.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Success Response (200):**
```json
{
  "message": "Test session retrieved successfully",
  "session": {
    "id": 1,
    "testName": "Physics - Current Electricity - 2025-11-17",
    "topic": "Physics - Current Electricity",
    "scorePercentage": 85.5,
    "status": "COMPLETED",
    "feedbackSummary": "Excellent performance!",
    "startTime": "2025-11-17T10:00:00.000Z",
    "endTime": "2025-11-17T10:30:00.000Z",
    "questions": [...],
    "answers": [...]
  }
}
```

**Error Responses:**

- `403 Forbidden` - Not authorized to view this test
- `404 Not Found` - Test session not found

**Example cURL:**
```bash
curl -X GET http://localhost:5000/api/tests/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔄 Complete Workflow

### Step-by-Step Test Flow:

1. **User logs in** → Gets JWT token
2. **Start test** → `POST /api/tests/start`
   - System generates questions via GPT
   - Creates test session in database
   - Returns questions (without answers)
3. **User answers questions** → Frontend collects answers
4. **Submit test** → `POST /api/tests/:sessionId/submit`
   - System grades answers
   - Calculates score
   - Returns results with explanations
5. **View history** → `GET /api/tests/history`
   - See all past tests
6. **Review test** → `GET /api/tests/:sessionId`
   - See detailed results

---

## 🎯 Test Status Values

| Status | Description |
|--------|-------------|
| `PENDING` | Test started but not completed |
| `COMPLETED` | Test submitted and graded |
| `FAILED` | Test abandoned or error |

---

## 📊 Score Feedback Ranges

| Score Range | Feedback |
|-------------|----------|
| 80% - 100% | Excellent performance! Keep up the great work! |
| 60% - 79% | Good effort! Review explanations to improve. |
| 0% - 59% | Focus on understanding concepts and practice more. |

---

## 🔒 Security Features

- ✅ **JWT Authentication** - All endpoints protected
- ✅ **User Ownership** - Can only access own tests
- ✅ **Answer Hiding** - Correct answers not sent until submission
- ✅ **Immutable Records** - Questions stored permanently
- ✅ **Single Submission** - Can't resubmit completed tests

---

## 🎓 Question Filtering

When starting a test, the API removes sensitive data:

**Stored in Database (Full):**
```json
{
  "text": "What is Ohm's Law?",
  "options": ["V=IR", "P=VI", "R=V/I", "I=V/R"],
  "correctAnswer": "V=IR",
  "explanation": "Ohm's Law states..."
}
```

**Sent to Client (Filtered):**
```json
{
  "questionNumber": 1,
  "text": "What is Ohm's Law?",
  "options": ["V=IR", "P=VI", "R=V/I", "I=V/R"]
}
```

---

## 🧪 Testing Examples

### Complete Test Flow in PowerShell:

```powershell
# 1. Login
$loginBody = @{
    email = "john@example.com"
    password = "password123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResponse.token

# 2. Start Test
$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

$testBody = @{
    topic = "Physics - Mechanics"
    difficulty = 3
    count = 5
} | ConvertTo-Json

$testResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/tests/start" -Method Post -Headers $headers -Body $testBody

$sessionId = $testResponse.sessionId
Write-Host "Test Started! Session ID: $sessionId"

# 3. Submit Answers
$submitBody = @{
    answers = @(
        @{ questionNumber = 1; selectedAnswer = "V=IR" },
        @{ questionNumber = 2; selectedAnswer = "Energy production" }
    )
} | ConvertTo-Json -Depth 3

$results = Invoke-RestMethod -Uri "http://localhost:5000/api/tests/$sessionId/submit" -Method Post -Headers $headers -Body $submitBody

Write-Host "Score: $($results.scorePercentage)%"

# 4. View History
$history = Invoke-RestMethod -Uri "http://localhost:5000/api/tests/history" -Method Get -Headers $headers

Write-Host "Total Tests: $($history.count)"
```

---

## 💡 Best Practices

### Frontend Integration:

1. **Store session ID** when test starts
2. **Save answers locally** (in case of connection loss)
3. **Timer implementation** for time tracking
4. **Confirm before submit** to prevent accidental submissions
5. **Handle errors gracefully** with user-friendly messages

### Backend Considerations:

1. **Question count limits** (1-50) to prevent abuse
2. **Rate limiting** on test creation recommended
3. **Caching** for frequently requested topics
4. **Logging** for debugging and analytics
5. **Backup** test sessions regularly

---

## 🐛 Common Errors

### Error: "OpenAI API key not configured"
**Solution:** Set `OPENAI_API_KEY` in `server/.env`

### Error: "Test has already been submitted"
**Solution:** Each test can only be submitted once. Start a new test.

### Error: "You do not have permission"
**Solution:** Ensure you're logged in and accessing your own tests.

### Error: "Failed to generate questions"
**Solution:** Check OpenAI API status and key validity.

---

## 📈 Future Enhancements

- [ ] Resume incomplete tests
- [ ] Time limits per test
- [ ] Question bookmarking
- [ ] Detailed analytics
- [ ] Adaptive difficulty based on performance
- [ ] Topic recommendations
- [ ] Peer comparison

---

**📅 Last Updated:** November 17, 2025  
**✅ Status:** Test API fully implemented
