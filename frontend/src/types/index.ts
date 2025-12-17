export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'mentor' | 'admin';
  approval_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string | null;
}
