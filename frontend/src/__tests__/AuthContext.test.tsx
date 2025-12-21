import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

vi.mock('../services/api', () => ({
  default: {
    login: vi.fn(),
    register: vi.fn(),
  },
}));

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('restores user from localStorage', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test',
      role: 'student' as const,
      approval_status: 'approved' as const,
      created_at: new Date().toISOString(),
    };
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('token', 'token-123');

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  it('logs in and stores user', async () => {
    const mockUser = {
      id: '2',
      email: 'student@test.com',
      name: 'Student',
      role: 'student' as const,
      approval_status: 'approved' as const,
      created_at: new Date().toISOString(),
    };
    vi.mocked(apiService.login).mockResolvedValue({ token: 'abc', user: mockUser });

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(async () => {
      await result.current.login('student@test.com', 'pass');
    });

    expect(apiService.login).toHaveBeenCalledWith({ email: 'student@test.com', password: 'pass' });
    expect(result.current.user).toEqual(mockUser);
    expect(localStorage.getItem('token')).toBe('abc');
  });

  it('logs out and clears storage', async () => {
    const mockUser = { id: '1', email: 'a', name: 'b', role: 'student' as const, approval_status: 'approved' as const, created_at: '' };
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('token', 'token');

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));

    act(() => result.current.logout());

    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('throws when used outside provider', () => {
    expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used within an AuthProvider');
  });
});
