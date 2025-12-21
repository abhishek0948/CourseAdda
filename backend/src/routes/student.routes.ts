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

// All routes require authentication and student role
router.use(authenticate);
router.use(authorize(UserRole.STUDENT));

/**
 * @route   GET /api/student/courses
 * @desc    Get all courses assigned to the student
 * @access  Student only
 */
router.get('/courses', getMyCourses);

/**
 * @route   GET /api/student/courses/:courseId/chapters
 * @desc    Get all chapters of an assigned course
 * @access  Student only
 */
router.get('/courses/:courseId/chapters', getCourseChapters);

/**
 * @route   POST /api/student/chapters/:chapterId/complete
 * @desc    Mark a chapter as completed (sequential)
 * @access  Student only
 */
router.post('/chapters/:chapterId/complete', completeChapter);

/**
 * @route   POST /api/student/progress
 * @desc    Mark chapter progress (with courseId and chapterId in body)
 * @access  Student only
 */
router.post('/progress', markProgress);

/**
 * @route   GET /api/student/progress
 * @desc    Get overall progress across all courses
 * @access  Student only
 */
router.get('/progress', getMyProgress);

/**
 * @route   GET /api/student/courses/:id/progress
 * @desc    Get progress for a specific course
 * @access  Student only
 */
router.get('/courses/:id/progress', getCourseProgress);

export default router;
