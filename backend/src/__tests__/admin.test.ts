import request from 'supertest';
import app from '../app';
import supabase from '../config/database';

describe('Admin Endpoints', () => {
  let adminToken: string;
  let mentorId: string;
  let mentorEmail: string;

  beforeAll(async () => {
    // Create admin account
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: `admin${Date.now()}@test.com`,
        password: 'Password123!',
        name: 'Test Admin',
        role: 'admin',
      });

    // Manually set admin role in database
    const { data: adminData } = await supabase
      .from('users')
      .select('id')
      .eq('email', adminRes.body.user.email)
      .single();

    await supabase
      .from('users')
      .update({ role: 'admin', approval_status: 'approved' })
      .eq('id', adminData?.id);

    // Login as admin
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: adminRes.body.user.email,
        password: 'Password123!',
      });

    adminToken = adminLogin.body.token;

    // Create pending mentor for testing
    mentorEmail = `mentor${Date.now()}@test.com`;
    const mentorRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: mentorEmail,
        password: 'Password123!',
        name: 'Pending Mentor',
        role: 'mentor',
      });

    mentorId = mentorRes.body.user.id;
  });

  describe('GET /api/users', () => {
    it('should get list of all users', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('users');
      expect(Array.isArray(response.body.users)).toBe(true);
    });

    it('should fail without admin token', async () => {
      const response = await request(app)
        .get('/api/users');

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/users/:id/approve-mentor', () => {
    it('should approve pending mentor', async () => {
      const response = await request(app)
        .put(`/api/users/${mentorId}/approve-mentor`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ approve: true });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('approved');

      // Verify mentor can now login
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: mentorEmail,
          password: 'Password123!',
        });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body).toHaveProperty('token');
    });

    it('should fail to approve non-existent mentor', async () => {
      const response = await request(app)
        .put('/api/users/00000000-0000-0000-0000-000000000000/approve-mentor')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ approve: true });

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/users/:id/approve-mentor (reject)', () => {
    let rejectMentorId: string;

    beforeAll(async () => {
      const mentorRes = await request(app)
        .post('/api/auth/register')
        .send({
          email: `rejectmentor${Date.now()}@test.com`,
          password: 'Password123!',
          name: 'Reject Mentor',
          role: 'mentor',
        });

      rejectMentorId = mentorRes.body.user.id;
    });

    it('should reject pending mentor', async () => {
      const response = await request(app)
        .put(`/api/users/${rejectMentorId}/approve-mentor`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ approve: false });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('rejected');
    });
  });

  describe('GET /api/users/analytics', () => {
    it('should get system analytics', async () => {
      const response = await request(app)
        .get('/api/users/analytics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('analytics');
      expect(response.body.analytics).toHaveProperty('users');
      expect(response.body.analytics).toHaveProperty('courses');
      expect(response.body.analytics.users).toHaveProperty('total');
      expect(response.body.analytics.users).toHaveProperty('admins');
      expect(response.body.analytics.users).toHaveProperty('mentors');
      expect(response.body.analytics.users).toHaveProperty('students');
      expect(response.body.analytics.users).toHaveProperty('pendingMentors');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete a user', async () => {
      // Create a test user to delete
      const userRes = await request(app)
        .post('/api/auth/register')
        .send({
          email: `deleteuser${Date.now()}@test.com`,
          password: 'Password123!',
          name: 'Delete Test User',
          role: 'student',
        });

      const response = await request(app)
        .delete(`/api/users/${userRes.body.user.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('deleted');
    });
  });
});
