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

router.use(authenticate);
router.use(authorize(UserRole.ADMIN));

router.get('/', getAllUsers);

router.put('/:id/approve-mentor', approveMentor);

router.delete('/:id', deleteUser);

router.get('/analytics', getAnalytics);

export default router;
