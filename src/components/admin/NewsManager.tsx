import { useState, useEffect } from 'react';
import type { News } from '../../types';
import ImageUploader from '../ImageUploader';

const NewsManager = () => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'company' as 'industry' | 'company' | 'achievement' | 'project',
    image: '',
    status: 'draft' as 'draft' | 'published'
  });

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:3001/api/news/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setNews(data);
    } catch (error) {
      console.error('Failed to load news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');

    try {
      const url = editingNews
        ? `http://localhost:3001/api/news/${editingNews.id}`
        : 'http://localhost:3001/api/news';

      const response = await fetch(url, {
        method: editingNews ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await loadNews();
        resetForm();
        alert('保存成功！');
      }
    } catch (error) {
      console.error('Failed to save news:', error);
      alert('保存失败');
    }
  };

  const handleEdit = (newsItem: News) => {
    setEditingNews(newsItem);
    setFormData({
      title: newsItem.title,
      content: newsItem.content,
      type: newsItem.type,
      image: newsItem.image || '',
      status: newsItem.status
    });
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条新闻吗？')) return;

    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`http://localhost:3001/api/news/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        await loadNews();
      }
    } catch (error) {
      console.error('Failed to delete news:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      type: 'company',
      image: '',
      status: 'draft'
    });
    setEditingNews(null);
    setIsEditing(false);
  };

  const newsTypeLabels = {
    industry: '行业动态',
    company: '公司公告',
    achievement: '最新成就',
    project: '项目动态'
  };

  if (loading) {
    return <div className="text-center py-8">加载中...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">新闻动态管理</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {isEditing ? '取消' : '发布新闻'}
        </button>
      </div>

      {isEditing && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">标题 *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              placeholder="输入新闻标题"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">内容 *</label>
            <textarea
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={6}
              className="w-full px-3 py-2 border rounded"
              placeholder="输入新闻内容"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">类型 *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="industry">行业动态</option>
                <option value="company">公司公告</option>
                <option value="achievement">最新成就</option>
                <option value="project">项目动态</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">状态 *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="draft">草稿</option>
                <option value="published">已发布</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <ImageUploader
              label="新闻图片"
              currentImage={formData.image}
              onUploadSuccess={(url) => setFormData({ ...formData, image: url })}
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
            >
              {editingNews ? '更新' : '发布'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
            >
              取消
            </button>
          </div>
        </form>
      )}

      {/* 新闻列表 */}
      <div className="space-y-4">
        {news.map((item) => (
          <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex gap-4 flex-1">
                {item.image && (
                  <img src={item.image} alt={item.title} className="w-32 h-24 rounded object-cover" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold">{item.title}</h3>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {newsTypeLabels[item.type]}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      item.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.status === 'published' ? '已发布' : '草稿'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.content}</p>
                  <div className="text-sm text-gray-500">
                    {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('zh-CN') : '未发布'}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleEdit(item)}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                >
                  编辑
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        ))}

        {news.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            暂无新闻，点击"发布新闻"按钮创建第一条新闻
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsManager;
