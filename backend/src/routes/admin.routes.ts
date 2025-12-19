import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { UserRole } from '../types';
import {
  getAllUsers,
  approveMentor,
  deleteUser,
  getAnalytics,
} from '../controllers/admin.controller';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize(UserRole.ADMIN));

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Admin only
 */
router.get('/', getAllUsers);

/**
 * @route   PUT /api/users/:id/approve-mentor
 * @desc    Approve or reject mentor account
 * @access  Admin only
 */
router.put('/:id/approve-mentor', approveMentor);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete a user
 * @access  Admin only
 */
router.delete('/:id', deleteUser);

/**
 * @route   GET /api/users/analytics
 * @desc    Get platform-wide analytics
 * @access  Admin only
 */
router.get('/analytics', getAnalytics);

export default router;
