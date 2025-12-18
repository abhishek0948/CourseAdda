import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { UserRole } from '../types';
import {
  getStudents,
  createCourse,
  deleteCourse,
} from '../controllers/course.controller';

const router = Router();

router.use(authenticate);
router.use(authorize(UserRole.MENTOR, UserRole.ADMIN));

router.get('/students', getStudents);


router.post('/', createCourse);
router.delete('/:id', deleteCourse);

export default router;
