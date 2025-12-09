import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const TestSetup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();

  // Get catalog ID and acronym from navigation state
  const { catalogId, acronym } = location.state || {};

  const [formData, setFormData] = useState({
    topic: '',
    difficulty: 3,
    count: 10
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Predefined topics for dropdown
  const topics = [
    'Biology - Cell Structure',
    'Biology - Genetics',
    'Biology - Human Anatomy',
    'Physics - Mechanics',
    'Physics - Current Electricity',
    'Physics - Thermodynamics',
    'Chemistry - Organic Chemistry',
    'Chemistry - Atomic Structure',
    'Chemistry - Chemical Bonding',
    'Mathematics - Calculus',
    'Mathematics - Algebra',
    'English - Comprehension'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'count' || name === 'difficulty' ? parseInt(value) : value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.topic) {
      setError('Please select a topic');
      setLoading(false);
      return;
    }

    if (formData.count < 1 || formData.count > 50) {
      setError('Number of questions must be between 1 and 50');
      setLoading(false);
      return;
    }

    try {
      // Call backend to start test
      const response = await axios.post(
        'http://localhost:5000/api/tests/start',
        {
          topic: formData.topic,
          difficulty: formData.difficulty,
          count: formData.count,
          testCatalogId: catalogId // Link to test catalog
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Navigate to test screen with questions and session data
      navigate('/test/active', {
        state: {
          sessionId: response.data.sessionId,
          questions: response.data.questions,
          testName: response.data.testName,
          topic: response.data.topic,
          difficulty: formData.difficulty
        }
      });

    } catch (err) {
      console.error('Start test error:', err);
      const message = err.response?.data?.message || 'Failed to start test. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold text-indigo-900">
              🎯 PrepPioneer
            </h1>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {acronym && (
            <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
              <p className="text-blue-700 font-semibold">
                📚 Preparing for: <span className="text-xl font-bold">{acronym}</span>
              </p>
            </div>
          )}
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {acronym ? `Start New Test: ${acronym}` : 'Start a New Test'}
          </h2>
          <p className="text-gray-600 mb-8">
            Configure your test parameters and begin practicing
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Topic Selection */}
            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
                Select Topic
              </label>
              <select
                id="topic"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                disabled={loading}
              >
                <option value="">-- Choose a topic --</option>
                {topics.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Slider */}
            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level: {formData.difficulty}
              </label>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">Easy</span>
                <input
                  type="range"
                  id="difficulty"
                  name="difficulty"
                  min="1"
                  max="5"
                  value={formData.difficulty}
                  onChange={handleChange}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  disabled={loading}
                />
                <span className="text-sm text-gray-500">Hard</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
              </div>
            </div>

            {/* Number of Questions */}
            <div>
              <label htmlFor="count" className="block text-sm font-medium text-gray-700 mb-2">
                Number of Questions
              </label>
              <input
                type="number"
                id="count"
                name="count"
                min="1"
                max="50"
                value={formData.count}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Choose between 1 and 50 questions
              </p>
            </div>

            {/* Estimated Time */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <p className="text-sm text-indigo-700">
                <strong>Estimated Time:</strong> {formData.count} minutes
              </p>
              <p className="text-xs text-indigo-600 mt-1">
                You'll have approximately 1 minute per question
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Questions...
                </span>
              ) : (
                'Start Test'
              )}
            </button>
          </form>

          {/* Info Section */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              📋 Test Guidelines
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-indigo-600 mr-2">✓</span>
                Questions are AI-generated based on your selected topic
              </li>
              <li className="flex items-start">
                <span className="text-indigo-600 mr-2">✓</span>
                Timer starts automatically when test begins
              </li>
              <li className="flex items-start">
                <span className="text-indigo-600 mr-2">✓</span>
                You can navigate between questions freely
              </li>
              <li className="flex items-start">
                <span className="text-indigo-600 mr-2">✓</span>
                Test auto-submits when timer expires
              </li>
              <li className="flex items-start">
                <span className="text-indigo-600 mr-2">✓</span>
                Detailed feedback provided after submission
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestSetup;
