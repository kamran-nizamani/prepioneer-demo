import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const TestScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();

  // Get test data from navigation state
  const { sessionId, questions, testName, topic, difficulty } = location.state || {};

  // State management
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(questions ? questions.length * 60 : 600); // 1 min per question
  const [isFinished, setIsFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Redirect if no test data
  useEffect(() => {
    if (!sessionId || !questions || questions.length === 0) {
      navigate('/test/setup');
    }
  }, [sessionId, questions, navigate]);

  // Timer implementation
  useEffect(() => {
    if (isFinished) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleSubmit(true); // Auto-submit when time expires
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isFinished]);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle option selection
  const handleOptionSelect = (option) => {
    setUserAnswers({
      ...userAnswers,
      [currentQuestionIndex]: option
    });
  };

  // Navigation handlers
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Submit test
  const handleSubmit = async (autoSubmit = false) => {
    if (isSubmitting) return;

    // Confirm submission (unless auto-submit)
    if (!autoSubmit) {
      const confirmed = window.confirm(
        'Are you sure you want to submit your test? This action cannot be undone.'
      );
      if (!confirmed) return;
    }

    setIsSubmitting(true);
    setIsFinished(true);
    setError('');

    try {
      // Prepare answers in required format
      const formattedAnswers = questions.map((q, index) => ({
        questionNumber: index + 1,
        selectedAnswer: userAnswers[index] || '' // Empty if not answered
      }));

      // Submit to backend
      const response = await axios.post(
        `http://localhost:5000/api/tests/${sessionId}/submit`,
        { answers: formattedAnswers },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Navigate to results page
      navigate(`/test/results/${sessionId}`, {
        state: {
          results: response.data,
          testName,
          topic
        }
      });

    } catch (err) {
      console.error('Submit test error:', err);
      const message = err.response?.data?.message || 'Failed to submit test. Please try again.';
      setError(message);
      setIsSubmitting(false);
      setIsFinished(false);
    }
  };

  // Loading state
  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading test...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const selectedAnswer = userAnswers[currentQuestionIndex];
  const answeredCount = Object.keys(userAnswers).length;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header with Timer */}
      <div className="bg-white shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-800">{testName}</h1>
              <p className="text-sm text-gray-600">{topic}</p>
            </div>
            
            <div className="text-center">
              <div className={`text-3xl font-bold ${timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-indigo-600'}`}>
                ⏱️ {formatTime(timeLeft)}
              </div>
              <p className="text-xs text-gray-500">Time Remaining</p>
            </div>

            <div className="text-right">
              <div className="text-lg font-semibold text-gray-800">
                {answeredCount} / {questions.length}
              </div>
              <p className="text-xs text-gray-500">Answered</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-4xl mx-auto px-4 mt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
          {/* Question Header */}
          <div className="flex items-center justify-between mb-6">
            <span className="bg-indigo-100 text-indigo-800 text-sm font-semibold px-3 py-1 rounded-full">
              Difficulty: {difficulty}
            </span>
            <span className="text-sm text-gray-500">
              Question #{currentQuestion.questionNumber}
            </span>
          </div>

          {/* Question Text */}
          <h2 className="text-2xl font-bold text-gray-800 mb-8">
            {currentQuestion.text}
          </h2>

          {/* Options */}
          <div className="space-y-4">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(option)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedAnswer === option
                    ? 'border-indigo-600 bg-indigo-50 shadow-md'
                    : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                }`}
                disabled={isFinished}
              >
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                    selectedAnswer === option
                      ? 'border-indigo-600 bg-indigo-600'
                      : 'border-gray-400'
                  }`}>
                    {selectedAnswer === option && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-lg ${selectedAnswer === option ? 'font-semibold text-indigo-900' : 'text-gray-700'}`}>
                    {option}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0 || isFinished}
            className="flex items-center px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          <div className="flex space-x-4">
            {!isLastQuestion ? (
              <button
                onClick={handleNext}
                disabled={isFinished}
                className="flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={() => handleSubmit(false)}
                disabled={isFinished || isSubmitting}
                className="flex items-center px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Test
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Question Navigator */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Navigation</h3>
          <div className="grid grid-cols-10 gap-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                disabled={isFinished}
                className={`aspect-square rounded-lg font-semibold text-sm transition-all duration-200 ${
                  index === currentQuestionIndex
                    ? 'bg-indigo-600 text-white shadow-lg scale-110'
                    : userAnswers[index]
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestScreen;
