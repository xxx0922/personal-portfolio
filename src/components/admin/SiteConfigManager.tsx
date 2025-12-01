import { useState, useEffect } from 'react';
import ImageUploader from '../ImageUploader';

// API 基础 URL - 从环境变量读取
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const SiteConfigManager = () => {
  const [config, setConfig] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    general: {
      siteName: '',
      siteSlogan: '',
      siteLogo: '',
      favicon: ''
    },
    homepage: {
      heroTitle: '',
      heroDescription: '',
      showHeroSection: true,
      showStatsSection: true
    },
    theme: {
      primaryColor: '',
      secondaryColor: '',
      accentColor: ''
    },
    contact: {
      showContactForm: true,
      contactEmail: ''
    }
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/site-config`);
      const data = await response.json();
      setConfig(data);
      setFormData(data);
    } catch (error) {
      console.error('Failed to load site config:', error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/site-config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await loadConfig();
        setIsEditing(false);
        alert('保存成功！');
      }
    } catch (error) {
      alert('保存失败');
    } finally {
      setIsSaving(false);
    }
  };

  if (!config) {
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
        <h2 className="text-2xl font-bold">网站配置</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            编辑配置
          </button>
        )}
      </div>

      {!isEditing ? (
        <div className="space-y-6">
          {/* 基本信息 */}
          <div className="border rounded-lg p-6 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">基本信息</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">网站名称：</label>
                <p className="text-gray-900">{config.general.siteName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">网站标语：</label>
                <p className="text-gray-900">{config.general.siteSlogan}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Logo：</label>
                {config.general.siteLogo ? (
                  <img src={config.general.siteLogo} alt="Logo" className="h-16 mt-2" />
                ) : (
                  <p className="text-gray-500">未设置</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Favicon：</label>
                <p className="text-gray-900">{config.general.favicon}</p>
              </div>
            </div>
          </div>

          {/* 首页配置 */}
          <div className="border rounded-lg p-6 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">首页配置</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Hero区标题：</label>
                <p className="text-gray-900">{config.homepage.heroTitle}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Hero区描述：</label>
                <p className="text-gray-900">{config.homepage.heroDescription}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">显示Hero区：</label>
                <p className="text-gray-900">{config.homepage.showHeroSection ? '是' : '否'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">显示统计区：</label>
                <p className="text-gray-900">{config.homepage.showStatsSection ? '是' : '否'}</p>
              </div>
            </div>
          </div>

          {/* 主题配置 */}
          <div className="border rounded-lg p-6 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">主题配置</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <label className="text-sm font-medium text-gray-700 w-32">主色调：</label>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded border-2 border-gray-300" style={{backgroundColor: config.theme.primaryColor}}></div>
                  <span className="text-gray-900">{config.theme.primaryColor}</span>
                </div>
              </div>
              <div className="flex items-center">
                <label className="text-sm font-medium text-gray-700 w-32">次要颜色：</label>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded border-2 border-gray-300" style={{backgroundColor: config.theme.secondaryColor}}></div>
                  <span className="text-gray-900">{config.theme.secondaryColor}</span>
                </div>
              </div>
              <div className="flex items-center">
                <label className="text-sm font-medium text-gray-700 w-32">强调色：</label>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded border-2 border-gray-300" style={{backgroundColor: config.theme.accentColor}}></div>
                  <span className="text-gray-900">{config.theme.accentColor}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 联系配置 */}
          <div className="border rounded-lg p-6 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">联系配置</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">显示联系表单：</label>
                <p className="text-gray-900">{config.contact.showContactForm ? '是' : '否'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">联系邮箱：</label>
                <p className="text-gray-900">{config.contact.contactEmail}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 基本信息表单 */}
          <div className="border rounded-lg p-6 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">基本信息</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">网站名称</label>
                <input
                  type="text"
                  value={formData.general.siteName}
                  onChange={(e) => setFormData({...formData, general: {...formData.general, siteName: e.target.value}})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">网站标语</label>
                <input
                  type="text"
                  value={formData.general.siteSlogan}
                  onChange={(e) => setFormData({...formData, general: {...formData.general, siteSlogan: e.target.value}})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">网站Logo</label>
                {formData.general.siteLogo && (
                  <div className="mb-3">
                    <img src={formData.general.siteLogo} alt="Logo" className="h-16 border rounded" />
                  </div>
                )}
                <ImageUploader
                  currentImage={formData.general.siteLogo}
                  onUploadSuccess={(url) => setFormData({...formData, general: {...formData.general, siteLogo: url}})}
                  label="上传Logo"
                />
                <div className="mt-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">或输入Logo URL</label>
                  <input
                    type="url"
                    value={formData.general.siteLogo}
                    onChange={(e) => setFormData({...formData, general: {...formData.general, siteLogo: e.target.value}})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Favicon路径</label>
                <input
                  type="text"
                  value={formData.general.favicon}
                  onChange={(e) => setFormData({...formData, general: {...formData.general, favicon: e.target.value}})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                  placeholder="/favicon.ico"
                />
              </div>
            </div>
          </div>

          {/* 首页配置表单 */}
          <div className="border rounded-lg p-6 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">首页配置</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hero区标题</label>
                <input
                  type="text"
                  value={formData.homepage.heroTitle}
                  onChange={(e) => setFormData({...formData, homepage: {...formData.homepage, heroTitle: e.target.value}})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hero区描述</label>
                <textarea
                  value={formData.homepage.heroDescription}
                  onChange={(e) => setFormData({...formData, homepage: {...formData.homepage, heroDescription: e.target.value}})}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.homepage.showHeroSection}
                  onChange={(e) => setFormData({...formData, homepage: {...formData.homepage, showHeroSection: e.target.checked}})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">显示Hero区块</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.homepage.showStatsSection}
                  onChange={(e) => setFormData({...formData, homepage: {...formData.homepage, showStatsSection: e.target.checked}})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">显示统计区块</label>
              </div>
            </div>
          </div>

          {/* 主题配置表单 */}
          <div className="border rounded-lg p-6 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">主题配置</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">主色调</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.theme.primaryColor}
                    onChange={(e) => setFormData({...formData, theme: {...formData.theme, primaryColor: e.target.value}})}
                    className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.theme.primaryColor}
                    onChange={(e) => setFormData({...formData, theme: {...formData.theme, primaryColor: e.target.value}})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">次要颜色</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.theme.secondaryColor}
                    onChange={(e) => setFormData({...formData, theme: {...formData.theme, secondaryColor: e.target.value}})}
                    className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.theme.secondaryColor}
                    onChange={(e) => setFormData({...formData, theme: {...formData.theme, secondaryColor: e.target.value}})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                    placeholder="#10B981"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">强调色</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.theme.accentColor}
                    onChange={(e) => setFormData({...formData, theme: {...formData.theme, accentColor: e.target.value}})}
                    className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.theme.accentColor}
                    onChange={(e) => setFormData({...formData, theme: {...formData.theme, accentColor: e.target.value}})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                    placeholder="#F59E0B"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 联系配置表单 */}
          <div className="border rounded-lg p-6 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">联系配置</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.contact.showContactForm}
                  onChange={(e) => setFormData({...formData, contact: {...formData.contact, showContactForm: e.target.checked}})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">显示联系表单</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">联系邮箱</label>
                <input
                  type="email"
                  value={formData.contact.contactEmail}
                  onChange={(e) => setFormData({...formData, contact: {...formData.contact, contactEmail: e.target.value}})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setIsEditing(false);
                setFormData(config);
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

export default SiteConfigManager;
