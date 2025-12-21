import { Request, Response } from 'express';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import supabase from '../config/database';
import { UserRole, ApprovalStatus } from '../types';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: 'Email, password, and name are required' });
      return;
    }

    const userRole = role || UserRole.STUDENT;
    
    if (!Object.values(UserRole).includes(userRole)) {
      res.status(400).json({ error: 'Invalid role' });
      return;
    }

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      res.status(409).json({ error: 'User already exists' });
      return;
    }

    const passwordHash = await hashPassword(password);

    const approvalStatus = userRole === UserRole.STUDENT 
      ? ApprovalStatus.APPROVED 
      : ApprovalStatus.PENDING;

    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        name,
        role: userRole,
        approval_status: approvalStatus,
      })
      .select('id, email, name, role, approval_status, created_at')
      .single();

    if (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Failed to create user' });
      return;
    }

    let token = null;
    if (approvalStatus === ApprovalStatus.APPROVED) {
      token = generateToken({
        userId: user.id,
        role: user.role,
        email: user.email,
      });
    }

    res.status(201).json({
      message: userRole === UserRole.MENTOR 
        ? 'Mentor registration successful. Awaiting admin approval.' 
        : 'Registration successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        approval_status: user.approval_status,
      },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    if (user.role === UserRole.MENTOR && user.approval_status !== ApprovalStatus.APPROVED) {
      res.status(403).json({ 
        error: 'Account pending approval',
        status: user.approval_status 
      });
      return;
    }

    const token = generateToken({
      userId: user.id,
      role: user.role,
      email: user.email,
    });

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        approval_status: user.approval_status,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
