import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

const mockUseAuth = vi.fn();

vi.mock('../contexts/AuthContext', async () => {
  const actual = await vi.importActual('../contexts/AuthContext');
  return { ...actual, useAuth: () => mockUseAuth() };
});

const TestPage = () => <div>Protected</div>;
const LoginPage = () => <div>Login</div>;
const DashboardPage = () => <div>Dashboard</div>;

const renderWithRouter = (ui: React.ReactElement, initialPath = '/protected') =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/protected" element={ui} />
      </Routes>
    </MemoryRouter>
  );

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects unauthenticated users to login', () => {
    mockUseAuth.mockReturnValue({ user: null, isAuthenticated: false, isLoading: false });

    renderWithRouter(
      <ProtectedRoute>
        <TestPage />
      </ProtectedRoute>
    );

    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('shows spinner while loading', () => {
    mockUseAuth.mockReturnValue({ user: null, isAuthenticated: false, isLoading: true });

    renderWithRouter(
      <ProtectedRoute>
        <TestPage />
      </ProtectedRoute>
    );

    expect(screen.queryByText('Protected')).not.toBeInTheDocument();
  });

  it('allows access for allowed role', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', email: 's', name: 's', role: 'student', approval_status: 'approved', created_at: '' },
      isAuthenticated: true,
      isLoading: false,
    });

    renderWithRouter(
      <ProtectedRoute allowedRoles={['student']}>
        <TestPage />
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected')).toBeInTheDocument();
  });

  it('redirects when role not allowed', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '2', email: 'm', name: 'm', role: 'mentor', approval_status: 'approved', created_at: '' },
      isAuthenticated: true,
      isLoading: false,
    });

    renderWithRouter(
      <ProtectedRoute allowedRoles={['student']}>
        <TestPage />
      </ProtectedRoute>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
