// New App.jsx - With Authentication and Role-Based Routing
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import './App.css';

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{padding: '20px'}}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

// Main App Component with Routing
function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={user ? <Navigate to={user.role === 'super_admin' ? '/admin/dashboard' : '/staff/dashboard'} replace /> : <Login />} 
      />

      {/* Super Admin Routes */}
      <Route 
        path="/admin/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />

      {/* Staff Routes */}
      <Route 
        path="/staff/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['staff']}>
            <StaffDashboard />
          </ProtectedRoute>
        } 
      />

      {/* Unauthorized Page */}
      <Route 
        path="/unauthorized" 
        element={
          <div style={{padding: '40px', textAlign: 'center'}}>
            <h1>Access Denied</h1>
            <p>You don't have permission to access this page.</p>
            <button onClick={() => window.history.back()}>Go Back</button>
          </div>
        } 
      />

      {/* Default Redirect */}
      <Route 
        path="/" 
        element={
          user 
            ? <Navigate to={user.role === 'super_admin' ? '/admin/dashboard' : '/staff/dashboard'} replace />
            : <Navigate to="/login" replace />
        } 
      />

      {/* 404 */}
      <Route 
        path="*" 
        element={
          <div style={{padding: '40px', textAlign: 'center'}}>
            <h1>404 - Page Not Found</h1>
            <button onClick={() => window.location.href = '/'}>Go Home</button>
          </div>
        } 
      />
    </Routes>
  );
}

// Main App with Auth Provider
export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

