import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 * Optionally checks if user has required role
 * 
 * @param {Array<string>} allowedRoles - Optional array of roles that can access this route
 */
const ProtectedRoute = ({ allowedRoles = null }) => {
  const { isAuthenticated, loading, user } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access if allowedRoles is specified
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role || 'STUDENT';
    
    if (!allowedRoles.includes(userRole)) {
      // User doesn't have required role - redirect to unauthorized page or dashboard
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100">
          <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-6">
              You don't have permission to access this page. 
              Required role: <span className="font-semibold">{allowedRoles.join(' or ')}</span>
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Your current role: <span className="font-semibold">{userRole}</span>
            </p>
            <button
              onClick={() => window.history.back()}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
  }

  // Render protected content
  return <Outlet />;
};

export default ProtectedRoute;
