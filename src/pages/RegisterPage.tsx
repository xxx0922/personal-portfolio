import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast, Toast } from '../hooks/useToast';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { toast, showToast, setToast } = useToast();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 验证
    if (!formData.username.trim()) {
      setError('用户名不能为空');
      return;
    }

    if (!formData.email.trim()) {
      setError('邮箱不能为空');
      return;
    }

    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('请输入有效的邮箱地址');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (formData.password.length < 6) {
      setError('密码长度至少为 6 位');
      return;
    }

    setLoading(true);

    try {
      const success = await register(formData.username, formData.email, formData.password);

      if (success) {
        showToast('注册成功！', 'success');
        navigate('/admin');
      } else {
        setError('注册失败，用户名可能已存在');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Toast toast={toast} onClose={() => setToast(null)} />
      {/* 背景 */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('/背景星空.png')`,
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-slate-900/90"></div>
      </div>

      {/* 注册表单 */}
      <div className="relative z-10 w-full max-w-md">
        <div className="clay-card p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold clay-title mb-2">创建账号</h1>
            <p className="text-clay-muted">注册后即可访问更多内容</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium clay-subtitle mb-2">
                用户名
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 clay-input rounded-lg"
                placeholder="请输入用户名"
              />
            </div>

            <div>
              <label className="block text-sm font-medium clay-subtitle mb-2">
                邮箱
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 clay-input rounded-lg"
                placeholder="请输入邮箱"
              />
            </div>

            <div>
              <label className="block text-sm font-medium clay-subtitle mb-2">
                密码
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 clay-input rounded-lg"
                placeholder="请输入密码"
              />
            </div>

            <div>
              <label className="block text-sm font-medium clay-subtitle mb-2">
                确认密码
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 clay-input rounded-lg"
                placeholder="请再次输入密码"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 clay-button clay-button-primary rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '注册中...' : '注册'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-clay-muted text-sm">
              已有账号？{' '}
              <Link to="/admin/login" className="text-clay-base hover:underline">
                立即登录
              </Link>
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link to="/" className="text-clay-muted text-sm hover:text-clay-base transition">
              ← 返回首页
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
