import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TestCatalogGrid from './pages/TestCatalogGrid';
import ExamDetailPage from './pages/ExamDetailPage';
import TestSetup from './pages/TestSetup';
import TestScreen from './pages/TestScreen';
import TestResults from './pages/TestResults';
import ResultsScreen from './pages/ResultsScreen';
import LatEssayGrader from './pages/LatEssayGrader';
import AICounselor from './pages/AICounselor';
import WhatsAppIntegration from './pages/WhatsAppIntegration';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import AdminDashboard from './pages/AdminDashboard';
import InstructorDashboard from './pages/InstructorDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Protected Routes - All authenticated users */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tests/catalog" element={<TestCatalogGrid />} />
            <Route path="/exam/:acronym" element={<ExamDetailPage />} />
            <Route path="/test-setup" element={<TestSetup />} />
            <Route path="/test/setup" element={<TestSetup />} />
            <Route path="/test/active" element={<TestScreen />} />
            <Route path="/test/results/:sessionId" element={<TestResults />} />
            <Route path="/results/:sessionId" element={<ResultsScreen />} />
            <Route path="/lat-grader" element={<LatEssayGrader />} />
            <Route path="/ai-counselor" element={<AICounselor />} />
            <Route path="/whatsapp" element={<WhatsAppIntegration />} />
            <Route path="/dashboard/analytics" element={<AnalyticsDashboard />} />
          </Route>

          {/* Admin-Only Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* Instructor & Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['INSTRUCTOR', 'ADMIN']} />}>
            <Route path="/instructor" element={<InstructorDashboard />} />
          </Route>

          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
