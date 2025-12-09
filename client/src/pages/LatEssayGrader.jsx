import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LatEssayGrader = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  
  const [essayText, setEssayText] = useState('');
  const [topic, setTopic] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!essayText.trim()) {
      setError('Please enter your essay text');
      return;
    }

    if (essayText.length < 50) {
      setError('Essay must be at least 50 characters long');
      return;
    }

    if (essayText.length > 5000) {
      setError('Essay must not exceed 5000 characters');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      setResult(null);

      const response = await axios.post(
        'http://localhost:5000/api/tests/lat/grade-essay',
        {
          essayText: essayText.trim(),
          topic: topic.trim() || 'General analytical essay'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setResult(response.data.grading);
    } catch (err) {
      console.error('Essay grading error:', err);
      setError(
        err.response?.data?.message || 
        'Failed to grade essay. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setEssayText('');
    setTopic('');
    setResult(null);
    setError('');
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    if (score >= 4) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 8) return 'bg-green-50 border-green-200';
    if (score >= 6) return 'bg-yellow-50 border-yellow-200';
    if (score >= 4) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-indigo-600 hover:text-indigo-800 font-medium mb-4 inline-flex items-center"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            LAT Essay Grader
          </h1>
          <p className="text-gray-600">
            Get AI-powered feedback on your Law Admission Test (LAT) essay
          </p>
        </div>

        {!result ? (
          /* Essay Submission Form */
          <div className="bg-white rounded-lg shadow-lg p-6">
            <form onSubmit={handleSubmit}>
              {/* Topic Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Essay Topic/Prompt (Optional)
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Leadership in Crisis, Ethics in Law"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={isSubmitting}
                />
              </div>

              {/* Essay Text Area */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Essay Text *
                </label>
                <textarea
                  value={essayText}
                  onChange={(e) => setEssayText(e.target.value)}
                  placeholder="Paste or type your essay here (minimum 50 characters, maximum 5000 characters)..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-vertical"
                  rows={15}
                  disabled={isSubmitting}
                  required
                />
                <div className="flex justify-between mt-2 text-sm text-gray-500">
                  <span>Characters: {essayText.length} / 5000</span>
                  <span>Words: ~{essayText.split(/\s+/).filter(w => w).length}</span>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !essayText.trim()}
                className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Grading Essay...
                  </span>
                ) : (
                  'Grade My Essay'
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Results Display */
          <div className="space-y-6">
            {/* Overall Score Card */}
            <div className={`bg-white rounded-lg shadow-lg p-8 border-2 ${getScoreBgColor(result.overallScore)}`}>
              <div className="text-center">
                <h2 className="text-gray-600 text-lg mb-2">Overall Score</h2>
                <div className={`text-6xl font-bold mb-2 ${getScoreColor(result.overallScore)}`}>
                  {result.overallScore}/10
                </div>
                <div className="text-2xl font-semibold text-gray-700 mb-4">
                  {result.percentage.toFixed(0)}%
                </div>
                <div className="flex justify-center gap-8 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Words:</span> {result.wordCount}
                  </div>
                  <div>
                    <span className="font-medium">Characters:</span> {result.essayLength}
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Feedback */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Content Feedback */}
              <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-blue-500">
                <div className="flex items-center mb-3">
                  <div className="text-3xl mr-3">📝</div>
                  <h3 className="text-lg font-bold text-gray-800">Content</h3>
                </div>
                <p className="text-gray-700 leading-relaxed text-sm">
                  {result.feedback.content}
                </p>
                <div className="mt-3 text-xs text-gray-500">
                  Weighted: 40%
                </div>
              </div>

              {/* Structure Feedback */}
              <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-purple-500">
                <div className="flex items-center mb-3">
                  <div className="text-3xl mr-3">🏗️</div>
                  <h3 className="text-lg font-bold text-gray-800">Structure</h3>
                </div>
                <p className="text-gray-700 leading-relaxed text-sm">
                  {result.feedback.structure}
                </p>
                <div className="mt-3 text-xs text-gray-500">
                  Weighted: 30%
                </div>
              </div>

              {/* Grammar Feedback */}
              <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-green-500">
                <div className="flex items-center mb-3">
                  <div className="text-3xl mr-3">✍️</div>
                  <h3 className="text-lg font-bold text-gray-800">Grammar</h3>
                </div>
                <p className="text-gray-700 leading-relaxed text-sm">
                  {result.feedback.grammar}
                </p>
                <div className="mt-3 text-xs text-gray-500">
                  Weighted: 30%
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleReset}
                className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                Grade Another Essay
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition font-medium"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">ℹ️ About LAT Essay Grading</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Essays are graded on a scale of 1-10</li>
            <li>• Content (40%): Relevance, arguments, evidence</li>
            <li>• Structure (30%): Organization, flow, transitions</li>
            <li>• Grammar (30%): Language accuracy, clarity, style</li>
            <li>• Minimum 50 characters, maximum 5000 characters</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LatEssayGrader;
