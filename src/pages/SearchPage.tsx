import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getProjects, getDocuments, getMediaItems } from '../services/dataService';
import type { Project, Document, MediaItem } from '../types';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<{
    projects: Project[];
    documents: Document[];
    media: MediaItem[];
  }>({
    projects: [],
    documents: [],
    media: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const performSearch = async () => {
      if (!query) {
        setLoading(false);
        return;
      }

      try {
        const [projects, documents, media] = await Promise.all([
          getProjects(),
          getDocuments(),
          getMediaItems()
        ]);

        const searchLower = query.toLowerCase();

        // 搜索项目
        const filteredProjects = projects.filter((p: Project) =>
          p.title.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.role.toLowerCase().includes(searchLower) ||
          (p.technologies && p.technologies.some(t => t.toLowerCase().includes(searchLower)))
        );

        // 搜索文档
        const filteredDocuments = documents.filter((d: Document) =>
          d.title.toLowerCase().includes(searchLower) ||
          d.content.toLowerCase().includes(searchLower) ||
          d.category.toLowerCase().includes(searchLower) ||
          (d.tags && d.tags.some(t => t.toLowerCase().includes(searchLower)))
        );

        // 搜索媒体
        const filteredMedia = media.filter((m: MediaItem) =>
          m.title.toLowerCase().includes(searchLower) ||
          m.review.toLowerCase().includes(searchLower) ||
          (m.tags && m.tags.some(t => t.toLowerCase().includes(searchLower)))
        );

        setResults({
          projects: filteredProjects,
          documents: filteredDocuments,
          media: filteredMedia
        });
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query]);

  const totalResults = results.projects.length + results.documents.length + results.media.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">搜索结果</h1>
          {query && (
            <p className="text-gray-600">
              关键词 "<span className="font-semibold text-primary-600">{query}</span>"
              {loading ? ' 搜索中...' : ` 找到 ${totalResults} 个结果`}
            </p>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <LoadingSpinner size="lg" text="搜索中..." />
          </div>
        ) : !query ? (
          <div className="text-center py-12 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-lg">请输入搜索关键词</p>
          </div>
        ) : totalResults === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg mb-2">未找到相关结果</p>
            <p className="text-sm">试试其他关键词</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Projects Results */}
            {results.projects.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm mr-3">
                    {results.projects.length}
                  </span>
                  项目
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.projects.map((project) => (
                    <Link
                      key={project.id}
                      to={`/project/${project.id}`}
                      className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
                    >
                      <h3 className="text-lg font-semibold mb-2 text-gray-900">{project.title}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{project.description}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <span>{project.role}</span>
                        <span className="mx-2">•</span>
                        <span>{project.duration}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Documents Results */}
            {results.documents.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm mr-3">
                    {results.documents.length}
                  </span>
                  文档
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {results.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{doc.title}</h3>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {doc.category}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-3">{doc.content}</p>
                      {doc.tags && doc.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {doc.tags.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Media Results */}
            {results.media.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm mr-3">
                    {results.media.length}
                  </span>
                  影音书籍
                </h2>
                <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {results.media.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
                    >
                      <div className="h-48 bg-gray-200 flex items-center justify-center">
                        {item.coverImage ? (
                          <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <span className="text-4xl">{item.type === 'movie' ? '🎬' : '📚'}</span>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            item.type === 'movie' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {item.type === 'movie' ? '电影' : '书籍'}
                          </span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`text-xs ${i < item.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                        <h3 className="font-semibold mb-1 line-clamp-1">{item.title}</h3>
                        <p className="text-gray-600 text-sm line-clamp-2">{item.review}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Back to Home */}
        <div className="mt-12 text-center">
          <Link
            to="/"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            返回首页
          </Link>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default SearchPage;
