import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap, LogOut, LayoutDashboard, BookOpen, Users, BarChart3 } from 'lucide-react';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    if (!user) return [];

    switch (user.role) {
      case 'student':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        ];
      case 'mentor':
        return [
          { icon: BookOpen, label: 'My Courses', path: '/dashboard' },
        ];
      case 'admin':
        return [
          { icon: BarChart3, label: 'Dashboard', path: '/dashboard' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-lg sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-5">
            <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate('/dashboard')}>
              <div className="bg-gradient-to-br from-primary-500 to-purple-600 p-2.5 rounded-xl shadow-md group-hover:shadow-lg transition-all">
                <GraduationCap className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-gray-900 tracking-tight">CourseAdda</h1>
                {user && (
                  <p className="text-xs text-gray-600 capitalize font-semibold">
                    {user.role} Portal
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {user && (
                <>
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-600">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Navigation */}
          {navItems.length > 0 && (
            <nav className="flex gap-3 border-t border-gray-200 py-3">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all transform hover:scale-105 ${
                    window.location.pathname === item.path
                      ? 'bg-gradient-to-r from-primary-500 to-purple-500 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-600">
            © {new Date().getFullYear()} Internship LMS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
