import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getNavigation } from '../services/dataService';

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
}

const Navbar = ({ personalInfo }: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [navItems, setNavItems] = useState<NavigationItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // 从API加载导航菜单
    const loadNavigation = async () => {
      const items = await getNavigation();
      if (items && items.length > 0) {
        setNavItems(items);
      } else {
        // 使用默认导航
        setNavItems([
          { id: '1', label: '首页', path: '/', order: 0, visible: true, isExternal: false },
          { id: '2', label: '关于我', path: '/about', order: 1, visible: true, isExternal: false },
          { id: '3', label: '博客文章', path: '#articles', order: 2, visible: true, isExternal: false },
          { id: '10', label: '新闻动态', path: '#news', order: 3, visible: true, isExternal: false },
          { id: '4', label: '项目经验', path: '#projects', order: 4, visible: true, isExternal: false },
          { id: '5', label: '专业技能', path: '#skills', order: 5, visible: true, isExternal: false },
          { id: '6', label: '影音书籍', path: '#media', order: 6, visible: true, isExternal: false },
          { id: '7', label: '精彩瞬间', path: '#photos', order: 7, visible: true, isExternal: false },
          { id: '8', label: '知识文档', path: '#documents', order: 8, visible: true, isExternal: false },
          { id: '9', label: '联系我', path: '#contact', order: 9, visible: true, isExternal: false }
        ]);
      }
    };
    loadNavigation();
  }, []);

  const scrollToSection = (path: string) => {
    const element = document.querySelector(path);
    if (element) {
      const offset = 80; // 导航栏高度
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

    // 如果是外部链接，在新标签页打开
    if (isExternal) {
      if (path.startsWith('http')) {
        window.open(path, '_blank');
      } else {
        navigate(path);
      }
      setIsMobileMenuOpen(false);
      return;
    }

    // 如果是首页路径 "/"，直接导航到首页
    if (path === '/') {
      navigate('/');
      setIsMobileMenuOpen(false);
      return;
    }

    // 如果是hash路径（如 #projects），处理滚动
    if (path.startsWith('#')) {
      // 如果在首页，直接滚动
      if (window.location.pathname === '/' || window.location.pathname === '') {
        scrollToSection(path);
      } else {
        // 如果在其他页面，先跳转到首页，然后滚动
        navigate('/');
        setTimeout(() => {
          scrollToSection(path);
        }, 100);
      }
      return;
    }

    // 其他路径，直接使用 navigate
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white shadow-md'
          : 'bg-white/95 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Name */}
          <div className="flex items-center space-x-3">
            {personalInfo?.avatar && (
              <img
                src={personalInfo.avatar}
                alt={personalInfo.name}
                className="w-10 h-10 rounded-full border-2 border-primary-500"
              />
            )}
            <Link
              to="/"
              className="text-xl font-bold text-gray-900 hover:text-primary-600 transition"
            >
              {personalInfo?.name || '个人网站'}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.path}
                onClick={(e) => handleNavClick(e, item.path, item.isExternal)}
                className="px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors font-medium"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition"
              aria-label="搜索"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Admin Login */}
            <Link
              to="/admin/login"
              className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              管理员
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-gray-600 hover:text-primary-600"
              aria-label="搜索"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-primary-600"
              aria-label="菜单"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 bg-white">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={item.path}
                  onClick={(e) => handleNavClick(e, item.path, item.isExternal)}
                  className="px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition"
                >
                  {item.label}
                </a>
              ))}
              <Link
                to="/admin/login"
                className="mx-4 mt-2 px-4 py-2 text-center bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                管理员登录
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Search Modal */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20"
          onClick={() => setIsSearchOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <div className="flex items-center space-x-3 mb-4">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="搜索项目、文档、媒体..."
                  className="flex-1 text-lg outline-none"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const query = e.currentTarget.value;
                      navigate(`/search?q=${encodeURIComponent(query)}`);
                      setIsSearchOpen(false);
                    }
                  }}
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="text-sm text-gray-500 border-t pt-3">
                按 <kbd className="px-2 py-1 bg-gray-100 border rounded">Enter</kbd> 搜索
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
