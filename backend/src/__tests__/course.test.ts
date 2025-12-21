import request from 'supertest';
import app from '../app';
import supabase from '../config/database';

describe('Course Endpoints', () => {
  let mentorToken: string;
  let studentToken: string;
  let courseId: string;
  let chapterId: string;

  beforeAll(async () => {
    // Create mentor account
    const mentorRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: `mentor${Date.now()}@test.com`,
        password: 'Password123!',
        name: 'Test Mentor',
        role: 'mentor',
      });

    // Approve mentor manually
    const { data: mentorData } = await supabase
      .from('users')
      .select('id')
      .eq('email', mentorRes.body.user.email)
      .single();

    await supabase
      .from('users')
      .update({ approval_status: 'approved' })
      .eq('id', mentorData?.id);

    // Login mentor
    const mentorLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: mentorRes.body.user.email,
        password: 'Password123!',
      });

    mentorToken = mentorLogin.body.token;

    // Create student account
    const studentRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: `student${Date.now()}@test.com`,
        password: 'Password123!',
        name: 'Test Student',
        role: 'student',
      });

    studentToken = studentRes.body.token;
  });

  describe('POST /api/courses', () => {
    it('should create a new course as mentor', async () => {
      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${mentorToken}`)
        .send({
          title: 'Test Course',
          description: 'This is a test course description',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('course');
      expect(response.body.course.title).toBe('Test Course');
      courseId = response.body.course.id;
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/courses')
        .send({
          title: 'Test Course',
          description: 'Description',
        });

      expect(response.status).toBe(401);
    });

    it('should fail with missing title', async () => {
      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${mentorToken}`)
        .send({
          description: 'Description',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/courses/my', () => {
    it('should get mentor courses', async () => {
      const response = await request(app)
        .get('/api/courses/my')
        .set('Authorization', `Bearer ${mentorToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('courses');
      expect(Array.isArray(response.body.courses)).toBe(true);
    });
  });

  describe('PUT /api/courses/:id', () => {
    it('should update course as mentor', async () => {
      const response = await request(app)
        .put(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .send({
          title: 'Updated Course Title',
          description: 'Updated description',
        });

      expect(response.status).toBe(200);
      expect(response.body.course.title).toBe('Updated Course Title');
    });

    it('should fail to update as student', async () => {
      const response = await request(app)
        .put(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Unauthorized Update',
        });

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/courses/:id/chapters', () => {
    it('should add chapter to course', async () => {
      const response = await request(app)
        .post(`/api/courses/${courseId}/chapters`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .send({
          title: 'Chapter 1',
          description: 'First chapter content',
          video_url: 'https://youtube.com/watch?v=test',
          image_url: 'https://example.com/image.jpg',
        });

      expect(response.status).toBe(201);
      expect(response.body.chapter.title).toBe('Chapter 1');
      expect(response.body.chapter.sequence_order).toBe(1);
      chapterId = response.body.chapter.id;
    });


  });

  describe('GET /api/courses/:id/chapters', () => {
    it('should get course chapters as mentor', async () => {
      const response = await request(app)
        .get(`/api/courses/${courseId}/chapters`)
        .set('Authorization', `Bearer ${mentorToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('chapters');
      expect(Array.isArray(response.body.chapters)).toBe(true);
    });
  });

  describe('DELETE /api/courses/:id', () => {
    it('should delete course', async () => {
      const response = await request(app)
        .delete(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${mentorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('deleted');
    });

    it('should fail to delete non-existent course', async () => {
      const response = await request(app)
        .delete(`/api/courses/00000000-0000-0000-0000-000000000000`)
        .set('Authorization', `Bearer ${mentorToken}`);

      expect(response.status).toBe(404);
    });
  });
});
