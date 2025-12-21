import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import supabase from '../config/database';
import { ApprovalStatus } from '../types';

export const getAllUsers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, name, role, approval_status, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
      return;
    }

    res.status(200).json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const approveMentor = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { approve } = req.body; // true for approve, false for reject

    if (typeof approve !== 'boolean') {
      res.status(400).json({ error: 'Approve field must be a boolean' });
      return;
    }

    // Check if user exists and is a mentor
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('role, approval_status')
      .eq('id', id)
      .single();

    if (fetchError || !user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.role !== 'mentor') {
      res.status(400).json({ error: 'User is not a mentor' });
      return;
    }

    // Update approval status
    const newStatus = approve ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED;

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ 
        approval_status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('id, email, name, role, approval_status')
      .single();

    if (updateError) {
      console.error('Database error:', updateError);
      res.status(500).json({ error: 'Failed to update mentor status' });
      return;
    }

    res.status(200).json({
      message: `Mentor ${approve ? 'approved' : 'rejected'} successfully`,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Approve mentor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === req.user?.userId) {
      res.status(400).json({ error: 'Cannot delete your own account' });
      return;
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Failed to delete user' });
      return;
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAnalytics = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Get user counts by role
    const { data: users } = await supabase
      .from('users')
      .select('role, approval_status');

    // Get course count
    const { count: courseCount } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true });

    // Get completion count (certificates issued)
    const { count: completionCount } = await supabase
      .from('certificates')
      .select('*', { count: 'exact', head: true });

    // Calculate user statistics
    const userStats = {
      total: users?.length || 0,
      students: users?.filter(u => u.role === 'student').length || 0,
      mentors: users?.filter(u => u.role === 'mentor' && u.approval_status === 'approved').length || 0,
      pendingMentors: users?.filter(u => u.role === 'mentor' && u.approval_status === 'pending').length || 0,
      admins: users?.filter(u => u.role === 'admin').length || 0,
    };

    res.status(200).json({
      analytics: {
        users: userStats,
        courses: courseCount || 0,
        completions: completionCount || 0,
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
