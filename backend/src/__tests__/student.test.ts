import request from 'supertest';
import app from '../app';
import supabase from '../config/database';

describe('Student Endpoints', () => {
  let mentorToken: string;
  let studentToken: string;
  let studentId: string;
  let courseId: string;
  let chapterId: string;

  beforeAll(async () => {
    // Create and approve mentor
    const mentorRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: `mentor${Date.now()}@test.com`,
        password: 'Password123!',
        name: 'Test Mentor',
        role: 'mentor',
      });

    const { data: mentorData } = await supabase
      .from('users')
      .select('id')
      .eq('email', mentorRes.body.user.email)
      .single();

    await supabase
      .from('users')
      .update({ approval_status: 'approved' })
      .eq('id', mentorData?.id);

    const mentorLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: mentorRes.body.user.email,
        password: 'Password123!',
      });

    mentorToken = mentorLogin.body.token;

    // Create student
    const studentRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: `student${Date.now()}@test.com`,
        password: 'Password123!',
        name: 'Test Student',
        role: 'student',
      });

    studentToken = studentRes.body.token;
    studentId = studentRes.body.user.id;

    // Create course and chapter
    const courseRes = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${mentorToken}`)
      .send({
        title: 'Student Test Course',
        description: 'Course for student testing',
      });

    courseId = courseRes.body.course.id;

    const chapterRes = await request(app)
      .post(`/api/courses/${courseId}/chapters`)
      .set('Authorization', `Bearer ${mentorToken}`)
      .send({
        title: 'Test Chapter',
        description: 'Chapter content',
        video_url: 'https://youtube.com/watch?v=test',
      });

    chapterId = chapterRes.body.chapter.id;

    // Assign course to student
    await request(app)
      .post(`/api/courses/${courseId}/assign`)
      .set('Authorization', `Bearer ${mentorToken}`)
      .send({
        studentIds: [studentId],
      });
  });

  describe('GET /api/student/courses', () => {
    it('should get assigned courses with progress', async () => {
      const response = await request(app)
        .get('/api/student/courses')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('courses');
      expect(Array.isArray(response.body.courses)).toBe(true);
      expect(response.body.courses.length).toBeGreaterThan(0);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/student/courses');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/student/courses/:id/chapters', () => {
    it('should get course chapters for assigned course', async () => {
      const response = await request(app)
        .get(`/api/student/courses/${courseId}/chapters`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('chapters');
      expect(Array.isArray(response.body.chapters)).toBe(true);
    });

    it('should fail for non-assigned course', async () => {
      // Create another course not assigned to student
      const otherCourseRes = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${mentorToken}`)
        .send({
          title: 'Other Course',
          description: 'Not assigned',
        });

      const response = await request(app)
        .get(`/api/student/courses/${otherCourseRes.body.course.id}/chapters`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/student/progress', () => {
    it('should mark chapter as completed', async () => {
      const response = await request(app)
        .post('/api/student/progress')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          courseId: courseId,
          chapterId: chapterId,
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Progress updated');
    });

    it('should handle duplicate completion requests', async () => {
      const response = await request(app)
        .post('/api/student/progress')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          courseId: courseId,
          chapterId: chapterId,
        });

      expect([200, 409]).toContain(response.status);
    });

    it('should fail with missing courseId', async () => {
      const response = await request(app)
        .post('/api/student/progress')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          chapterId: chapterId,
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/student/progress', () => {
    it('should get student progress for all courses', async () => {
      const response = await request(app)
        .get('/api/student/progress')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('progress');
      expect(Array.isArray(response.body.progress)).toBe(true);
    });
  });

  describe('GET /api/student/courses/:id/progress', () => {
    it('should get progress for specific course', async () => {
      const response = await request(app)
        .get(`/api/student/courses/${courseId}/progress`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('progress');
      expect(response.body.progress).toHaveProperty('completedChapters');
      expect(response.body.progress).toHaveProperty('totalChapters');
      expect(response.body.progress).toHaveProperty('percentage');
    });
  });
});
