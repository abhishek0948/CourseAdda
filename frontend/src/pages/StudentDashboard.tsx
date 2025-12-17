import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Award } from 'lucide-react';
import apiService from '../services/api';
import { Progress } from '../types';

const StudentDashboard: React.FC = () => {
  const [progress, setProgress] = useState<Progress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const data = await apiService.getStudentProgress();
      const progressArray = data.progress || [];

      const transformedProgress = progressArray.map((item: any) => ({
        course_id: item.course.id,
        course_title: item.course.title,
        total_chapters: item.totalChapters,
        completed_chapters: item.completedCount,
        completion_percentage: item.percentage,
        last_accessed_at: new Date().toISOString(), 
      }));
      setProgress(transformedProgress);
    } catch (error) {
      console.error('Failed to load progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewCourse = (courseId: string) => {
    navigate(`/student/courses/${courseId}`);
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
      </div>

      {progress.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses assigned yet</h3>
          <p className="text-gray-600">Your mentor will assign courses to you soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {progress.map((course) => (
            <div
              key={course.course_id}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden cursor-pointer"
              onClick={() => handleViewCourse(course.course_id)}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <BookOpen className="h-8 w-8 text-primary-600" />
                  {course.completion_percentage === 100 && (
                    <Award className="h-6 w-6 text-amber-500" />
                  )}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {course.course_title}
                </h3>

                <div className="space-y-3 mt-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>
                      {course.completed_chapters} of {course.total_chapters} chapters
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm font-medium mb-1">
                      <span className="text-gray-700">Progress</span>
                      <span className="text-primary-600">{course.completion_percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${course.completion_percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {course.completion_percentage === 100 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/student/certificate/${course.course_id}`);
                    }}
                    className="mt-4 w-full bg-amber-500 text-white py-2 px-4 rounded-lg hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Award className="h-4 w-4" />
                    View Certificate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
