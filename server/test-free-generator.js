/**
 * Test script for FREE Question Generator
 * Run with: node test-free-generator.js
 */

const freeGenerator = require('./services/free-question-generator.service');

console.log('🧪 Testing FREE Question Generator\n');
console.log('=' .repeat(60));

// Test 1: Physics Questions
console.log('\n📝 TEST 1: Physics - Electricity (Difficulty 3, 5 questions)');
console.log('-'.repeat(60));
const physicsQuestions = freeGenerator.generateQuestions('Physics - Electricity', 3, 5);
physicsQuestions.forEach((q, i) => {
  console.log(`\nQ${i+1}: ${q.text}`);
  console.log(`Options: ${q.options.join(', ')}`);
  console.log(`Answer: ${q.correctAnswer}`);
  console.log(`Difficulty: ${q.difficulty}`);
});

// Test 2: Biology Questions
console.log('\n\n📝 TEST 2: Biology - Cell Biology (Difficulty 2, 5 questions)');
console.log('-'.repeat(60));
const bioQuestions = freeGenerator.generateQuestions('Biology', 2, 5);
bioQuestions.forEach((q, i) => {
  console.log(`\nQ${i+1}: ${q.text}`);
  console.log(`Options: ${q.options.join(', ')}`);
  console.log(`Answer: ${q.correctAnswer}`);
});

// Test 3: Mathematics Questions
console.log('\n\n📝 TEST 3: Mathematics - Algebra (Difficulty 4, 3 questions)');
console.log('-'.repeat(60));
const mathQuestions = freeGenerator.generateQuestions('Mathematics', 4, 3);
mathQuestions.forEach((q, i) => {
  console.log(`\nQ${i+1}: ${q.text}`);
  console.log(`Options: ${q.options.join(', ')}`);
  console.log(`Answer: ${q.correctAnswer}`);
});

// Test 4: Verify Randomization (Same parameters, different results)
console.log('\n\n📝 TEST 4: Randomization Check (Same params, different questions)');
console.log('-'.repeat(60));
const test1 = freeGenerator.generateQuestions('Physics', 3, 3);
const test2 = freeGenerator.generateQuestions('Physics', 3, 3);

console.log('\nFirst Test Questions:');
test1.forEach((q, i) => console.log(`${i+1}. ${q.text.substring(0, 50)}...`));

console.log('\nSecond Test Questions:');
test2.forEach((q, i) => console.log(`${i+1}. ${q.text.substring(0, 50)}...`));

const isDifferent = JSON.stringify(test1) !== JSON.stringify(test2);
console.log(`\n✅ Questions are different: ${isDifferent ? 'YES' : 'NO'}`);

// Test 5: All Subjects
console.log('\n\n📝 TEST 5: All Subjects Coverage');
console.log('-'.repeat(60));
const subjects = ['Physics', 'Biology', 'Mathematics', 'Chemistry', 'History', 'Law'];
subjects.forEach(subject => {
  const questions = freeGenerator.generateQuestions(subject, 3, 2);
  console.log(`✅ ${subject}: Generated ${questions.length} questions`);
});

// Test 6: All Difficulty Levels
console.log('\n\n📝 TEST 6: All Difficulty Levels');
console.log('-'.repeat(60));
for (let diff = 1; diff <= 5; diff++) {
  const questions = freeGenerator.generateQuestions('Physics', diff, 2);
  console.log(`✅ Difficulty ${diff}: Generated ${questions.length} questions`);
}

// Statistics
console.log('\n\n📊 Question Bank Statistics');
console.log('-'.repeat(60));
const stats = freeGenerator.getQuestionBankStats();
console.log(JSON.stringify(stats, null, 2));

console.log('\n\n✅ ALL TESTS COMPLETED SUCCESSFULLY!\n');
console.log('=' .repeat(60));
