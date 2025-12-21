import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';
import { AuthProvider } from '../contexts/AuthContext';
import apiService from '../services/api';

vi.mock('../services/api', () => ({
  default: { login: vi.fn() },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const renderLogin = () =>
  render(
    <BrowserRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </BrowserRouter>
  );

describe('Login page', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('submits and redirects on success', async () => {
    const mockUser = {
      id: '1',
      email: 'student@test.com',
      name: 'Student',
      role: 'student' as const,
      approval_status: 'approved' as const,
      created_at: new Date().toISOString(),
    };
    vi.mocked(apiService.login).mockResolvedValue({ token: 't', user: mockUser });

    renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email address/i), 'student@test.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(apiService.login).toHaveBeenCalledWith({ email: 'student@test.com', password: 'password123' });
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows error on failure', async () => {
    vi.mocked(apiService.login).mockRejectedValue({ response: { data: { error: 'Invalid credentials' } } });

    renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email address/i), 'wrong@test.com');
    await user.type(screen.getByLabelText(/password/i), 'wrong');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('requires email and password fields', () => {
    renderLogin();

    expect(screen.getByLabelText(/email address/i)).toBeRequired();
    expect(screen.getByLabelText(/password/i)).toBeRequired();
  });
});
