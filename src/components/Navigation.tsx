import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from './LoginModal';
import { getPhotos } from '../services/dataService';
import type { Photo } from '../types';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 新的导航配置
  const navItems = [
    { path: '/boot', label: '首页', icon: '🏠' },
    { path: '/products', label: '产品', icon: '📁' },
    { path: '/tools', label: '工具', icon: '🔧' },
    { path: '/admin', label: '后台', icon: '⚙️' }
  ];

  // 加载照片墙数据
  useEffect(() => {
    const loadPhotos = async () => {
      try {
        const photosData = await getPhotos();
        setPhotos(photosData);
      } catch (error) {
        console.error('Failed to load photos:', error);
      }
    };
    loadPhotos();
  }, []);

  // 音乐播放控制
  useEffect(() => {
    const currentTrack = localStorage.getItem('currentTrack');
    if (currentTrack) {
      const track = JSON.parse(currentTrack);
      if (!audioRef.current) {
        audioRef.current = new Audio(track.url);
        audioRef.current.loop = true;
      }
      audioRef.current.onplay = () => setIsPlaying(true);
      audioRef.current.onpause = () => setIsPlaying(false);
    }
  }, []);

  const toggleMusic = () => {
    if (!audioRef.current) {
      const currentTrack = localStorage.getItem('currentTrack');
      if (currentTrack) {
        const track = JSON.parse(currentTrack);
        audioRef.current = new Audio(track.url);
        audioRef.current.loop = true;
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
        return;
      }
    }
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <nav className="clay-navbar fixed top-0 left-0 right-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          {/* Logo + 照片墙 */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">FS</span>
              </div>
              <Link
                to="/"
                className="text-4xl font-bold clay-title hover:opacity-80 transition-all duration-300"
              >
                丰生水起
              </Link>
            </div>

            {/* 滚动照片墙 */}
            {photos.length > 0 && (
              <div className="hidden md:flex items-center overflow-hidden w-72 h-16 rounded-xl bg-white/10 backdrop-blur-sm">
                <div className="flex animate-scroll-photos">
                  {[...photos, ...photos].slice(0, 8).map((photo, index) => (
                    <div
                      key={`${photo.id}-${index}`}
                      className="flex-shrink-0 w-14 h-14 mx-1 rounded-lg overflow-hidden border border-white/20 hover:border-white/40 transition-all"
                    >
                      <img
                        src={photo.url}
                        alt={photo.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="group relative px-8 py-4 clay-subtitle hover:text-clay-base rounded-xl transition-all duration-300 font-bold flex items-center gap-3"
              >
                <span className="text-4xl">{item.icon}</span>
                <span className="text-3xl">{item.label}</span>
                {/* 下划线效果 */}
                <span className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-clay-base to-sky-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-6">
            {/* 音乐按钮 - 只有图标 */}
            <button
              onClick={toggleMusic}
              className={`p-4 clay-subtitle hover:text-clay-base hover:bg-white/10 rounded-xl transition-all duration-300 ${
                isPlaying ? 'text-clay-base animate-pulse' : ''
              }`}
              aria-label="背景音乐"
              title={isPlaying ? '暂停音乐' : '播放音乐'}
            >
              {isPlaying ? (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
              ) : (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
              )}
            </button>

            {/* 注册按钮 */}
            <Link
              to="/register"
              className="px-8 py-4 text-xl clay-button clay-button-primary rounded-xl flex items-center gap-2"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              注册
            </Link>

            {/* 登录/用户 */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <span className="text-xl text-clay-muted">{user?.username}</span>
                <button onClick={logout} className="text-lg text-clay-base hover:underline">
                  退出
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="text-xl clay-button clay-button-secondary rounded-xl px-8 py-4"
              >
                登录
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              aria-expanded="false"
            >
              <span className="sr-only">打开主菜单</span>
              {!isMobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 py-4">
          <div className="flex flex-col space-y-6 px-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-6 px-10 py-10 rounded-lg text-5xl font-bold clay-subtitle hover:bg-white/10 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="text-6xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}

            {/* 音乐控制 - 移动端 */}
            <button
              onClick={() => {
                toggleMusic();
                setIsMobileMenuOpen(false);
              }}
              className="mx-2 mt-2 px-10 py-10 text-center clay-button clay-button-secondary rounded-lg flex items-center justify-center gap-6"
            >
              {isPlaying ? (
                <>
                  <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                  </svg>
                  暂停音乐
                </>
              ) : (
                <>
                  <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                  </svg>
                  播放音乐
                </>
              )}
            </button>

            {/* 注册按钮 - 移动端 */}
            <Link
              to="/register"
              className="mx-2 mt-2 px-10 py-10 text-center clay-button clay-button-primary rounded-lg flex items-center justify-center gap-4"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              注册
            </Link>

            {/* Mobile User Authentication */}
            <div className="border-t border-white/10 pt-4 mt-4">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="px-3 py-2 text-4xl text-clay-muted">
                    欢迎，{user?.username}
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-3 text-3xl font-medium text-red-400 hover:bg-red-500/10 rounded-lg"
                  >
                    退出登录
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setShowLoginModal(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-3 text-3xl font-medium text-clay-base hover:bg-white/10 rounded-lg"
                >
                  登录
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </nav>
  );
};

export default Navigation;
