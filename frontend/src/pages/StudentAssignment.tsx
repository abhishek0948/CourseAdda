import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, UserPlus } from 'lucide-react';
import apiService from '../services/api';
import { StudentProgress, User } from '../types';

const StudentAssignment: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [progress, setProgress] = useState<StudentProgress[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [courseId]);

  const loadData = async () => {
    try {
      const [progressResponse, usersResponse] = await Promise.all([
        apiService.getCourseProgress(courseId!),
        apiService.getStudents(),
      ]);
      
      const progressData = progressResponse.progress || [];
      const transformedProgress = progressData.map((item: any) => ({
        student_id: item.student?.id,
        student_name: item.student?.name,
        student_email: item.student?.email,
        total_chapters: item.totalChapters,
        completed_chapters: item.completedChapters,
        completion_percentage: item.percentage,
        last_accessed_at: null,
      }));
      
      // Backend returns { users: [...] }
      const usersData = usersResponse.users || [];
      
      setProgress(transformedProgress);
      setAllUsers(usersData); 
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignStudents = async () => {
    if (selectedStudents.length === 0) {
      alert('Please select at least one student');
      return;
    }

    try {
      await apiService.assignCourse(courseId!, selectedStudents);
      setShowAssignModal(false);
      setSelectedStudents([]);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to assign students');
    }
  };

  const toggleStudent = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const unassignedStudents = allUsers.filter(
    (user) => !progress.some((p) => p.student_id === user.id)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Courses
        </button>
        <button
          onClick={() => setShowAssignModal(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <UserPlus className="h-5 w-5" />
          Assign Students
        </button>
      </div>

      <h1 className="text-3xl font-bold text-gray-900">Student Progress</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {progress.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No students assigned yet.</p>
            <button
              onClick={() => setShowAssignModal(true)}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors inline-flex items-center gap-2"
            >
              <UserPlus className="h-5 w-5" />
              Assign Students
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chapters
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Activity
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {progress.map((student) => (
                  <tr key={student.student_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {student.student_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{student.student_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${student.completion_percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {student.completion_percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {student.completed_chapters} / {student.total_chapters}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {student.last_accessed_at
                          ? new Date(student.last_accessed_at).toLocaleDateString()
                          : 'Never'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Students Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Assign Students</h2>
            
            {unassignedStudents.length === 0 ? (
              <p className="text-gray-600 py-4">All students have been assigned to this course.</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {unassignedStudents.map((student) => (
                  <label
                    key={student.id}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => toggleStudent(student.id)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                      <div className="text-xs text-gray-600">{student.email}</div>
                    </div>
                  </label>
                ))}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedStudents([]);
                }}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              {unassignedStudents.length > 0 && (
                <button
                  onClick={handleAssignStudents}
                  disabled={selectedStudents.length === 0}
                  className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Assign ({selectedStudents.length})
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAssignment;
