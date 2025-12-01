import { useState, useEffect } from 'react';

// API 基础 URL - 从环境变量读取
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const FooterSettingsManager = () => {
  const [settings, setSettings] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    about: { title: '', description: '', copyright: '', icpNumber: '' },
    contact: { email: '', phone: '', location: '' },
    social: { wechat: '', github: '', linkedin: '', email: '' },
    links: { privacyPolicy: '', termsOfService: '' },
    branding: { designedBy: '' }
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/footer-settings`);
      const data = await response.json();
      setSettings(data);
      setFormData(data);
    } catch (error) {
      console.error('Failed to load footer settings:', error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/footer-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await loadSettings();
        setIsEditing(false);
        alert('保存成功！');
      }
    } catch (error) {
      alert('保存失败');
    } finally {
      setIsSaving(false);
    }
  };

  if (!settings) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">加载中...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Footer设置</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            编辑设置
          </button>
        )}
      </div>

      {!isEditing ? (
        <div className="space-y-6">
          {/* 关于信息 */}
          <div className="border rounded-lg p-6 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">关于信息</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">标题：</label>
                <p className="text-gray-900">{settings.about.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">描述：</label>
                <p className="text-gray-900">{settings.about.description}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">版权：</label>
                <p className="text-gray-900">{settings.about.copyright}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">ICP备案号：</label>
                <p className="text-gray-900">{settings.about.icpNumber}</p>
              </div>
            </div>
          </div>

          {/* 联系方式 */}
          <div className="border rounded-lg p-6 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">联系方式</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">邮箱：</label>
                <p className="text-gray-900">{settings.contact.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">电话：</label>
                <p className="text-gray-900">{settings.contact.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">地址：</label>
                <p className="text-gray-900">{settings.contact.location}</p>
              </div>
            </div>
          </div>

          {/* 社交媒体 */}
          <div className="border rounded-lg p-6 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">社交媒体</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">微信号：</label>
                <p className="text-gray-900">{settings.social.wechat}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">GitHub：</label>
                <p className="text-gray-900">{settings.social.github}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">LinkedIn：</label>
                <p className="text-gray-900">{settings.social.linkedin}</p>
              </div>
            </div>
          </div>

          {/* 链接 */}
          <div className="border rounded-lg p-6 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">其他链接</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">隐私政策：</label>
                <p className="text-gray-900">{settings.links.privacyPolicy}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">使用条款：</label>
                <p className="text-gray-900">{settings.links.termsOfService}</p>
              </div>
            </div>
          </div>

          {/* 品牌信息 */}
          <div className="border rounded-lg p-6 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">品牌信息</h3>
            <div>
              <label className="text-sm font-medium text-gray-700">设计者：</label>
              <p className="text-gray-900">{settings.branding.designedBy}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 关于信息表单 */}
          <div className="border rounded-lg p-6 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">关于信息</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
                <input
                  type="text"
                  value={formData.about.title}
                  onChange={(e) => setFormData({...formData, about: {...formData.about, title: e.target.value}})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea
                  value={formData.about.description}
                  onChange={(e) => setFormData({...formData, about: {...formData.about, description: e.target.value}})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">版权</label>
                <input
                  type="text"
                  value={formData.about.copyright}
                  onChange={(e) => setFormData({...formData, about: {...formData.about, copyright: e.target.value}})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ICP备案号</label>
                <input
                  type="text"
                  value={formData.about.icpNumber}
                  onChange={(e) => setFormData({...formData, about: {...formData.about, icpNumber: e.target.value}})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>
            </div>
          </div>

          {/* 联系方式表单 */}
          <div className="border rounded-lg p-6 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">联系方式</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                <input
                  type="email"
                  value={formData.contact.email}
                  onChange={(e) => setFormData({...formData, contact: {...formData.contact, email: e.target.value}})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">电话</label>
                <input
                  type="text"
                  value={formData.contact.phone}
                  onChange={(e) => setFormData({...formData, contact: {...formData.contact, phone: e.target.value}})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">地址</label>
                <input
                  type="text"
                  value={formData.contact.location}
                  onChange={(e) => setFormData({...formData, contact: {...formData.contact, location: e.target.value}})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>
            </div>
          </div>

          {/* 社交媒体表单 */}
          <div className="border rounded-lg p-6 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">社交媒体</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">微信号</label>
                <input
                  type="text"
                  value={formData.social.wechat}
                  onChange={(e) => setFormData({...formData, social: {...formData.social, wechat: e.target.value}})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GitHub链接</label>
                <input
                  type="url"
                  value={formData.social.github}
                  onChange={(e) => setFormData({...formData, social: {...formData.social, github: e.target.value}})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn链接</label>
                <input
                  type="url"
                  value={formData.social.linkedin}
                  onChange={(e) => setFormData({...formData, social: {...formData.social, linkedin: e.target.value}})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>
            </div>
          </div>

          {/* 链接表单 */}
          <div className="border rounded-lg p-6 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">其他链接</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">隐私政策链接</label>
                <input
                  type="text"
                  value={formData.links.privacyPolicy}
                  onChange={(e) => setFormData({...formData, links: {...formData.links, privacyPolicy: e.target.value}})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">使用条款链接</label>
                <input
                  type="text"
                  value={formData.links.termsOfService}
                  onChange={(e) => setFormData({...formData, links: {...formData.links, termsOfService: e.target.value}})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>
            </div>
          </div>

          {/* 品牌信息表单 */}
          <div className="border rounded-lg p-6 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">品牌信息</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">设计者</label>
              <input
                type="text"
                value={formData.branding.designedBy}
                onChange={(e) => setFormData({...formData, branding: {...formData.branding, designedBy: e.target.value}})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setIsEditing(false);
                setFormData(settings);
              }}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isSaving}
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
              disabled={isSaving}
            >
              {isSaving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FooterSettingsManager;
