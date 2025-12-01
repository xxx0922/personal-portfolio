import { useState, useEffect } from 'react';

// API 基础 URL - 从环境变量读取
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface FileItem {
  filename: string;
  url: string;
  size?: number;
  uploadedAt?: string;
  type?: string;
}

export default function FilesManager() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'images' | 'files'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [totalSize, setTotalSize] = useState(0);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/upload/list`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        const filesData = data.data || [];
        setFiles(filesData);

        // 计算总大小
        const total = filesData.reduce((sum: number, file: FileItem) => sum + (file.size || 0), 0);
        setTotalSize(total);
      }
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm(`确定要删除文件 ${filename} 吗？`)) return;

    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`${API_BASE_URL}/upload/${filename}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('文件删除成功');
      loadFiles();
    } catch (error) {
      alert('删除失败');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const isImage = (filename: string) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);
  };

  const filteredFiles = files
    .filter(file => {
      if (filter === 'images') return isImage(file.filename);
      if (filter === 'files') return !isImage(file.filename);
      return true;
    })
    .filter(file => file.filename.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) {
    return <div className="text-center py-12">加载中...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">文件管理</h2>

        {/* 统计信息 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">总文件数</div>
            <div className="text-2xl font-bold text-blue-600">{files.length}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">图片文件</div>
            <div className="text-2xl font-bold text-green-600">
              {files.filter(f => isImage(f.filename)).length}
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">总大小</div>
            <div className="text-2xl font-bold text-orange-600">{formatFileSize(totalSize)}</div>
          </div>
        </div>

        {/* 搜索和筛选 */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="搜索文件名..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setFilter('images')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'images' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              图片
            </button>
            <button
              onClick={() => setFilter('files')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'files' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              文档
            </button>
          </div>
        </div>
      </div>

      {/* 文件列表 */}
      {filteredFiles.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <p className="text-lg">没有找到文件</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFiles.map((file) => (
            <div key={file.filename} className="border rounded-lg overflow-hidden hover:shadow-lg transition">
              {isImage(file.filename) ? (
                <div className="h-48 bg-gray-100 flex items-center justify-center">
                  <img src={file.url} alt={file.filename} className="max-h-full max-w-full object-contain" />
                </div>
              ) : (
                <div className="h-48 bg-gray-50 flex items-center justify-center">
                  <svg className="w-20 h-20 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              )}

              <div className="p-4">
                <p className="text-sm font-medium text-gray-800 truncate mb-2" title={file.filename}>
                  {file.filename}
                </p>
                {file.size && (
                  <p className="text-xs text-gray-500 mb-3">{formatFileSize(file.size)}</p>
                )}

                <div className="flex gap-2">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                  >
                    查看
                  </a>
                  <button
                    onClick={() => handleDelete(file.filename)}
                    className="px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
