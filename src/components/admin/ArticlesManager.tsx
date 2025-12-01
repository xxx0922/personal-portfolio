import { useState, useEffect, useCallback, useMemo } from 'react';
import SimpleMDE from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';
import type { Article } from '../../types';
import ImageUploader from '../ImageUploader';

// API 基础 URL - 从环境变量读取
const API_BASE_URL = import.meta.env.VITE_API_URL || `${API_BASE_URL.replace('/api', '')}/api`;

const ArticlesManager = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    coverImage: '',
    category: '',
    tags: '',
    status: 'draft' as 'draft' | 'published',
    author: '管理员'
  });

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/articles/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setArticles(data);
    } catch (error) {
      console.error('Failed to load articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');

    const articleData = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
    };

    try {
      const url = editingArticle
        ? `${API_BASE_URL}/articles/${editingArticle.id}`
        : `${API_BASE_URL}/articles`;

      const response = await fetch(url, {
        method: editingArticle ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(articleData)
      });

      if (response.ok) {
        await loadArticles();
        resetForm();
        alert('保存成功！');
      }
    } catch (error) {
      console.error('Failed to save article:', error);
      alert('保存失败');
    }
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      summary: article.summary,
      content: article.content,
      coverImage: article.coverImage || '',
      category: article.category,
      tags: article.tags.join(', '),
      status: article.status,
      author: article.author
    });
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这篇文章吗？')) return;

    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${API_BASE_URL}/articles/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        await loadArticles();
      }
    } catch (error) {
      console.error('Failed to delete article:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      summary: '',
      content: '',
      coverImage: '',
      category: '',
      tags: '',
      status: 'draft',
      author: '管理员'
    });
    setEditingArticle(null);
    setIsEditing(false);
  };

  const onContentChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, content: value }));
  }, []);

  const editorOptions = useMemo(() => ({
    spellChecker: false,
    placeholder: '在此输入文章内容（支持Markdown）...',
    status: false,
    toolbar: ['bold', 'italic', 'heading', '|', 'quote', 'unordered-list', 'ordered-list', '|', 'link', 'image', '|', 'preview', 'side-by-side', 'fullscreen', '|', 'guide'] as any
  }), []);

  if (loading) {
    return <div className="text-center py-8">加载中...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">博客文章管理</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {isEditing ? '取消' : '写文章'}
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
              placeholder="输入文章标题"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">摘要 *</label>
            <textarea
              required
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border rounded"
              placeholder="文章摘要（显示在列表页）"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">分类 *</label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                placeholder="例如：技术教程、行业动态"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">标签（用逗号分隔）</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                placeholder="例如：弱电,监控,智能化"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">作者</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              />
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
              label="封面图"
              currentImage={formData.coverImage}
              onUploadSuccess={(url) => setFormData({ ...formData, coverImage: url })}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">文章内容（Markdown） *</label>
            <SimpleMDE
              value={formData.content}
              onChange={onContentChange}
              options={editorOptions}
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
            >
              {editingArticle ? '更新文章' : '发布文章'}
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

      {/* 文章列表 */}
      <div className="space-y-4">
        {articles.map((article) => (
          <div key={article.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold">{article.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${
                    article.status === 'published'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {article.status === 'published' ? '已发布' : '草稿'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{article.summary}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>分类：{article.category}</span>
                  <span>作者：{article.author}</span>
                  <span>阅读：{article.views}</span>
                  <span>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('zh-CN') : '未发布'}</span>
                </div>
                {article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {article.tags.map((tag, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleEdit(article)}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                >
                  编辑
                </button>
                <button
                  onClick={() => handleDelete(article.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        ))}

        {articles.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            暂无文章，点击"写文章"按钮创建第一篇文章
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticlesManager;
