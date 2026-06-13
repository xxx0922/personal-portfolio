import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPhotos } from '../services/dataService';
import type { Photo } from '../types';
import LazyImage from '../components/LazyImage';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

// 获取完整的图片 URL
const getImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${API_BASE_URL.replace('/api', '')}${url}`;
};

// 相册密码配置 - 只有工作和生活的照片需要密码
const ALBUM_PASSWORD_KEY = 'albumPasswordVerified';
const ALBUM_PASSWORD = 'Xue0922@'; // 相册密码（与管理后台一致）
const PROTECTED_CATEGORIES = ['工作', '生活']; // 需要密码保护的分类

const PhotosPage = () => {
  const { category, folder } = useParams<{ category: string; folder: string }>();
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(true);

  // 密码验证状态
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [needsProtection, setNeedsProtection] = useState(false);

  // 检查当前分类是否需要密码保护
  const checkPasswordProtection = (currentCategory: string | undefined) => {
    // 只有明确访问"工作"或"生活"分类时才需要密码
    // "全部"视图不需要密码
    return currentCategory ? PROTECTED_CATEGORIES.includes(currentCategory) : false;
  };

  useEffect(() => {
    loadPhotos();
  }, []);

  // 当照片加载完成且分类变化时，检查是否需要密码保护
  useEffect(() => {
    if (photos.length === 0) return;

    const protectionNeeded = checkPasswordProtection(category);
    setNeedsProtection(protectionNeeded);

    if (protectionNeeded) {
      const verified = sessionStorage.getItem(ALBUM_PASSWORD_KEY);
      if (verified === 'true') {
        setIsPasswordVerified(true);
        setShowPasswordModal(false);
      } else {
        setIsPasswordVerified(false);
        setShowPasswordModal(true);
      }
    } else {
      // 不需要密码保护（包括全部视图和其他分类）
      setIsPasswordVerified(true);
      setShowPasswordModal(false);
    }
  }, [category, photos]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ALBUM_PASSWORD) {
      sessionStorage.setItem(ALBUM_PASSWORD_KEY, 'true');
      setIsPasswordVerified(true);
      setShowPasswordModal(false);
      setPasswordError('');
    } else {
      setPasswordError('密码错误，请重试');
      setPasswordInput('');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(ALBUM_PASSWORD_KEY);
    setIsPasswordVerified(false);
    setShowPasswordModal(true);
    setPasswordInput('');
    setPasswordError('');
  };

  // 判断当前视图是否显示密码退出按钮
  const showLogoutButton = isPasswordVerified && needsProtection;

  const loadPhotos = async () => {
    try {
      const data = await getPhotos();
      setPhotos(data);

      // 提取所有分类，并将"活动"放在第一个
      const allCategories = Array.from(new Set(data.map((p: Photo) => p.category).filter(Boolean))) as string[];
      const sortedCategories = allCategories.sort((a, b) => {
        if (a === '活动') return -1;
        if (b === '活动') return 1;
        return 0;
      });
      setCategories(sortedCategories);
    } catch (error) {
      console.error('Failed to load photos:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取当前分类下的所有文件夹
  const getCurrentCategoryFolders = () => {
    if (!category) return [];
    return Array.from(new Set(
      photos
        .filter(p => p.category === category)
        .map(p => p.folder)
        .filter(Boolean)
    )) as string[];
  };

  const currentCategoryFolders = getCurrentCategoryFolders();

  // 根据分类和文件夹筛选照片
  let filteredPhotos = photos;
  if (category) {
    filteredPhotos = filteredPhotos.filter(p => p.category === category);
  }
  if (folder) {
    filteredPhotos = filteredPhotos.filter(p => p.folder === folder);
  }

  // 当前选中的分类
  const currentCategory = category || '全部';
  // 当前选中的文件夹
  const currentFolder = folder || '全部';

  // 键盘快捷键支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedPhoto) return;

      if (e.key === 'Escape') {
        setSelectedPhoto(null);
      } else if (e.key === 'ArrowLeft') {
        const currentIndex = filteredPhotos.findIndex(p => p.id === selectedPhoto.id);
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : filteredPhotos.length - 1;
        setSelectedPhoto(filteredPhotos[prevIndex]);
      } else if (e.key === 'ArrowRight') {
        const currentIndex = filteredPhotos.findIndex(p => p.id === selectedPhoto.id);
        const nextIndex = currentIndex < filteredPhotos.length - 1 ? currentIndex + 1 : 0;
        setSelectedPhoto(filteredPhotos[nextIndex]);
      }
    };

    if (selectedPhoto) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto, filteredPhotos]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 密码验证模态框 - 仅当访问受保护的分类时显示 */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 transform transition-all">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">🔒 相册密码验证</h2>
              <p className="text-gray-600 text-sm">
                分类「<span className="text-emerald-600 font-semibold">{category}</span>」需要密码验证
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-center text-lg tracking-widest"
                  placeholder="请输入密码"
                  autoFocus
                  autoComplete="off"
                />
              </div>

              {passwordError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center text-sm">
                  {passwordError}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all transform hover:scale-105 shadow-lg"
              >
                验证密码
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => navigate('/')}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                返回首页
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* 返回按钮 */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">返回首页</span>
          </button>
        </div>

        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
            活动瞬间
          </h1>
          <p className="text-gray-600">记录生活美好时刻</p>
        </div>

        {/* 分类标签 */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          <button
            onClick={() => navigate('/photos')}
            className={`px-6 py-2 rounded-full transition-all ${
              currentCategory === '全部'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
            }`}
          >
            全部
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => navigate(`/photos/category/${cat}`)}
              className={`px-6 py-2 rounded-full transition-all ${
                currentCategory === cat
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 文件夹标签（当选择了分类且该分类下有文件夹时显示） */}
        {category && currentCategoryFolders.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
              onClick={() => navigate(`/photos/category/${category}`)}
              className={`px-4 py-1.5 rounded-full text-sm transition-all ${
                currentFolder === '全部'
                  ? 'bg-emerald-500 text-white shadow'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border'
              }`}
            >
              全部
            </button>
            {currentCategoryFolders.map(fol => (
              <button
                key={fol}
                onClick={() => navigate(`/photos/category/${category}/folder/${fol}`)}
                className={`px-4 py-1.5 rounded-full text-sm transition-all ${
                  currentFolder === fol
                    ? 'bg-emerald-500 text-white shadow'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border'
                }`}
              >
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  {fol}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* 照片数量 */}
        <div className="text-center mb-6 flex justify-between items-center">
          <span className="text-gray-600">
            {currentCategory === '全部' ? '全部' : currentCategory}
            {currentFolder !== '全部' && ` · ${currentFolder}`}
            <span className="font-semibold text-emerald-600 mx-1">{filteredPhotos.length}</span>
            张照片
          </span>
          {showLogoutButton && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-full transition-all text-sm text-white shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              退出密码
            </button>
          )}
        </div>

        {/* 照片网格 - 仅在密码验证通过或不需要密码时显示 */}
        {(isPasswordVerified || !needsProtection) && (
          loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📷</div>
            <p className="text-gray-600">暂无照片</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all"
                onClick={() => setSelectedPhoto(photo)}
              >
                <LazyImage
                  src={getImageUrl(photo.url)}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-semibold text-base truncate">{photo.title}</h3>
                    {photo.description && (
                      <p className="text-gray-300 text-sm truncate">{photo.description}</p>
                    )}
                  </div>
                </div>
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-gray-700">
                    {photo.category}
                  </div>
                  {photo.folder && (
                    <div className="bg-emerald-500/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-white flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      {photo.folder}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* 照片 Lightbox 全屏预览 - 仅在密码验证后或不需要密码时显示 */}
        {(isPasswordVerified || !needsProtection) && selectedPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center"
          onClick={() => setSelectedPhoto(null)}
        >
          {/* 关闭按钮 */}
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-6 right-6 z-10 w-14 h-14 bg-red-500 hover:bg-red-600 rounded-full shadow-xl flex items-center justify-center transition transform hover:scale-110"
            aria-label="关闭"
            title="关闭 (Esc)"
          >
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* 上一张按钮 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              const currentIndex = filteredPhotos.findIndex(p => p.id === selectedPhoto.id);
              const prevIndex = currentIndex > 0 ? currentIndex - 1 : filteredPhotos.length - 1;
              setSelectedPhoto(filteredPhotos[prevIndex]);
            }}
            className="absolute left-6 z-10 w-14 h-14 bg-white bg-opacity-30 hover:bg-opacity-50 rounded-full shadow-xl flex items-center justify-center transition transform hover:scale-110"
            aria-label="上一张"
            title="上一张 (←)"
          >
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* 下一张按钮 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              const currentIndex = filteredPhotos.findIndex(p => p.id === selectedPhoto.id);
              const nextIndex = currentIndex < filteredPhotos.length - 1 ? currentIndex + 1 : 0;
              setSelectedPhoto(filteredPhotos[nextIndex]);
            }}
            className="absolute right-6 z-10 w-14 h-14 bg-white bg-opacity-30 hover:bg-opacity-50 rounded-full shadow-xl flex items-center justify-center transition transform hover:scale-110"
            aria-label="下一张"
            title="下一张 (→)"
          >
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* 图片容器 */}
          <div
            className="w-full h-full flex items-center justify-center cursor-pointer p-4"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPhoto(null);
            }}
          >
            <img
              src={getImageUrl(selectedPhoto.url)}
              alt={selectedPhoto.title}
              className="max-w-full max-h-full object-contain hover:opacity-90 transition-opacity"
              style={{ maxHeight: '90vh' }}
            />
          </div>

          {/* 图片信息 */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center pointer-events-none">
            <h3 className="text-xl font-semibold text-white mb-1">{selectedPhoto.title}</h3>
            {selectedPhoto.description && (
              <p className="text-sm text-gray-300">{selectedPhoto.description}</p>
            )}
            <span className="inline-block mt-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white">
              {selectedPhoto.category}
            </span>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default PhotosPage;
