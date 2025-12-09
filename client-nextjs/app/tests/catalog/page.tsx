'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import axios from 'axios';

interface TestCatalog {
  id: number;
  title: string;
  acronym: string;
  type: string;
  conductingBody: string;
  description: string;
  isActive: boolean;
}

const examIcons: Record<string, string> = {
  CSS: '🎯',
  MDCAT: '🏥',
  ECAT: '⚡',
  LAT: '⚖️',
  NAT: '🎓',
  PMS: '🏛️',
  'GAT-General': '📊',
  'NTS-NAT': '📚',
};

const typeColors: Record<string, string> = {
  Admission: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200',
  Recruitment: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-200',
};

export default function TestCatalogPage() {
  const [exams, setExams] = useState<TestCatalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/public/tests/catalog');
      
      if (response.data.success) {
        setExams(response.data.catalog);
      } else {
        setError('Failed to load exams');
      }
    } catch (err: any) {
      console.error('Error fetching test catalog:', err);
      setError(err.response?.data?.message || 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleStartPrep = (exam: TestCatalog) => {
    router.push(`/tests/setup?catalogId=${exam.id}&acronym=${exam.acronym}`);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <motion.div
            className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-xl text-gray-600 dark:text-gray-400">Loading exams...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card variant="glass" className="max-w-md p-8 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Error Loading Exams</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Button variant="gradient" onClick={fetchExams}>
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  if (exams.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card variant="glass" className="max-w-md p-8 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold mb-2">No Exams Available</h2>
          <p className="text-gray-600 dark:text-gray-400">Check back soon for new exam preparations!</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-teal-500 to-purple-600 bg-clip-text text-transparent">
            Browse Test Catalog
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Choose from {exams.length} Pakistani competitive exams. Start your personalized prep journey today.
          </p>
        </motion.div>

        {/* Exam Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {exams.map((exam) => (
            <motion.div key={exam.id} variants={cardVariants}>
              <Card
                variant="gradient"
                hover
                className="p-6 h-full flex flex-col justify-between group"
              >
                {/* Icon & Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="text-5xl">{examIcons[exam.acronym] || '📖'}</div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                      typeColors[exam.type] || 'bg-gray-500/10 text-gray-600 border-gray-200'
                    }`}
                  >
                    {exam.type}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-grow">
                  <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {exam.acronym}
                  </h3>
                  <h4 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
                    {exam.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span className="font-semibold">Conducting Body:</span> {exam.conductingBody}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                    {exam.description}
                  </p>
                </div>

                {/* Action Button */}
                <div className="mt-6">
                  <Button
                    variant="gradient"
                    size="md"
                    className="w-full"
                    onClick={() => handleStartPrep(exam)}
                  >
                    Start Prep for {exam.acronym} →
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-16 text-center"
        >
          <Card variant="glass-lg" className="max-w-3xl mx-auto p-8">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-teal-500 to-purple-600 bg-clip-text text-transparent">
              Not sure which exam to take?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Our AI advisor can help you choose the right exam based on your goals and background.
            </p>
            <Button variant="outline" size="lg">
              Get AI Guidance
            </Button>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
