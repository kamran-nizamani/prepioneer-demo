/**
 * Free LAT Essay Grader Service
 * - No external API required
 * - Rubric-based scoring across multiple dimensions
 * - Provides feedback, sample improved essay, and suggestions
 */

/**
 * Rubric weights (sum to 100)
 */
const RUBRIC = {
  thesis: 25,        // clear thesis and focus
  organization: 20,  // logical flow, paragraphs
  evidence: 20,      // relevant examples and support
  analysis: 20,      // depth of reasoning and legal argument
  language: 15       // grammar, vocabulary, clarity
};

/**
 * Grade essay text according to rubric
 * @param {string} essayText
 * @param {string} topic
 * @returns {Object} grading result
 */
function gradeEssay(essayText, topic = 'General LAT Essay') {
  try {
    // Basic validation
    if (!essayText || typeof essayText !== 'string') {
      throw new Error('Essay text must be a non-empty string');
    }

    const length = essayText.length;
    const words = essayText.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // Heuristics for scoring (0-10 per dimension, then scaled)
    function scoreThesis(text) {
      // presence of thesis keywords and sentence length heuristics
      const thesisKeywords = ['argue', 'thesis', 'position', 'contend', 'argues', 'assert', 'claim'];
      const matches = thesisKeywords.reduce((c, kw) => c + (text.toLowerCase().includes(kw) ? 1 : 0), 0);
      const sentences = text.split(/[\.\!\?]+/).map(s => s.trim()).filter(Boolean);
      const firstTwo = sentences.slice(0,2).join(' ');
      const hasThesisSentence = firstTwo.length > 30 && matches > 0;
      if (hasThesisSentence) return 9 + Math.min(1, matches);
      if (sentences.length >= 3 && matches > 0) return 7 + Math.min(2, matches);
      if (matches > 0) return 5;
      return Math.max(1, Math.min(4, Math.floor(wordCount / 200)));
    }

    function scoreOrganization(text) {
      const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
      const paraCount = paragraphs.length;
      if (paraCount >= 4 && paragraphs[0].length > 20 && paragraphs[paraCount-1].length > 20) return 9;
      if (paraCount >= 3) return 7;
      if (paraCount === 2) return 5;
      return Math.max(1, Math.min(4, Math.floor(wordCount / 300)));
    }

    function scoreEvidence(text) {
      const evidenceKeywords = ['for example', 'for instance', 'e.g.', 'such as', 'because', 'due to', 'according to'];
      const matches = evidenceKeywords.reduce((c, kw) => c + (text.toLowerCase().includes(kw) ? 1 : 0), 0);
      if (matches >= 3) return 9;
      if (matches === 2) return 7;
      if (matches === 1) return 5;
      return Math.max(1, Math.min(4, Math.floor(wordCount / 400)));
    }

    function scoreAnalysis(text) {
      const analysisKeywords = ['therefore', 'consequently', 'thus', 'however', 'on the other hand', 'in contrast', 'this suggests'];
      const matches = analysisKeywords.reduce((c, kw) => c + (text.toLowerCase().includes(kw) ? 1 : 0), 0);
      if (matches >= 3) return 9;
      if (matches === 2) return 7;
      if (matches === 1) return 5;
      return Math.max(1, Math.min(4, Math.floor(wordCount / 500)));
    }

    function scoreLanguage(text) {
      // Basic grammar heuristics: average sentence length and presence of many punctuation errors
      const sentences = text.split(/[\.\!\?]+/).map(s => s.trim()).filter(Boolean);
      const avgLen = sentences.length ? (words.length / sentences.length) : words.length;
      if (avgLen >= 10 && avgLen <= 25 && text.match(/[A-Z][^\.\!\?]{10,}\./)) return 9;
      if (avgLen >= 8 && avgLen <= 30) return 7;
      if (avgLen >= 5) return 5;
      return 3;
    }

    // Raw scores (1-10)
    const raw = {
      thesis: scoreThesis(essayText),
      organization: scoreOrganization(essayText),
      evidence: scoreEvidence(essayText),
      analysis: scoreAnalysis(essayText),
      language: scoreLanguage(essayText)
    };

    // Convert raw scores to weighted percentage
    const weighted = {}; let totalPercent = 0;
    Object.keys(raw).forEach(key => {
      const weight = RUBRIC[key];
      const percent = (raw[key] / 10) * weight; // scale 0-10 into weight
      weighted[key] = Math.round(percent * 10) / 10; // one decimal
      totalPercent += percent;
    });

    const overallScore = Math.round((totalPercent / 100) * 10) / 1; // scale to 0-10

    // Generate feedback bullets per dimension
    const feedback = [];
    if (raw.thesis >= 8) feedback.push('Thesis is clear and well-stated.');
    else if (raw.thesis >= 5) feedback.push('Thesis present but could be clearer. Consider stating a concise position in the introduction.');
    else feedback.push('Thesis is weak or missing. Add a clear position in the opening paragraph.');

    if (raw.organization >= 8) feedback.push('Excellent organization: logical paragraphs with clear topic sentences.');
    else if (raw.organization >= 5) feedback.push('Organization is okay; add clearer transitions and paragraph structure.');
    else feedback.push('Poor organization: use paragraphs for introduction, body, and conclusion, and add transitions.');

    if (raw.evidence >= 8) feedback.push('Strong use of evidence and examples to support claims.');
    else if (raw.evidence >= 5) feedback.push('Some evidence used; add more specific examples or citations.');
    else feedback.push('Lacks evidence: include concrete examples, facts, or case law where applicable.');

    if (raw.analysis >= 8) feedback.push('Excellent analysis and reasoning; arguments are well-developed.');
    else if (raw.analysis >= 5) feedback.push('Analysis is present but could be deeper; explain the significance of evidence.');
    else feedback.push('Weak analysis: connect evidence to your thesis and evaluate implications.');

    if (raw.language >= 8) feedback.push('Language is polished with strong vocabulary and few errors.');
    else if (raw.language >= 5) feedback.push('Language is generally clear; watch sentence structure and grammar.');
    else feedback.push('Frequent language errors; proofread for grammar and clarity.');

    // Build a sample improved essay (short) - conservative rewrite of introduction + conclusion
    const sampleIntro = `Introduction (Sample): \nThe essay examines ${topic}. I argue that [state your position clearly], because [brief reason 1] and [brief reason 2]. This essay will explore these points and conclude with a recommendation.`;
    const sampleConclusion = `Conclusion (Sample): \nIn conclusion, considering the arguments above, I maintain that [restate position]. The evidence suggests [brief summary]. Therefore, [final recommendation].`;

    // Generate a full improved essay example
    const improvedEssay = `IMPROVED ESSAY EXAMPLE for: ${topic}

INTRODUCTION
The essay examines ${topic}. I argue that [state your clear position], because [reason 1 with evidence] and [reason 2 with analysis]. This essay will explore these points through examination of relevant case law and conclude with a practical recommendation.

BODY PARAGRAPH 1: [First Supporting Point]
[Topic sentence introducing first argument]. For example, [specific evidence or case law that supports your position]. This demonstrates that [explain significance of evidence]. Therefore, [connect back to thesis and show logical progression].

BODY PARAGRAPH 2: [Second Supporting Point]
[Topic sentence introducing second argument]. According to [source or common understanding], [present evidence]. This is significant because [analyze why this matters]. Consequently, [draw conclusion that strengthens your thesis].

BODY PARAGRAPH 3: [Counter-argument and Rebuttal - Optional but Strengthens Essay]
Some may argue that [present opposing view]. However, this overlooks [your counter-evidence]. On closer examination, [analyze why your position is stronger]. Thus, [reaffirm your thesis].

CONCLUSION
In conclusion, considering the arguments above, I maintain that [restate your position with conviction]. The evidence from [brief reference to key points] strongly suggests [summarize your analysis]. Therefore, [final recommendation or call to action]. This approach not only addresses the immediate issue but also [broader implication].

---
WRITING TIPS:
- Use transition words: "Furthermore," "However," "Consequently," "Therefore"
- Cite examples: "For instance," "According to," "Evidence shows"
- Analyze deeply: Don't just state facts—explain WHY they matter
- Structure clearly: Each paragraph = one main idea
- Proofread: Check grammar, spelling, and sentence flow
`;

    return {
      overallScore: Math.min(10, Math.round((totalPercent / 10) * 10) / 10),
      rubric: RUBRIC,
      rawScores: raw,
      weightedScores: weighted,
      feedback,
      sampleIntro,
      sampleConclusion,
      improvedEssay,
      essayLength: length,
      wordCount
    };

  } catch (error) {
    console.error('Free essay grader error:', error.message);
    throw error;
  }
}

module.exports = { gradeEssay };
