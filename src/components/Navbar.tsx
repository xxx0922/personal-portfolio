import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMusic } from '../contexts/MusicContext';

interface NavbarProps {
  personalInfo?: {
    name: string;
    avatar: string;
  };
}

interface NavigationItem {
  id: string;
  label: string;
  path: string;
  order: number;
  visible: boolean;
  isExternal: boolean;
  icon?: string;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002';

const Navbar = ({ personalInfo }: NavbarProps) => {
  const navigate = useNavigate();
  const { togglePlay, isPlaying } = useMusic();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // 静态导航菜单 - 直接作为默认 state
  const [navItems, setNavItems] = useState<NavigationItem[]>([
    { id: '1', label: '首页', path: '/', order: 0, visible: true, isExternal: false, icon: '🏠' },
    { id: '2', label: '产品', path: '/products', order: 1, visible: true, isExternal: false, icon: '📁' },
    { id: '3', label: '工具', path: '/tools', order: 2, visible: true, isExternal: false, icon: '🔧' },
    { id: '4', label: '后台', path: '/admin', order: 3, visible: true, isExternal: false, icon: '⚙️' }
  ]);

  // 获取头像 URL（处理相对路径）
  const getAvatarUrl = () => {
    if (!personalInfo?.avatar) return '';
    if (personalInfo.avatar.startsWith('http://') || personalInfo.avatar.startsWith('https://')) {
      return personalInfo.avatar;
    }
    return `${BACKEND_URL}${personalInfo.avatar}`;
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (path: string) => {
    const element = document.querySelector(path);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setIsMobileMenuOpen(false);
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string, isExternal?: boolean) => {
    e.preventDefault();

    if (isExternal) {
      if (path.startsWith('http')) {
        window.open(path, '_blank');
      } else {
        navigate(path);
      }
      setIsMobileMenuOpen(false);
      return;
    }

    if (path === '/') {
      navigate('/');
      setIsMobileMenuOpen(false);
      return;
    }

    if (path.startsWith('#')) {
      if (window.location.pathname === '/' || window.location.pathname === '') {
        scrollToSection(path);
      } else {
        navigate('/');
        setTimeout(() => {
          scrollToSection(path);
        }, 100);
      }
      return;
    }

    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`clay-navbar fixed top-0 left-0 right-0 z-50 transition-shadow duration-300 ${
        isScrolled ? 'shadow-lg' : ''
      }`}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          <div className="flex items-center space-x-6 min-w-[300px]">
            {personalInfo?.avatar && (
              <img
                src={getAvatarUrl()}
                alt={personalInfo.name}
                className="w-16 h-16 rounded-full border-2 border-clay-medium shadow-lg flex-shrink-0"
              />
            )}
            <Link
              to="/"
              className="text-4xl font-bold clay-title hover:opacity-80 transition-all duration-300 whitespace-nowrap"
            >
              {personalInfo?.name || '个人网站'}
            </Link>
          </div>

          <div className="hidden lg:flex items-center space-x-6">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.path}
                onClick={(e) => handleNavClick(e, item.path, item.isExternal)}
                className="group relative px-12 py-4 clay-subtitle hover:text-clay-base rounded-xl transition-all duration-300 font-bold flex items-center gap-3"
              >
                {item.icon && <span className="text-4xl">{item.icon}</span>}
                <span className="text-3xl whitespace-nowrap">{item.label}</span>
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-clay-base to-sky-400 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-6">
          </div>

          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-3 clay-subtitle hover:text-clay-base"
              aria-label="菜单"
            >
              {isMobileMenuOpen ? (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 py-4 clay-navbar">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={item.path}
                  onClick={(e) => handleNavClick(e, item.path, item.isExternal)}
                  className="px-6 py-4 clay-subtitle hover:bg-white/10 hover:text-clay-base rounded-xl transition flex items-center gap-3"
                >
                  {item.icon && <span className="text-4xl">{item.icon}</span>}
                  <span className="text-3xl">{item.label}</span>
                </a>
              ))}
              <button
                onClick={() => {
                  togglePlay();
                  setIsMobileMenuOpen(false);
                }}
                className="mx-4 mt-2 px-6 py-4 text-center clay-button clay-button-secondary rounded-xl flex items-center justify-center gap-3"
              >
                {isPlaying ? (
                  <>
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                    </svg>
                    暂停音乐
                  </>
                ) : (
                  <>
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                    </svg>
                    播放音乐
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
