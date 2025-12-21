import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Register from '../pages/Register';
import { AuthProvider } from '../contexts/AuthContext';
import apiService from '../services/api';

vi.mock('../services/api', () => ({
  default: { register: vi.fn() },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const renderRegister = () =>
  render(
    <BrowserRouter>
      <AuthProvider>
        <Register />
      </AuthProvider>
    </BrowserRouter>
  );

describe('Register page', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('registers student and redirects to dashboard', async () => {
    const mockUser = {
      id: '1',
      email: 'student@test.com',
      name: 'Student',
      role: 'student' as const,
      approval_status: 'approved' as const,
      created_at: new Date().toISOString(),
    };
    vi.mocked(apiService.register).mockResolvedValue({ token: 't', user: mockUser });

    renderRegister();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/full name/i), 'Student User');
    await user.type(screen.getByLabelText(/email address/i), 'student@test.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(
      () => {
        expect(apiService.register).toHaveBeenCalledWith({
          email: 'student@test.com',
          password: 'password123',
          name: 'Student User',
          role: 'student',
        });
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      },
      { timeout: 4000 }
    );
  });

  it('registers mentor and shows pending message', async () => {
    const mockUser = {
      id: '2',
      email: 'mentor@test.com',
      name: 'Mentor',
      role: 'mentor' as const,
      approval_status: 'pending' as const,
      created_at: new Date().toISOString(),
    };
    vi.mocked(apiService.register).mockResolvedValue({ token: 't', user: mockUser });

    renderRegister();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/full name/i), 'Mentor User');
    await user.type(screen.getByLabelText(/email address/i), 'mentor@test.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.selectOptions(screen.getByLabelText(/i am a/i), 'mentor');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(
      () => {
        expect(screen.getByText(/pending admin approval/i)).toBeInTheDocument();
      },
      { timeout: 4000 }
    );
  });

  it('shows error on duplicate email', async () => {
    vi.mocked(apiService.register).mockRejectedValue({ response: { data: { error: 'Email already exists' } } });

    renderRegister();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/full name/i), 'Existing User');
    await user.type(screen.getByLabelText(/email address/i), 'existing@test.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
