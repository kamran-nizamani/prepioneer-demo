import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const TestResults = () => {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [results, setResults] = useState(location.state?.results || null);
  const [loading, setLoading] = useState(!results);
  const [error, setError] = useState('');

  // Fetch results if not passed via navigation
  useEffect(() => {
    if (!results && sessionId) {
      fetchResults();
    }
  }, [sessionId, results]);

  const fetchResults = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/tests/${sessionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setResults(response.data.session);
    } catch (err) {
      console.error('Fetch results error:', err);
      setError('Failed to load test results');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-50 border-green-200';
    if (percentage >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <p className="text-red-600 text-xl">{error || 'No results found'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { scorePercentage, feedbackSummary, gradedAnswers, startTime, endTime } = results;
  const duration = endTime && startTime 
    ? Math.round((new Date(endTime) - new Date(startTime)) / 1000 / 60)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-indigo-900">🎯 Test Results</h1>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Score Card */}
        <div className={`rounded-lg shadow-xl p-8 mb-8 border-2 ${getScoreBgColor(scorePercentage)}`}>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Score</h2>
            <div className={`text-7xl font-bold mb-4 ${getScoreColor(scorePercentage)}`}>
              {scorePercentage?.toFixed(1)}%
            </div>
            <div className="text-xl text-gray-700 mb-6">
              {results.correctCount || Math.round((scorePercentage / 100) * (gradedAnswers?.length || 0))} / {gradedAnswers?.length || 0} Correct
            </div>
            <div className="flex justify-center items-center space-x-8 text-sm text-gray-600">
              <div>
                <span className="font-semibold">Duration:</span> {duration} minutes
              </div>
              <div>
                <span className="font-semibold">Status:</span> {results.status}
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Summary */}
        {feedbackSummary && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-3">📝 Feedback</h3>
            <p className="text-gray-700">{feedbackSummary}</p>
          </div>
        )}

        {/* Detailed Answers */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Detailed Review</h3>

          {gradedAnswers && gradedAnswers.length > 0 ? (
            <div className="space-y-6">
              {gradedAnswers.map((answer, index) => (
                <div
                  key={index}
                  className={`border-2 rounded-lg p-6 ${
                    answer.isCorrect
                      ? 'border-green-200 bg-green-50'
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  {/* Question Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-800">
                      Question {answer.questionNumber}
                    </h4>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        answer.isCorrect
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {answer.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                  </div>

                  {/* Your Answer */}
                  <div className="mb-3">
                    <span className="font-semibold text-gray-700">Your Answer: </span>
                    <span className={answer.isCorrect ? 'text-green-700' : 'text-red-700'}>
                      {answer.selectedAnswer || 'Not answered'}
                    </span>
                  </div>

                  {/* Correct Answer */}
                  {!answer.isCorrect && (
                    <div className="mb-3">
                      <span className="font-semibold text-gray-700">Correct Answer: </span>
                      <span className="text-green-700 font-semibold">
                        {answer.correctAnswer}
                      </span>
                    </div>
                  )}

                  {/* Explanation */}
                  {answer.explanation && (
                    <div className="mt-4 pt-4 border-t border-gray-300">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Explanation:</p>
                      <p className="text-sm text-gray-600">{answer.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No answer details available.</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={() => navigate('/test/setup')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition"
          >
            Take Another Test
          </button>
          <button
            onClick={() => navigate('/test/history')}
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold transition"
          >
            View Test History
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestResults;
