const freeGrader = require('./services/free-essay-grader.service');

const sampleEssay = `
Topic: The role of judiciary in protecting human rights.

The judiciary plays a crucial role in protecting human rights. I argue that an independent judiciary is essential because it ensures that laws are interpreted fairly and that executive overreach is checked. For example, courts can issue injunctions to prevent unlawful detentions. Therefore, a robust judicial system safeguards citizens. In conclusion, strengthening judicial independence will enhance protection of human rights.
`;

console.log('Running free essay grader test...');
const result = freeGrader.gradeEssay(sampleEssay, 'Role of judiciary in protecting human rights');
console.log('Result:', JSON.stringify(result, null, 2));
