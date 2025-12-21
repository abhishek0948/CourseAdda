import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { UserRole } from '../types';
import supabase from '../config/database';

export const authorize = (...allowedRoles: UserRole[]) => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized: User not authenticated' });
        return;
      }

      if (!allowedRoles.includes(req.user.role)) {
        res.status(403).json({ 
          error: 'Forbidden: Insufficient permissions',
          required: allowedRoles,
          current: req.user.role
        });
        return;
      }

      if (req.user.role === UserRole.MENTOR) {
        const { data: user, error } = await supabase
          .from('users')
          .select('approval_status')
          .eq('id', req.user.userId)
          .single();

        if (error || !user || user.approval_status !== 'approved') {
          res.status(403).json({ 
            error: 'Forbidden: Mentor account not approved' 
          });
          return;
        }
      }

      next();
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};
