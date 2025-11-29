import { useAuth } from '../contexts/AuthContext';
import type { ReactNode } from 'react';

interface ProtectedContentProps {
  children: ReactNode;
  permission?: string;
  fallback?: ReactNode;
}

const ProtectedContent = ({ children, permission, fallback }: ProtectedContentProps) => {
  const { hasPermission, isAuthenticated } = useAuth();

  // 如果没有指定权限要求，只检查是否已登录
  if (!permission) {
    return isAuthenticated ? <>{children}</> : <>{fallback || null}</>;
  }

  // 检查特定权限
  if (hasPermission(permission)) {
    return <>{children}</>;
  }

  return <>{fallback || null}</>;
};

export default ProtectedContent;