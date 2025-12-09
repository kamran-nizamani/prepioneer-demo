const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // ========================================
  // 1. CREATE SUPER ADMIN ACCOUNT
  // ========================================
  console.log('👤 Creating Super Admin account...');
  
  const adminPassword = await bcrypt.hash('AdminPassword123', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@preppioneer.com' },
    update: {},
    create: {
      email: 'admin@preppioneer.com',
      password: adminPassword,
      name: 'Super Admin',
      role: 'ADMIN',
    },
  });
  
  console.log(`✅ Admin created: ${adminUser.email} (ID: ${adminUser.id})`);

  // ========================================
  // 2. CREATE INSTRUCTOR ACCOUNT
  // ========================================
  console.log('👨‍🏫 Creating Instructor account...');
  
  const instructorPassword = await bcrypt.hash('InstructorPass123', 10);
  
  const instructorUser = await prisma.user.upsert({
    where: { email: 'instructor@preppioneer.com' },
    update: {},
    create: {
      email: 'instructor@preppioneer.com',
      password: instructorPassword,
      name: 'John Instructor',
      role: 'INSTRUCTOR',
    },
  });
  
  console.log(`✅ Instructor created: ${instructorUser.email} (ID: ${instructorUser.id})`);

  // ========================================
  // 3. CREATE SAMPLE STUDENT ACCOUNTS
  // ========================================
  console.log('🎓 Creating sample student accounts...');
  
  const studentPassword = await bcrypt.hash('StudentPass123', 10);
  
  const student1 = await prisma.user.upsert({
    where: { email: 'student1@preppioneer.com' },
    update: {},
    create: {
      email: 'student1@preppioneer.com',
      password: studentPassword,
      name: 'Alice Student',
      role: 'STUDENT',
    },
  });
  
  const student2 = await prisma.user.upsert({
    where: { email: 'student2@preppioneer.com' },
    update: {},
    create: {
      email: 'student2@preppioneer.com',
      password: studentPassword,
      name: 'Bob Student',
      role: 'STUDENT',
    },
  });
  
  console.log(`✅ Students created: ${student1.email}, ${student2.email}`);

  // ========================================
  // 4. SEED TEST CATALOG (Pakistani Competitive Exams)
  // ========================================
  console.log('📋 Seeding Test Catalog with Pakistani Competitive Exams...');

  const existingCatalog = await prisma.testCatalog.count();
  
  if (existingCatalog > 0) {
    console.log(`ℹ️  ${existingCatalog} test catalog entries already exist. Skipping catalog seeding.`);
  } else {
    const pakistaniExams = [
      {
        title: 'Central Superior Services Exam',
        acronym: 'CSS',
        type: 'Recruitment',
        conductingBody: 'FPSC (Federal Public Service Commission)',
        description: 'Premier competitive examination for recruiting officers to the civil services of Pakistan (BPS-17 and above). Gateway to 12 occupational groups including PAS, Police, and Foreign Service. See EXAM_CONTENT/CSS.md for complete details.',
        isActive: true,
      },
      {
        title: 'National Medical & Dental College Admission Test',
        acronym: 'MDCAT',
        type: 'Admission',
        conductingBody: 'PMC (Pakistan Medical Commission)',
        description: 'Mandatory entrance test for admission to MBBS and BDS programs in medical and dental colleges across Pakistan. Tests Biology, Chemistry, Physics, and English. See EXAM_CONTENT/MDCAT.md for complete details.',
        isActive: true,
      },
      {
        title: 'Engineering College Admission Test',
        acronym: 'ECAT',
        type: 'Admission',
        conductingBody: 'UET Lahore',
        description: 'Entrance test for engineering degree programs at public and private universities in Punjab. Covers Mathematics, Physics, Chemistry, and English. See EXAM_CONTENT/ECAT.md for complete details.',
        isActive: true,
      },
      {
        title: 'Law Admission Test',
        acronym: 'LAT',
        type: 'Admission',
        conductingBody: 'HEC (Higher Education Commission)',
        description: 'Required test for admission to five-year BA-LLB (Hons) programs in HEC-recognized law universities. Tests analytical reasoning, English comprehension, and general knowledge. See EXAM_CONTENT/LAT.md for complete details.',
        isActive: true,
      },
      {
        title: 'National Aptitude Test',
        acronym: 'NAT',
        type: 'Admission/Screening',
        conductingBody: 'NTS (National Testing Service)',
        description: 'General screening test for undergraduate admissions at NTS-associated universities. Includes verbal, quantitative, and analytical skills. See EXAM_CONTENT/NAT.md for complete details.',
        isActive: true,
      },
      {
        title: 'Provincial Management Service',
        acronym: 'PMS',
        type: 'Recruitment',
        conductingBody: 'Provincial Public Service Commissions',
        description: 'Provincial-level competitive examination for civil service positions (BPS-17) in Punjab, Sindh, KPK, and Balochistan. See EXAM_CONTENT/PMS.md for complete details.',
        isActive: true,
      },
      {
        title: 'Graduate Assessment Test',
        acronym: 'GAT-General',
        type: 'Admission',
        conductingBody: 'NTS (National Testing Service)',
        description: 'Required for admission to MS/MPhil programs in Pakistani universities. Tests verbal reasoning, quantitative reasoning, and analytical writing. See EXAM_CONTENT/GAT.md for complete details.',
        isActive: true,
      },
      {
        title: 'Business Schools Admission Test',
        acronym: 'NTS-NAT',
        type: 'Admission',
        conductingBody: 'NTS / Individual Business Schools',
        description: 'Entry test for MBA and BBA programs at top Pakistani business schools including IBA, LUMS, and NUST. See EXAM_CONTENT/NTS-NAT.md for complete details.',
        isActive: true,
      },
    ];

    // Insert exams individually to handle duplicates
    for (const exam of pakistaniExams) {
      await prisma.testCatalog.upsert({
        where: { acronym: exam.acronym },
        update: {},
        create: exam,
      });
    }

    const catalogCount = await prisma.testCatalog.count();
    console.log(`✅ Test Catalog seeded successfully with ${catalogCount} Pakistani competitive exams`);
    console.log('   - CSS (FPSC)');
    console.log('   - MDCAT (PMC)');
    console.log('   - ECAT (UET Lahore)');
    console.log('   - LAT (HEC)');
    console.log('   - NAT (NTS)');
    console.log('   - PMS (Provincial PSCs)');
    console.log('   - GAT-General (NTS)');
    console.log('   - NTS-NAT (NTS/Business Schools)');
  }

  // ========================================
  // 5. CREATE SAMPLE QUESTIONS
  // ========================================
  console.log('📚 Creating sample questions...');

  // Check if sample questions already exist
  const existingQuestions = await prisma.question.count();
  
  if (existingQuestions > 0) {
    console.log(`ℹ️  ${existingQuestions} questions already exist. Skipping question creation.`);
  } else {
    const sampleQuestions = [
      // Physics Questions
      {
        questionType: 'MULTIPLE_CHOICE',
        difficulty: 3,
        category: 'Physics',
        questionText: 'What is the SI unit of force?',
        options: JSON.stringify(['Joule', 'Newton', 'Watt', 'Pascal']),
        correctAnswer: 'Newton',
        explanation: 'The Newton (N) is the SI unit of force, defined as the force needed to accelerate 1 kilogram of mass at 1 meter per second squared.',
      },
      {
        questionType: 'MULTIPLE_CHOICE',
        difficulty: 4,
        category: 'Physics',
        questionText: 'According to Newton\'s second law, force equals:',
        options: JSON.stringify(['Mass × Velocity', 'Mass × Acceleration', 'Mass / Acceleration', 'Acceleration / Mass']),
        correctAnswer: 'Mass × Acceleration',
        explanation: 'Newton\'s second law states F = ma, where force equals mass multiplied by acceleration.',
      },
      {
        questionType: 'TRUE_FALSE',
        difficulty: 2,
        category: 'Physics',
        questionText: 'Light travels faster in water than in air.',
        options: JSON.stringify(['True', 'False']),
        correctAnswer: 'False',
        explanation: 'Light travels slower in denser mediums. The speed of light in water is approximately 75% of its speed in air.',
      },
      {
        questionType: 'MULTIPLE_CHOICE',
        difficulty: 5,
        category: 'Physics',
        questionText: 'What is the relationship between energy and mass according to Einstein\'s theory?',
        options: JSON.stringify(['E = mc', 'E = mc²', 'E = m²c', 'E = m/c']),
        correctAnswer: 'E = mc²',
        explanation: 'Einstein\'s famous equation E = mc² shows that energy equals mass times the speed of light squared, revealing the equivalence of mass and energy.',
      },

      // Biology Questions
      {
        questionType: 'MULTIPLE_CHOICE',
        difficulty: 2,
        category: 'Biology',
        questionText: 'What is the powerhouse of the cell?',
        options: JSON.stringify(['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi Apparatus']),
        correctAnswer: 'Mitochondria',
        explanation: 'Mitochondria are called the powerhouse of the cell because they produce ATP, the main energy currency of cells, through cellular respiration.',
      },
      {
        questionType: 'MULTIPLE_CHOICE',
        difficulty: 3,
        category: 'Biology',
        questionText: 'Which molecule carries genetic information in most organisms?',
        options: JSON.stringify(['RNA', 'DNA', 'Protein', 'Lipid']),
        correctAnswer: 'DNA',
        explanation: 'DNA (Deoxyribonucleic Acid) stores genetic information in most organisms through sequences of four nucleotide bases.',
      },
      {
        questionType: 'TRUE_FALSE',
        difficulty: 2,
        category: 'Biology',
        questionText: 'Photosynthesis occurs in the mitochondria of plant cells.',
        options: JSON.stringify(['True', 'False']),
        correctAnswer: 'False',
        explanation: 'Photosynthesis occurs in chloroplasts, not mitochondria. Mitochondria are responsible for cellular respiration.',
      },

      // Mathematics Questions
      {
        questionType: 'MULTIPLE_CHOICE',
        difficulty: 3,
        category: 'Mathematics',
        questionText: 'What is the value of π (pi) rounded to two decimal places?',
        options: JSON.stringify(['3.12', '3.14', '3.16', '3.18']),
        correctAnswer: '3.14',
        explanation: 'Pi (π) is approximately 3.14159..., which rounds to 3.14 when rounded to two decimal places.',
      },
      {
        questionType: 'MULTIPLE_CHOICE',
        difficulty: 4,
        category: 'Mathematics',
        questionText: 'If f(x) = 2x + 3, what is f(5)?',
        options: JSON.stringify(['10', '11', '13', '15']),
        correctAnswer: '13',
        explanation: 'Substitute x = 5 into the function: f(5) = 2(5) + 3 = 10 + 3 = 13.',
      },
      {
        questionType: 'TRUE_FALSE',
        difficulty: 3,
        category: 'Mathematics',
        questionText: 'The square root of 144 is 12.',
        options: JSON.stringify(['True', 'False']),
        correctAnswer: 'True',
        explanation: 'The square root of 144 is 12 because 12 × 12 = 144.',
      },

      // Chemistry Questions
      {
        questionType: 'MULTIPLE_CHOICE',
        difficulty: 2,
        category: 'Chemistry',
        questionText: 'What is the chemical symbol for water?',
        options: JSON.stringify(['H2O', 'CO2', 'O2', 'HO']),
        correctAnswer: 'H2O',
        explanation: 'Water is H2O, consisting of two hydrogen atoms bonded to one oxygen atom.',
      },
      {
        questionType: 'MULTIPLE_CHOICE',
        difficulty: 4,
        category: 'Chemistry',
        questionText: 'What is the pH of a neutral solution at 25°C?',
        options: JSON.stringify(['0', '7', '14', '1']),
        correctAnswer: '7',
        explanation: 'A neutral solution has a pH of 7 at 25°C. Values below 7 are acidic, and above 7 are basic.',
      },
      {
        questionType: 'TRUE_FALSE',
        difficulty: 3,
        category: 'Chemistry',
        questionText: 'Gold is more reactive than sodium.',
        options: JSON.stringify(['True', 'False']),
        correctAnswer: 'False',
        explanation: 'Gold is one of the least reactive elements, while sodium is highly reactive. This is why gold doesn\'t corrode easily.',
      },

      // History Questions
      {
        questionType: 'MULTIPLE_CHOICE',
        difficulty: 2,
        category: 'History',
        questionText: 'In which year did World War II end?',
        options: JSON.stringify(['1943', '1944', '1945', '1946']),
        correctAnswer: '1945',
        explanation: 'World War II ended in 1945 with Germany\'s surrender in May and Japan\'s surrender in September.',
      },
      {
        questionType: 'MULTIPLE_CHOICE',
        difficulty: 3,
        category: 'History',
        questionText: 'Who was the first President of the United States?',
        options: JSON.stringify(['Thomas Jefferson', 'Benjamin Franklin', 'George Washington', 'John Adams']),
        correctAnswer: 'George Washington',
        explanation: 'George Washington served as the first President of the United States from 1789 to 1797.',
      },
    ];

    // Create questions one by one to handle duplicates
    let createdCount = 0;
    for (const question of sampleQuestions) {
      try {
        await prisma.question.create({
          data: question,
        });
        createdCount++;
      } catch (error) {
        // Skip if question already exists
        if (!error.message.includes('Unique constraint')) {
          console.log(`⚠️ Skipping duplicate question: ${question.questionText.substring(0, 50)}...`);
        }
      }
    }

    console.log(`✅ Created ${createdCount} sample questions across multiple categories.`);
  }

  // ========================================
  // 5. CREATE A SAMPLE TEST (Optional)
  // ========================================
  console.log('📝 Creating sample test...');

  // Get a few questions for the test
  const questions = await prisma.question.findMany({
    take: 5,
    where: {
      category: {
        in: ['Physics', 'Biology', 'Mathematics'],
      },
    },
  });

  if (questions.length > 0) {
    const sampleTest = await prisma.test.upsert({
      where: { id: 'sample-test-001' },
      update: {},
      create: {
        id: 'sample-test-001',
        userId: instructorUser.id,
        title: 'Sample Science & Math Quiz',
        subject: 'Mixed Sciences',
        difficulty: 3,
        numQuestions: questions.length,
        questions: {
          connect: questions.map(q => ({ id: q.id })),
        },
      },
    });

    console.log(`✅ Sample test created: ${sampleTest.title} (ID: ${sampleTest.id})`);
  } else {
    console.log('⚠️  No questions available to create sample test.');
  }

  // ========================================
  // SUMMARY
  // ========================================
  console.log('\n🎉 Database seeding completed successfully!\n');
  console.log('📋 Summary:');
  console.log('   - Admin account: admin@preppioneer.com / AdminPassword123');
  console.log('   - Instructor account: instructor@preppioneer.com / InstructorPass123');
  console.log('   - Student accounts: student1@preppioneer.com, student2@preppioneer.com / StudentPass123');
  console.log('   - Sample questions: 15 questions across 5 categories');
  console.log('   - Sample test: Mixed Sciences quiz\n');
  console.log('🚀 You can now start the application and log in with these credentials!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
