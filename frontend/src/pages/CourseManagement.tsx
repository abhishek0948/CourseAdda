import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, MoveUp, MoveDown } from 'lucide-react';
import apiService from '../services/api';
import { Chapter } from '../types';

const CourseManagement: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [chapterData, setChapterData] = useState({
    title: '',
    description: '',
    image_url: '',
    video_url: '',
  });

  useEffect(() => {
    loadChapters();
  }, [courseId]);

  const loadChapters = async () => {
    try {
      const data = await apiService.getChapters(courseId!);
      setChapters(data.chapters || []);
    } catch (error) {
      console.error('Failed to load chapters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (chapter?: Chapter) => {
    if (chapter) {
      setEditingChapter(chapter);
      setChapterData({
        title: chapter.title,
        description: chapter.description,
        image_url: chapter.image_url || '',
        video_url: chapter.video_url || '',
      });
    } else {
      setEditingChapter(null);
      setChapterData({ title: '', description: '', image_url: '', video_url: '' });
    }
    setShowChapterModal(true);
  };

  const handleSaveChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingChapter) {
        await apiService.updateChapter(editingChapter.id, chapterData);
      } else {
        await apiService.addChapter(courseId!, chapterData);
      }
      setShowChapterModal(false);
      loadChapters();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to save chapter');
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!confirm('Are you sure you want to delete this chapter?')) return;
    
    try {
      await apiService.deleteChapter(chapterId);
      loadChapters();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete chapter');
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
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Courses
        </button>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add Chapter
        </button>
      </div>

      <h1 className="text-3xl font-bold text-gray-900">Manage Chapters</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {chapters.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600 mb-4">No chapters yet. Add your first chapter to get started.</p>
            <button
              onClick={() => handleOpenModal()}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Add Chapter
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {chapters.map((chapter, index) => (
              <div key={chapter.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-semibold">
                        Chapter {chapter.sequence_number}
                      </span>
                      <h3 className="text-lg font-bold text-gray-900">{chapter.title}</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{chapter.description}</p>
                    <div className="flex gap-4 text-xs text-gray-500">
                      {chapter.video_url && <span>📹 Video</span>}
                      {chapter.image_url && <span>🖼️ Image</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(chapter)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteChapter(chapter.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chapter Modal */}
      {showChapterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingChapter ? 'Edit Chapter' : 'Add New Chapter'}
            </h2>
            <form onSubmit={handleSaveChapter} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chapter Title
                </label>
                <input
                  type="text"
                  required
                  value={chapterData.title}
                  onChange={(e) => setChapterData({ ...chapterData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                  placeholder="e.g., Introduction to Variables"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  required
                  rows={3}
                  value={chapterData.description}
                  onChange={(e) => setChapterData({ ...chapterData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                  placeholder="Chapter description..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video URL (optional)
                </label>
                <input
                  type="url"
                  value={chapterData.video_url}
                  onChange={(e) => setChapterData({ ...chapterData, video_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL (optional)
                </label>
                <input
                  type="url"
                  value={chapterData.image_url}
                  onChange={(e) => setChapterData({ ...chapterData, image_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowChapterModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {editingChapter ? 'Update' : 'Add'} Chapter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;
