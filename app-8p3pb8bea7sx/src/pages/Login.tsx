import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { LogIn } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { signInWithUsername, signUpWithUsername } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: string })?.from || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error('请输入用户名和密码');
      return;
    }

    // 验证用户名格式（只允许字母、数字和下划线）
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      toast.error('用户名只能包含字母、数字和下划线');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signInWithUsername(username, password);
        if (error) {
          toast.error('登录失败：' + error.message);
        } else {
          toast.success('登录成功');
          navigate(from, { replace: true });
        }
      } else {
        const { error } = await signUpWithUsername(username, password);
        if (error) {
          toast.error('注册失败：' + error.message);
        } else {
          toast.success('注册成功，正在登录...');
          // 注册成功后自动登录
          setTimeout(() => {
            navigate(from, { replace: true });
          }, 1000);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <LogIn className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {isLogin ? '登录' : '注册'}
          </CardTitle>
          <CardDescription>
            无锡灵山景区交通监控仪表盘
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                type="text"
                placeholder="请输入用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                autoComplete="username"
              />
              <p className="text-xs text-muted-foreground">
                只能包含字母、数字和下划线
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {isLogin ? '登录中...' : '注册中...'}
                </>
              ) : (
                <>{isLogin ? '登录' : '注册'}</>
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline"
              disabled={loading}
            >
              {isLogin ? '没有账号？立即注册' : '已有账号？立即登录'}
            </button>
          </div>
          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              disabled={loading}
            >
              返回首页
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
