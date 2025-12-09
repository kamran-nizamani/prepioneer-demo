import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/AICounselor.css';

const AICounselor = () => {
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'السلام علیکم! Welcome to AI Counseling with Dr. Ayesha Rahman 👋\n\nI\'m here to provide personalized guidance for your exam preparation. I specialize in:\n\n• 📚 Study strategy and time management\n• 🎯 Subject selection and career guidance\n• 💪 Motivation and stress management\n• 📊 Performance analysis and improvement plans\n\nFeel free to ask me anything about CSS, MDCAT, ECAT, LAT, NAT, PMS, or GAT preparation!',
      timestamp: new Date().toISOString()
    }
  ]);
  const [studyPlan, setStudyPlan] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [weaknesses, setWeaknesses] = useState(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [exams, setExams] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const navigate = useNavigate();

  const suggestedQuestions = [
    '🎯 How should I prepare for MDCAT with 3 months left?',
    '📖 Should I focus on Physics or Biology first?',
    '⏰ How can I manage time during the actual exam?',
    '😰 I\'m feeling anxious about CSS essays. Any tips?',
    '📊 What\'s the best strategy for improving my weak areas?',
    '🎓 How many hours should I study daily?'
  ];

  useEffect(() => {
    // Fetch weakness profile and exams on mount
    fetchWeaknesses();
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/public/tests/catalog');
      setExams(response.data.catalog || []);
    } catch (err) {
      console.error('Failed to fetch exams:', err);
    }
  };

  const fetchWeaknesses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/counseling/weaknesses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWeaknesses(response.data.weaknesses);
    } catch (err) {
      console.error('Failed to fetch weaknesses:', err);
    }
  };

  const handleAskQuestion = async (e, suggestedQ = null) => {
    if (e) e.preventDefault();
    const questionText = suggestedQ || question;
    if (!questionText.trim()) return;

    // Add user message to chat
    const userMessage = {
      role: 'user',
      content: questionText,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setQuestion('');
    setShowSuggestions(false);
    setLoading(true);

    // Scroll to bottom
    setTimeout(() => {
      const chatContainer = document.getElementById('chat-messages');
      if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 100);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/counseling/ask',
        { 
          question: questionText,
          examId: selectedExam?.id 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Add AI response to chat
      const aiMessage = {
        role: 'assistant',
        content: response.data.guidance,
        timestamp: response.data.timestamp
      };
      setMessages(prev => [...prev, aiMessage]);

      // Scroll to bottom after AI response
      setTimeout(() => {
        const chatContainer = document.getElementById('chat-messages');
        if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
      }, 100);

    } catch (err) {
      console.error('Failed to get guidance:', err);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again or contact support.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateStudyPlan = async () => {
    setLoadingPlan(true);
    try {
      const token = localStorage.getItem('token');
      const url = selectedExam 
        ? `http://localhost:5000/api/counseling/plan?examId=${selectedExam.id}`
        : 'http://localhost:5000/api/counseling/plan';
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.data.hasData) {
        const message = 'No test data available yet!\n\n📝 Take some practice tests to generate a personalized study plan based on your performance.\n\n💡 Tip: The more tests you take, the more accurate your study plan will be!';
        alert(message);
        return;
      }

      setStudyPlan(response.data.plan);
      setShowPlanModal(true);

    } catch (err) {
      console.error('Failed to generate study plan:', err);
      alert('Failed to generate study plan. Please try again.');
    } finally {
      setLoadingPlan(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const handleExportChat = () => {
    const chatText = messages.map(msg => 
      `[${formatTimestamp(msg.timestamp)}] ${msg.role === 'user' ? 'You' : 'Dr. Ayesha'}:\n${msg.content}\n`
    ).join('\n');
    
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AI-Counseling-Chat-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  const handleClearChat = () => {
    if (confirm('Clear all chat history? This cannot be undone.')) {
      setMessages([{
        role: 'assistant',
        content: 'Chat history cleared. How can I help you today?',
        timestamp: new Date().toISOString()
      }]);
      setShowSuggestions(true);
    }
  };

  const handleExportStudyPlan = () => {
    if (!studyPlan) return;
    
    let planText = `${studyPlan.examTitle || 'Study Plan'}\n`;
    planText += `Generated: ${new Date().toLocaleDateString()}\n`;
    planText += `Student: ${studyPlan.studentName}\n`;
    planText += `Goal: ${studyPlan.overallGoal}\n\n`;
    planText += '='.repeat(60) + '\n\n';
    
    studyPlan.plan?.forEach(day => {
      planText += `${day.label.toUpperCase()} - ${day.focusArea}\n`;
      planText += `Total Time: ${day.totalMinutes} minutes\n`;
      planText += `Goal: ${day.goalForDay}\n\n`;
      
      day.sessions?.forEach((session, idx) => {
        planText += `  Session ${idx + 1}: ${session.topic}\n`;
        planText += `  Duration: ${session.duration} min | Difficulty: ${session.difficulty}\n`;
        planText += `  Practice: ${session.practiceQuestions} questions\n`;
        planText += `  Tips: ${session.tips}\n\n`;
      });
      
      planText += '-'.repeat(60) + '\n\n';
    });
    
    const blob = new Blob([planText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Study-Plan-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with Animated Study Images */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-blue-800 to-purple-900 animated-background">
        <div className="absolute inset-0 bg-black/20"></div>
        {/* Floating Study Elements with Animations */}
        <div className="absolute top-10 left-10 w-32 h-32 opacity-15 floating-element-1 study-element">
          <div className="w-full h-full bg-white/20 rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-sm border border-white/10">
            <svg className="w-16 h-16 text-white study-icon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
          </div>
        </div>
        <div className="absolute top-20 right-20 w-24 h-24 opacity-15 floating-element-2 study-element">
          <div className="w-full h-full bg-white/20 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-sm border border-white/10">
            <svg className="w-12 h-12 text-white study-icon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
            </svg>
          </div>
        </div>
        <div className="absolute bottom-10 left-20 w-28 h-28 opacity-15 floating-element-3 study-element">
          <div className="w-full h-full bg-white/20 rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-sm border border-white/10">
            <svg className="w-14 h-14 text-white study-icon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2.5-5H18V4l-1-1H7L6 4v2H3.5C2.67 6 2 6.67 2 7.5S2.67 9 3.5 9H5v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V9h1.5c.83 0 1.5-.67 1.5-1.5S20.33 6 19.5 6z"/>
            </svg>
          </div>
        </div>
        <div className="absolute bottom-20 right-10 w-20 h-20 opacity-15 floating-element-4 study-element">
          <div className="w-full h-full bg-white/20 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-sm border border-white/10">
            <svg className="w-10 h-10 text-white study-icon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
        </div>
        {/* Additional decorative study elements */}
        <div className="absolute top-1/3 right-1/4 w-16 h-16 opacity-10 floating-element-1">
          <div className="w-full h-full bg-white/20 rounded-lg flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
        </div>
        <div className="absolute bottom-1/3 left-1/4 w-20 h-20 opacity-10 floating-element-3">
          <div className="w-full h-full bg-white/20 rounded-xl flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
            </svg>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen">
        {/* Advanced Header */}
        <div className="bg-white/95 backdrop-blur-sm shadow-xl border-b border-white/20">
          <div className="max-w-6xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 p-4 rounded-xl shadow-lg">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    AI Counselor - Dr. Ayesha Rahman
                  </h1>
                  <p className="text-gray-600 font-medium">🎓 Educational Psychologist & Exam Strategy Specialist</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">🤖 AI-Powered</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">✨ Personalized</span>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">📊 Data-Driven</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleExportChat}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
                  title="Export chat history"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Export</span>
                </button>
                <button
                  onClick={handleClearChat}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
                  title="Clear chat"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Clear</span>
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-5 py-2 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-xl hover:from-gray-800 hover:to-gray-900 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Dashboard</span>
                </button>
              </div>
            </div>
          
            {/* Enhanced Exam Selector */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/30">
              <div className="flex flex-col space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Target Exam Selection</h3>
                    <p className="text-xs text-gray-600">Choose your focus exam for personalized guidance</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <select
                    value={selectedExam?.id || ''}
                    onChange={(e) => {
                      const exam = exams.find(ex => ex.id === parseInt(e.target.value));
                      setSelectedExam(exam || null);
                    }}
                    className="flex-1 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 shadow-sm"
                  >
                    <option value="">🌍 General (All Exams)</option>
                    {exams.map(exam => (
                      <option key={exam.id} value={exam.id}>
                        🎯 {exam.acronym} - {exam.title}
                      </option>
                    ))}
                  </select>
                  
                  {selectedExam && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 px-3 py-2 rounded-full font-medium border border-purple-200">
                        🏢 {selectedExam.conductingBody}
                      </span>
                      <span className="text-xs bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-3 py-2 rounded-full font-medium border border-green-200">
                        ✅ Selected
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Advanced Chat Interface - Left Column (2/3) */}
            <div className="lg:col-span-2">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden flex flex-col relative" style={{ height: '75vh' }}>
                {/* Chat Header with Study Theme */}
                <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 p-4 text-white relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">🤖 AI Counseling Session</h3>
                        <p className="text-white/80 text-sm">{selectedExam ? `Focused on ${selectedExam.acronym}` : 'General Guidance'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Online</span>
                    </div>
                  </div>
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
                </div>
              
              {/* Enhanced Messages Container */}
              <div id="chat-messages" className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-50/50 to-white/50 custom-scrollbar">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                      <div className="flex items-end space-x-2">
                        {msg.role === 'assistant' && (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg border-2 border-white animate-pulse">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                          </div>
                        )}
                        <div>
                          <div
                            className={`rounded-2xl px-5 py-4 shadow-lg border ${
                              msg.role === 'user'
                                ? 'bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white shadow-blue-500/25 border-blue-500/20'
                                : 'bg-white/90 backdrop-blur-sm text-gray-800 shadow-gray-200/50 border-gray-200/50'
                            } transform hover:scale-[1.02] transition-all duration-200`}
                          >
                            <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{msg.content}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-2 px-2 font-medium">
                            {formatTimestamp(msg.timestamp)}
                          </p>
                        </div>
                        {msg.role === 'user' && (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg border-2 border-white">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {loading && (
                  <div className="flex justify-start">
                    <div className="flex items-end space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div className="bg-gray-100 rounded-2xl px-4 py-3">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Enhanced Suggested Questions */}
                {showSuggestions && messages.length === 1 && (
                  <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 rounded-2xl border border-blue-100 shadow-sm">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </div>
                      <h4 className="text-base font-bold text-gray-800">🚀 Quick Start - Try These Questions</h4>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {suggestedQuestions.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleAskQuestion(null, q)}
                          className="group text-left px-5 py-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-300 hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 text-sm text-gray-700 font-medium shadow-sm"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full group-hover:animate-pulse"></div>
                            <span className="group-hover:text-blue-700 transition-colors">{q}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Input Form */}
              <div className="border-t border-white/20 bg-gradient-to-r from-gray-50/90 to-white/90 backdrop-blur-sm p-6">
                <form onSubmit={handleAskQuestion} className="space-y-4">
                  <div className="flex space-x-4">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Ask me anything about exam preparation, strategy, or guidance..."
                        className="w-full px-5 py-4 bg-white/90 backdrop-blur-sm border-2 border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm text-gray-800 placeholder-gray-500 font-medium"
                        disabled={loading}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={loading || !question.trim()}
                      className="px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:via-purple-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
                    >
                      {loading ? (
                        <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      )}
                      <span>{loading ? 'Thinking...' : 'Ask'}</span>
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="p-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    <p className="text-xs text-gray-600 font-medium">
                      💡 Pro Tip: Be specific for personalized guidance (e.g., "How to improve Biology score from 60% to 80% in 2 months?")
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Enhanced Right Sidebar - Study Tools & Analytics */}
          <div className="space-y-8">
            
            {/* Advanced Study Plan Card */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8 relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="relative z-10">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                      📈 Smart Study Plan
                    </h3>
                    <p className="text-sm text-gray-600 font-medium">AI-Generated & Data-Driven</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 mb-6 border border-purple-100">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm">✨ Personalized 7-Day Plan</h4>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                        Generated based on your test performance, weak areas, and learning patterns. Includes daily goals, practice sessions, and progress tracking.
                      </p>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleGenerateStudyPlan}
                  disabled={loadingPlan}
                  className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-600 text-white rounded-xl hover:from-purple-600 hover:via-indigo-600 hover:to-blue-700 disabled:opacity-50 font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center space-x-3"
                >
                  {loadingPlan ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Analyzing Your Data...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>🚀 Generate Smart Plan</span>
                    </>
                  )}
                </button>
                
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-xs font-bold text-blue-700">📊 Analytics</p>
                  </div>
                  <div className="p-2 bg-green-50 rounded-lg border border-green-100">
                    <p className="text-xs font-bold text-green-700">🎯 Targeted</p>
                  </div>
                  <div className="p-2 bg-purple-50 rounded-lg border border-purple-100">
                    <p className="text-xs font-bold text-purple-700">⏱️ Timed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Performance Analytics Card */}
            {weaknesses && Object.keys(weaknesses).length > 0 && (
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-full -translate-y-14 translate-x-14"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl shadow-lg">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        📊 Performance Analytics
                      </h3>
                      <p className="text-sm text-gray-600 font-medium">Areas Requiring Focus</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {Object.keys(weaknesses).slice(0, 5).map((topic, idx) => {
                      const score = weaknesses[topic]?.averageScore || 0;
                      const attempts = weaknesses[topic]?.totalAttempts || 0;
                      const scoreColor = score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red';
                      
                      return (
                        <div key={idx} className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-800 truncate">📝 {topic}</span>
                            <div className="flex items-center space-x-2">
                              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                                scoreColor === 'green' ? 'bg-green-100 text-green-700 border border-green-200' :
                                scoreColor === 'yellow' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                                'bg-red-100 text-red-700 border border-red-200'
                              }`}>
                                {score.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  scoreColor === 'green' ? 'bg-gradient-to-r from-green-400 to-green-600' :
                                  scoreColor === 'yellow' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                                  'bg-gradient-to-r from-red-400 to-red-600'
                                }`}
                                style={{ width: `${Math.max(score, 5)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500 font-medium">{attempts} Q's</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <p className="text-xs text-gray-700 font-medium text-center">
                      💡 Take more tests to get detailed analytics and personalized recommendations
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Expert Tips Card */}
            <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">✨ Expert Insights</h3>
                    <p className="text-white/80 text-sm font-medium">Dr. Ayesha's Pro Tips</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                    <div className="p-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm mb-1">Build Your Profile</h4>
                      <p className="text-white/90 text-xs">Take regular practice tests to create an accurate weakness analysis</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                    <div className="p-2 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-lg flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm mb-1">Ask Specific Questions</h4>
                      <p className="text-white/90 text-xs">"How to improve Biology from 60% to 80% in 2 months?" gets better advice</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                    <div className="p-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm mb-1">Select Target Exam</h4>
                      <p className="text-white/90 text-xs">Choose your exam above for focused, personalized guidance</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                    <div className="p-2 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm mb-1">Weekly Reviews</h4>
                      <p className="text-white/90 text-xs">Update your study plan every week based on progress</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Study Plan Modal */}
      {showPlanModal && studyPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{studyPlan.examTitle || 'Your Study Plan'}</h2>
                  <p className="text-purple-100 mt-1">{studyPlan.totalDays}-Day Personalized Schedule</p>
                </div>
                <button
                  onClick={() => setShowPlanModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Overall Goal */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-purple-900 mb-2">🎯 Weekly Goal</h3>
                <p className="text-purple-800">{studyPlan.overallGoal}</p>
              </div>

              {/* Daily Plans */}
              <div className="space-y-6">
                {studyPlan.plan?.map((day, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-bold text-gray-800">{day.label}</h4>
                        <p className="text-sm text-gray-600">{day.focusArea}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Total Time</p>
                        <p className="text-lg font-bold text-purple-600">{day.totalMinutes} min</p>
                      </div>
                    </div>

                    {/* Sessions */}
                    <div className="space-y-3">
                      {day.sessions?.map((session, sIdx) => (
                        <div key={sIdx} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-800">{session.topic}</h5>
                              <p className="text-xs text-gray-600 mt-1">{session.tips}</p>
                            </div>
                            <span className={`text-xs font-medium px-2 py-1 rounded ${
                              session.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                              session.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {session.difficulty}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>⏱️ {session.duration} min</span>
                            <span>📝 {session.practiceQuestions} questions</span>
                          </div>
                          {session.resources && session.resources.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500">Resources:</p>
                              <p className="text-xs text-gray-700">{session.resources.join(', ')}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-700">
                        <strong>Goal:</strong> {day.goalForDay}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={() => setShowPlanModal(false)}
                  className="flex-1 min-w-[200px] px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 font-medium transition-all"
                >
                  ✅ Start Following Plan
                </button>
                <button
                  onClick={handleExportStudyPlan}
                  className="px-6 py-3 border border-purple-300 text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 font-medium transition-all"
                >
                  📥 Export as Text
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-all"
                >
                  🖨️ Print PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AICounselor;
