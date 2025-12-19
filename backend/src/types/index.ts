export enum UserRole {
  STUDENT = 'student',
  MENTOR = 'mentor',
  ADMIN = 'admin',
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: UserRole;
  approval_status: ApprovalStatus;
  created_at: Date;
  updated_at: Date;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  mentor_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface Chapter {
  id: string;
  course_id: string;
  title: string;
  description: string;
  image_url?: string;
  video_url?: string;
  sequence_order: number;
  created_at: Date;
  updated_at: Date;
}

export interface CourseAssignment {
  id: string;
  course_id: string;
  student_id: string;
  assigned_at: Date;
}

export interface Progress {
  id: string;
  student_id: string;
  chapter_id: string;
  course_id: string;
  completed_at: Date;
}

export interface Certificate {
  id: string;
  student_id: string;
  course_id: string;
  issued_at: Date;
  certificate_url?: string;
}

export interface JWTPayload {
  userId: string;
  role: UserRole;
  email: string;
}
