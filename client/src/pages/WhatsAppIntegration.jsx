import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/AICounselor.css';

const WhatsAppIntegration = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [serviceStatus, setServiceStatus] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [customMessage, setCustomMessage] = useState('');
  const [userOptedIn, setUserOptedIn] = useState(false);

  useEffect(() => {
    checkServiceStatus();
    checkUserOptInStatus();
  }, []);

  const checkServiceStatus = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/whatsapp/status');
      setServiceStatus(response.data);
    } catch (error) {
      console.error('Error checking service status:', error);
    }
  };

  const checkUserOptInStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const userResponse = await axios.get('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserOptedIn(userResponse.data.user.whatsappOptIn || false);
      if (userResponse.data.user.phoneNumber) {
        setPhoneNumber(userResponse.data.user.phoneNumber);
      }
    } catch (error) {
      console.error('Error checking user status:', error);
    }
  };

  const handleSendTestMessage = async () => {
    if (!phoneNumber) {
      alert('Please enter a phone number');
      return;
    }

    setLoading(true);
    setTestResult(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/whatsapp/test',
        { phoneNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTestResult({
        success: true,
        message: response.data.message
      });
    } catch (error) {
      console.error('Error sending test message:', error);
      setTestResult({
        success: false,
        message: error.response?.data?.message || 'Failed to send test message'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOptIn = async () => {
    if (!phoneNumber) {
      alert('Please enter your phone number');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/whatsapp/opt-in',
        { phoneNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUserOptedIn(true);
      alert('✅ Successfully opted in to WhatsApp notifications!');
    } catch (error) {
      console.error('Error opting in:', error);
      alert('Failed to opt in: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleOptOut = async () => {
    if (!confirm('Are you sure you want to stop receiving WhatsApp notifications?')) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/whatsapp/opt-out',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUserOptedIn(false);
      alert('✅ Successfully opted out of WhatsApp notifications');
    } catch (error) {
      console.error('Error opting out:', error);
      alert('Failed to opt out: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSendCustomMessage = async () => {
    if (!phoneNumber || !customMessage) {
      alert('Please enter both phone number and message');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/whatsapp/send-message',
        { phoneNumber, message: customMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('✅ Message sent successfully!');
      setCustomMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-teal-900 to-blue-900">
        <div className="absolute inset-0 bg-black/20"></div>
        {/* Floating Elements */}
        <div className="absolute top-10 left-10 w-32 h-32 opacity-10 floating-element-1">
          <div className="w-full h-full bg-white/20 rounded-2xl backdrop-blur-sm border border-white/10 flex items-center justify-center">
            <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-sm shadow-2xl border-b border-white/20">
          <div className="max-w-6xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    WhatsApp Integration
                  </h1>
                  <p className="text-gray-600 font-medium">📱 Stay connected with PrepPioneer notifications</p>
                </div>
              </div>
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
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Service Status Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Service Status
            </h2>
            {serviceStatus ? (
              <div className={`p-6 rounded-xl ${serviceStatus.configured ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
                <p className={`text-lg font-bold ${serviceStatus.configured ? 'text-green-800' : 'text-red-800'}`}>
                  {serviceStatus.message}
                </p>
                {serviceStatus.configured && (
                  <p className="text-sm text-green-700 mt-2">
                    📱 WhatsApp Number: {serviceStatus.whatsappNumber}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-600">Checking service status...</p>
            )}
          </div>

          {/* Opt-In/Out Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Notification Preferences
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Your Phone Number (E.164 format, e.g., +14155551234)
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+14155551234"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                />
              </div>
              <div className="flex items-center space-x-4">
                {userOptedIn ? (
                  <button
                    onClick={handleOptOut}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 disabled:opacity-50 font-bold transition-all shadow-lg"
                  >
                    {loading ? 'Processing...' : '🔕 Opt Out'}
                  </button>
                ) : (
                  <button
                    onClick={handleOptIn}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl hover:from-green-600 hover:to-teal-700 disabled:opacity-50 font-bold transition-all shadow-lg"
                  >
                    {loading ? 'Processing...' : '🔔 Opt In to Notifications'}
                  </button>
                )}
                <span className={`px-4 py-2 rounded-full text-sm font-bold ${userOptedIn ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {userOptedIn ? '✅ Subscribed' : '❌ Not Subscribed'}
                </span>
              </div>
            </div>
          </div>

          {/* Test Message Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Test Integration
            </h2>
            <p className="text-gray-600 mb-4">
              Send a test message to verify your WhatsApp integration is working correctly.
            </p>
            <button
              onClick={handleSendTestMessage}
              disabled={loading || !serviceStatus?.configured}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 font-bold transition-all shadow-lg"
            >
              {loading ? 'Sending...' : '🧪 Send Test Message'}
            </button>
            {testResult && (
              <div className={`mt-4 p-4 rounded-xl ${testResult.success ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
                <p className={`font-bold ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
                  {testResult.message}
                </p>
              </div>
            )}
          </div>

          {/* Custom Message Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-3 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Send Custom Message
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Enter your message here..."
                  rows="4"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                />
              </div>
              <button
                onClick={handleSendCustomMessage}
                disabled={loading || !serviceStatus?.configured}
                className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl hover:from-teal-600 hover:to-cyan-700 disabled:opacity-50 font-bold transition-all shadow-lg"
              >
                {loading ? 'Sending...' : '📤 Send Message'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppIntegration;
