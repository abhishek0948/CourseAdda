import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import supabase from '../config/database';

export const getStudents = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { data: students, error } = await supabase
      .from('users')
      .select('id, email, name, role, created_at')
      .eq('role', 'student')
      .eq('approval_status', 'approved')
      .order('name', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Failed to fetch students' });
      return;
    }

    res.status(200).json({ users: students });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createCourse = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, description } = req.body;
    const mentorId = req.user?.userId;

    if (!title || !description) {
      res.status(400).json({ error: 'Title and description are required' });
      return;
    }

    const { data: course, error } = await supabase
      .from('courses')
      .insert({
        title,
        description,
        mentor_id: mentorId,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Failed to create course' });
      return;
    }

    res.status(201).json({
      message: 'Course created successfully',
      course,
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMyCourses = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const mentorId = req.user?.userId;

    const { data: courses, error } = await supabase
      .from('courses')
      .select(`
        *,
        chapters:chapters(count)
      `)
      .eq('mentor_id', mentorId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Failed to fetch courses' });
      return;
    }

    res.status(200).json({ courses });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCourse = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const mentorId = req.user?.userId;

    const { data: course, error: fetchError } = await supabase
      .from('courses')
      .select('mentor_id')
      .eq('id', id)
      .single();

    if (fetchError || !course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    if (course.mentor_id !== mentorId) {
      res.status(403).json({ error: 'Forbidden: Not your course' });
      return;
    }

    const { data: updatedCourse, error: updateError } = await supabase
      .from('courses')
      .update({
        title,
        description,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Database error:', updateError);
      res.status(500).json({ error: 'Failed to update course' });
      return;
    }

    res.status(200).json({
      message: 'Course updated successfully',
      course: updatedCourse,
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteCourse = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const mentorId = req.user?.userId;

    const { data: course, error: fetchError } = await supabase
      .from('courses')
      .select('mentor_id')
      .eq('id', id)
      .single();

    if (fetchError || !course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    if (course.mentor_id !== mentorId) {
      res.status(403).json({ error: 'Forbidden: Not your course' });
      return;
    }

    const { error: deleteError } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Database error:', deleteError);
      res.status(500).json({ error: 'Failed to delete course' });
      return;
    }

    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addChapter = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params; 
    const { title, description, image_url, video_url } = req.body;
    const mentorId = req.user?.userId;

    if (!title || !description) {
      res.status(400).json({ error: 'Title and description are required' });
      return;
    }

    const { data: course, error: fetchError } = await supabase
      .from('courses')
      .select('mentor_id')
      .eq('id', id)
      .single();

    if (fetchError || !course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    if (course.mentor_id !== mentorId) {
      res.status(403).json({ error: 'Forbidden: Not your course' });
      return;
    }

    const { data: lastChapter } = await supabase
      .from('chapters')
      .select('sequence_order')
      .eq('course_id', id)
      .order('sequence_order', { ascending: false })
      .limit(1)
      .single();

    const sequenceOrder = lastChapter ? lastChapter.sequence_order + 1 : 1;

    const { data: chapter, error: createError } = await supabase
      .from('chapters')
      .insert({
        course_id: id,
        title,
        description,
        image_url,
        video_url,
        sequence_order: sequenceOrder,
      })
      .select()
      .single();

    if (createError) {
      console.error('Database error:', createError);
      res.status(500).json({ error: 'Failed to create chapter' });
      return;
    }

    res.status(201).json({
      message: 'Chapter added successfully',
      chapter,
    });
  } catch (error) {
    console.error('Add chapter error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getChapters = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params; 
    const mentorId = req.user?.userId;

    const { data: course, error: fetchError } = await supabase
      .from('courses')
      .select('mentor_id')
      .eq('id', id)
      .single();

    if (fetchError || !course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    if (course.mentor_id !== mentorId) {
      res.status(403).json({ error: 'Forbidden: Not your course' });
      return;
    }

    const { data: chapters, error: chaptersError } = await supabase
      .from('chapters')
      .select('*')
      .eq('course_id', id)
      .order('sequence_order', { ascending: true });

    if (chaptersError) {
      console.error('Database error:', chaptersError);
      res.status(500).json({ error: 'Failed to fetch chapters' });
      return;
    }

    res.status(200).json({ chapters });
  } catch (error) {
    console.error('Get chapters error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const assignCourse = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params; 
    const { studentIds } = req.body; 
    const mentorId = req.user?.userId;

    console.log("Mentors ids:",mentorId);
    console.log("Student ids:",studentIds);

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      res.status(400).json({ error: 'Student IDs array is required' });
      return;
    }

    const { data: course, error: fetchError } = await supabase
      .from('courses')
      .select('mentor_id')
      .eq('id', id)
      .single();

    if (fetchError || !course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    if (course.mentor_id !== mentorId) {
      res.status(403).json({ error: 'Forbidden: Not your course' });
      return;
    }

    const { data: students, error: studentsError } = await supabase
      .from('users')
      .select('id, role')
      .in('id', studentIds);

    if (studentsError) {
      console.error('Database error:', studentsError);
      res.status(500).json({ error: 'Failed to verify students' });
      return;
    }

    const invalidUsers = students?.filter(s => s.role !== 'student') || [];
    if (invalidUsers.length > 0) {
      res.status(400).json({ 
        error: 'Some users are not students',
        invalidUsers: invalidUsers.map(u => u.id),
      });
      return;
    }

    const assignments = studentIds.map(studentId => ({
      course_id: id,
      student_id: studentId,
    }));

    const { data: createdAssignments, error: assignError } = await supabase
      .from('course_assignments')
      .upsert(assignments, { onConflict: 'course_id,student_id' })
      .select();

    if (assignError) {
      console.error('Database error:', assignError);
      res.status(500).json({ error: 'Failed to assign course' });
      return;
    }

    res.status(200).json({
      message: 'Course assigned successfully',
      assignments: createdAssignments,
    });
  } catch (error) {
    console.error('Assign course error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getStudentProgress = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const mentorId = req.user?.userId;

    const { data: course, error: fetchError } = await supabase
      .from('courses')
      .select('mentor_id')
      .eq('id', id)
      .single();

    if (fetchError || !course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    if (course.mentor_id !== mentorId) {
      res.status(403).json({ error: 'Forbidden: Not your course' });
      return;
    }

    const { data: assignments } = await supabase
      .from('course_assignments')
      .select(`
        student_id,
        users!course_assignments_student_id_fkey(id, name, email)
      `)
      .eq('course_id', id);

    const { count: totalChapters } = await supabase
      .from('chapters')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', id);

    const studentProgress = await Promise.all(
      (assignments || []).map(async (assignment) => {
        const { count: completedChapters } = await supabase
          .from('progress')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', id)
          .eq('student_id', assignment.student_id);

        const percentage = totalChapters 
          ? Math.round(((completedChapters || 0) / totalChapters) * 100)
          : 0;

        return {
          student: assignment.users,
          completedChapters: completedChapters || 0,
          totalChapters: totalChapters || 0,
          percentage,
        };
      })
    );

    res.status(200).json({ progress: studentProgress });
  } catch (error) {
    console.error('Get student progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
