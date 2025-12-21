import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Plus, Edit, Trash2, Users } from 'lucide-react';
import apiService from '../services/api';
import { Course } from '../types';

const MentorDashboard: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: '', description: '' });
  const navigate = useNavigate();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const data = await apiService.getMentorCourses();
      // Backend returns { courses: [...] }
      setCourses(data.courses || []);
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.createCourse(newCourse);
      setShowCreateModal(false);
      setNewCourse({ title: '', description: '' });
      loadCourses();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create course');
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    
    try {
      await apiService.deleteCourse(courseId);
      loadCourses();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete course');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Create Course
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses yet</h3>
          <p className="text-gray-600 mb-4">Create your first course to get started.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Create Course
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <BookOpen className="h-8 w-8 text-primary-600" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {course.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {course.description}
                </p>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => navigate(`/mentor/courses/${course.id}`)}
                    className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Manage
                  </button>
                  <button
                    onClick={() => navigate(`/mentor/courses/${course.id}/students`)}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <Users className="h-4 w-4" />
                    Students
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Course</h2>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Title
                </label>
                <input
                  type="text"
                  required
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                  placeholder="e.g., Introduction to Python"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  required
                  rows={4}
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                  placeholder="Course description..."
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorDashboard;
