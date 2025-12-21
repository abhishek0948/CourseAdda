import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { UserRole } from '../types';
import {
  getMyCourses,
  getCourseChapters,
  completeChapter,
  getMyProgress,
  markProgress,
  getCourseProgress,
} from '../controllers/student.controller';

const router = Router();

router.use(authenticate);
router.use(authorize(UserRole.STUDENT));

router.get('/courses', getMyCourses);

router.get('/courses/:courseId/chapters', getCourseChapters);

router.post('/chapters/:chapterId/complete', completeChapter);

router.post('/progress', markProgress);

router.get('/progress', getMyProgress);

router.get('/courses/:id/progress', getCourseProgress);

export default router;
