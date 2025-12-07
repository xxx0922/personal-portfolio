import { useState, useEffect } from 'react';
import { getNews, getPersonalInfo } from '../services/dataService';
import type { News, PersonalInfo } from '../types';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import NewsList from '../components/NewsList';
import { useSEO } from '../hooks/useSEO';

const NewsPage = () => {
  const [news, setNews] = useState<News[]>([]);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [newsData, infoData] = await Promise.all([
          getNews(),
          getPersonalInfo()
        ]);
        setNews(newsData);
        setPersonalInfo(infoData);
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
    title: '新闻动态',
    description: '最新的项目动态、成就公告和活动信息',
    keywords: '新闻动态, 项目更新, 成就公告, 活动信息',
    ogTitle: '新闻动态',
    ogDescription: '最新的项目动态、成就公告和活动信息',
    ogUrl: window.location.href,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="加载中..." />
      </div>
    );
  }

  const types = [
    { value: 'all', label: '全部' },
    { value: 'achievement', label: '成就' },
    { value: 'announcement', label: '公告' },
    { value: 'event', label: '活动' },
    { value: 'project', label: '项目' },
    { value: 'other', label: '其他' }
  ];

  const filteredNews = filter === 'all'
    ? news
    : news.filter(item => item.type === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar personalInfo={personalInfo || undefined} />

      {/* Page Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">新闻动态</h1>
            <p className="text-xl text-primary-100">
              最新的项目动态、成就公告和活动信息
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-2">
            {types.map((type) => (
              <button
                key={type.value}
                onClick={() => setFilter(type.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === type.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* News List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredNews.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">暂无{filter !== 'all' && types.find(t => t.value === filter)?.label}新闻</p>
          </div>
        ) : (
          <NewsList news={filteredNews} />
        )}
      </div>

      <Footer />
    </div>
  );
};

export default NewsPage;
