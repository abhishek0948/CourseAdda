import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { UserRole } from '../types';
import {
  getCertificate,
  getMyCertificates,
} from '../controllers/certificate.controller';

const router = Router();

router.use(authenticate);
router.use(authorize(UserRole.STUDENT));

router.get('/:courseId', getCertificate);

router.get('/', getMyCertificates);

export default router;
