import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const TestCatalogGrid = () => {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        // Public route, no token required
        const response = await axios.get('http://localhost:5000/api/public/tests/catalog');
        setCatalog(response.data.catalog);
        console.log(`Loaded ${response.data.count} exams`);
      } catch (err) {
        console.error('Failed to fetch test catalog:', err);
        setError('Could not load available tests. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  const getIcon = (type) => {
    if (type.includes('Admission')) {
      return (
        <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      );
    }
    if (type.includes('Recruitment')) {
      return (
        <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    }
    return (
      <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  };

  const getBadgeColor = (type) => {
    if (type.includes('Recruitment')) return 'bg-green-100 text-green-800';
    if (type.includes('Admission')) return 'bg-blue-100 text-blue-800';
    return 'bg-purple-100 text-purple-800';
  };

  const startTestSetup = (catalogId, acronym) => {
    // Navigate to the test setup page, passing the catalog ID as state
    navigate('/test-setup', { state: { catalogId, acronym } });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading Test Catalog...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 font-bold text-xl mb-2">Error Loading Catalog</h2>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
            Choose Your Exam Path
          </h1>
          <p className="text-xl text-gray-600">
            Prepare for Pakistan's top competitive exams with AI-powered practice tests
          </p>
        </div>

        {catalog.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Exams Available</h3>
            <p className="text-gray-500">Check back soon for new exam preparations.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {catalog.map((exam) => (
              <div 
                key={exam.id} 
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 p-6 flex flex-col border-t-4 border-blue-500"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  {getIcon(exam.type)}
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getBadgeColor(exam.type)}`}>
                    {exam.type}
                  </span>
                </div>
                
                {/* Acronym */}
                <h2 className="text-5xl font-black text-gray-900 mb-1">{exam.acronym}</h2>
                
                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-700 mb-3 leading-tight">
                  {exam.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 flex-grow leading-relaxed">
                  {exam.description}
                </p>
                
                {/* Footer */}
                <div className="border-t pt-3 mt-auto">
                  <p className="text-xs text-gray-500 mb-3">
                    <span className="font-medium">Conducted by:</span>{' '}
                    <span className="font-bold text-gray-700">{exam.conductingBody}</span>
                  </p>

                  <div className="space-y-2">
                    <button
                      onClick={() => navigate(`/exam/${exam.acronym}`)}
                      className="w-full py-2.5 bg-white border-2 border-blue-600 text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition duration-150"
                    >
                      📖 View Complete Details
                    </button>
                    <button
                      onClick={() => startTestSetup(exam.id, exam.acronym)}
                      className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 active:bg-blue-800 transition duration-150 shadow-md hover:shadow-lg"
                    >
                      🚀 Start Prep for {exam.acronym}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>✨ All tests use AI-powered question generation for unlimited practice</p>
          <p className="mt-2">💰 Completely FREE - No API costs, no subscriptions</p>
        </div>
      </div>
    </div>
  );
};

export default TestCatalogGrid;
