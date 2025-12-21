import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import supabase from '../config/database';
import { generateCertificatePDF } from '../utils/pdfGenerator';

export const getCertificate = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { courseId } = req.params;
    const studentId = req.user?.userId;

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

    const { count: totalChapters } = await supabase
      .from('chapters')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId);

    const { count: completedChapters } = await supabase
      .from('progress')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId)
      .eq('student_id', studentId);

    if (!totalChapters || completedChapters !== totalChapters) {
      res.status(403).json({ 
        error: 'Certificate not available: Course not fully completed',
        progress: {
          completed: completedChapters || 0,
          total: totalChapters || 0,
          percentage: totalChapters 
            ? Math.round(((completedChapters || 0) / totalChapters) * 100)
            : 0,
        },
      });
      return;
    }

    let certificate;
    const { data: existingCert } = await supabase
      .from('certificates')
      .select('*')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .single();

    if (existingCert) {
      certificate = existingCert;
    } else {
      const { data: newCert, error: certError } = await supabase
        .from('certificates')
        .insert({
          student_id: studentId,
          course_id: courseId,
        })
        .select()
        .single();

      if (certError) {
        console.error('Database error:', certError);
        res.status(500).json({ error: 'Failed to generate certificate' });
        return;
      }

      certificate = newCert;
    }

    const { data: student } = await supabase
      .from('users')
      .select('name')
      .eq('id', studentId)
      .single();

    const { data: course } = await supabase
      .from('courses')
      .select('title')
      .eq('id', courseId)
      .single();

    if (!student || !course) {
      res.status(500).json({ error: 'Failed to fetch details' });
      return;
    }

    await generateCertificatePDF(
      student.name,
      course.title,
      certificate.issued_at,
      res
    );
  } catch (error) {
    console.error('Get certificate error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const getMyCertificates = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const studentId = req.user?.userId;

    const { data: certificates, error } = await supabase
      .from('certificates')
      .select(`
        id,
        issued_at,
        courses (
          id,
          title,
          description
        )
      `)
      .eq('student_id', studentId)
      .order('issued_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Failed to fetch certificates' });
      return;
    }

    res.status(200).json({ certificates });
  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
