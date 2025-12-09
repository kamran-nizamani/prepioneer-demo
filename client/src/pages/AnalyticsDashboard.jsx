import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AnalyticsDashboard = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        'http://localhost:5000/api/tests/history',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Filter only completed sessions and sort by date
      const completedSessions = response.data.sessions
        .filter(s => s.status === 'COMPLETED')
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      
      setSessions(completedSessions);
      setError('');
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError(err.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
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

  if (sessions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-indigo-600 hover:text-indigo-800 font-medium mb-4 inline-flex items-center"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Test Data Yet</h2>
            <p className="text-gray-600 mb-6">
              Complete some tests to see your performance analytics and insights.
            </p>
            <button
              onClick={() => navigate('/test-setup')}
              className="bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              Take Your First Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate summary statistics
  const totalTests = sessions.length;
  const averageScore = sessions.reduce((sum, s) => sum + (s.scorePercentage || 0), 0) / totalTests;
  const mostRecentScore = sessions[sessions.length - 1]?.scorePercentage || 0;
  const highestScore = Math.max(...sessions.map(s => s.scorePercentage || 0));
  const lowestScore = Math.min(...sessions.map(s => s.scorePercentage || 0));

  // Prepare data for Score Trend Chart (last 15 tests)
  const recentSessions = sessions.slice(-15);
  const scoreTrendData = {
    labels: recentSessions.map((s, idx) => `Test ${idx + 1}`),
    datasets: [
      {
        label: 'Score (%)',
        data: recentSessions.map(s => s.scorePercentage?.toFixed(1) || 0),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7
      }
    ]
  };

  const scoreTrendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Score Trend (Last 15 Tests)',
        font: { size: 16, weight: 'bold' }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value) => value + '%'
        }
      }
    }
  };

  // Prepare data for Topics Performance Chart
  const topicPerformance = {};
  sessions.forEach(session => {
    const topic = session.topic || 'General';
    if (!topicPerformance[topic]) {
      topicPerformance[topic] = { scores: [], count: 0 };
    }
    topicPerformance[topic].scores.push(session.scorePercentage || 0);
    topicPerformance[topic].count++;
  });

  const topicAverages = Object.keys(topicPerformance).map(topic => ({
    topic,
    average: topicPerformance[topic].scores.reduce((a, b) => a + b, 0) / topicPerformance[topic].count,
    count: topicPerformance[topic].count
  })).sort((a, b) => a.average - b.average); // Sort by performance (worst to best)

  const topicsBarData = {
    labels: topicAverages.map(t => t.topic),
    datasets: [
      {
        label: 'Average Score (%)',
        data: topicAverages.map(t => t.average.toFixed(1)),
        backgroundColor: topicAverages.map(t => 
          t.average >= 80 ? 'rgba(34, 197, 94, 0.7)' :
          t.average >= 60 ? 'rgba(234, 179, 8, 0.7)' :
          'rgba(239, 68, 68, 0.7)'
        ),
        borderColor: topicAverages.map(t => 
          t.average >= 80 ? 'rgb(34, 197, 94)' :
          t.average >= 60 ? 'rgb(234, 179, 8)' :
          'rgb(239, 68, 68)'
        ),
        borderWidth: 2
      }
    ]
  };

  const topicsBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Performance by Topic',
        font: { size: 16, weight: 'bold' }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value) => value + '%'
        }
      }
    }
  };

  // Performance distribution (Doughnut)
  const excellent = sessions.filter(s => s.scorePercentage >= 80).length;
  const good = sessions.filter(s => s.scorePercentage >= 60 && s.scorePercentage < 80).length;
  const needsImprovement = sessions.filter(s => s.scorePercentage < 60).length;

  const distributionData = {
    labels: ['Excellent (80%+)', 'Good (60-79%)', 'Needs Work (<60%)'],
    datasets: [
      {
        data: [excellent, good, needsImprovement],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(234, 179, 8)',
          'rgb(239, 68, 68)'
        ],
        borderWidth: 2
      }
    ]
  };

  const distributionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      },
      title: {
        display: true,
        text: 'Score Distribution',
        font: { size: 16, weight: 'bold' }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-indigo-600 hover:text-indigo-800 font-medium mb-4 inline-flex items-center"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Track your progress and identify areas for improvement</p>
        </div>

        {/* Summary Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-indigo-600 text-3xl mb-2">📚</div>
            <div className="text-3xl font-bold text-gray-800">{totalTests}</div>
            <div className="text-gray-600 text-sm">Total Tests</div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-blue-600 text-3xl mb-2">📊</div>
            <div className="text-3xl font-bold text-gray-800">{averageScore.toFixed(1)}%</div>
            <div className="text-gray-600 text-sm">Average Score</div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-green-600 text-3xl mb-2">🎯</div>
            <div className="text-3xl font-bold text-gray-800">{highestScore.toFixed(1)}%</div>
            <div className="text-gray-600 text-sm">Highest Score</div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-purple-600 text-3xl mb-2">📈</div>
            <div className="text-3xl font-bold text-gray-800">{mostRecentScore.toFixed(1)}%</div>
            <div className="text-gray-600 text-sm">Most Recent</div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Score Trend Chart */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
            <div style={{ height: '300px' }}>
              <Line data={scoreTrendData} options={scoreTrendOptions} />
            </div>
          </div>

          {/* Score Distribution */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div style={{ height: '300px' }}>
              <Doughnut data={distributionData} options={distributionOptions} />
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 mb-6">
          {/* Topics Performance Bar Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div style={{ height: '350px' }}>
              <Bar data={topicsBarData} options={topicsBarOptions} />
            </div>
          </div>
        </div>

        {/* Recent Tests Table */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Test History</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Test Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Topic</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Score</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.slice(-10).reverse().map((session) => (
                  <tr key={session.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(session.startTime).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                      {session.testName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {session.topic}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`font-bold ${
                        session.scorePercentage >= 80 ? 'text-green-600' :
                        session.scorePercentage >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {session.scorePercentage?.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => navigate(`/results/${session.id}`)}
                        className="text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        View Details →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={() => navigate('/test-setup')}
            className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition font-medium"
          >
            Take New Test
          </button>
          <button
            onClick={() => navigate('/lat-grader')}
            className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition font-medium"
          >
            Grade LAT Essay
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
