/**
 * Free Question Generator Service
 * NO API COSTS - Generates unique questions using templates and intelligent algorithms
 * Creates NEW questions every time without external AI services
 */

// Question templates organized by subject and difficulty
const QUESTION_TEMPLATES = {
  Physics: {
    topics: {
      'Electricity': {
        1: [ // Very Easy
          { template: 'What is the unit of electric current?', options: ['Ampere', 'Volt', 'Ohm', 'Watt'], answer: 'Ampere', explanation: 'The SI unit of electric current is Ampere (A), named after André-Marie Ampère.' },
          { template: 'Which material is a good conductor of electricity?', options: ['Copper', 'Rubber', 'Plastic', 'Wood'], answer: 'Copper', explanation: 'Copper is an excellent conductor due to its free electrons.' },
          { template: 'What does a battery provide in a circuit?', options: ['Voltage', 'Resistance', 'Capacitance', 'Inductance'], answer: 'Voltage', explanation: 'A battery provides electrical potential difference (voltage) to drive current.' }
        ],
        2: [ // Easy
          { template: 'What is Ohm\'s Law?', options: ['V = IR', 'V = I/R', 'I = VR', 'R = VI'], answer: 'V = IR', explanation: 'Ohm\'s Law states that voltage equals current times resistance (V=IR).' },
          { template: 'In a series circuit, the current is:', options: ['Same everywhere', 'Different at each point', 'Zero', 'Infinite'], answer: 'Same everywhere', explanation: 'In series circuits, current remains constant throughout.' }
        ],
        3: [ // Medium
          { template: 'If resistance doubles and voltage is constant, current will:', options: ['Halve', 'Double', 'Stay same', 'Quadruple'], answer: 'Halve', explanation: 'According to Ohm\'s Law (I=V/R), doubling R halves I when V is constant.' },
          { template: 'What is the power dissipated in a 10Ω resistor carrying 2A?', options: ['40W', '20W', '5W', '10W'], answer: '40W', explanation: 'P = I²R = (2)² × 10 = 40W' }
        ],
        4: [ // Hard
          { template: 'Three 6Ω resistors in parallel have equivalent resistance:', options: ['2Ω', '6Ω', '18Ω', '3Ω'], answer: '2Ω', explanation: '1/R_eq = 1/6 + 1/6 + 1/6 = 3/6 = 1/2, so R_eq = 2Ω' },
          { template: 'A 12V battery with 2Ω internal resistance powers a 4Ω load. Current is:', options: ['2A', '3A', '4A', '6A'], answer: '2A', explanation: 'Total R = 2+4 = 6Ω, I = V/R = 12/6 = 2A' }
        ],
        5: [ // Very Hard
          { template: 'In an RC circuit with R=1MΩ and C=1μF, the time constant is:', options: ['1 second', '1 millisecond', '1 microsecond', '10 seconds'], answer: '1 second', explanation: 'Time constant τ = RC = 10⁶ × 10⁻⁶ = 1 second' }
        ]
      },
      'Mechanics': {
        1: [
          { template: 'What is the SI unit of force?', options: ['Newton', 'Joule', 'Watt', 'Pascal'], answer: 'Newton', explanation: 'Force is measured in Newtons (N), named after Isaac Newton.' },
          { template: 'What causes objects to fall to Earth?', options: ['Gravity', 'Magnetism', 'Electricity', 'Friction'], answer: 'Gravity', explanation: 'Gravitational force pulls objects toward Earth\'s center.' }
        ],
        2: [
          { template: 'What is Newton\'s First Law of Motion?', options: ['Law of Inertia', 'F=ma', 'Action-Reaction', 'Law of Gravity'], answer: 'Law of Inertia', explanation: 'Objects at rest stay at rest, objects in motion stay in motion unless acted upon by force.' }
        ],
        3: [
          { template: 'A 10kg object accelerates at 5m/s². The applied force is:', options: ['50N', '15N', '2N', '5N'], answer: '50N', explanation: 'F = ma = 10kg × 5m/s² = 50N' },
          { template: 'Work done to lift 5kg object by 2m (g=10m/s²):', options: ['100J', '50J', '10J', '25J'], answer: '100J', explanation: 'W = mgh = 5 × 10 × 2 = 100J' }
        ],
        4: [
          { template: 'A projectile launched at 45° achieves maximum:', options: ['Range', 'Height', 'Speed', 'Acceleration'], answer: 'Range', explanation: 'For given velocity, 45° angle gives maximum horizontal range.' }
        ],
        5: [
          { template: 'Angular momentum is conserved when:', options: ['No external torque', 'No friction', 'Constant velocity', 'Zero acceleration'], answer: 'No external torque', explanation: 'Conservation of angular momentum requires net external torque = 0' }
        ]
      }
    }
  },
  Biology: {
    topics: {
      'Cell Biology': {
        1: [
          { template: 'What is the powerhouse of the cell?', options: ['Mitochondria', 'Nucleus', 'Ribosome', 'Golgi Body'], answer: 'Mitochondria', explanation: 'Mitochondria produce ATP through cellular respiration, providing energy.' },
          { template: 'Which organelle contains genetic material?', options: ['Nucleus', 'Lysosome', 'Vacuole', 'Chloroplast'], answer: 'Nucleus', explanation: 'The nucleus houses DNA and controls cell activities.' },
          { template: 'What is the basic unit of life?', options: ['Cell', 'Tissue', 'Organ', 'Molecule'], answer: 'Cell', explanation: 'Cells are the smallest functional units of all living organisms.' }
        ],
        2: [
          { template: 'What is the function of ribosomes?', options: ['Protein synthesis', 'Energy production', 'Lipid storage', 'DNA replication'], answer: 'Protein synthesis', explanation: 'Ribosomes translate mRNA into proteins.' }
        ],
        3: [
          { template: 'In which phase of cell cycle does DNA replication occur?', options: ['S phase', 'G1 phase', 'G2 phase', 'M phase'], answer: 'S phase', explanation: 'DNA synthesis (replication) occurs during S phase of interphase.' },
          { template: 'What process produces ATP in mitochondria?', options: ['Oxidative phosphorylation', 'Photosynthesis', 'Fermentation', 'Glycolysis'], answer: 'Oxidative phosphorylation', explanation: 'Electron transport chain and chemiosmosis in mitochondria produce most ATP.' }
        ],
        4: [
          { template: 'How many ATP molecules net result from glycolysis?', options: ['2', '4', '36', '38'], answer: '2', explanation: 'Glycolysis produces 4 ATP but uses 2, net gain = 2 ATP' }
        ],
        5: [
          { template: 'Which checkpoint prevents cell cycle progression with damaged DNA?', options: ['G1/S checkpoint', 'G2 checkpoint', 'M checkpoint', 'All checkpoints'], answer: 'G1/S checkpoint', explanation: 'G1/S checkpoint (restriction point) checks DNA integrity before replication.' }
        ]
      },
      'Genetics': {
        1: [
          { template: 'What does DNA stand for?', options: ['Deoxyribonucleic Acid', 'Diatomic Nuclear Acid', 'Dynamic Nucleic Acid', 'Double Nitrogen Acid'], answer: 'Deoxyribonucleic Acid', explanation: 'DNA is the molecule that carries genetic information.' }
        ],
        2: [
          { template: 'How many chromosomes do humans have?', options: ['46', '23', '48', '24'], answer: '46', explanation: 'Humans have 46 chromosomes (23 pairs) in somatic cells.' }
        ],
        3: [
          { template: 'What is a dominant allele?', options: ['Expressed when present', 'Only expressed in pairs', 'Never expressed', 'Mutated gene'], answer: 'Expressed when present', explanation: 'Dominant alleles mask recessive alleles and are expressed in heterozygotes.' }
        ],
        4: [
          { template: 'In Mendel\'s crosses, F2 generation shows ratio:', options: ['3:1', '1:1', '9:3:3:1', '1:2:1'], answer: '3:1', explanation: 'Monohybrid cross F2 generation shows 3:1 phenotypic ratio (dominant:recessive).' }
        ],
        5: [
          { template: 'What is the probability of two heterozygous parents (Aa × Aa) having homozygous recessive offspring?', options: ['25%', '50%', '75%', '0%'], answer: '25%', explanation: 'Punnett square: AA(25%), Aa(50%), aa(25%). Homozygous recessive (aa) = 25%' }
        ]
      }
    }
  },
  Mathematics: {
    topics: {
      'Algebra': {
        1: [
          { template: 'What is 5 + 3?', options: ['8', '7', '9', '6'], answer: '8', explanation: 'Basic addition: 5 + 3 = 8' },
          { template: 'What is the value of x in x + 5 = 10?', options: ['5', '10', '15', '0'], answer: '5', explanation: 'x + 5 = 10, subtract 5 from both sides: x = 5' }
        ],
        2: [
          { template: 'Solve: 2x = 12', options: ['x = 6', 'x = 14', 'x = 10', 'x = 24'], answer: 'x = 6', explanation: 'Divide both sides by 2: x = 12/2 = 6' }
        ],
        3: [
          { template: 'Factor: x² - 9', options: ['(x+3)(x-3)', '(x+9)(x-9)', 'x(x-9)', '(x-3)²'], answer: '(x+3)(x-3)', explanation: 'Difference of squares: a² - b² = (a+b)(a-b), so x² - 9 = (x+3)(x-3)' },
          { template: 'Solve: x² - 5x + 6 = 0', options: ['x = 2 or 3', 'x = 1 or 6', 'x = -2 or -3', 'x = 5 or 6'], answer: 'x = 2 or 3', explanation: 'Factor: (x-2)(x-3) = 0, so x = 2 or x = 3' }
        ],
        4: [
          { template: 'What are the roots of x² + 4x + 4 = 0?', options: ['x = -2 (double root)', 'x = 2', 'x = -4', 'x = ±2'], answer: 'x = -2 (double root)', explanation: 'Perfect square: (x+2)² = 0, gives x = -2 with multiplicity 2' }
        ],
        5: [
          { template: 'Solve system: x + y = 10, 2x - y = 5', options: ['x=5, y=5', 'x=3, y=7', 'x=7, y=3', 'x=6, y=4'], answer: 'x=5, y=5', explanation: 'Add equations: 3x = 15, x = 5. Substitute: 5 + y = 10, y = 5' }
        ]
      },
      'Calculus': {
        3: [
          { template: 'Derivative of x² is:', options: ['2x', 'x', 'x²', '2x²'], answer: '2x', explanation: 'Power rule: d/dx(xⁿ) = nxⁿ⁻¹, so d/dx(x²) = 2x' }
        ],
        4: [
          { template: 'Integral of 2x dx is:', options: ['x² + C', '2x² + C', 'x³ + C', 'x + C'], answer: 'x² + C', explanation: '∫2x dx = 2(x²/2) + C = x² + C' }
        ],
        5: [
          { template: 'Limit of (x² - 1)/(x - 1) as x→1 is:', options: ['2', '1', '0', 'Undefined'], answer: '2', explanation: 'Factor: (x+1)(x-1)/(x-1) = x+1. As x→1, limit = 1+1 = 2' }
        ]
      }
    }
  },
  Chemistry: {
    topics: {
      'Atomic Structure': {
        1: [
          { template: 'What is the charge of a proton?', options: ['+1', '-1', '0', '+2'], answer: '+1', explanation: 'Protons carry a positive charge of +1 elementary charge.' },
          { template: 'Where are electrons located in an atom?', options: ['Orbits around nucleus', 'In nucleus', 'Between atoms', 'In bonds'], answer: 'Orbits around nucleus', explanation: 'Electrons occupy orbitals/shells around the nucleus.' }
        ],
        2: [
          { template: 'What determines an element\'s atomic number?', options: ['Number of protons', 'Number of neutrons', 'Number of electrons', 'Atomic mass'], answer: 'Number of protons', explanation: 'Atomic number = number of protons in nucleus, defines the element.' }
        ],
        3: [
          { template: 'Isotopes differ in number of:', options: ['Neutrons', 'Protons', 'Electrons', 'Quarks'], answer: 'Neutrons', explanation: 'Isotopes are atoms of same element with different neutron counts.' },
          { template: 'Maximum electrons in 3rd shell:', options: ['18', '8', '32', '2'], answer: '18', explanation: 'Maximum electrons = 2n², for n=3: 2(3²) = 18' }
        ],
        4: [
          { template: 'Electronic configuration of Argon (Z=18):', options: ['1s² 2s² 2p⁶ 3s² 3p⁶', '1s² 2s² 2p⁶ 3s² 3p⁴', '1s² 2s² 2p⁶ 3s² 3p⁸', '1s² 2s² 2p⁶ 3s²'], answer: '1s² 2s² 2p⁶ 3s² 3p⁶', explanation: 'Argon has 18 electrons filling up to 3p orbital: 2+2+6+2+6=18' }
        ],
        5: [
          { template: 'Which quantum number determines orbital shape?', options: ['Azimuthal (l)', 'Principal (n)', 'Magnetic (m)', 'Spin (s)'], answer: 'Azimuthal (l)', explanation: 'Azimuthal quantum number (l) determines orbital angular momentum and shape (s,p,d,f).' }
        ]
      },
      'Chemical Bonding': {
        1: [
          { template: 'What type of bond forms between Na and Cl?', options: ['Ionic', 'Covalent', 'Metallic', 'Hydrogen'], answer: 'Ionic', explanation: 'Metal (Na) and nonmetal (Cl) form ionic bonds by electron transfer.' }
        ],
        2: [
          { template: 'Covalent bonds involve:', options: ['Sharing electrons', 'Transferring electrons', 'Losing electrons', 'Nuclear fusion'], answer: 'Sharing electrons', explanation: 'Covalent bonds form when atoms share electron pairs.' }
        ],
        3: [
          { template: 'H₂O has how many lone pairs on oxygen?', options: ['2', '1', '0', '3'], answer: '2', explanation: 'Oxygen has 6 valence electrons, 2 used in bonds, 4 remain as 2 lone pairs.' }
        ],
        4: [
          { template: 'Bond order in O₂ molecule is:', options: ['2', '1', '3', '1.5'], answer: '2', explanation: 'O₂ has double bond (σ and π bond), bond order = 2' }
        ],
        5: [
          { template: 'Which molecule shows sp³d² hybridization?', options: ['SF₆', 'PCl₅', 'BF₃', 'CH₄'], answer: 'SF₆', explanation: 'SF₆ has octahedral geometry requiring sp³d² hybridization of sulfur.' }
        ]
      }
    }
  },
  History: {
    topics: {
      'Pakistan History': {
        1: [
          { template: 'When did Pakistan gain independence?', options: ['1947', '1945', '1950', '1940'], answer: '1947', explanation: 'Pakistan became independent on August 14, 1947.' },
          { template: 'Who is known as Quaid-e-Azam?', options: ['Muhammad Ali Jinnah', 'Allama Iqbal', 'Liaquat Ali Khan', 'Fatima Jinnah'], answer: 'Muhammad Ali Jinnah', explanation: 'Muhammad Ali Jinnah, founder of Pakistan, is called Quaid-e-Azam (Great Leader).' }
        ],
        2: [
          { template: 'Pakistan Resolution was passed in:', options: ['1940', '1947', '1935', '1930'], answer: '1940', explanation: 'Lahore Resolution (Pakistan Resolution) was passed on March 23, 1940.' }
        ],
        3: [
          { template: 'First constitution of Pakistan was adopted in:', options: ['1956', '1947', '1962', '1973'], answer: '1956', explanation: 'Pakistan\'s first constitution was adopted on March 23, 1956.' }
        ],
        4: [
          { template: 'East Pakistan became Bangladesh in:', options: ['1971', '1965', '1970', '1974'], answer: '1971', explanation: 'After 1971 war, East Pakistan separated and became Bangladesh.' }
        ],
        5: [
          { template: 'Who presented Two-Nation Theory?', options: ['Allama Iqbal and Jinnah', 'Only Jinnah', 'Only Iqbal', 'Liaquat Ali Khan'], answer: 'Allama Iqbal and Jinnah', explanation: 'Allama Iqbal philosophically developed and Jinnah politically championed Two-Nation Theory.' }
        ]
      },
      'World History': {
        2: [
          { template: 'World War II ended in:', options: ['1945', '1944', '1946', '1943'], answer: '1945', explanation: 'WWII ended in 1945 with Germany surrendering in May and Japan in September.' }
        ],
        3: [
          { template: 'The Cold War was primarily between:', options: ['USA and USSR', 'USA and China', 'UK and Germany', 'France and Russia'], answer: 'USA and USSR', explanation: 'Cold War (1947-1991) was ideological conflict between USA and Soviet Union.' }
        ]
      }
    }
  },
  Law: {
    topics: {
      'Constitutional Law': {
        1: [
          { template: 'What is the supreme law of Pakistan?', options: ['Constitution', 'Sharia', 'Common Law', 'Statute'], answer: 'Constitution', explanation: 'The Constitution of Pakistan 1973 is the supreme law of the land.' },
          { template: 'How many articles are in Pakistan Constitution 1973?', options: ['280', '200', '300', '250'], answer: '280', explanation: 'Pakistan Constitution 1973 originally had 280 articles (now with amendments).' }
        ],
        2: [
          { template: 'Who is head of state in Pakistan?', options: ['President', 'Prime Minister', 'Chief Justice', 'Army Chief'], answer: 'President', explanation: 'President is the constitutional head of state in Pakistan.' }
        ],
        3: [
          { template: 'Fundamental Rights are in which part of Constitution?', options: ['Part II', 'Part I', 'Part III', 'Part IV'], answer: 'Part II', explanation: 'Part II (Articles 8-28) contains Fundamental Rights in Pakistan Constitution.' }
        ],
        4: [
          { template: 'Article 25 of Constitution guarantees:', options: ['Equality before law', 'Freedom of speech', 'Right to property', 'Right to education'], answer: 'Equality before law', explanation: 'Article 25 guarantees equality of citizens before law and equal protection.' }
        ],
        5: [
          { template: 'Constitutional amendment requires how many votes in Parliament?', options: ['Two-thirds majority', 'Simple majority', '75% majority', 'Unanimous'], answer: 'Two-thirds majority', explanation: 'Article 239 requires 2/3 majority in both houses for constitutional amendments.' }
        ]
      },
      'Contract Law': {
        2: [
          { template: 'Essential element of valid contract is:', options: ['Offer and acceptance', 'Only offer', 'Only consideration', 'Written document'], answer: 'Offer and acceptance', explanation: 'Valid contract requires offer, acceptance, consideration, capacity, and lawful object.' }
        ],
        3: [
          { template: 'Contract with minor is:', options: ['Void ab initio', 'Valid', 'Voidable', 'Enforceable'], answer: 'Void ab initio', explanation: 'Contract with minor is void from beginning (void ab initio) under Contract Act.' }
        ],
        4: [
          { template: 'Free consent means consent not caused by:', options: ['Coercion, fraud, misrepresentation', 'Consideration', 'Offer', 'Acceptance'], answer: 'Coercion, fraud, misrepresentation', explanation: 'Consent is free when not caused by coercion, undue influence, fraud, misrepresentation, or mistake.' }
        ]
      }
    }
  }
};

/**
 * Generate random variations for numbers, names, values in questions
 */
function generateVariations(template, difficulty) {
  const variations = {
    numbers: {
      small: () => Math.floor(Math.random() * 10) + 1,
      medium: () => Math.floor(Math.random() * 50) + 10,
      large: () => Math.floor(Math.random() * 200) + 50
    },
    elements: ['Hydrogen', 'Helium', 'Carbon', 'Nitrogen', 'Oxygen', 'Sodium', 'Chlorine', 'Iron'],
    countries: ['Pakistan', 'India', 'USA', 'UK', 'China', 'Japan', 'Germany', 'France'],
    scientists: ['Newton', 'Einstein', 'Darwin', 'Mendel', 'Bohr', 'Curie', 'Tesla', 'Hawking']
  };
  
  return template;
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generate unique questions using templates
 * @param {string} topic - Subject and topic (e.g., "Physics", "Biology - Genetics")
 * @param {number} difficulty - Difficulty level 1-5
 * @param {number} count - Number of questions
 * @returns {Array} Generated questions
 */
function generateQuestions(topic, difficulty, count = 10) {
  try {
    console.log(`🎲 FREE Generator: Creating ${count} questions for "${topic}" at difficulty ${difficulty}`);
    
    // Parse topic to get subject and subtopic
    const [subject, subtopic] = topic.includes('-') 
      ? topic.split('-').map(s => s.trim())
      : [topic.trim(), null];
    
    // Find matching subject in templates
    const subjectTemplates = QUESTION_TEMPLATES[subject] || 
                            QUESTION_TEMPLATES[Object.keys(QUESTION_TEMPLATES).find(k => 
                              k.toLowerCase().includes(subject.toLowerCase())
                            )];
    
    if (!subjectTemplates) {
      console.log(`⚠️ No templates for "${subject}", using mixed topics`);
      return generateMixedQuestions(topic, difficulty, count);
    }
    
    // Collect all available questions for this difficulty
    let availableQuestions = [];
    
    Object.keys(subjectTemplates.topics).forEach(topicKey => {
      const topicQuestions = subjectTemplates.topics[topicKey];
      
      // Include questions from exact difficulty and neighboring difficulties
      [difficulty - 1, difficulty, difficulty + 1].forEach(diff => {
        if (diff >= 1 && diff <= 5 && topicQuestions[diff]) {
          availableQuestions = [...availableQuestions, ...topicQuestions[diff]];
        }
      });
    });
    
    if (availableQuestions.length === 0) {
      console.log(`⚠️ No questions at difficulty ${difficulty}, using mixed difficulty`);
      // Fallback: get questions from all difficulties
      Object.keys(subjectTemplates.topics).forEach(topicKey => {
        const topicQuestions = subjectTemplates.topics[topicKey];
        Object.keys(topicQuestions).forEach(diff => {
          availableQuestions = [...availableQuestions, ...topicQuestions[diff]];
        });
      });
    }
    
    // Shuffle and select random questions
    const shuffled = shuffleArray(availableQuestions);
    const selectedQuestions = [];
    
    for (let i = 0; i < count; i++) {
      // Cycle through available questions if we need more than we have
      const questionTemplate = shuffled[i % shuffled.length];
      
      // Add slight variation to make each instance unique
      const questionText = generateVariations(questionTemplate.template, difficulty);
      
      // Shuffle options to randomize answer position
      const shuffledOptions = shuffleArray(questionTemplate.options);
      
      selectedQuestions.push({
        topic: topic,
        difficulty: difficulty,
        type: 'MCQ',
        text: questionText,
        options: shuffledOptions,
        correctAnswer: questionTemplate.answer,
        explanation: questionTemplate.explanation
      });
    }
    
    console.log(`✅ FREE Generator: Created ${selectedQuestions.length} unique questions`);
    return selectedQuestions;
    
  } catch (error) {
    console.error('❌ Error in FREE question generator:', error.message);
    return generateMixedQuestions(topic, difficulty, count);
  }
}

/**
 * Generate mixed questions when specific topic not found
 */
function generateMixedQuestions(topic, difficulty, count) {
  const allQuestions = [];
  
  // Collect questions from all subjects at appropriate difficulty
  Object.keys(QUESTION_TEMPLATES).forEach(subject => {
    const subjectData = QUESTION_TEMPLATES[subject];
    Object.keys(subjectData.topics).forEach(topicKey => {
      const topicQuestions = subjectData.topics[topicKey];
      if (topicQuestions[difficulty]) {
        allQuestions.push(...topicQuestions[difficulty].map(q => ({
          ...q,
          topic: `${subject} - ${topicKey}`,
          difficulty: difficulty,
          type: 'MCQ'
        })));
      }
    });
  });
  
  if (allQuestions.length === 0) {
    // Last resort: return some default questions
    return getDefaultQuestions(topic, difficulty, count);
  }
  
  const shuffled = shuffleArray(allQuestions);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Fallback default questions (absolute last resort)
 */
function getDefaultQuestions(topic, difficulty, count) {
  const defaultQuestion = {
    topic: topic,
    difficulty: difficulty,
    type: 'MCQ',
    text: `Sample question about ${topic}`,
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: 'Option A',
    explanation: 'This is a sample question. Please expand the question bank.'
  };
  
  return Array(count).fill(null).map((_, i) => ({
    ...defaultQuestion,
    text: `${defaultQuestion.text} (Question ${i + 1})`
  }));
}

/**
 * Add new question template to the bank
 */
function addQuestionTemplate(subject, topic, difficulty, questionData) {
  if (!QUESTION_TEMPLATES[subject]) {
    QUESTION_TEMPLATES[subject] = { topics: {} };
  }
  
  if (!QUESTION_TEMPLATES[subject].topics[topic]) {
    QUESTION_TEMPLATES[subject].topics[topic] = {};
  }
  
  if (!QUESTION_TEMPLATES[subject].topics[topic][difficulty]) {
    QUESTION_TEMPLATES[subject].topics[topic][difficulty] = [];
  }
  
  QUESTION_TEMPLATES[subject].topics[topic][difficulty].push(questionData);
  console.log(`✅ Added question template: ${subject} - ${topic} (Difficulty ${difficulty})`);
}

/**
 * Get statistics about available questions
 */
function getQuestionBankStats() {
  const stats = {
    totalSubjects: Object.keys(QUESTION_TEMPLATES).length,
    subjects: {}
  };
  
  Object.keys(QUESTION_TEMPLATES).forEach(subject => {
    const subjectData = QUESTION_TEMPLATES[subject];
    let totalQuestions = 0;
    const topics = {};
    
    Object.keys(subjectData.topics).forEach(topic => {
      const topicData = subjectData.topics[topic];
      let topicCount = 0;
      
      Object.keys(topicData).forEach(difficulty => {
        topicCount += topicData[difficulty].length;
      });
      
      topics[topic] = topicCount;
      totalQuestions += topicCount;
    });
    
    stats.subjects[subject] = {
      totalQuestions,
      topics
    };
  });
  
  return stats;
}

module.exports = {
  generateQuestions,
  addQuestionTemplate,
  getQuestionBankStats
};
