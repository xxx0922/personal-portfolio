import { useState, useEffect } from 'react';
import ImageUploader from '../ImageUploader';

// API 基础 URL - 从环境变量读取
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const SeoSettingsManager = () => {
  const [settings, setSettings] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    basic: {
      siteTitle: '',
      siteDescription: '',
      keywords: [] as string[]
    },
    og: {
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      ogUrl: ''
    },
    verification: {
      googleSiteVerification: '',
      baiduSiteVerification: '',
      bingSiteVerification: ''
    }
  });

  const [keywordInput, setKeywordInput] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/seo-settings`);
      const data = await response.json();
      setSettings(data);
      setFormData(data);
    } catch (error) {
      console.error('Failed to load SEO settings:', error);
    }
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !formData.basic.keywords.includes(keywordInput.trim())) {
      setFormData({
        ...formData,
        basic: {
          ...formData.basic,
          keywords: [...formData.basic.keywords, keywordInput.trim()]
        }
      });
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setFormData({
      ...formData,
      basic: {
        ...formData.basic,
        keywords: formData.basic.keywords.filter(k => k !== keyword)
      }
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/seo-settings`, {
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
        <h2 className="text-2xl font-bold">SEO设置</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            编辑SEO设置
          </button>
        )}
      </div>

      {!isEditing ? (
        <div className="space-y-6">
          {/* 基本SEO设置 */}
          <div className="border rounded-lg p-6 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">基本SEO设置</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">网站标题：</label>
                <p className="text-gray-900">{settings.basic.siteTitle}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">网站描述：</label>
                <p className="text-gray-900">{settings.basic.siteDescription}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">关键词：</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {settings.basic.keywords.map((keyword: string, index: number) => (
                    <span key={index} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Open Graph设置 */}
          <div className="border rounded-lg p-6 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">Open Graph设置</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">OG标题：</label>
                <p className="text-gray-900">{settings.og.ogTitle || '未设置'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">OG描述：</label>
                <p className="text-gray-900">{settings.og.ogDescription || '未设置'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">OG图片：</label>
                {settings.og.ogImage ? (
                  <img src={settings.og.ogImage} alt="OG" className="h-32 mt-2 border rounded" />
                ) : (
                  <p className="text-gray-500">未设置</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">OG URL：</label>
                <p className="text-gray-900">{settings.og.ogUrl || '未设置'}</p>
              </div>
            </div>
          </div>

          {/* 网站验证 */}
          <div className="border rounded-lg p-6 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">网站验证</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Google Search Console：</label>
                <p className="text-gray-900 font-mono text-sm break-all">
                  {settings.verification.googleSiteVerification || '未设置'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">百度站长平台：</label>
                <p className="text-gray-900 font-mono text-sm break-all">
                  {settings.verification.baiduSiteVerification || '未设置'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Bing Webmaster：</label>
                <p className="text-gray-900 font-mono text-sm break-all">
                  {settings.verification.bingSiteVerification || '未设置'}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 基本SEO设置表单 */}
          <div className="border rounded-lg p-6 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">基本SEO设置</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">网站标题</label>
                <input
                  type="text"
                  value={formData.basic.siteTitle}
                  onChange={(e) => setFormData({
                    ...formData,
                    basic: { ...formData.basic, siteTitle: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                  placeholder="个人作品集"
                />
                <p className="text-xs text-gray-500 mt-1">显示在浏览器标签页和搜索结果中</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">网站描述</label>
                <textarea
                  value={formData.basic.siteDescription}
                  onChange={(e) => setFormData({
                    ...formData,
                    basic: { ...formData.basic, siteDescription: e.target.value }
                  })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                  placeholder="展示个人项目、技能和经验的个人网站"
                />
                <p className="text-xs text-gray-500 mt-1">显示在搜索结果中，建议120-160字符</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">关键词</label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                    placeholder="输入关键词后回车"
                  />
                  <button
                    type="button"
                    onClick={handleAddKeyword}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    添加
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.basic.keywords.map((keyword: string) => (
                    <span key={keyword} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center">
                      {keyword}
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(keyword)}
                        className="ml-2 text-blue-900 hover:text-red-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">帮助搜索引擎理解网站内容，建议3-5个</p>
              </div>
            </div>
          </div>

          {/* Open Graph设置表单 */}
          <div className="border rounded-lg p-6 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">Open Graph设置</h3>
            <p className="text-sm text-gray-600 mb-4">用于社交媒体分享时的展示效果（Facebook、Twitter等）</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">OG标题</label>
                <input
                  type="text"
                  value={formData.og.ogTitle}
                  onChange={(e) => setFormData({
                    ...formData,
                    og: { ...formData.og, ogTitle: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                  placeholder="个人作品集"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">OG描述</label>
                <textarea
                  value={formData.og.ogDescription}
                  onChange={(e) => setFormData({
                    ...formData,
                    og: { ...formData.og, ogDescription: e.target.value }
                  })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                  placeholder="展示个人项目、技能和经验"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">OG图片</label>
                {formData.og.ogImage && (
                  <div className="mb-3">
                    <img src={formData.og.ogImage} alt="OG预览" className="h-32 border rounded" />
                  </div>
                )}
                <ImageUploader
                  currentImage={formData.og.ogImage}
                  onUploadSuccess={(url) => setFormData({
                    ...formData,
                    og: { ...formData.og, ogImage: url }
                  })}
                  label="上传OG图片"
                />
                <div className="mt-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">或输入图片 URL</label>
                  <input
                    type="url"
                    value={formData.og.ogImage}
                    onChange={(e) => setFormData({
                      ...formData,
                      og: { ...formData.og, ogImage: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                    placeholder="https://example.com/og-image.jpg"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">建议尺寸: 1200×630px</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">OG URL</label>
                <input
                  type="url"
                  value={formData.og.ogUrl}
                  onChange={(e) => setFormData({
                    ...formData,
                    og: { ...formData.og, ogUrl: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                  placeholder="https://your-website.com"
                />
              </div>
            </div>
          </div>

          {/* 网站验证表单 */}
          <div className="border rounded-lg p-6 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">网站验证</h3>
            <p className="text-sm text-gray-600 mb-4">用于验证网站所有权，通常在各搜索引擎站长平台获取</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Google Search Console 验证码
                </label>
                <input
                  type="text"
                  value={formData.verification.googleSiteVerification}
                  onChange={(e) => setFormData({
                    ...formData,
                    verification: { ...formData.verification, googleSiteVerification: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white font-mono text-sm"
                  placeholder="google-site-verification=xxxxx"
                />
                <p className="text-xs text-gray-500 mt-1">
                  从 <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Search Console</a> 获取
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  百度站长平台验证码
                </label>
                <input
                  type="text"
                  value={formData.verification.baiduSiteVerification}
                  onChange={(e) => setFormData({
                    ...formData,
                    verification: { ...formData.verification, baiduSiteVerification: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white font-mono text-sm"
                  placeholder="baidu-site-verification=xxxxx"
                />
                <p className="text-xs text-gray-500 mt-1">
                  从 <a href="https://ziyuan.baidu.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">百度站长平台</a> 获取
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bing Webmaster 验证码
                </label>
                <input
                  type="text"
                  value={formData.verification.bingSiteVerification}
                  onChange={(e) => setFormData({
                    ...formData,
                    verification: { ...formData.verification, bingSiteVerification: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white font-mono text-sm"
                  placeholder="msvalidate.01=xxxxx"
                />
                <p className="text-xs text-gray-500 mt-1">
                  从 <a href="https://www.bing.com/webmasters" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Bing Webmaster Tools</a> 获取
                </p>
              </div>
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

export default SeoSettingsManager;
