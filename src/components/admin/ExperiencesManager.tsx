import { useState, useEffect } from 'react';
import type { Experience } from '../../types';
import ImageUploader from '../ImageUploader';

// API 基础 URL - 从环境变量读取
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const ExperiencesManager = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    location: '',
    startDate: '',
    endDate: '',
    description: '',
    responsibilities: [''],
    achievements: [''],
    technologies: [''],
    logo: ''
  });

  useEffect(() => {
    loadExperiences();
  }, []);

  const loadExperiences = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/experiences`);
      const data = await response.json();
      setExperiences(data);
    } catch (error) {
      console.error('Failed to load experiences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');

    // 过滤空值
    const cleanedData = {
      ...formData,
      responsibilities: formData.responsibilities.filter(r => r.trim()),
      achievements: formData.achievements.filter(a => a.trim()),
      technologies: formData.technologies.filter(t => t.trim()),
      endDate: formData.endDate || null
    };

    try {
      const url = editingExperience
        ? `${API_BASE_URL}/experiences/${editingExperience.id}`
        : `${API_BASE_URL}/experiences`;

      const response = await fetch(url, {
        method: editingExperience ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(cleanedData)
      });

      if (response.ok) {
        await loadExperiences();
        resetForm();
      }
    } catch (error) {
      console.error('Failed to save experience:', error);
      alert('保存失败');
    }
  };

  const handleEdit = (experience: Experience) => {
    setEditingExperience(experience);
    setFormData({
      company: experience.company,
      position: experience.position,
      location: experience.location,
      startDate: experience.startDate.split('T')[0],
      endDate: experience.endDate ? experience.endDate.split('T')[0] : '',
      description: experience.description,
      responsibilities: experience.responsibilities || [''],
      achievements: experience.achievements || [''],
      technologies: experience.technologies || [''],
      logo: experience.logo || ''
    });
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条工作经历吗？')) return;

    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${API_BASE_URL}/experiences/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        await loadExperiences();
      }
    } catch (error) {
      console.error('Failed to delete experience:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      description: '',
      responsibilities: [''],
      achievements: [''],
      technologies: [''],
      logo: ''
    });
    setEditingExperience(null);
    setIsEditing(false);
  };

  const addArrayItem = (field: 'responsibilities' | 'achievements' | 'technologies') => {
    setFormData({
      ...formData,
      [field]: [...formData[field], '']
    });
  };

  const updateArrayItem = (field: 'responsibilities' | 'achievements' | 'technologies', index: number, value: string) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({
      ...formData,
      [field]: newArray
    });
  };

  const removeArrayItem = (field: 'responsibilities' | 'achievements' | 'technologies', index: number) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index)
    });
  };

  if (loading) {
    return <div className="text-center py-8">加载中...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">工作经历管理</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {isEditing ? '取消' : '添加工作经历'}
        </button>
      </div>

      {isEditing && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg mb-6">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">公司名称 *</label>
              <input
                type="text"
                required
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">职位 *</label>
              <input
                type="text"
                required
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">地点 *</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">开始日期 *</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">结束日期（留空表示在职）</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">工作描述 *</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div className="mb-4">
            <ImageUploader
              label="公司Logo"
              currentImage={formData.logo}
              onUploadSuccess={(url) => setFormData({ ...formData, logo: url })}
            />
          </div>

          {/* 工作职责 */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">工作职责</label>
            {formData.responsibilities.map((resp, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={resp}
                  onChange={(e) => updateArrayItem('responsibilities', index, e.target.value)}
                  className="flex-1 px-3 py-2 border rounded"
                  placeholder={`职责 ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem('responsibilities', index)}
                  className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                >
                  删除
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('responsibilities')}
              className="text-blue-500 hover:text-blue-600 text-sm"
            >
              + 添加职责
            </button>
          </div>

          {/* 主要成就 */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">主要成就</label>
            {formData.achievements.map((achievement, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={achievement}
                  onChange={(e) => updateArrayItem('achievements', index, e.target.value)}
                  className="flex-1 px-3 py-2 border rounded"
                  placeholder={`成就 ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem('achievements', index)}
                  className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                >
                  删除
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('achievements')}
              className="text-blue-500 hover:text-blue-600 text-sm"
            >
              + 添加成就
            </button>
          </div>

          {/* 技术栈 */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">技术栈</label>
            {formData.technologies.map((tech, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tech}
                  onChange={(e) => updateArrayItem('technologies', index, e.target.value)}
                  className="flex-1 px-3 py-2 border rounded"
                  placeholder={`技术 ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem('technologies', index)}
                  className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                >
                  删除
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('technologies')}
              className="text-blue-500 hover:text-blue-600 text-sm"
            >
              + 添加技术
            </button>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
            >
              {editingExperience ? '更新' : '创建'}
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

      {/* 工作经历列表 */}
      <div className="space-y-4">
        {experiences.map((exp) => (
          <div key={exp.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {exp.logo && (
                    <img src={exp.logo} alt={exp.company} className="w-12 h-12 rounded object-cover" />
                  )}
                  <div>
                    <h3 className="text-lg font-bold">{exp.position}</h3>
                    <p className="text-gray-600">{exp.company} · {exp.location}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-2">
                  {new Date(exp.startDate).toLocaleDateString('zh-CN')} -
                  {exp.endDate ? new Date(exp.endDate).toLocaleDateString('zh-CN') : '至今'}
                </p>
                <p className="text-gray-700">{exp.description}</p>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleEdit(exp)}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                >
                  编辑
                </button>
                <button
                  onClick={() => handleDelete(exp.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        ))}

        {experiences.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            暂无工作经历，点击"添加工作经历"按钮创建第一条记录
          </div>
        )}
      </div>
    </div>
  );
};

export default ExperiencesManager;
