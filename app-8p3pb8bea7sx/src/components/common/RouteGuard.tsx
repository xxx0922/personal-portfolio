import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface RouteGuardProps {
  children: React.ReactNode;
}

// Please add the pages that can be accessed without logging in to PUBLIC_ROUTES.
const PUBLIC_ROUTES = ['/login', '/403', '/404', '/', '/history', '/trends', '/upload', '/simulator'];

// 需要管理员权限的路由
const ADMIN_ROUTES = ['/admin', '/backend'];

function matchPublicRoute(path: string, patterns: string[]) {
  return patterns.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
      return regex.test(path);
    }
    return path === pattern;
  });
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;

    const isPublic = matchPublicRoute(location.pathname, PUBLIC_ROUTES);
    const isAdminRoute = matchPublicRoute(location.pathname, ADMIN_ROUTES);

    // 如果是管理员路由，检查是否登录且是管理员
    if (isAdminRoute) {
      if (!user) {
        navigate('/login', { state: { from: location.pathname }, replace: true });
        return;
      }
      if (profile?.role !== 'admin') {
        navigate('/403', { replace: true });
        return;
      }
    }

    // 如果不是公开路由且未登录，跳转到登录页
    if (!user && !isPublic) {
      navigate('/login', { state: { from: location.pathname }, replace: true });
    }
  }, [user, profile, loading, location.pathname, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}