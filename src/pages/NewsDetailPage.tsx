import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getNewsById, getNews } from '../services/dataService';
import type { News } from '../types';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import LazyImage from '../components/LazyImage';
import { useSEO } from '../hooks/useSEO';

const NewsDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [newsItem, setNewsItem] = useState<News | null>(null);
  const [relatedNews, setRelatedNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNews = async () => {
      if (!id) {
        navigate('/');
        return;
      }

      try {
        const [newsData, allNews] = await Promise.all([
          getNewsById(id),
          getNews()
        ]);

        if (!newsData) {
          navigate('/');
          return;
        }

        setNewsItem(newsData);

        // 找相关新闻（同类型）
        const related = allNews
          .filter((n: any) => n.id !== id && n.type === newsData.type)
          .slice(0, 3);
        setRelatedNews(related);
      } catch (error) {
        console.error('Failed to load news:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, [id, navigate]);

  // SEO优化
  useSEO({
    title: newsItem?.title || '新闻动态',
    description: newsItem?.excerpt || newsItem?.content?.substring(0, 160) || '新闻动态详情',
    keywords: newsItem ? `${newsItem.type}, 新闻, 动态` : '新闻, 动态',
    ogTitle: newsItem?.title || '新闻动态',
    ogDescription: newsItem?.excerpt || newsItem?.content?.substring(0, 160) || '新闻动态详情',
    ogImage: newsItem?.image,
    ogUrl: window.location.href,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="加载中..." />
      </div>
    );
  }

  if (!newsItem) {
    return null;
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      achievement: '成就',
      announcement: '公告',
      event: '活动',
      project: '项目',
      other: '其他'
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      achievement: 'bg-green-100 text-green-700',
      announcement: 'bg-blue-100 text-blue-700',
      event: 'bg-purple-100 text-purple-700',
      project: 'bg-orange-100 text-orange-700',
      other: 'bg-gray-100 text-gray-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = newsItem?.title || '新闻动态';

    switch (platform) {
      case 'weibo':
        window.open(`https://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`, '_blank');
        break;
      case 'wechat':
        // 微信分享需要复制链接
        navigator.clipboard.writeText(url).then(() => {
          alert('链接已复制到剪贴板，请在微信中粘贴分享');
        });
        break;
      case 'copy':
        navigator.clipboard.writeText(url).then(() => {
          alert('链接已复制到剪贴板');
        });
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-primary-600">首页</Link>
            <span className="text-gray-400">/</span>
            <Link to="/#news" className="text-gray-500 hover:text-primary-600">新闻动态</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900">{newsItem.title}</span>
          </nav>
        </div>
      </div>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <header className="mb-8">
          {newsItem.image && (
            <LazyImage
              src={newsItem.image}
              alt={newsItem.title}
              className="w-full h-96 object-cover rounded-lg shadow-lg mb-8"
              effect="blur"
            />
          )}

          <div className="flex items-center space-x-2 mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(newsItem.type)}`}>
              {getTypeLabel(newsItem.type)}
            </span>
            {newsItem.important && (
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                🔥 重要
              </span>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{newsItem.title}</h1>

          {newsItem.excerpt && (
            <p className="text-xl text-gray-600 mb-6">{newsItem.excerpt}</p>
          )}

          <div className="flex items-center gap-4 text-gray-600">
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {newsItem.date ? new Date(newsItem.date).toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : '未知日期'}
            </span>
          </div>
        </header>

        {/* News Content */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="prose max-w-none">
            <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {newsItem.content}
            </div>
          </div>

          {newsItem.link && (
            <div className="mt-6 pt-6 border-t">
              <a
                href={newsItem.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                查看更多详情
              </a>
            </div>
          )}
        </div>

        {/* Share & Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">分享新闻</h3>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleShare('weibo')}
                  className="p-2 bg-[#E6162D] text-white rounded-lg hover:bg-[#C8102E] transition"
                  title="分享到微博"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.194 14.197c.478.853.283 1.707-.39 2.278-.673.57-2.102.997-3.532.997-3.775 0-6.887-2.562-7.555-5.993-.045-.231-.068-.464-.068-.697 0-2.438 2.24-4.416 5-4.416.93 0 1.813.209 2.598.587.136-.647.21-1.317.21-2.006C16.457 2.125 14.265 0 11.613 0 8.96 0 6.768 2.125 6.768 4.947c0 .69.074 1.359.21 2.006C3.61 7.37 1.194 9.86 1.194 12.853c0 4.238 4.366 7.668 9.753 7.668 5.386 0 9.753-3.43 9.753-7.668 0-.52-.062-1.029-.18-1.522-.103-.46-.243-.907-.41-1.336-.176.092-.359.173-.548.244-.19.07-.385.131-.583.183zm-9.58 3.356c-2.176 0-3.94-1.473-3.94-3.29 0-1.816 1.764-3.289 3.94-3.289s3.94 1.473 3.94 3.29c0 1.816-1.764 3.289-3.94 3.289zm8.678-7.75c-.232-.016-.464-.041-.695-.076.231-.526.351-1.094.351-1.68 0-2.07-1.69-3.75-3.774-3.75-2.085 0-3.775 1.68-3.775 3.75 0 .586.12 1.154.351 1.68-.231.035-.463.06-.695.076-1.45.126-2.613.965-2.613 1.875 0 .91 1.163 1.75 2.613 1.875.232.016.464.041.695.076-.231.526-.351 1.094-.351 1.68 0 2.07 1.69 3.75 3.775 3.75 2.084 0 3.774-1.68 3.774-3.75 0-.586-.12-1.154-.351-1.68.231-.035.463-.06.695-.076 1.45-.125 2.613-.965 2.613-1.875 0-.91-1.163-1.75-2.613-1.875z"/>
                  </svg>
                </button>
                <button
                  onClick={() => handleShare('wechat')}
                  className="p-2 bg-[#07C160] text-white rounded-lg hover:bg-[#06AD56] transition"
                  title="分享到微信"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.478c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348z"/>
                  </svg>
                </button>
                <button
                  onClick={() => handleShare('copy')}
                  className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition"
                  title="复制链接"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related News */}
        {relatedNews.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">相关新闻</h2>
            <div className="space-y-4">
              {relatedNews.map((related) => (
                <Link
                  key={related.id}
                  to={`/news/${related.id}`}
                  className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition group"
                >
                  {related.image && (
                    <LazyImage
                      src={related.image}
                      alt={related.title}
                      className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                      effect="blur"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition line-clamp-2">
                      {related.title}
                    </h3>
                    {related.excerpt && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{related.excerpt}</p>
                    )}
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(related.type)}`}>
                        {getTypeLabel(related.type)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {related.date ? new Date(related.date).toLocaleDateString('zh-CN') : '未知日期'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <Link
            to="/#news"
            className="inline-flex items-center px-6 py-3 bg-white text-primary-600 border-2 border-primary-600 rounded-lg hover:bg-primary-50 transition font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回新闻列表
          </Link>

          <Link
            to="/#contact"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
          >
            联系我
            <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default NewsDetailPage;
