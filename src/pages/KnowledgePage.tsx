import { useState, useMemo, useEffect } from 'react';
import { getDocuments, getRegulations } from '../services/dataService';
import type { Document, Regulation } from '../types';
import { useSEO } from '../hooks/useSEO';

const KnowledgePage = () => {
  const [activeTab, setActiveTab] = useState<'documents' | 'regulations'>('documents');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [selectedRegulation, setSelectedRegulation] = useState<Regulation | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [docsData, regsData] = await Promise.all([
          getDocuments(),
          getRegulations()
        ]);
        setDocuments(docsData);
        setRegulations(regsData);
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
    title: '知识库 - 学习资料与建设法规',
    description: '精选学习资料、技术文档和建设行业法律法规。持续学习，不断进步。',
    keywords: '知识库, 学习资料, 技术文档, 建设法规, 法律法规, 学习笔记',
    ogTitle: '知识库 - 知识分享平台',
    ogDescription: '探索丰富的学习资源和专业知识',
  });

  // 获取文档分类
  const documentCategories = useMemo(() => {
    const categories = Array.from(new Set(documents.map(doc => doc.category)));
    return ['all', ...categories];
  }, [documents]);

  // 获取法规分类
  const regulationCategories = useMemo(() => {
    const categories = Array.from(new Set(regulations.map(reg => reg.category)));
    return ['all', ...categories];
  }, [regulations]);

  // 过滤文档
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
      const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [documents, selectedCategory, searchTerm]);

  // 过滤法规
  const filteredRegulations = useMemo(() => {
    return regulations.filter(reg => {
      const matchesCategory = selectedCategory === 'all' || reg.category === selectedCategory;
      const matchesSearch = reg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           reg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           reg.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [regulations, selectedCategory, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">知识库</h1>
          <p className="text-xl text-green-100">
            精选学习资料、文档资源和建设行业法律法规
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex space-x-8">
              <button
                onClick={() => {
                  setActiveTab('documents');
                  setSelectedCategory('all');
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'documents'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                📄 学习文档 ({documents.length})
              </button>
              <button
                onClick={() => {
                  setActiveTab('regulations');
                  setSelectedCategory('all');
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'regulations'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                ⚖️ 法律法规 ({regulations.length})
              </button>
            </div>

            {/* Search Bar */}
            <div className="mt-4 lg:mt-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索文档..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 overflow-x-auto">
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">分类：</span>
            {(activeTab === 'documents' ? documentCategories : regulationCategories).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category === 'all' ? '全部' : category}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Documents Section */}
        {activeTab === 'documents' && (
          <div>
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">未找到相关文档</h3>
                <p className="text-gray-500">尝试调整搜索条件或分类筛选</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300 p-6 cursor-pointer"
                    onClick={() => setSelectedDoc(doc)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {doc.title}
                      </h3>
                      <span className="text-2xl">📄</span>
                    </div>

                    <div className="mb-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {doc.category}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                      {doc.content}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {doc.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {doc.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          +{doc.tags.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>📅 {doc.date}</span>
                      {doc.fileUrl && (
                        <span className="text-green-600 font-medium">可下载</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Regulations Section */}
        {activeTab === 'regulations' && (
          <div>
            {filteredRegulations.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">⚖️</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">未找到相关法规</h3>
                <p className="text-gray-500">尝试调整搜索条件或分类筛选</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredRegulations.map((regulation) => (
                  <div
                    key={regulation.id}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300 p-6 cursor-pointer"
                    onClick={() => setSelectedRegulation(regulation)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-4">
                          <span className="text-3xl">⚖️</span>
                          <h3 className="text-xl font-semibold text-gray-900">
                            {regulation.title}
                          </h3>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 mb-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {regulation.category}
                          </span>
                          <span className="text-sm text-gray-500">
                            发布日期：{regulation.publishDate}
                          </span>
                        </div>

                        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                          {regulation.content}
                        </p>

                        <div className="flex flex-wrap gap-1">
                          {regulation.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Document Detail Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">{selectedDoc.title}</h2>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center space-x-4 mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    {selectedDoc.category}
                  </span>
                  <span className="text-gray-500">📅 {selectedDoc.date}</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedDoc.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedDoc.content}
                </p>
              </div>

              {selectedDoc.fileUrl && (
                <div className="mt-6 pt-6 border-t">
                  <a
                    href={selectedDoc.fileUrl}
                    download
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    下载文档
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Regulation Detail Modal */}
      {selectedRegulation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">{selectedRegulation.title}</h2>
              <button
                onClick={() => setSelectedRegulation(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center space-x-4 mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {selectedRegulation.category}
                  </span>
                  <span className="text-gray-500">📅 发布日期：{selectedRegulation.publishDate}</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedRegulation.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedRegulation.content}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgePage;