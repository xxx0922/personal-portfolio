import { useState, useEffect } from 'react';

// API 基础 URL - 从环境变量读取
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
  order: number;
  visible: boolean;
}

export default function SocialMediaManager() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null);

  const platformOptions = [
    { name: '抖音', icon: '🎵', placeholder: 'https://www.douyin.com/user/MS4wLjABAAAA...' },
    { name: '小红书', icon: '📕', placeholder: 'https://www.xiaohongshu.com/user/profile/...' },
    { name: 'WeChat', icon: '💬', placeholder: 'WeChat ID or QR code URL' },
    { name: 'Bilibili', icon: '📺', placeholder: 'https://space.bilibili.com/uid' },
    { name: 'Zhihu', icon: '📝', placeholder: 'https://zhihu.com/people/username' },
    { name: 'Twitter', icon: '🐦', placeholder: 'https://twitter.com/username' },
    { name: 'Instagram', icon: '📷', placeholder: 'https://instagram.com/username' },
    { name: 'YouTube', icon: '📺', placeholder: 'https://youtube.com/@channel' },
    { name: 'GitHub', icon: '💻', placeholder: 'https://github.com/username' },
    { name: 'LinkedIn', icon: '💼', placeholder: 'https://linkedin.com/in/username' },
    { name: 'Email', icon: '📧', placeholder: 'mailto:your@email.com' },
    { name: 'Facebook', icon: '👥', placeholder: 'https://facebook.com/username' },
    { name: '个人网站', icon: '🌐', placeholder: 'https://your-website.com' },
    { name: '其他', icon: '🔗', placeholder: 'https://...' }
  ];

  useEffect(() => {
    loadSocialLinks();
  }, []);

  const loadSocialLinks = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/social-links`);
      if (response.ok) {
        const data = await response.json();
        setSocialLinks(data);
      } else {
        // 使用默认数据
        setSocialLinks([
          { id: '1', platform: '抖音', url: 'https://www.douyin.com', icon: '🎵', order: 0, visible: true },
          { id: '2', platform: '小红书', url: 'https://www.xiaohongshu.com', icon: '📕', order: 1, visible: true }
        ]);
      }
    } catch (error) {
      console.error('Failed to load social links:', error);
    }
  };

  const handleSave = async (link: SocialLink) => {
    try {
      const token = localStorage.getItem('adminToken');
      const url = link.id
        ? `${API_BASE_URL}/social-links/${link.id}`
        : `${API_BASE_URL}/social-links`;
      const method = link.id ? 'PUT' : 'POST';

      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(link)
      });

      alert('保存成功');
      loadSocialLinks();
      setIsAdding(false);
      setEditingLink(null);
    } catch (error) {
      // 本地模拟保存
      if (link.id) {
        setSocialLinks(socialLinks.map(l => l.id === link.id ? link : l));
      } else {
        setSocialLinks([...socialLinks, { ...link, id: Date.now().toString() }]);
      }
      setIsAdding(false);
      setEditingLink(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个社交链接吗？')) return;

    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`${API_BASE_URL}/social-links/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      loadSocialLinks();
    } catch (error) {
      setSocialLinks(socialLinks.filter(l => l.id !== id));
    }
  };

  const toggleVisibility = (id: string) => {
    setSocialLinks(socialLinks.map(link =>
      link.id === id ? { ...link, visible: !link.visible } : link
    ));
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">社交媒体管理</h2>

        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">管理您的社交媒体链接，这些链接将显示在网站上</p>
          <button
            onClick={() => setIsAdding(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            添加链接
          </button>
        </div>

        {/* 社交链接列表 */}
        {socialLinks.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
            <div className="text-4xl mb-4">🔗</div>
            <p className="text-lg">还没有添加社交媒体链接</p>
            <p className="text-sm mt-2">点击上方按钮添加您的社交媒体账号</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {socialLinks
              .sort((a, b) => a.order - b.order)
              .map((link) => (
                <div key={link.id} className={`border rounded-lg p-5 ${link.visible ? 'bg-white' : 'bg-gray-50'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{link.icon}</span>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-800">{link.platform}</h3>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline truncate block max-w-xs"
                        >
                          {link.url}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleVisibility(link.id)}
                        className={`p-2 rounded ${link.visible ? 'text-green-600' : 'text-gray-400'}`}
                        title={link.visible ? '已显示' : '已隐藏'}
                      >
                        {link.visible ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <button
                      onClick={() => setEditingLink(link)}
                      className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(link.id)}
                      className="px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* 添加/编辑表单 */}
      {(isAdding || editingLink) && (
        <SocialLinkForm
          link={editingLink}
          platforms={platformOptions}
          onSave={handleSave}
          onClose={() => {
            setIsAdding(false);
            setEditingLink(null);
          }}
        />
      )}
    </div>
  );
}

// 社交链接表单组件
function SocialLinkForm({ link, platforms, onSave, onClose }: any) {
  const [formData, setFormData] = useState<SocialLink>(link || {
    id: '',
    platform: '',
    url: '',
    icon: '🔗',
    order: 0,
    visible: true
  });

  const selectedPlatform = platforms.find((p: any) => p.name === formData.platform);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">{link ? '编辑链接' : '添加链接'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">平台</label>
            <select
              value={formData.platform}
              onChange={(e) => {
                const platform = platforms.find((p: any) => p.name === e.target.value);
                setFormData({
                  ...formData,
                  platform: e.target.value,
                  icon: platform?.icon || '🔗'
                });
              }}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">选择平台</option>
              {platforms.map((platform: any) => (
                <option key={platform.name} value={platform.name}>
                  {platform.icon} {platform.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">链接地址</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder={selectedPlatform?.placeholder || 'https://...'}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">显示顺序</label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              min="0"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.visible}
              onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">在网站上显示</label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
