import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800';
      case 'INSTRUCTOR':
        return 'bg-blue-100 text-blue-800';
      case 'INSTITUTIONAL_PARTNER':
        return 'bg-green-100 text-green-800';
      case 'STUDENT':
      default:
        return 'bg-indigo-100 text-indigo-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">PrepPioneer</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name}!</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome Back!</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600"><strong>Name:</strong> {user?.name}</p>
              <p className="text-gray-600"><strong>Email:</strong> {user?.email}</p>
            </div>
            <div>
              <p className="text-gray-600"><strong>Role:</strong> 
                <span className={`ml-2 px-3 py-1 rounded-full text-sm ${getRoleBadgeColor(user?.role)}`}>
                  {user?.role}
                </span>
              </p>
              <p className="text-gray-600"><strong>User ID:</strong> {user?.id}</p>
            </div>
          </div>
        </div>

        {/* Admin/Instructor Dashboard Links */}
        {(user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR') && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Management Dashboards</h3>
            <div className="flex flex-wrap gap-4">
              {user?.role === 'ADMIN' && (
                <button
                  onClick={() => navigate('/admin')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition duration-200 font-semibold"
                >
                  Admin Dashboard
                </button>
              )}
              {(user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN') && (
                <button
                  onClick={() => navigate('/instructor')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition duration-200 font-semibold"
                >
                  Instructor Dashboard
                </button>
              )}
            </div>
          </div>
        )}

        {/* Simple Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => navigate('/tests/catalog')}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition duration-200 text-left cursor-pointer hover:scale-105 transform"
          >
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Browse Exams</h3>
            <p className="text-gray-600">Explore competitive exams catalog</p>
          </button>

          <button
            onClick={() => navigate('/test-setup')}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition duration-200 text-left cursor-pointer hover:scale-105 transform"
          >
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Start New Test</h3>
            <p className="text-gray-600">Take AI-generated practice tests</p>
          </button>

          <button
            onClick={() => navigate('/dashboard/analytics')}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition duration-200 text-left cursor-pointer hover:scale-105 transform"
          >
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Analytics</h3>
            <p className="text-gray-600">View performance analytics</p>
          </button>

          <button
            onClick={() => navigate('/ai-counselor')}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition duration-200 text-left cursor-pointer hover:scale-105 transform"
          >
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">AI Counselor</h3>
            <p className="text-gray-600">Personalized guidance & study plans</p>
          </button>

          <button
            onClick={() => navigate('/lat-grader')}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition duration-200 text-left cursor-pointer hover:scale-105 transform"
          >
            <div className="text-4xl mb-4">✍️</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">LAT Essay Grader</h3>
            <p className="text-gray-600">Get AI feedback on essays</p>
          </button>

          <button
            onClick={() => navigate('/whatsapp')}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition duration-200 text-left cursor-pointer hover:scale-105 transform"
          >
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">WhatsApp Alerts</h3>
            <p className="text-gray-600">Daily quizzes & notifications</p>
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            🚀 Welcome to PrepPioneer AI-Powered Platform
          </h3>
          <div className="space-y-2 text-gray-700">
            <p>✅ <strong>MCQ Tests:</strong> AI-generated questions tailored to your topics</p>
            <p>✅ <strong>Real-time Feedback:</strong> Instant AI-powered performance analysis</p>
            <p>✅ <strong>LAT Essay Grading:</strong> Professional essay evaluation with structured feedback</p>
            <p>✅ <strong>AI Counseling:</strong> Get personalized study plans based on your performance</p>
            <p>✅ <strong>WhatsApp Alerts:</strong> Daily quiz questions and test notifications via WhatsApp</p>
            <p>✅ <strong>Analytics Dashboard:</strong> Track progress with visual charts and insights</p>
          </div>
        </div>

        {/* Premium/Gradient Feature Cards */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Featured Services</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Browse Exams */}
            <button
              onClick={() => navigate('/tests/catalog')}
              className="group relative bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 text-left cursor-pointer transform hover:scale-105 border border-blue-100 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">📚</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">Browse Exams</h3>
                <p className="text-gray-600">Explore competitive exams catalog</p>
              </div>
            </button>

            {/* Start Test */}
            <button
              onClick={() => navigate('/test-setup')}
              className="group relative bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 text-left cursor-pointer transform hover:scale-105 border border-green-100 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">📝</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">Start New Test</h3>
                <p className="text-gray-600">Take AI-generated practice tests</p>
              </div>
            </button>

            {/* Analytics */}
            <button
              onClick={() => navigate('/dashboard/analytics')}
              className="group relative bg-gradient-to-br from-white to-orange-50 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 text-left cursor-pointer transform hover:scale-105 border border-orange-100 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-red-500/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">📊</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors">Analytics</h3>
                <p className="text-gray-600">View performance analytics</p>
              </div>
            </button>

            {/* AI Counselor */}
            <button
              onClick={() => navigate('/ai-counselor')}
              className="group relative bg-gradient-to-br from-purple-600 via-pink-500 to-indigo-600 rounded-2xl shadow-2xl p-8 hover:shadow-3xl transition-all duration-300 text-left cursor-pointer transform hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/50 to-pink-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-5xl transform group-hover:scale-110 transition-transform">🧠</div>
                  <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold border border-white/30">AI POWERED</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">AI Counselor</h3>
                <p className="text-purple-100">Personalized guidance & study plans</p>
              </div>
            </button>

            {/* LAT Grader */}
            <button
              onClick={() => navigate('/lat-grader')}
              className="group relative bg-gradient-to-br from-white to-teal-50 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 text-left cursor-pointer transform hover:scale-105 border border-teal-100 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-400/20 to-cyan-500/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">✍️</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-teal-600 transition-colors">LAT Essay Grader</h3>
                <p className="text-gray-600">Get AI feedback on essays</p>
              </div>
            </button>

            {/* WhatsApp */}
            <button
              onClick={() => navigate('/whatsapp')}
              className="group relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-2xl p-8 hover:shadow-3xl transition-all duration-300 text-left cursor-pointer transform hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/50 to-emerald-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-5xl transform group-hover:scale-110 transition-transform">📱</div>
                  <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold border border-white/30">NEW</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">WhatsApp Alerts</h3>
                <p className="text-green-100">Daily quizzes & notifications</p>
              </div>
            </button>
          </div>
        </div>

        {/* Social Media & Footer */}
        <div className="mt-10 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-8">
          {/* Social Media Links */}
          <div className="flex flex-col items-center mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Connect With Us</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {/* Facebook */}
              <a
                href="https://facebook.com/preppioneer"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center space-x-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="font-semibold">Facebook</span>
              </a>

              {/* Twitter */}
              <a
                href="https://twitter.com/preppioneer"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center space-x-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white px-6 py-3 rounded-xl hover:from-gray-900 hover:to-black transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span className="font-semibold">Twitter</span>
              </a>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com/company/preppioneer"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span className="font-semibold">LinkedIn</span>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com/preppioneer"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center space-x-3 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white px-6 py-3 rounded-xl hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span className="font-semibold">Instagram</span>
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com/@preppioneer"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center space-x-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span className="font-semibold">YouTube</span>
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/923001234567"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center space-x-3 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span className="font-semibold">WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Copyright Footer */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">PrepPioneer</p>
                  <p className="text-xs text-gray-600">AI-Powered Learning Platform</p>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-700 font-semibold mb-1">
                  © 2025 All Rights Reserved
                </p>
                <p className="text-sm text-gray-600">
                  Developed by{' '}
                  <a
                    href="https://ietcoders.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all"
                  >
                    IETCODERS
                  </a>
                </p>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <a href="/privacy" className="hover:text-indigo-600 transition-colors font-medium">Privacy Policy</a>
                <span>•</span>
                <a href="/terms" className="hover:text-indigo-600 transition-colors font-medium">Terms of Service</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
