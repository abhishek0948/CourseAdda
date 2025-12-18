import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import supabase from '../config/database';

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