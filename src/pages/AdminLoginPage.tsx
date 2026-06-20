import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// API 基础 URL - 从环境变量读取
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // 页面加载时：如有有效 token 直接跳转，否则停留在登录页
  React.useEffect(() => {
    const existingToken = localStorage.getItem('adminToken');
    if (existingToken) {
      fetch(`${API_BASE_URL}/auth/verify`, {
        headers: { 'Authorization': `Bearer ${existingToken}` }
      })
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(() => {
          navigate('/admin');
        })
        .catch(() => {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
        });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isRegistering ? '/auth/register' : '/auth/login';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password, email: '' })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || (isRegistering ? '注册失败' : '登录失败'));
      }

      // 保存 token
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.user));

      // 跳转到管理后台
      navigate('/admin');
    } catch (error: any) {
      setError(error.message || (isRegistering ? '注册失败，请重试' : '登录失败，请检查用户名和密码'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">管理后台</h1>
          <p className="text-gray-600">{isRegistering ? '注册管理员账户' : '请登录以继续'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              用户名
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="输入用户名"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              密码
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="输入密码"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-blue-300"
          >
            {loading ? (isRegistering ? '注册中...' : '登录中...') : (isRegistering ? '注册' : '登录')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {isRegistering ? '已有账户？去登录' : '没有账户？去注册'}
          </button>
        </div>

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
  );
}
