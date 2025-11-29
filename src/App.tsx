import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navigation from './components/Navigation';
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* 管理后台路由 */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminPage />} />

            {/* 前台路由 */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/project/:id" element={<ProjectDetailPage />} />
            <Route path="/experience/:id" element={<ExperienceDetailPage />} />
            <Route path="/article/:id" element={<ArticleDetailPage />} />
            <Route path="/news/:id" element={<NewsDetailPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/achievements" element={
              <>
                <Navigation />
                <AchievementsPage />
              </>
            } />
            <Route path="/lifestyle" element={
              <>
                <Navigation />
                <LifestylePage />
              </>
            } />
            <Route path="/knowledge" element={
              <>
                <Navigation />
                <KnowledgePage />
              </>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
