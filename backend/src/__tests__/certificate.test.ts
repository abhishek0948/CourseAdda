import request from 'supertest';
import app from '../app';
import supabase from '../config/database';

describe('Certificate Endpoints', () => {
  let studentToken: string;
  let studentId: string;
  let mentorToken: string;
  let courseId: string;
  let chapterId: string;

  beforeAll(async () => {
    // Setup mentor
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

    // Setup student
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

    // Create course with chapter
    const courseRes = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${mentorToken}`)
      .send({
        title: 'Certificate Test Course',
        description: 'Course for certificate testing',
      });

    courseId = courseRes.body.course.id;

    const chapterRes = await request(app)
      .post(`/api/courses/${courseId}/chapters`)
      .set('Authorization', `Bearer ${mentorToken}`)
      .send({
        title: 'Test Chapter',
        description: 'Chapter content',
      });

    chapterId = chapterRes.body.chapter.id;

    // Assign course
    await request(app)
      .post(`/api/courses/${courseId}/assign`)
      .set('Authorization', `Bearer ${mentorToken}`)
      .send({
        studentIds: [studentId],
      });

    // Complete chapter
    await request(app)
      .post(`/api/student/chapters/${chapterId}/complete`)
      .set('Authorization', `Bearer ${studentToken}`);
  });

  describe('GET /api/certificates/:courseId', () => {
    it('should generate certificate for completed course', async () => {
      const response = await request(app)
        .get(`/api/certificates/${courseId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/pdf');
    });

    it('should fail for incomplete course', async () => {
      // Create another course not completed
      const newCourseRes = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${mentorToken}`)
        .send({
          title: 'Incomplete Course',
          description: 'Not completed',
        });

      await request(app)
        .post(`/api/courses/${newCourseRes.body.course.id}/chapters`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .send({
          title: 'Uncompleted Chapter',
          description: 'Not done',
        });

      await request(app)
        .post(`/api/courses/${newCourseRes.body.course.id}/assign`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .send({
          studentIds: [studentId],
        });

      const response = await request(app)
        .get(`/api/certificates/${newCourseRes.body.course.id}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('progress');
    });

    it('should fail for non-assigned course', async () => {
      const otherCourseRes = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${mentorToken}`)
        .send({
          title: 'Other Course',
          description: 'Not assigned',
        });

      const response = await request(app)
        .get(`/api/certificates/${otherCourseRes.body.course.id}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get(`/api/certificates/${courseId}`);

      expect(response.status).toBe(401);
    });
  });


});
