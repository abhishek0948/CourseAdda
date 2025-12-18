export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'mentor' | 'admin';
  approval_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface Progress {
  course_id: string;
  course_title: string;
  total_chapters: number;
  completed_chapters: number;
  completion_percentage: number;
  last_accessed_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  created_by: string;
  created_at: string;
  mentor_name?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string | null;
}
