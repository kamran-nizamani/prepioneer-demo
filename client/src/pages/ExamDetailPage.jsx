import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ExamDetailPage = () => {
  const { acronym } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [examInfo, setExamInfo] = useState(null);

  useEffect(() => {
    const fetchExamContent = async () => {
      try {
        // Fetch markdown content
        const contentResponse = await axios.get(`http://localhost:5000/api/public/exam-content/${acronym}`);
        setContent(contentResponse.data.content);

        // Fetch exam info from catalog
        const catalogResponse = await axios.get('http://localhost:5000/api/public/tests/catalog');
        const exam = catalogResponse.data.catalog.find(e => e.acronym === acronym);
        setExamInfo(exam);

      } catch (err) {
        console.error('Failed to fetch exam content:', err);
        setError('Could not load exam details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchExamContent();
  }, [acronym]);

  const startTestSetup = () => {
    if (examInfo) {
      navigate('/test-setup', { state: { catalogId: examInfo.id, acronym: examInfo.acronym } });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading {acronym} Details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 font-bold text-xl mb-2">Error Loading Content</h2>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => navigate('/tests/catalog')} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Catalog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8 shadow-lg">
        <div className="max-w-5xl mx-auto px-6">
          <button
            onClick={() => navigate('/tests/catalog')}
            className="mb-4 flex items-center text-blue-100 hover:text-white transition"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Catalog
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-black mb-2">{acronym}</h1>
              {examInfo && (
                <>
                  <p className="text-xl font-medium text-blue-100">{examInfo.title}</p>
                  <p className="text-sm text-blue-200 mt-1">Conducted by: {examInfo.conductingBody}</p>
                </>
              )}
            </div>
            {examInfo && (
              <button
                onClick={startTestSetup}
                className="px-8 py-4 bg-white text-blue-700 font-bold rounded-lg hover:bg-blue-50 active:bg-blue-100 transition duration-150 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Start Prep for {acronym}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="bg-white rounded-xl shadow-xl p-8 md:p-12">
          <article className="prose prose-lg prose-blue max-w-none">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                // Custom styling for markdown elements
                h1: ({node, ...props}) => <h1 className="text-4xl font-black text-gray-900 mb-6 border-b-4 border-blue-500 pb-4" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-3xl font-bold text-gray-800 mt-10 mb-4 border-l-4 border-blue-500 pl-4" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-2xl font-bold text-gray-800 mt-8 mb-3" {...props} />,
                h4: ({node, ...props}) => <h4 className="text-xl font-semibold text-gray-700 mt-6 mb-2" {...props} />,
                p: ({node, ...props}) => <p className="text-gray-700 leading-relaxed mb-4" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-700" {...props} />,
                li: ({node, ...props}) => <li className="ml-4" {...props} />,
                strong: ({node, ...props}) => <strong className="font-bold text-gray-900" {...props} />,
                em: ({node, ...props}) => <em className="italic text-gray-800" {...props} />,
                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-400 pl-4 italic text-gray-600 my-4 bg-blue-50 py-2" {...props} />,
                code: ({node, inline, ...props}) => 
                  inline ? 
                    <code className="bg-gray-100 text-red-600 px-2 py-1 rounded text-sm font-mono" {...props} /> :
                    <code className="block bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono" {...props} />,
                table: ({node, ...props}) => (
                  <div className="overflow-x-auto my-6">
                    <table className="min-w-full border-collapse border border-gray-300" {...props} />
                  </div>
                ),
                thead: ({node, ...props}) => <thead className="bg-blue-600 text-white" {...props} />,
                th: ({node, ...props}) => <th className="border border-gray-300 px-4 py-2 text-left font-semibold" {...props} />,
                td: ({node, ...props}) => <td className="border border-gray-300 px-4 py-2" {...props} />,
                tr: ({node, ...props}) => <tr className="hover:bg-gray-50" {...props} />,
                a: ({node, ...props}) => <a className="text-blue-600 hover:text-blue-800 underline font-medium" {...props} />,
                hr: ({node, ...props}) => <hr className="my-8 border-t-2 border-gray-300" {...props} />,
              }}
            >
              {content}
            </ReactMarkdown>
          </article>

          {/* Footer CTA */}
          {examInfo && (
            <div className="mt-12 pt-8 border-t-2 border-gray-200">
              <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg p-8 text-white text-center">
                <h3 className="text-2xl font-bold mb-3">Ready to Start Your Preparation?</h3>
                <p className="text-blue-100 mb-6">Generate unlimited practice questions with AI-powered test creation</p>
                <button
                  onClick={startTestSetup}
                  className="px-8 py-4 bg-white text-blue-700 font-bold rounded-lg hover:bg-blue-50 active:bg-blue-100 transition duration-150 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Start Prep for {acronym} Now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Back to Top Button */}
      <div className="fixed bottom-8 right-8">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition transform hover:scale-110"
          title="Back to top"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ExamDetailPage;
