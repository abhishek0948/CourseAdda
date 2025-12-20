import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Award, ArrowLeft, CheckCircle } from 'lucide-react';
import apiService from '../services/api';

const CertificatePage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);
  const [courseTitle, setCourseTitle] = useState('');

  useEffect(() => {
    loadCourseTitle();
  }, [courseId]);

  const loadCourseTitle = async () => {
    try {
      const data = await apiService.getStudentChapters(courseId!);
      setCourseTitle(data.course_title);
    } catch (error) {
      console.error('Failed to load course:', error);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const blob = await apiService.downloadCertificate(courseId!);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${courseTitle.replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to download certificate');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
      >
        <ArrowLeft className="h-5 w-5" />
        Back to Dashboard
      </button>

      <div className="bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-amber-100 p-6 rounded-full">
            <Award className="h-24 w-24 text-amber-500" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Congratulations!
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          You've completed {courseTitle}
        </p>

        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <span className="text-lg font-semibold text-green-900">
              Course Completed
            </span>
          </div>
          <p className="text-sm text-green-700">
            Your certificate is ready to download
          </p>
        </div>

        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="inline-flex items-center gap-3 bg-primary-600 text-white py-4 px-8 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors text-lg shadow-lg"
        >
          <Download className="h-6 w-6" />
          {isDownloading ? 'Downloading...' : 'Download Certificate'}
        </button>

        <p className="text-sm text-gray-500 mt-6">
          Your certificate will be downloaded as a PDF file
        </p>
      </div>
    </div>
  );
};

export default CertificatePage;
