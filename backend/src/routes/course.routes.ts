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

// All routes require authentication and mentor role
router.use(authenticate);
router.use(authorize(UserRole.MENTOR, UserRole.ADMIN));

/**
 * @route   GET /api/courses/students
 * @desc    Get all students for course assignment
 * @access  Mentor only
 */
router.get('/students', getStudents);

/**
 * @route   POST /api/courses
 * @desc    Create a new course
 * @access  Mentor only
 */
router.post('/', createCourse);

/**
 * @route   GET /api/courses/my
 * @desc    Get all courses created by the mentor
 * @access  Mentor only
 */
router.get('/my', getMyCourses);

/**
 * @route   PUT /api/courses/:id
 * @desc    Update a course
 * @access  Mentor only (course owner)
 */
router.put('/:id', updateCourse);

/**
 * @route   DELETE /api/courses/:id
 * @desc    Delete a course
 * @access  Mentor only (course owner)
 */
router.delete('/:id', deleteCourse);

/**
 * @route   POST /api/courses/:id/chapters
 * @desc    Add a chapter to a course
 * @access  Mentor only (course owner)
 */
router.post('/:id/chapters', addChapter);

/**
 * @route   GET /api/courses/:id/chapters
 * @desc    Get all chapters of a course
 * @access  Mentor only (course owner)
 */
router.get('/:id/chapters', getChapters);

/**
 * @route   POST /api/courses/:id/assign
 * @desc    Assign course to students
 * @access  Mentor only (course owner)
 */
router.post('/:id/assign', assignCourse);

/**
 * @route   GET /api/courses/:id/progress
 * @desc    Get progress of all students in a course
 * @access  Mentor only (course owner)
 */
router.get('/:id/progress', getStudentProgress);

export default router;
