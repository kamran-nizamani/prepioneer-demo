import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ResultsScreen = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSessionResults();
  }, [sessionId]);

  const fetchSessionResults = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/tests/${sessionId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setSession(response.data.session);
      setError('');
    } catch (err) {
      console.error('Failed to fetch results:', err);
      setError(err.response?.data?.message || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-red-500 text-5xl mb-4 text-center">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Error</h2>
          <p className="text-gray-600 mb-6 text-center">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const questions = JSON.parse(session.questions || '[]');
  const gradedAnswersFromAPI = JSON.parse(session.answers || '[]');
  const scorePercentage = session.scorePercentage || 0;
  
  // Map graded answers from API with questions
  const gradedAnswers = questions.map((q, idx) => {
    const gradedAnswer = gradedAnswersFromAPI[idx] || {};
    return {
      question: q,
      userAnswer: gradedAnswer.selectedAnswer || '',
      isCorrect: gradedAnswer.isCorrect || false,
      correctAnswer: gradedAnswer.correctAnswer || q.correctAnswer,
      explanation: gradedAnswer.explanation || q.explanation
    };
  });

  const correctCount = gradedAnswers.filter(a => a.isCorrect).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-indigo-600 hover:text-indigo-800 font-medium mb-4 inline-flex items-center"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Test Results</h1>
          <p className="text-gray-600 mt-1">{session.testName}</p>
        </div>

        {/* Score Card */}
        <div className={`bg-white rounded-lg shadow-lg p-8 mb-6 border-2 ${getScoreBgColor(scorePercentage)}`}>
          <div className="text-center">
            <h2 className="text-gray-600 text-lg mb-2">Your Score</h2>
            <div className={`text-6xl font-bold mb-2 ${getScoreColor(scorePercentage)}`}>
              {scorePercentage.toFixed(1)}%
            </div>
            <p className="text-gray-600 text-lg">
              {correctCount} out of {questions.length} questions correct
            </p>
          </div>
        </div>

        {/* AI Feedback Summary */}
        {session.feedbackSummary && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-lg p-6 mb-6 border-2 border-purple-200">
            <div className="flex items-start">
              <div className="text-3xl mr-4">🤖</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-purple-900 mb-2">
                  AI-Powered Feedback
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {session.feedbackSummary}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Question Review */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Question Review</h3>
          
          <div className="space-y-4">
            {gradedAnswers.map((item, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-2 ${
                  item.isCorrect 
                    ? 'bg-green-50 border-green-300' 
                    : 'bg-red-50 border-red-300'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-gray-800 flex-1">
                    Question {idx + 1}
                  </h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    item.isCorrect 
                      ? 'bg-green-200 text-green-800' 
                      : 'bg-red-200 text-red-800'
                  }`}>
                    {item.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                  </span>
                </div>

                <p className="text-gray-700 mb-3">{item.question.text}</p>

                <div className="space-y-2 mb-3">
                  {item.question.options.map((option, optIdx) => {
                    const isUserAnswer = item.userAnswer === option;
                    const isCorrectAnswer = item.correctAnswer === option;

                    return (
                      <div
                        key={optIdx}
                        className={`p-2 rounded ${
                          isCorrectAnswer 
                            ? 'bg-green-100 border border-green-300' 
                            : isUserAnswer && !item.isCorrect
                            ? 'bg-red-100 border border-red-300'
                            : 'bg-gray-50'
                        }`}
                      >
                        <span className="font-medium">{String.fromCharCode(65 + optIdx)}.</span> {option}
                        {isCorrectAnswer && (
                          <span className="ml-2 text-green-600 font-medium">✓ Correct Answer</span>
                        )}
                        {isUserAnswer && !isCorrectAnswer && (
                          <span className="ml-2 text-red-600 font-medium">✗ Your Answer</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {!item.isCorrect && item.explanation && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <p className="text-sm font-semibold text-blue-900 mb-1">
                      💡 Explanation:
                    </p>
                    <p className="text-sm text-gray-700">
                      {item.explanation}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/test-setup')}
            className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition font-medium"
          >
            Take Another Test
          </button>
          <Link
            to="/dashboard/analytics"
            className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition font-medium text-center"
          >
            View Analytics
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResultsScreen;
