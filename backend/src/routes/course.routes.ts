import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { UserRole } from '../types';
import {
  getStudents,
  createCourse,
  getMyCourses,
  updateCourse,
  deleteCourse,
  addChapter,
  getChapters,
  assignCourse,
  getStudentProgress,
} from '../controllers/course.controller';

const router = Router();

router.use(authenticate);
router.use(authorize(UserRole.MENTOR, UserRole.ADMIN));

router.get('/students', getStudents);

router.post('/', createCourse);

router.get('/my', getMyCourses);

router.put('/:id', updateCourse);

router.delete('/:id', deleteCourse);

router.post('/:id/chapters', addChapter);

router.get('/:id/chapters', getChapters);

router.post('/:id/assign', assignCourse);

router.get('/:id/progress', getStudentProgress);

export default router;
