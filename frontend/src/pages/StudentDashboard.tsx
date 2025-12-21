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
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">My Courses</h1>
          <p className="text-gray-600 mt-2 font-medium">Continue your learning journey</p>
        </div>
      </div>

      {progress.length === 0 ? (
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-16 text-center border border-gray-200">
          <div className="bg-gradient-to-br from-primary-100 to-purple-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="h-12 w-12 text-primary-600" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-3">No courses assigned yet</h3>
          <p className="text-gray-600 text-lg">Your mentor will assign courses to you soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {progress.map((course, index) => (
            <div
              key={course.course_id}
              className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden cursor-pointer hover-lift border border-gray-200 animate-fadeIn"
              onClick={() => handleViewCourse(course.course_id)}
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <div className="h-2 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500"></div>
              <div className="p-7">
                <div className="flex items-center justify-between mb-5">
                  <div className="bg-gradient-to-br from-primary-100 to-purple-100 p-3 rounded-xl">
                    <BookOpen className="h-7 w-7 text-primary-600" />
                  </div>
                  {course.completion_percentage === 100 && (
                    <div className="bg-amber-100 p-2 rounded-full">
                      <Award className="h-6 w-6 text-amber-600" />
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-black text-gray-900 mb-3 tracking-tight">
                  {course.course_title}
                </h3>

                <div className="space-y-4 mt-5">
                  <div className="flex items-center text-sm text-gray-700 font-semibold bg-gray-100 px-3 py-2 rounded-lg">
                    <Clock className="h-4 w-4 mr-2 text-primary-600" />
                    <span>
                      {course.completed_chapters} of {course.total_chapters} chapters
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm font-bold mb-2">
                      <span className="text-gray-700">Progress</span>
                      <span className="text-primary-600 text-base">{course.completion_percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 shadow-md"
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
