# 📱 WhatsApp Messaging Service Documentation

## Overview
Complete WhatsApp messaging integration using Twilio API for automated daily quizzes, reminders, and notifications.

---

## 🎯 Features Implemented

### 1. **Daily Quiz Delivery**
- Automated daily quiz questions sent via WhatsApp at 9:00 AM
- AI-generated questions using GPT-4
- Personalized messages with user's name
- Multiple choice format with A, B, C, D options
- Random topic selection from 8 categories

### 2. **Test Completion Notifications**
- Automatic notifications when users complete tests
- Score-based emoji and messaging
- Direct link encouragement to view detailed results

### 3. **Custom Reminders**
- Ability to send custom reminder messages
- Batch messaging to all opted-in users
- Professional formatting with emojis

### 4. **User Opt-In System**
- Users must explicitly opt-in to receive messages
- WhatsApp number stored in E.164 format (+1234567890)
- Database fields: `whatsappNumber` and `whatsappOptIn`

---

## 🔧 Technical Implementation

### Dependencies Added
```json
{
  "twilio": "^4.x.x",
  "node-cron": "^3.x.x"
}
```

**Installation:**
```bash
cd server
npm install twilio node-cron
```

### Database Schema Updates

**New Fields in User Model:**
```prisma
model User {
  // ... existing fields
  whatsappNumber String?  // Optional, E.164 format (+1234567890)
  whatsappOptIn  Boolean @default(false) // Must explicitly opt-in
}
```

**Migration:**
```bash
npx prisma migrate dev --name add_whatsapp_fields
npx prisma generate
```

---

## 📁 New Files Created

### 1. `server/services/whatsapp.service.js` (~200 lines)

**Purpose:** Core WhatsApp messaging service using Twilio API

**Functions:**
- `initializeTwilioClient()` - Initialize Twilio with env credentials
- `sendWhatsAppMessage(to, body)` - Send single message
- `sendBatchMessages(messages)` - Send multiple messages with rate limiting
- `formatQuizMessage(question, userName)` - Format quiz as WhatsApp message
- `formatReminderMessage(userName, text)` - Format reminder message
- `formatTestNotification(userName, score, testName)` - Format test completion
- `testWhatsAppService(testNumber)` - Test the service

**Key Features:**
- Automatic "whatsapp:" prefix formatting
- Comprehensive error handling with Twilio error codes
- Rate limiting with 1-2 second delays between messages
- Graceful fallback if credentials not configured

### 2. `server/scheduling/scheduler.js` (~280 lines)

**Purpose:** Automated daily quiz scheduling with node-cron

**Functions:**
- `startScheduler()` - Start the daily cron job (9:00 AM)
- `stopScheduler()` - Stop the scheduler
- `sendDailyQuizzes()` - Main function to send quizzes to all opted-in users
- `sendDailyQuizToUser(user)` - Send quiz to individual user
- `triggerManualQuizDelivery()` - Manually trigger delivery for testing
- `sendCustomReminder(text)` - Send custom reminder to all users
- `sendTestCompletionNotification(userId, score, testName)` - Test notification

**Cron Schedule:**
- Pattern: `"0 9 * * *"` (Every day at 9:00 AM)
- Timezone: America/New_York (configurable)
- Can be adjusted to any time/frequency

**Quiz Generation Logic:**
1. Query all users with `whatsappOptIn: true` and valid `whatsappNumber`
2. For each user:
   - Select random topic from 8 categories
   - Generate 1 question at difficulty level 2 (easy-medium)
   - Format as WhatsApp message
   - Send via Twilio
   - Log success/failure
3. Summary statistics logged after all messages sent

---

## 🔐 Environment Configuration

### Required Twilio Variables (`.env`)

```env
# Twilio WhatsApp Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

### Getting Twilio Credentials

1. **Create Twilio Account:**
   - Visit https://www.twilio.com/try-twilio
   - Sign up for free trial account
   - Get $15 credit for testing

2. **Get Account SID and Auth Token:**
   - Go to https://console.twilio.com
   - Find credentials on dashboard
   - Copy Account SID and Auth Token

3. **Set Up WhatsApp Sandbox:**
   - Navigate to Messaging → Try it out → Send a WhatsApp message
   - Follow instructions to join sandbox
   - Get sandbox number (e.g., +14155238886)
   - For production, apply for WhatsApp Business API

4. **Test Number Setup:**
   - Send "join <your-sandbox-code>" to the Twilio WhatsApp number
   - Your personal number is now whitelisted for testing

---

## 📊 Message Formats

### Daily Quiz Message
```
🎯 Good morning, John!

Here's your daily PrepPioneer quiz question:

📝 What is the SI unit of electric current?

A. Volt
B. Ampere
C. Ohm
D. Watt

💡 Reply with your answer (A, B, C, or D) to see if you're correct!

Keep learning with PrepPioneer! 🚀
```

### Test Completion Notification
```
🎉 Hi Sarah!

You scored 85.0% on "Physics Practice Test"

Excellent work!

View detailed results in your PrepPioneer dashboard. 📱
```

### Custom Reminder
```
🔔 Hi Mike!

Don't forget to complete your daily practice test today!

Stay focused with PrepPioneer! 🎯
```

---

## 🚀 Usage Examples

### 1. Enable WhatsApp for a User (via API or Database)

**Direct Database Update:**
```javascript
await prisma.user.update({
  where: { email: 'student@example.com' },
  data: {
    whatsappNumber: '+14155551234',
    whatsappOptIn: true
  }
});
```

**Via API Endpoint (create route):**
```javascript
// POST /api/users/whatsapp/opt-in
router.post('/whatsapp/opt-in', verifyToken, async (req, res) => {
  const { whatsappNumber } = req.body;
  const userId = req.user.userId;
  
  await prisma.user.update({
    where: { id: userId },
    data: {
      whatsappNumber,
      whatsappOptIn: true
    }
  });
  
  res.json({ message: 'WhatsApp notifications enabled' });
});
```

### 2. Manually Trigger Quiz Delivery (Testing)

**In server console or via API:**
```javascript
const scheduler = require('./scheduling/scheduler');

// Trigger immediate delivery
scheduler.triggerManualQuizDelivery()
  .then(results => console.log('Quiz delivery results:', results));
```

### 3. Send Test Completion Notification

**In test.controller.js submitTest function:**
```javascript
const scheduler = require('../scheduling/scheduler');

// After updating test session
if (session.status === 'COMPLETED') {
  // Send WhatsApp notification (non-blocking)
  scheduler.sendTestCompletionNotification(
    userId,
    scorePercentage,
    testSession.testName
  ).catch(err => console.error('Notification error:', err));
}
```

### 4. Test WhatsApp Service

**Create test route:**
```javascript
// GET /api/tests/whatsapp/test
router.get('/whatsapp/test', verifyToken, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId }
  });
  
  if (user.whatsappNumber) {
    const result = await whatsappService.testWhatsAppService(
      user.whatsappNumber
    );
    res.json(result);
  } else {
    res.status(400).json({ error: 'No WhatsApp number configured' });
  }
});
```

---

## 🧪 Testing Procedures

### 1. Local Testing with Twilio Sandbox

**Step 1: Join Sandbox**
```
1. Get sandbox code from Twilio Console
2. Send WhatsApp message to +14155238886 (or your sandbox number)
3. Message: "join <sandbox-code>"
4. Receive confirmation message
```

**Step 2: Add Test User to Database**
```javascript
// Via Prisma Studio or SQL
await prisma.user.update({
  where: { email: 'your-email@example.com' },
  data: {
    whatsappNumber: '+14155551234', // Your actual number
    whatsappOptIn: true
  }
});
```

**Step 3: Trigger Manual Delivery**
```javascript
// In Node.js REPL or test script
const scheduler = require('./scheduling/scheduler');
await scheduler.triggerManualQuizDelivery();
```

**Step 4: Verify Message Received**
- Check your WhatsApp for quiz message
- Verify formatting and content

### 2. Scheduler Testing

**Option A: Adjust Cron Schedule for Testing**
```javascript
// In scheduler.js, change cron pattern temporarily
dailyQuizJob = cron.schedule('*/2 * * * *', async () => {
  await sendDailyQuizzes();
}); // Runs every 2 minutes
```

**Option B: Use Immediate Execution**
```javascript
// In scheduler.js startScheduler(), uncomment:
setTimeout(async () => {
  await sendDailyQuizzes();
}, 10000); // Runs 10 seconds after server start
```

### 3. Error Handling Testing

**Test Invalid Number:**
```javascript
await whatsappService.sendWhatsAppMessage('+1234', 'Test');
// Should log Twilio error code and handle gracefully
```

**Test Missing Credentials:**
```javascript
// Remove TWILIO_ACCOUNT_SID from .env
// Restart server
// Should see warning message, no crashes
```

**Test Rate Limiting:**
```javascript
// Send 100 messages rapidly
const messages = Array(100).fill().map((_, i) => ({
  to: '+14155551234',
  body: `Test message ${i}`
}));
await whatsappService.sendBatchMessages(messages);
// Should respect 1-2 second delays
```

---

## 📈 Production Considerations

### 1. Twilio WhatsApp Business API

**Sandbox Limitations:**
- Only whitelisted numbers can receive messages
- "This message was sent from an unverified business" warning
- 24-hour session expiration

**Production Setup:**
1. Apply for WhatsApp Business API access via Twilio
2. Complete business verification process
3. Get approved sender number
4. Configure message templates (required for business accounts)
5. Update `TWILIO_WHATSAPP_NUMBER` in .env

### 2. Rate Limits

**Twilio Limits:**
- Trial: 1 message per second
- Paid: Higher limits based on tier
- WhatsApp: 1000 messages per day per number (can be increased)

**Implementation:**
- Current code includes 1-2 second delays
- For large user bases, implement queue system (e.g., Bull, RabbitMQ)
- Monitor Twilio usage dashboard

### 3. Cost Management

**Pricing (as of 2024):**
- Twilio trial: $15 credit
- WhatsApp messages: ~$0.005 - $0.01 per message
- SMS fallback: ~$0.0075 per message

**Budget Example:**
- 1000 users × 30 days = 30,000 messages/month
- Cost: ~$150 - $300/month
- Consider tiered pricing for different user roles

### 4. Compliance & Privacy

**Required:**
- Explicit user opt-in (implemented via `whatsappOptIn`)
- Easy opt-out mechanism
- Privacy policy disclosure
- GDPR compliance for EU users
- Store consent timestamp
- Allow number deletion

**Recommended Route:**
```javascript
// POST /api/users/whatsapp/opt-out
router.post('/whatsapp/opt-out', verifyToken, async (req, res) => {
  await prisma.user.update({
    where: { id: req.user.userId },
    data: { whatsappOptIn: false }
  });
  res.json({ message: 'Opted out successfully' });
});
```

---

## 🔧 Customization Options

### 1. Change Schedule Time

**Edit `scheduler.js`:**
```javascript
// Daily at 7:00 AM
dailyQuizJob = cron.schedule('0 7 * * *', async () => {
  await sendDailyQuizzes();
});

// Twice daily (9 AM and 6 PM)
cron.schedule('0 9,18 * * *', async () => {
  await sendDailyQuizzes();
});

// Weekdays only at 9 AM
cron.schedule('0 9 * * 1-5', async () => {
  await sendDailyQuizzes();
});
```

### 2. Add Topic Preferences

**Update User model:**
```prisma
model User {
  // ... existing fields
  preferredTopics String[] @default([]) // Array of preferred topics
}
```

**Update scheduler logic:**
```javascript
// In sendDailyQuizToUser()
const topics = user.preferredTopics.length > 0 
  ? user.preferredTopics 
  : defaultTopics;
```

### 3. Multiple Messages per Day

```javascript
// Morning motivation (7 AM)
cron.schedule('0 7 * * *', async () => {
  await sendMotivationalQuote();
});

// Daily quiz (9 AM)
cron.schedule('0 9 * * *', async () => {
  await sendDailyQuizzes();
});

// Evening reminder (6 PM)
cron.schedule('0 18 * * *', async () => {
  await sendEveningReminder();
});
```

### 4. Difficulty-Based Delivery

```javascript
// In sendDailyQuizToUser()
const difficulty = user.averageScore >= 80 ? 4 : 
                   user.averageScore >= 60 ? 3 : 2;

const questions = await gptService.generateQuestions(
  randomTopic,
  difficulty,
  1
);
```

---

## 🐛 Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| "Twilio client not initialized" | Missing env variables | Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER to .env |
| "Error Code 21211" | Invalid number format | Ensure E.164 format (+14155551234) |
| "Error Code 63007" | Number not joined sandbox | Send "join sandbox-code" to Twilio number |
| Messages not received | Sandbox session expired | Rejoin sandbox (24-hour expiration) |
| "Error Code 20003" | Invalid auth credentials | Verify Account SID and Auth Token |
| Scheduler not running | Server not restarted | Restart server after adding scheduler code |
| GPT questions failing | Invalid OpenAI API key | Verify OPENAI_API_KEY in .env |
| No users found | No opted-in users | Update user records with whatsappOptIn: true |

---

## 📊 Monitoring & Logging

### Console Output

**On Server Start:**
```
✅ Twilio client initialized successfully
📱 WhatsApp sender number: whatsapp:+14155238886
🚀 Initializing Daily Quiz Scheduler
✅ Daily Quiz Scheduler started successfully!
⏰ Schedule: Every day at 9:00 AM (America/New_York)
```

**On Scheduled Delivery:**
```
⏰ =====================================
⏰ Daily Quiz Scheduler Triggered
⏰ Time: 11/18/2025, 9:00:00 AM
⏰ =====================================

📊 Found 5 users opted in to daily quizzes
📚 Generating daily quiz for John Doe (john@example.com)
📤 Sending WhatsApp message to +14155551234...
✅ Message sent successfully! SID: SMxxxxxxxxxxxxxxxxxxxxxxxx
✅ Quiz sent to John Doe

📊 ===== Daily Quiz Summary =====
📊 Total users: 5
✅ Successfully sent: 5
❌ Failed: 0
📊 Success rate: 100.0%
📊 ================================
```

### Database Logging (Optional Enhancement)

**Create MessageLog model:**
```prisma
model MessageLog {
  id           Int      @id @default(autoincrement())
  userId       Int
  messageType  String   // "DAILY_QUIZ", "TEST_NOTIFICATION", "REMINDER"
  status       String   // "SENT", "FAILED"
  twilioSid    String?
  errorMessage String?
  createdAt    DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id])
}
```

---

## 🎯 Success Metrics

✅ **WhatsApp Service:** Fully functional Twilio integration  
✅ **Daily Scheduler:** Automated cron job at 9:00 AM  
✅ **Quiz Generation:** AI-powered questions via GPT-4  
✅ **Opt-In System:** Database fields and user control  
✅ **Error Handling:** Graceful fallbacks and logging  
✅ **Message Formatting:** Professional templates with emojis  
✅ **Batch Processing:** Rate-limited message delivery  
✅ **Testing Tools:** Manual trigger and test functions  

**Total New Code:** ~500 lines of production-ready Node.js

---

## 📚 Related Documentation

- Twilio WhatsApp API: https://www.twilio.com/docs/whatsapp
- node-cron: https://www.npmjs.com/package/node-cron
- Prisma migrations: https://www.prisma.io/docs/concepts/components/prisma-migrate
- E.164 phone format: https://en.wikipedia.org/wiki/E.164

---

**Status:** Step 12 Complete - WhatsApp Messaging Service Operational! 📱✅
