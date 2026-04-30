import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { MusicProvider } from './contexts/MusicContext';
import ClayBootAnimation from './components/ClayBootAnimation';
import HomePage from './pages/HomePage';
import AchievementsPage from './pages/AchievementsPage';
import LifestylePage from './pages/LifestylePage';
import KnowledgePage from './pages/KnowledgePage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import SearchPage from './pages/SearchPage';
import BlogPage from './pages/BlogPage';
import NewsPage from './pages/NewsPage';
import AboutPage from './pages/AboutPage';
import ExperienceDetailPage from './pages/ExperienceDetailPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import NewsDetailPage from './pages/NewsDetailPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminPage from './pages/AdminPage';
import FourQuadrantPage from './pages/FourQuadrantPage';
import ToolsPage from './pages/ToolsPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProductFolderPage from './pages/ProductFolderPage';
import ProfessionsPage from './pages/ProfessionsPage';
import DashboardPage from './pages/DashboardPage';
import PhotosPage from './pages/PhotosPage';
import PreviewPage from './pages/PreviewPage';

// 内部组件用于路由感知
function AppRoutes() {
  const location = useLocation();
  const [showBootAnimation, setShowBootAnimation] = useState(true);

  // 仅在首页显示开机动画
  const showAnimation = location.pathname === '/' || location.pathname === '/boot';

  // 开机动画完成后的处理 - 跳转到首页
  const handleBootAnimationComplete = () => {
    setShowBootAnimation(false);
  };

  useEffect(() => {
    // 如果从首页离开，隐藏开机动画
    if (location.pathname !== '/' && location.pathname !== '/boot') {
      setShowBootAnimation(false);
    }
  }, [location]);

  return (
    <>
      {showAnimation && showBootAnimation && (
        <ClayBootAnimation onComplete={handleBootAnimationComplete} />
      )}
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* 管理后台路由 */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminPage />} />

          {/* 开机动画 */}
          <Route path="/boot" element={<ClayBootAnimation onComplete={() => window.location.href = '/'} />} />

          {/* 产品页面 */}
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/products/:categoryId/:folderId" element={<ProductFolderPage />} />
          <Route path="/products/:categoryId/:folderId/:subFolderId" element={<ProductFolderPage />} />

          {/* 专业页面 */}
          <Route path="/professions" element={<ProfessionsPage />} />

          {/* 工具页面 */}
          <Route path="/tools" element={<ToolsPage />} />

          {/* 前台路由 */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/quadrant" element={<FourQuadrantPage />} />
          <Route path="/project/:id" element={<ProjectDetailPage />} />
          <Route path="/experience/:id" element={<ExperienceDetailPage />} />
          <Route path="/article/:id" element={<ArticleDetailPage />} />
          <Route path="/news/:id" element={<NewsDetailPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/lifestyle" element={<LifestylePage />} />
          <Route path="/knowledge" element={<KnowledgePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/photos" element={<PhotosPage />} />
          <Route path="/photos/category/:category" element={<PhotosPage />} />
          <Route path="/photos/category/:category/folder/:folder" element={<PhotosPage />} />

          {/* 预览页面 */}
          <Route path="/preview" element={<PreviewPage />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <MusicProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </MusicProvider>
  );
}

export default App;
