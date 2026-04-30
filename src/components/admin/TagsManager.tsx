import { useState, useEffect } from 'react';

// API 基础 URL - 从环境变量读取
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

interface TagItem {
  tag: string;
  count: number;
  sources: string[];
}

export default function TagsManager() {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'count'>('count');

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      // 从各个模块加载数据并统计标签
      const [articles, media, documents] = await Promise.all([
        fetch(`${API_BASE_URL}/articles`).then(r => r.json()),
        fetch(`${API_BASE_URL}/media`).then(r => r.json()),
        fetch(`${API_BASE_URL}/documents`).then(r => r.json())
      ]);

      const tagMap = new Map<string, TagItem>();

      // 统计博客文章标签
      articles.forEach((article: any) => {
        article.tags?.forEach((tag: string) => {
          if (!tagMap.has(tag)) {
            tagMap.set(tag, { tag, count: 0, sources: [] });
          }
          const tagItem = tagMap.get(tag)!;
          tagItem.count++;
          if (!tagItem.sources.includes('博客文章')) {
            tagItem.sources.push('博客文章');
          }
        });
      });

      // 统计媒体标签
      media.forEach((item: any) => {
        item.tags?.forEach((tag: string) => {
          if (!tagMap.has(tag)) {
            tagMap.set(tag, { tag, count: 0, sources: [] });
          }
          const tagItem = tagMap.get(tag)!;
          tagItem.count++;
          if (!tagItem.sources.includes('媒体')) {
            tagItem.sources.push('媒体');
          }
        });
      });

      // 统计文档标签
      documents.forEach((doc: any) => {
        doc.tags?.forEach((tag: string) => {
          if (!tagMap.has(tag)) {
            tagMap.set(tag, { tag, count: 0, sources: [] });
          }
          const tagItem = tagMap.get(tag)!;
          tagItem.count++;
          if (!tagItem.sources.includes('文档')) {
            tagItem.sources.push('文档');
          }
        });
      });

      setTags(Array.from(tagMap.values()));
    } catch (error) {
      console.error('Failed to load tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedTags = tags
    .filter(tag => tag.tag.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.tag.localeCompare(b.tag);
      }
      return b.count - a.count;
    });

  if (loading) {
    return <div className="text-center py-12">加载中...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-6">标签管理中心</h2>

        {/* 统计信息 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">总标签数</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{tags.length}</p>
              </div>
              <div className="text-4xl">🏷️</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">总使用次数</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {tags.reduce((sum, tag) => sum + tag.count, 0)}
                </p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">平均使用</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {tags.length > 0 ? (tags.reduce((sum, tag) => sum + tag.count, 0) / tags.length).toFixed(1) : 0}
                </p>
              </div>
              <div className="text-4xl">📈</div>
            </div>
          </div>
        </div>

        {/* 搜索和排序 */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="搜索标签..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('count')}
              className={`px-4 py-2 rounded-lg ${
                sortBy === 'count' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              按使用次数
            </button>
            <button
              onClick={() => setSortBy('name')}
              className={`px-4 py-2 rounded-lg ${
                sortBy === 'name' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              按名称
            </button>
          </div>
        </div>

        {/* 标签列表 */}
        {filteredAndSortedTags.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">🏷️</div>
            <p className="text-lg">没有找到标签</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSortedTags.map((tagItem) => (
              <div key={tagItem.tag} className="bg-white border rounded-lg p-5 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">#{tagItem.tag}</h3>
                    <p className="text-sm text-gray-500">使用 {tagItem.count} 次</p>
                  </div>
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                    {tagItem.count}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {tagItem.sources.map((source) => (
                    <span
                      key={source}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                    >
                      {source}
                    </span>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t flex gap-2">
                  <button className="flex-1 text-sm px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600">
                    查看内容
                  </button>
                  <button className="text-sm px-3 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                    重命名
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 提示信息 */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
          <p className="font-medium mb-1">💡 标签管理提示：</p>
          <ul className="list-disc list-inside space-y-1">
            <li>标签统计来自博客文章、媒体和文档模块</li>
            <li>点击"查看内容"可以看到使用该标签的所有内容</li>
            <li>建议定期清理和合并相似标签，保持标签体系整洁</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
