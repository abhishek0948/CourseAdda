import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import CourseViewer from './pages/CourseViewer';
import CertificatePage from './pages/CertificatePage';
import MentorDashboard from './pages/MentorDashboard';
import CourseManagement from './pages/CourseManagement';
import StudentAssignment from './pages/StudentAssignment';
import AdminDashboard from './pages/AdminDashboard';

const DashboardRouter: React.FC = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'student':
      return <StudentDashboard />;
    case 'mentor':
      return <MentorDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardRouter />} />

            <Route
              path="/student/courses/:courseId"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <CourseViewer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/certificate/:courseId"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <CertificatePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/mentor/courses/:courseId"
              element={
                <ProtectedRoute allowedRoles={['mentor']}>
                  <CourseManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentor/courses/:courseId/students"
              element={
                <ProtectedRoute allowedRoles={['mentor']}>
                  <StudentAssignment />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
