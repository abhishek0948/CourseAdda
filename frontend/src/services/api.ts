import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Handle 401 errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth
  async register(data: { email: string; password: string; name: string; role: string }) {
    const response = await this.api.post('/api/auth/register', data);
    return response.data;
  }

  async login(data: { email: string; password: string }) {
    const response = await this.api.post('/api/auth/login', data);
    return response.data;
  }

  // Admin
  async getUsers() {
    const response = await this.api.get('/api/users');
    return response.data;
  }

  async approveMentor(userId: string, approve: boolean) {
    const response = await this.api.put(`/api/users/${userId}/approve-mentor`, { approve });
    return response.data;
  }

  async deleteUser(userId: string) {
    const response = await this.api.delete(`/api/users/${userId}`);
    return response.data;
  }

  async getAnalytics() {
    const response = await this.api.get('/api/users/analytics');
    return response.data;
  }

  // Mentor
  async getStudents() {
    const response = await this.api.get('/api/courses/students');
    return response.data;
  }

  async createCourse(data: { title: string; description: string }) {
    const response = await this.api.post('/api/courses', data);
    return response.data;
  }

  async getMentorCourses() {
    const response = await this.api.get('/api/courses/my');
    return response.data;
  }

  async updateCourse(courseId: string, data: { title: string; description: string }) {
    const response = await this.api.put(`/api/courses/${courseId}`, data);
    return response.data;
  }

  async deleteCourse(courseId: string) {
    const response = await this.api.delete(`/api/courses/${courseId}`);
    return response.data;
  }

  async addChapter(courseId: string, data: {
    title: string;
    description: string;
    image_url?: string;
    video_url?: string;
  }) {
    const response = await this.api.post(`/api/courses/${courseId}/chapters`, data);
    return response.data;
  }

  async getChapters(courseId: string) {
    const response = await this.api.get(`/api/courses/${courseId}/chapters`);
    return response.data;
  }

  async updateChapter(chapterId: string, data: {
    title: string;
    description: string;
    image_url?: string;
    video_url?: string;
  }) {
    const response = await this.api.put(`/api/chapters/${chapterId}`, data);
    return response.data;
  }

  async deleteChapter(chapterId: string) {
    const response = await this.api.delete(`/api/chapters/${chapterId}`);
    return response.data;
  }

  async assignCourse(courseId: string, studentIds: string[]) {
    const response = await this.api.post(`/api/courses/${courseId}/assign`, { studentIds });
    return response.data;
  }

  async getCourseProgress(courseId: string) {
    const response = await this.api.get(`/api/courses/${courseId}/progress`);
    return response.data;
  }

  // Student
  async getStudentCourses() {
    const response = await this.api.get('/api/student/courses');
    return response.data;
  }

  async getStudentChapters(courseId: string) {
    const response = await this.api.get(`/api/student/courses/${courseId}/chapters`);
    return response.data;
  }

  async completeChapter(chapterId: string) {
    const response = await this.api.post(`/api/student/chapters/${chapterId}/complete`);
    return response.data;
  }

  async getStudentProgress() {
    const response = await this.api.get('/api/student/progress');
    return response.data;
  }

  async downloadCertificate(courseId: string) {
    const response = await this.api.get(`/api/certificates/${courseId}`, {
      responseType: 'blob',
    });
    return response.data;
  }
}

export default new ApiService();
