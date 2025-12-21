import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import supabase from '../config/database';

export const getMyCourses = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const studentId = req.user?.userId;

    // Get assigned courses with progress
    const { data: assignments, error } = await supabase
      .from('course_assignments')
      .select(`
        course_id,
        assigned_at,
        courses (
          id,
          title,
          description,
          created_at,
          users!courses_mentor_id_fkey (
            id,
            name,
            email
          )
        )
      `)
      .eq('student_id', studentId);

    if (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Failed to fetch courses' });
      return;
    }

    // Calculate progress for each course
    const coursesWithProgress = await Promise.all(
      (assignments || []).map(async (assignment: any) => {
        const courseId = assignment.courses?.id;

        // Get total chapters
        const { count: totalChapters } = await supabase
          .from('chapters')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', courseId);

        // Get completed chapters
        const { count: completedChapters } = await supabase
          .from('progress')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', courseId)
          .eq('student_id', studentId);

        const percentage = totalChapters 
          ? Math.round(((completedChapters || 0) / totalChapters) * 100)
          : 0;

        return {
          ...assignment.courses,
          mentor: assignment.courses.users,
          progress: {
            completedChapters: completedChapters || 0,
            totalChapters: totalChapters || 0,
            percentage,
          },
          assignedAt: assignment.assigned_at,
        };
      })
    );

    res.status(200).json({ courses: coursesWithProgress });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCourseChapters = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { courseId } = req.params;
    const studentId = req.user?.userId;

    // Verify student is assigned to this course
    const { data: assignment, error: assignmentError } = await supabase
      .from('course_assignments')
      .select('*')
      .eq('course_id', courseId)
      .eq('student_id', studentId)
      .single();

    if (assignmentError || !assignment) {
      res.status(403).json({ error: 'Forbidden: Course not assigned to you' });
      return;
    }

    // Get all chapters
    const { data: chapters, error: chaptersError } = await supabase
      .from('chapters')
      .select('*')
      .eq('course_id', courseId)
      .order('sequence_order', { ascending: true });

    if (chaptersError) {
      console.error('Database error:', chaptersError);
      res.status(500).json({ error: 'Failed to fetch chapters' });
      return;
    }

    // Get student's completed chapters
    const { data: completedProgress } = await supabase
      .from('progress')
      .select('chapter_id, completed_at')
      .eq('course_id', courseId)
      .eq('student_id', studentId);

    const completedChapterIds = new Set(
      completedProgress?.map(p => p.chapter_id) || []
    );

    // Get course title
    const { data: course } = await supabase
      .from('courses')
      .select('title')
      .eq('id', courseId)
      .single();

    // Add completion status and accessibility to each chapter
    const chaptersWithStatus = chapters?.map((chapter, index) => {
      const isCompleted = completedChapterIds.has(chapter.id);
      const previousChapterCompleted = index === 0 || 
        completedChapterIds.has(chapters[index - 1].id);
      const isAccessible = index === 0 || previousChapterCompleted;

      return {
        ...chapter,
        sequence_number: chapter.sequence_order, // Map to frontend field name
        is_completed: isCompleted,
        is_locked: !isAccessible,
        completed_at: completedProgress?.find(p => p.chapter_id === chapter.id)?.completed_at,
      };
    });

    res.status(200).json({ 
      chapters: chaptersWithStatus,
      course_title: course?.title || 'Unknown Course'
    });
  } catch (error) {
    console.error('Get chapters error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const completeChapter = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { chapterId } = req.params;
    const studentId = req.user?.userId;

    // Get chapter details
    const { data: chapter, error: chapterError } = await supabase
      .from('chapters')
      .select('id, course_id, sequence_order')
      .eq('id', chapterId)
      .single();

    if (chapterError || !chapter) {
      res.status(404).json({ error: 'Chapter not found' });
      return;
    }

    // Verify student is assigned to this course
    const { data: assignment, error: assignmentError } = await supabase
      .from('course_assignments')
      .select('*')
      .eq('course_id', chapter.course_id)
      .eq('student_id', studentId)
      .single();

    if (assignmentError || !assignment) {
      res.status(403).json({ error: 'Forbidden: Course not assigned to you' });
      return;
    }

    // Check if chapter is already completed
    const { data: existingProgress } = await supabase
      .from('progress')
      .select('*')
      .eq('chapter_id', chapterId)
      .eq('student_id', studentId)
      .single();

    if (existingProgress) {
      res.status(400).json({ error: 'Chapter already completed' });
      return;
    }

    // Enforce sequential completion
    if (chapter.sequence_order > 1) {
      // Get previous chapter
      const { data: previousChapter } = await supabase
        .from('chapters')
        .select('id')
        .eq('course_id', chapter.course_id)
        .eq('sequence_order', chapter.sequence_order - 1)
        .single();

      if (previousChapter) {
        // Check if previous chapter is completed
        const { data: previousProgress } = await supabase
          .from('progress')
          .select('*')
          .eq('chapter_id', previousChapter.id)
          .eq('student_id', studentId)
          .single();

        if (!previousProgress) {
          res.status(400).json({ 
            error: 'Cannot complete chapter: Previous chapter not completed',
            sequenceOrder: chapter.sequence_order,
          });
          return;
        }
      }
    }

    // Mark chapter as completed
    const { data: progress, error: progressError } = await supabase
      .from('progress')
      .insert({
        student_id: studentId,
        chapter_id: chapterId,
        course_id: chapter.course_id,
      })
      .select()
      .single();

    if (progressError) {
      console.error('Database error:', progressError);
      res.status(500).json({ error: 'Failed to mark chapter as completed' });
      return;
    }

    // Check if course is fully completed
    const { count: totalChapters } = await supabase
      .from('chapters')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', chapter.course_id);

    const { count: completedChapters } = await supabase
      .from('progress')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', chapter.course_id)
      .eq('student_id', studentId);

    const isFullyCompleted = totalChapters === completedChapters;

    // If fully completed, generate certificate
    if (isFullyCompleted) {
      const { data: existingCert } = await supabase
        .from('certificates')
        .select('*')
        .eq('student_id', studentId)
        .eq('course_id', chapter.course_id)
        .single();

      if (!existingCert) {
        await supabase
          .from('certificates')
          .insert({
            student_id: studentId,
            course_id: chapter.course_id,
          });
      }
    }

    res.status(200).json({
      message: 'Chapter completed successfully',
      progress,
      courseCompleted: isFullyCompleted,
      completionPercentage: Math.round(((completedChapters || 0) / (totalChapters || 1)) * 100),
    });
  } catch (error) {
    console.error('Complete chapter error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const markProgress = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { courseId, chapterId } = req.body;
    const studentId = req.user?.userId;

    // Validate required fields
    if (!courseId || !chapterId) {
      res.status(400).json({ error: 'courseId and chapterId are required' });
      return;
    }

    // Get chapter details
    const { data: chapter, error: chapterError } = await supabase
      .from('chapters')
      .select('id, course_id, sequence_order')
      .eq('id', chapterId)
      .eq('course_id', courseId)
      .single();

    if (chapterError || !chapter) {
      res.status(404).json({ error: 'Chapter not found' });
      return;
    }

    // Verify student is assigned to this course
    const { data: assignment, error: assignmentError } = await supabase
      .from('course_assignments')
      .select('*')
      .eq('course_id', courseId)
      .eq('student_id', studentId)
      .single();

    if (assignmentError || !assignment) {
      res.status(403).json({ error: 'Forbidden: Course not assigned to you' });
      return;
    }

    // Check if chapter is already completed
    const { data: existingProgress } = await supabase
      .from('progress')
      .select('*')
      .eq('chapter_id', chapterId)
      .eq('student_id', studentId)
      .single();

    if (existingProgress) {
      res.status(409).json({ 
        message: 'Chapter already completed',
        progress: existingProgress 
      });
      return;
    }

    // Mark chapter as completed
    const { data: progress, error: progressError } = await supabase
      .from('progress')
      .insert({
        student_id: studentId,
        chapter_id: chapterId,
        course_id: courseId,
      })
      .select()
      .single();

    if (progressError) {
      console.error('Database error:', progressError);
      res.status(500).json({ error: 'Failed to update progress' });
      return;
    }

    res.status(200).json({
      message: 'Progress updated successfully',
      progress,
    });
  } catch (error) {
    console.error('Mark progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCourseProgress = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id: courseId } = req.params;
    const studentId = req.user?.userId;

    // Verify student is assigned to this course
    const { data: assignment, error: assignmentError } = await supabase
      .from('course_assignments')
      .select('*')
      .eq('course_id', courseId)
      .eq('student_id', studentId)
      .single();

    if (assignmentError || !assignment) {
      res.status(403).json({ error: 'Forbidden: Course not assigned to you' });
      return;
    }

    // Get total chapters
    const { count: totalChapters } = await supabase
      .from('chapters')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId);

    // Get completed chapters
    const { data: completedChapters, count: completedCount } = await supabase
      .from('progress')
      .select('chapter_id, completed_at', { count: 'exact' })
      .eq('course_id', courseId)
      .eq('student_id', studentId);

    const percentage = totalChapters 
      ? Math.round(((completedCount || 0) / totalChapters) * 100)
      : 0;

    res.status(200).json({ 
      progress: {
        completedChapters: completedCount || 0,
        totalChapters: totalChapters || 0,
        percentage,
        chapters: completedChapters || [],
      }
    });
  } catch (error) {
    console.error('Get course progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMyProgress = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const studentId = req.user?.userId;

    // Get all assigned courses
    const { data: assignments } = await supabase
      .from('course_assignments')
      .select(`
        course_id,
        courses (
          id,
          title
        )
      `)
      .eq('student_id', studentId);

    // Get progress for each course
    const progressData = await Promise.all(
      (assignments || []).map(async (assignment: any) => {
        const courseId = assignment.courses.id;

        // Get total chapters
        const { count: totalChapters } = await supabase
          .from('chapters')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', courseId);

        // Get completed chapters with details
        const { data: completedChapters } = await supabase
          .from('progress')
          .select(`
            chapter_id,
            completed_at,
            chapters (
              title,
              sequence_order
            )
          `)
          .eq('course_id', courseId)
          .eq('student_id', studentId)
          .order('completed_at', { ascending: false });

        const percentage = totalChapters 
          ? Math.round(((completedChapters?.length || 0) / totalChapters) * 100)
          : 0;

        return {
          course: assignment.courses,
          totalChapters: totalChapters || 0,
          completedChapters: completedChapters || [],
          completedCount: completedChapters?.length || 0,
          percentage,
        };
      })
    );

    res.status(200).json({ progress: progressData });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
