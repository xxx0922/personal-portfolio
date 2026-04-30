import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPersonalInfo, getSkills, getContact } from '../services/dataService';
import type { PersonalInfo, Skill, Contact } from '../types';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import LazyImage from '../components/LazyImage';
import { useSEO } from '../hooks/useSEO';
import { downloadVCard } from '../utils/vcard';

const AboutPage = () => {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'about' | 'skills' | 'photos'>('about');

  // 获取头像 URL（处理相对路径）
  const getAvatarUrl = () => {
    if (!personalInfo?.avatar) return '';
    if (personalInfo.avatar.startsWith('http://') || personalInfo.avatar.startsWith('https://')) {
      return personalInfo.avatar;
    }
    return `http://localhost:3002${personalInfo.avatar}`;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [infoData, skillsData, contactData] = await Promise.all([
          getPersonalInfo(),
          getSkills(),
          getContact()
        ]);
        setPersonalInfo(infoData);
        setSkills(skillsData);
        setContact(contactData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // SEO优化
  useSEO({
    title: personalInfo ? `关于 ${personalInfo.name}` : '关于我',
    description: personalInfo?.bio || '了解更多关于我的信息',
    keywords: '关于我, 个人简介, 技能, 联系方式',
    ogTitle: personalInfo ? `关于 ${personalInfo.name}` : '关于我',
    ogDescription: personalInfo?.bio || '了解更多关于我的信息',
    ogImage: getAvatarUrl(),
    ogUrl: window.location.href,
  });

  if (loading || !personalInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="加载中..." />
      </div>
    );
  }

  // 按分类分组技能
  const groupedSkills = skills.reduce((acc, skill) => {
    const category = skill.category || '其他';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar personalInfo={personalInfo} />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <LazyImage
              src={getAvatarUrl()}
              alt={personalInfo.name}
              className="w-32 h-32 rounded-full border-4 border-white shadow-xl mx-auto mb-6"
              effect="opacity"
            />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{personalInfo.name}</h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-6">{personalInfo.title}</p>
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <a
                href={`mailto:${contact?.email}`}
                className="inline-flex items-center px-4 py-2 bg-white text-primary-600 rounded-lg hover:bg-primary-50 transition"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                发送邮件
              </a>
              <button
                onClick={() => contact && downloadVCard(personalInfo, contact)}
                className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition border-2 border-white"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                下载名片
              </button>
            </div>
            <div className="flex justify-center space-x-4">
              <span className="flex items-center text-primary-100">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {personalInfo.location}
              </span>
              {contact?.phone && (
                <span className="flex items-center text-primary-100">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {contact.phone}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <div className="bg-white shadow sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('about')}
              className={`py-4 px-2 border-b-2 font-medium transition ${
                activeTab === 'about'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              个人简介
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`py-4 px-2 border-b-2 font-medium transition ${
                activeTab === 'skills'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              专业技能
            </button>
            <button
              onClick={() => setActiveTab('photos')}
              className={`py-4 px-2 border-b-2 font-medium transition ${
                activeTab === 'photos'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              照片墙
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <span className="text-3xl mr-3">👋</span>
                关于我
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">
                {personalInfo.bio}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                <div className="text-3xl font-bold mb-2">{skills.length}+</div>
                <div className="text-blue-100">专业技能</div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
                <div className="text-3xl font-bold mb-2">5+</div>
                <div className="text-green-100">年经验</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                <div className="text-3xl font-bold mb-2">50+</div>
                <div className="text-purple-100">完成项目</div>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                <div className="text-3xl font-bold mb-2">100+</div>
                <div className="text-orange-100">满意客户</div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <span className="text-3xl mr-3">📞</span>
                联系方式
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">邮箱</div>
                    <a href={`mailto:${contact?.email}`} className="text-lg font-medium text-gray-900 hover:text-primary-600">
                      {contact?.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">电话</div>
                    <a href={`tel:${contact?.phone}`} className="text-lg font-medium text-gray-900 hover:text-primary-600">
                      {contact?.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">位置</div>
                    <div className="text-lg font-medium text-gray-900">{personalInfo.location}</div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">GitHub</div>
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-lg font-medium text-gray-900 hover:text-primary-600">
                      @username
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-8 text-white">
              <h2 className="text-2xl font-bold mb-6">快速链接</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link to="/#projects" className="bg-white/10 hover:bg-white/20 rounded-lg p-4 transition text-center">
                  <div className="text-2xl mb-2">💼</div>
                  <div>项目经验</div>
                </Link>
                <Link to="/#skills" className="bg-white/10 hover:bg-white/20 rounded-lg p-4 transition text-center">
                  <div className="text-2xl mb-2">🎯</div>
                  <div>专业技能</div>
                </Link>
                <Link to="/#media" className="bg-white/10 hover:bg-white/20 rounded-lg p-4 transition text-center">
                  <div className="text-2xl mb-2">🎬</div>
                  <div>影音书籍</div>
                </Link>
                <Link to="/#contact" className="bg-white/10 hover:bg-white/20 rounded-lg p-4 transition text-center">
                  <div className="text-2xl mb-2">✉️</div>
                  <div>联系我</div>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Skills Tab */}
        {activeTab === 'skills' && (
          <div className="space-y-8">
            {Object.keys(groupedSkills).length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="text-6xl mb-4">🎯</div>
                <p className="text-xl text-gray-500">暂无技能数据</p>
              </div>
            ) : (
              Object.entries(groupedSkills).map(([category, categorySkills]) => (
                <div key={category} className="bg-white rounded-lg shadow-md p-8">
                  <h2 className="text-2xl font-bold mb-6 text-primary-600">{category}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categorySkills.map((skill) => (
                      <div key={skill.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-lg">{skill.name}</h3>
                          <span className="text-sm text-primary-600 font-medium">{skill.level}/5</span>
                        </div>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`flex-1 h-2 rounded-full ${
                                level <= skill.level
                                  ? 'bg-gradient-to-r from-primary-500 to-primary-600'
                                  : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Photos Tab */}
        {activeTab === 'photos' && (
          <div>
            {personalInfo.photos && personalInfo.photos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {personalInfo.photos.map((photo, index) => (
                  <div key={index} className="group relative aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-xl transition">
                    <LazyImage
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                      effect="blur"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition flex items-center justify-center">
                      <button className="opacity-0 group-hover:opacity-100 transition bg-white text-gray-900 px-4 py-2 rounded-lg">
                        查看大图
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="text-6xl mb-4">📸</div>
                <p className="text-xl text-gray-500">暂无照片</p>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default AboutPage;
