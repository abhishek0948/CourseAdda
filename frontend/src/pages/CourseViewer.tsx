import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, CheckCircle, Play, Image as ImageIcon } from 'lucide-react';
import apiService from '../services/api';
import { ChapterWithStatus } from '../types';

const CourseViewer: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [chapters, setChapters] = useState<ChapterWithStatus[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<ChapterWithStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [courseTitle, setCourseTitle] = useState('');

  useEffect(() => {
    loadChapters();
  }, [courseId]);

  const loadChapters = async () => {
    try {
      const data = await apiService.getStudentChapters(courseId!);
      setChapters(data.chapters);
      setCourseTitle(data.course_title);
      
      const firstUnlocked = data.chapters.find((ch: ChapterWithStatus) => !ch.is_locked);
      if (firstUnlocked) {
        setSelectedChapter(firstUnlocked);
      }
    } catch (error) {
      console.error('Failed to load chapters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteChapter = async () => {
    if (!selectedChapter || selectedChapter.is_completed) return;

    setIsCompleting(true);
    try {
      await apiService.completeChapter(selectedChapter.id);
      await loadChapters();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to complete chapter');
    } finally {
      setIsCompleting(false);
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
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
      >
        <ArrowLeft className="h-5 w-5" />
        Back to Dashboard
      </button>

      <h1 className="text-3xl font-bold text-gray-900">{courseTitle}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chapter List */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-4 h-fit">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Chapters</h2>
          <div className="space-y-2">
            {chapters.map((chapter) => (
              <button
                key={chapter.id}
                onClick={() => !chapter.is_locked && setSelectedChapter(chapter)}
                disabled={chapter.is_locked}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedChapter?.id === chapter.id
                    ? 'bg-primary-100 border-2 border-primary-600'
                    : chapter.is_locked
                    ? 'bg-gray-100 cursor-not-allowed opacity-60'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="font-medium text-gray-700">
                      {chapter.sequence_number}.
                    </span>
                    <span className="text-sm text-gray-900 truncate">
                      {chapter.title}
                    </span>
                  </div>
                  {chapter.is_completed && (
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  )}
                  {chapter.is_locked && (
                    <Lock className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chapter Content */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          {selectedChapter ? (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedChapter.title}
                  </h2>
                  {selectedChapter.is_completed && (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      Completed
                    </span>
                  )}
                </div>
                <p className="text-gray-600">{selectedChapter.description}</p>
              </div>

              {/* Video */}
              {selectedChapter.video_url && (
                <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                  {selectedChapter.video_url.includes('youtube.com') || 
                   selectedChapter.video_url.includes('youtu.be') ? (
                    <iframe
                      src={selectedChapter.video_url.replace('watch?v=', 'embed/')}
                      className="w-full h-full"
                      allowFullScreen
                      title={selectedChapter.title}
                    ></iframe>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Play className="h-16 w-16 text-white" />
                    </div>
                  )}
                </div>
              )}

              {/* Image */}
              {selectedChapter.image_url && (
                <div className="rounded-lg overflow-hidden">
                  <img
                    src={selectedChapter.image_url}
                    alt={selectedChapter.title}
                    className="w-full h-auto"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              {!selectedChapter.video_url && !selectedChapter.image_url && (
                <div className="bg-gray-100 rounded-lg p-12 text-center">
                  <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No media content available for this chapter</p>
                </div>
              )}

              {/* Complete Button */}
              {!selectedChapter.is_completed && (
                <button
                  onClick={handleCompleteChapter}
                  disabled={isCompleting}
                  className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {isCompleting ? 'Marking as complete...' : 'Mark as Complete'}
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-600">Select a chapter to view content</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseViewer;
