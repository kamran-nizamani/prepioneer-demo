# 🧪 WhatsApp Service Testing Guide

## Quick Start Testing

### Prerequisites
1. ✅ Twilio account created
2. ✅ WhatsApp sandbox joined
3. ✅ Dependencies installed (`npm install twilio node-cron`)
4. ✅ Prisma migration run (`npx prisma migrate dev`)
5. ✅ Server running

---

## 🚀 Step-by-Step Testing

### Step 1: Configure Twilio Credentials

**Get Credentials:**
1. Visit https://console.twilio.com
2. Copy **Account SID** and **Auth Token** from dashboard
3. Go to Messaging → Try it out → Send a WhatsApp message
4. Note the **WhatsApp Sandbox Number** (e.g., +14155238886)

**Update `.env`:**
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_actual_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

---

### Step 2: Join Twilio WhatsApp Sandbox

**On Your Phone:**
1. Open WhatsApp
2. Create new message to the Twilio sandbox number (+14155238886)
3. Send message: `join <your-sandbox-code>`
   - Find code at: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
   - Example: `join capital-friend`
4. Receive confirmation message from Twilio

**Important:** Your phone number is now whitelisted for 24 hours

---

### Step 3: Add Test User to Database

**Option A: Using Prisma Studio**
```bash
cd server
npx prisma studio
```
- Open User table
- Find your test user (or create one)
- Update fields:
  - `whatsappNumber`: +1XXXXXXXXXX (your actual phone number in E.164 format)
  - `whatsappOptIn`: true

**Option B: Using Node.js Script**
Create `server/test-whatsapp-setup.js`:
```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setupTestUser() {
  await prisma.user.update({
    where: { email: 'your-email@example.com' }, // Your test account email
    data: {
      whatsappNumber: '+14155551234', // YOUR ACTUAL PHONE NUMBER
      whatsappOptIn: true
    }
  });
  console.log('✅ Test user configured for WhatsApp');
  await prisma.$disconnect();
}

setupTestUser();
```

Run: `node server/test-whatsapp-setup.js`

---

### Step 4: Test Immediate Message Sending

**Create `server/test-message.js`:**
```javascript
require('dotenv').config();
const whatsappService = require('./services/whatsapp.service');

async function testMessage() {
  const result = await whatsappService.testWhatsAppService('+14155551234');
  console.log('Result:', result);
}

testMessage();
```

**Run:**
```bash
node server/test-message.js
```

**Expected Output:**
```
✅ Twilio client initialized successfully
📱 WhatsApp sender number: whatsapp:+14155238886
📤 Sending WhatsApp message to +14155551234...
✅ Message sent successfully! SID: SMxxxxxxxxxxxxxxxxxxxxxxxx
```

**Check Your Phone:**
- You should receive a test message within 5-10 seconds
- Message contains "PrepPioneer Test Message"

---

### Step 5: Test Daily Quiz Delivery

**Manual Trigger:**

**Option A: Via Node.js Script**
Create `server/test-quiz-delivery.js`:
```javascript
require('dotenv').config();
const scheduler = require('./scheduling/scheduler');

async function test() {
  console.log('Testing daily quiz delivery...');
  const results = await scheduler.triggerManualQuizDelivery();
  console.log('\nResults:', JSON.stringify(results, null, 2));
  process.exit(0);
}

test();
```

Run: `node server/test-quiz-delivery.js`

**Option B: Via Server Console**
With server running:
```bash
# Open new terminal
cd server
node
```

In Node REPL:
```javascript
require('dotenv').config();
const scheduler = require('./scheduling/scheduler');
await scheduler.triggerManualQuizDelivery();
```

**Expected Output:**
```
📊 Found 1 users opted in to daily quizzes
📚 Generating daily quiz for John Doe (john@example.com)
📤 Sending WhatsApp message to +14155551234...
✅ Message sent successfully! SID: SMxxxxxxxxxxxxxxxxxxxxxxxx
✅ Quiz sent to John Doe

📊 ===== Daily Quiz Summary =====
📊 Total users: 1
✅ Successfully sent: 1
❌ Failed: 0
📊 Success rate: 100.0%
```

**Check Your Phone:**
- Quiz message with question and 4 options
- Formatted with emojis and your name
- Example: "🎯 Good morning, John!..."

---

### Step 6: Test Scheduler (Real Cron Job)

**Option A: Change Schedule to Run Soon**

Edit `server/scheduling/scheduler.js`:
```javascript
// Find the cron.schedule line and change to run in next minute
const now = new Date();
const nextMinute = now.getMinutes() + 1;

dailyQuizJob = cron.schedule(`${nextMinute % 60} * * * *`, async () => {
  await sendDailyQuizzes();
});
```

Restart server and wait for next minute.

**Option B: Enable Immediate Test Run**

In `server/scheduling/scheduler.js`, uncomment these lines in `startScheduler()`:
```javascript
// Uncomment these lines:
console.log('🧪 Running test delivery in 10 seconds...');
setTimeout(async () => {
  await sendDailyQuizzes();
}, 10000);
```

Restart server and wait 10 seconds.

**Expected:**
- After 10 seconds, see scheduler output in server console
- Receive quiz on your phone

---

### Step 7: Test Multiple Users

**Add More Test Users:**
```javascript
// In Prisma Studio or script
await prisma.user.updateMany({
  where: {
    email: { in: ['user1@test.com', 'user2@test.com', 'user3@test.com'] }
  },
  data: {
    whatsappNumber: '+14155551234', // All to your number for testing
    whatsappOptIn: true
  }
});
```

**Run Delivery:**
```bash
node server/test-quiz-delivery.js
```

**Expected:**
- Multiple messages sent (with 2-second delays)
- Each with different GPT-generated question
- Summary shows all successful

---

## 🔍 Verification Checklist

### Server Console Checks
- [ ] "✅ Twilio client initialized successfully"
- [ ] "✅ Daily Quiz Scheduler started successfully!"
- [ ] "📊 Found X users opted in to daily quizzes"
- [ ] "✅ Message sent successfully! SID: SMxxxxxxxx"
- [ ] No error messages or stack traces

### Database Checks (Prisma Studio)
- [ ] User has `whatsappNumber` populated (E.164 format)
- [ ] User has `whatsappOptIn` set to `true`
- [ ] Multiple test users configured correctly

### WhatsApp Checks
- [ ] Received test message
- [ ] Received daily quiz message
- [ ] Message formatting correct (emojis, line breaks)
- [ ] Your name appears in greeting
- [ ] Question has 4 options (A, B, C, D)

### Twilio Console Checks
1. Go to https://console.twilio.com/us1/monitor/logs/sms
2. See message entries with:
   - [ ] Status: "delivered"
   - [ ] To: Your phone number
   - [ ] From: Sandbox number
   - [ ] Message body preview

---

## 🐛 Common Issues & Solutions

### Issue: "Twilio client not initialized"
**Cause:** Missing or invalid credentials in `.env`

**Solution:**
```bash
# Verify .env has correct values
cat server/.env | grep TWILIO

# Should show:
# TWILIO_ACCOUNT_SID=ACxxxxx...
# TWILIO_AUTH_TOKEN=xxxxxx...
# TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

### Issue: "Error Code 63007"
**Cause:** Your phone number hasn't joined the sandbox

**Solution:**
1. Send "join <code>" message again
2. Wait for confirmation
3. Retry within 24 hours

### Issue: "Error Code 21211 - Invalid To phone number"
**Cause:** Phone number not in E.164 format

**Solution:**
```javascript
// Wrong:
whatsappNumber: '4155551234'

// Correct:
whatsappNumber: '+14155551234'
```

### Issue: "Found 0 users opted in"
**Cause:** No users have `whatsappOptIn: true`

**Solution:**
```bash
# Check in Prisma Studio
npx prisma studio
# Or update via script
```

### Issue: Messages delayed or not received
**Cause:** Twilio rate limits or network issues

**Solution:**
1. Check Twilio console for message status
2. Verify phone has signal/data
3. Check spam/blocked messages
4. Try test message first

### Issue: GPT questions not generating
**Cause:** Invalid OpenAI API key

**Solution:**
```bash
# Verify OpenAI key
echo $OPENAI_API_KEY

# Update in .env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
```

---

## 📊 Expected Message Examples

### Test Message
```
🎯 PrepPioneer Test Message

This is a test message from your PrepPioneer platform. 
If you receive this, WhatsApp integration is working correctly!

✅ Service is operational.
```

### Daily Quiz Message
```
🎯 Good morning, Sarah!

Here's your daily PrepPioneer quiz question:

📝 What is the primary function of mitochondria in a cell?

A. Protein synthesis
B. Energy production
C. DNA replication
D. Waste removal

💡 Reply with your answer (A, B, C, or D) to see if you're correct!

Keep learning with PrepPioneer! 🚀
```

### Test Completion Notification
```
🎉 Hi John!

You scored 92.5% on "Physics Practice Test"

Excellent work!

View detailed results in your PrepPioneer dashboard. 📱
```

---

## 🎯 Success Criteria

### Minimum Requirements
- [ ] Twilio credentials configured
- [ ] At least 1 user opted in
- [ ] Test message sent and received
- [ ] Daily quiz message sent and received
- [ ] No errors in server console
- [ ] Messages properly formatted

### Full Test Coverage
- [ ] Multiple users tested
- [ ] Scheduler cron job verified
- [ ] Batch messaging works
- [ ] Rate limiting respected (2s delays)
- [ ] Error handling tested (invalid number)
- [ ] Twilio console shows delivered status
- [ ] Different topics/questions generated

---

## 🚀 Next Steps After Testing

### Production Preparation
1. Apply for WhatsApp Business API (removes sandbox limitations)
2. Verify business with Twilio
3. Set up message templates
4. Configure production phone number
5. Update production `.env` with real credentials

### Feature Enhancements
1. Add user opt-in/opt-out API endpoints
2. Create admin panel to send custom messages
3. Implement message response handling
4. Add quiz answer tracking
5. Create analytics for message delivery

### Monitoring Setup
1. Log messages to database (MessageLog model)
2. Set up Twilio webhooks for delivery status
3. Create daily report of message success rates
4. Alert on high failure rates
5. Track user engagement metrics

---

## 📞 Support Resources

- **Twilio Docs:** https://www.twilio.com/docs/whatsapp
- **Twilio Support:** https://support.twilio.com
- **node-cron Docs:** https://www.npmjs.com/package/node-cron
- **Prisma Docs:** https://www.prisma.io/docs

---

**Testing Time:** 15-30 minutes  
**Status:** Ready for testing! 📱✅
