import { Link } from 'react-router-dom';
import type { News } from '../types';

interface NewsListProps {
  news: News[];
  limit?: number;
}

const NewsList = ({ news, limit }: NewsListProps) => {
  const displayNews = limit ? news.slice(0, limit) : news;

  const newsTypeLabels = {
    industry: '行业动态',
    company: '公司公告',
    achievement: '最新成就',
    project: '项目动态',
  };

  const newsTypeColors = {
    industry: 'bg-blue-100 text-blue-800',
    company: 'bg-purple-100 text-purple-800',
    achievement: 'bg-green-100 text-green-800',
    project: 'bg-orange-100 text-orange-800',
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (displayNews.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
        <p>暂无新闻动态</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {displayNews.map((item) => (
        <Link
          key={item.id}
          to={`/news/${item.id}`}
          className="bg-gray-50 rounded-lg hover:shadow-lg transition-shadow overflow-hidden block flex items-start"
        >
          {item.image && (
            <div className="w-32 h-24 flex-shrink-0 overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-medium px-2.5 py-1 rounded ${newsTypeColors[item.type]}`}>
                {newsTypeLabels[item.type]}
              </span>
              <span className="text-sm text-gray-500">
                {formatDate(item.publishedAt!)}
              </span>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
              {item.title}
            </h3>

            <p className="text-gray-600 text-sm line-clamp-3 mb-4">
              {item.content}
            </p>

            <div className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center">
              阅读更多
              <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default NewsList;
