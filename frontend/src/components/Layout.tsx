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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
              <GraduationCap className="h-8 w-8 text-primary-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Internship LMS</h1>
                {user && (
                  <p className="text-xs text-gray-600 capitalize">
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
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
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
            <nav className="flex gap-4 border-t border-gray-200 py-2">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    window.location.pathname === item.path
                      ? 'bg-primary-100 text-primary-700'
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
