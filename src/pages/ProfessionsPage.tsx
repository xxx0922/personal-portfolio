import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Profession {
  id: string;
  name: string;
  description: string;
  icon: string;
  skills: Array<{
    id: string;
    name: string;
    level: number;
  }>;
  certifications: Array<{
    id: string;
    name: string;
    date: string;
  }>;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

const ProfessionsPage = () => {
  const navigate = useNavigate();
  const [professions, setProfessions] = useState<Profession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfessions = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/professions`);
        const data = await response.json();
        setProfessions(data);
      } catch (error) {
        console.error('Failed to load professions:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProfessions();
  }, []);

  // 键盘快捷键支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        navigate('/');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  // 专业配色方案
  const professionStyles = {
    'AI': {
      gradient: 'from-cyan-500 to-blue-500',
      glow: 'shadow-cyan-500/30',
      icon: '🤖'
    },
    '弱电': {
      gradient: 'from-amber-500 to-orange-500',
      glow: 'shadow-amber-500/30',
      icon: '🔌'
    }
  };

  const getStyleForProfession = (name: string) => {
    if (name.includes('AI')) return professionStyles['AI'];
    if (name.includes('弱电')) return professionStyles['弱电'];
    return professionStyles['AI']; // 默认
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/80 text-lg">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* 动态背景装饰 */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/20 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* 星空背景 */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: `url('/背景星空.png')`,
          }}
        ></div>
      </div>

      {/* 内容 */}
      <div className="relative z-10">
        {/* 顶部导航栏简化版 */}
        <div className="pt-8 px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/')}
            aria-label="返回首页"
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-8"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">返回首页</span>
          </button>
        </div>

        <main className="pt-8 pb-12 px-4 sm:px-6 lg:px-8">
          {/* 页面标题 */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-xl">
                <span className="text-4xl">🎓</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
              专业领域
            </h1>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              专业技能与资质认证，展现专业实力
            </p>
          </div>

          {/* 专业列表 - 两个专业并排显示 */}
          {professions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-white/60 text-lg">暂无专业数据</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {professions.map((profession) => {
                const style = getStyleForProfession(profession.name);
                return (
                  <div
                    key={profession.id}
                    className={`group relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${style.glow}`}
                  >
                    {/* 顶部渐变条 */}
                    <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${style.gradient} rounded-t-3xl`}></div>

                    {/* 图标 - 放大显示 */}
                    <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${style.gradient} flex items-center justify-center shadow-xl mb-6 group-hover:scale-110 transition-transform duration-300 mx-auto`}>
                      <span className="text-6xl">{profession.icon}</span>
                    </div>

                    {/* 标题 */}
                    <h3 className="text-2xl font-bold text-white mb-3 text-center">{profession.name}</h3>

                    {/* 描述 */}
                    <p className="text-white/60 mb-8 leading-relaxed text-center">{profession.description}</p>

                    {/* 技能列表 */}
                    {profession.skills && profession.skills.length > 0 && (
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-4 justify-center">
                          <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <h4 className="text-sm font-semibold text-white/80">核心技能</h4>
                        </div>
                        <div className="space-y-3">
                          {profession.skills.map((skill) => (
                            <div key={skill.id} className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-2">
                              <span className="text-white/80 text-sm">{skill.name}</span>
                              <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full ${
                                      i < skill.level
                                        ? `bg-gradient-to-r ${style.gradient}`
                                        : 'bg-white/10'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 证书列表 */}
                    {profession.certifications && profession.certifications.length > 0 && (
                      <div className="pt-6 border-t border-white/10 mt-6">
                        <div className="flex items-center gap-2 mb-3 justify-center">
                          <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                          </svg>
                          <h4 className="text-sm font-semibold text-white/80">资质证书</h4>
                        </div>
                        <div className="space-y-2">
                          {profession.certifications.map((cert) => (
                            <div key={cert.id} className="flex items-center gap-2 text-sm bg-white/5 rounded-lg px-3 py-2">
                              <span className="text-purple-400">▹</span>
                              <span className="text-white/70 flex-1">{cert.name}</span>
                              <span className="text-white/40 text-xs">{cert.date}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProfessionsPage;
