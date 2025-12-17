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

export interface JWTPayload {
  userId: string;
  role: UserRole;
  email: string;
}
