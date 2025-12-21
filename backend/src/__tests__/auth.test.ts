import request from 'supertest';
import app from '../app';

describe('Auth Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new student', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: `student${Date.now()}@test.com`,
          password: 'Password123!',
          name: 'Test Student',
          role: 'student',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.role).toBe('student');
    });

    it('should register a mentor with pending status', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: `mentor${Date.now()}@test.com`,
          password: 'Password123!',
          name: 'Test Mentor',
          role: 'mentor',
        });

      expect(response.status).toBe(201);
      expect(response.body.user.role).toBe('mentor');
      expect(response.body.user.approval_status).toBe('pending');
      expect(response.body.token).toBeNull();
    });

    it('should fail with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@test.com',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should fail with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should require email and password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
    });
  });
});

describe('Health Check', () => {
  it('should return health status', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
  });
});
