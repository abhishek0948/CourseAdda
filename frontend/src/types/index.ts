export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'mentor' | 'admin';
  approval_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  created_by: string;
  created_at: string;
  mentor_name?: string;
}

export interface Chapter {
  id: string;
  course_id: string;
  title: string;
  description: string;
  sequence_number: number;
  image_url?: string;
  video_url?: string;
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

export interface Certificate {
  id: string;
  student_id: string;
  course_id: string;
  issued_at: string;
}

export interface StudentProgress {
  student_id: string;
  student_name: string;
  student_email: string;
  total_chapters: number;
  completed_chapters: number;
  completion_percentage: number;
  last_accessed_at: string | null;
}

export interface Analytics {
  total_students: number;
  total_mentors: number;
  total_courses: number;
  total_certificates: number;
  pending_mentor_approvals: number;
  average_course_completion: number;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string | null;
}

export interface ChapterWithStatus extends Chapter {
  is_completed: boolean;
  is_locked: boolean;
}
