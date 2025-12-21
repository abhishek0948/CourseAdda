import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { UserRole } from '../types';
import {
  getCertificate,
  getMyCertificates,
} from '../controllers/certificate.controller';

const router = Router();

// All routes require authentication and student role
router.use(authenticate);
router.use(authorize(UserRole.STUDENT));

/**
 * @route   GET /api/certificates/:courseId
 * @desc    Download certificate for a completed course
 * @access  Student only (100% completion required)
 */
router.get('/:courseId', getCertificate);

/**
 * @route   GET /api/certificates
 * @desc    Get all certificates earned by the student
 * @access  Student only
 */
router.get('/', getMyCertificates);

export default router;
