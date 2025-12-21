import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';
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
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Courses
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Manage Chapters</h1>
          <p className="text-gray-600 mt-1">Create and organize course content</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 font-semibold whitespace-nowrap"
        >
          <Plus className="h-5 w-5" />
          Add Chapter
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        {chapters.length === 0 ? (
          <div className="p-16 text-center">
            <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No chapters yet</h3>
            <p className="text-gray-600 mb-6">Add your first chapter to get started.</p>
            <button
              onClick={() => handleOpenModal()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg inline-flex items-center gap-2 font-semibold"
            >
              <Plus className="h-5 w-5" />
              Add Chapter
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {chapters.map((chapter, index) => (
              <div 
                key={chapter.id} 
                className="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all animate-fadeIn"
                style={{animationDelay: `${index * 0.05}s`}}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold shadow-sm">
                        Chapter {chapter.sequence_number}
                      </span>
                      <h3 className="text-lg font-bold text-gray-900">{chapter.title}</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 leading-relaxed">{chapter.description}</p>
                    <div className="flex gap-3 text-xs">
                      {chapter.video_url && (
                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg font-medium">📹 Video</span>
                      )}
                      {chapter.image_url && (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg font-medium">🖼️ Image</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(chapter)}
                      className="p-2.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-all shadow-sm hover:shadow-md"
                      title="Edit"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteChapter(chapter.id)}
                      className="p-2.5 text-red-600 hover:bg-red-100 rounded-lg transition-all shadow-sm hover:shadow-md"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full p-8 max-h-[90vh] overflow-y-auto animate-scaleIn">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingChapter ? 'Edit Chapter' : 'Add New Chapter'}
            </h2>
            <form onSubmit={handleSaveChapter} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chapter Title
                </label>
                <input
                  type="text"
                  required
                  value={chapterData.title}
                  onChange={(e) => setChapterData({ ...chapterData, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-colors"
                  placeholder="e.g., Introduction to Variables"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  required
                  rows={4}
                  value={chapterData.description}
                  onChange={(e) => setChapterData({ ...chapterData, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-colors"
                  placeholder="Chapter description..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video URL (optional)
                </label>
                <input
                  type="url"
                  value={chapterData.video_url}
                  onChange={(e) => setChapterData({ ...chapterData, video_url: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-colors"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL (optional)
                </label>
                <input
                  type="url"
                  value={chapterData.image_url}
                  onChange={(e) => setChapterData({ ...chapterData, image_url: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-colors"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowChapterModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg font-semibold"
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
