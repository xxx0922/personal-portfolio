import { useState, useEffect } from 'react';
import ImageUploader from '../ImageUploader';

// API 基础 URL - 从环境变量读取
const API_BASE_URL = import.meta.env.VITE_API_URL || `${API_BASE_URL.replace('/api', '')}/api`;

interface FriendLink {
  id: string;
  name: string;
  url: string;
  description: string;
  logo: string;
  order: number;
  visible: boolean;
}

const FriendLinksManager = () => {
  const [links, setLinks] = useState<FriendLink[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingLink, setEditingLink] = useState<FriendLink | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadFriendLinks();
  }, []);

  const loadFriendLinks = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/friend-links/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setLinks(data);
    } catch (error) {
      console.error('Failed to load friend links:', error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/friend-links`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(links)
      });

      if (response.ok) {
        await loadFriendLinks();
        alert('保存成功！');
      }
    } catch (error) {
      alert('保存失败');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdd = () => {
    const newLink: FriendLink = {
      id: Date.now().toString(),
      name: '',
      url: '',
      description: '',
      logo: '',
      order: links.length,
      visible: true
    };
    setEditingLink(newLink);
    setIsAdding(true);
  };

  const handleEdit = (link: FriendLink) => {
    setEditingLink({ ...link });
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm('确定要删除这个友情链接吗？')) return;
    const newLinks = links.filter(link => link.id !== id);
    // 重新排序
    newLinks.forEach((link, index) => {
      link.order = index;
    });
    setLinks(newLinks);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newLinks = [...links];
    [newLinks[index - 1], newLinks[index]] = [newLinks[index], newLinks[index - 1]];
    // 更新order
    newLinks.forEach((link, idx) => {
      link.order = idx;
    });
    setLinks(newLinks);
  };

  const handleMoveDown = (index: number) => {
    if (index === links.length - 1) return;
    const newLinks = [...links];
    [newLinks[index], newLinks[index + 1]] = [newLinks[index + 1], newLinks[index]];
    // 更新order
    newLinks.forEach((link, idx) => {
      link.order = idx;
    });
    setLinks(newLinks);
  };

  const handleToggleVisible = (id: string) => {
    setLinks(links.map(link =>
      link.id === id ? { ...link, visible: !link.visible } : link
    ));
  };

  const handleSaveEdit = () => {
    if (!editingLink) return;

    if (!editingLink.name || !editingLink.url) {
      alert('请填写网站名称和URL');
      return;
    }

    // 验证URL格式
    try {
      new URL(editingLink.url);
    } catch {
      alert('请输入有效的URL（如 https://example.com）');
      return;
    }

    if (isAdding) {
      setLinks([...links, editingLink]);
    } else {
      setLinks(links.map(link =>
        link.id === editingLink.id ? editingLink : link
      ));
    }

    setEditingLink(null);
    setIsAdding(false);
  };

  const handleCancelEdit = () => {
    setEditingLink(null);
    setIsAdding(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">友情链接管理</h2>
        <div className="flex space-x-3">
          <button
            onClick={handleAdd}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            + 添加友情链接
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
            disabled={isSaving}
          >
            {isSaving ? '保存中...' : '保存更改'}
          </button>
        </div>
      </div>

      {links.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <p className="text-lg text-gray-500">暂无友情链接</p>
          <p className="text-sm text-gray-400 mt-2">点击上方按钮添加友情链接</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {links.map((link, index) => (
            <div
              key={link.id}
              className={`bg-white border rounded-lg p-4 hover:shadow-lg transition ${
                !link.visible ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {link.logo ? (
                    <img
                      src={link.logo}
                      alt={link.name}
                      className="w-12 h-12 rounded-lg object-cover border"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                      🔗
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{link.name}</h3>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline break-all"
                    >
                      {link.url}
                    </a>
                  </div>
                </div>
                <div className="flex flex-col space-y-1">
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === links.length - 1}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs"
                  >
                    ▼
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {link.description || '暂无描述'}
              </p>

              <div className="flex items-center justify-between pt-3 border-t">
                <button
                  onClick={() => handleToggleVisible(link.id)}
                  className={`text-xs px-2 py-1 rounded ${
                    link.visible
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {link.visible ? '显示' : '隐藏'}
                </button>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(link)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(link.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 编辑/添加弹窗 */}
      {editingLink && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {isAdding ? '添加友情链接' : '编辑友情链接'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  网站名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingLink.name}
                  onChange={(e) => setEditingLink({ ...editingLink, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                  placeholder="例如: 技术博客"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  网站URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={editingLink.url}
                  onChange={(e) => setEditingLink({ ...editingLink, url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                  placeholder="https://example.com"
                />
                <p className="text-xs text-gray-500 mt-1">请输入完整的URL，包括 https://</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  网站描述
                </label>
                <textarea
                  value={editingLink.description}
                  onChange={(e) => setEditingLink({ ...editingLink, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                  placeholder="简短描述这个网站..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  网站Logo
                </label>
                {editingLink.logo && (
                  <div className="mb-3">
                    <img
                      src={editingLink.logo}
                      alt="Logo预览"
                      className="w-24 h-24 object-cover rounded-lg border"
                    />
                  </div>
                )}
                <ImageUploader
                  currentImage={editingLink.logo}
                  onUploadSuccess={(url) => setEditingLink({ ...editingLink, logo: url })}
                  label="上传Logo"
                />
                <div className="mt-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    或输入Logo URL
                  </label>
                  <input
                    type="url"
                    value={editingLink.logo}
                    onChange={(e) => setEditingLink({ ...editingLink, logo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">建议尺寸: 100×100px，支持正方形图片</p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={editingLink.visible}
                  onChange={(e) => setEditingLink({ ...editingLink, visible: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  在前端显示
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendLinksManager;
