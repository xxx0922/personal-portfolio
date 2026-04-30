import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface ProductAttachment {
  id: string;
  name: string;
  description: string;
  url: string;
  originalName: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

interface ProductFolder {
  id: string;
  name: string;
  count: number;
  subFolders?: ProductSubFolder[];
}

interface ProductSubFolder {
  id: string;
  name: string;
  count: number;
  attachments?: ProductAttachment[];
}

interface ProductCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

const ProductFolderPage = () => {
  const { categoryId, folderId, subFolderId } = useParams<{ categoryId: string; folderId: string; subFolderId?: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<ProductCategory | null>(null);
  const [folder, setFolder] = useState<ProductFolder | null>(null);
  const [subFolder, setSubFolder] = useState<ProductSubFolder | null>(null);
  const [attachments, setAttachments] = useState<ProductAttachment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFolderData = async () => {
      try {
        // 获取分类信息
        const categoryResponse = await fetch(`${API_BASE_URL}/products/${categoryId}`);
        const categoryData = await categoryResponse.json();
        setCategory(categoryData);

        // 获取文件夹信息
        const folder = categoryData.folders?.find((f: any) => f.id === folderId);
        setFolder(folder || null);

        // 如果是子文件夹，获取子文件夹信息
        if (subFolderId && folder?.subFolders) {
          const subFolder = folder.subFolders.find((sf: any) => sf.id === subFolderId);
          setSubFolder(subFolder || null);
        }

        // 获取附件列表 - 根据是否有子文件夹 ID 决定 API 路径
        let attachmentsUrl: string;
        if (subFolderId) {
          attachmentsUrl = `${API_BASE_URL}/products/${categoryId}/folders/${folderId}/subfolders/${subFolderId}/attachments`;
        } else {
          attachmentsUrl = `${API_BASE_URL}/products/${categoryId}/folders/${folderId}/attachments`;
        }
        const attachmentsResponse = await fetch(attachmentsUrl);
        const attachmentsData = await attachmentsResponse.json();
        setAttachments(attachmentsData);
      } catch (error) {
        console.error('Failed to load folder data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadFolderData();
  }, [categoryId, folderId, subFolderId]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return '📕';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📘';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📗';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('video')) return '🎬';
    if (mimeType.includes('audio')) return '🎵';
    if (mimeType.includes('zip') || mimeType.includes('archive')) return '📦';
    return '📄';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-clay-muted">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* 背景 */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('/背景星空.png')`,
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-slate-900/90"></div>
      </div>

      {/* 内容 */}
      <div className="relative z-10">
        <Navbar personalInfo={{ name: '丰生水起', avatar: '' }} />

        <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          {/* 面包屑导航 */}
          <nav className="flex items-center gap-2 mb-6 text-sm">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11h2a1 1 0 011 1v10a1 1 0 01-1 1h-2m-2-1H5a1 1 0 01-1-1V2a1 1 0 011-1h2" />
              </svg>
              <span>产品</span>
            </Link>
            {folder && (
              <>
                <span className="text-white/30">/</span>
                <Link
                  to={`/products/${categoryId}/${folderId}`}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  {folder.name}
                </Link>
              </>
            )}
            {subFolder && (
              <>
                <span className="text-white/30">/</span>
                <span className="text-white/90">
                  {subFolder.name}
                </span>
              </>
            )}
          </nav>

          {/* 页面标题 */}
          <div className="clay-card p-8 mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center shadow-lg">
                <span className="text-3xl">{category?.icon || '📦'}</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold clay-title mb-1">
                  {subFolder?.name || folder?.name}
                </h1>
                <p className="text-clay-muted">{category?.description}</p>
              </div>
            </div>

            {/* 统计信息 */}
            <div className="flex items-center gap-4 text-sm text-clay-muted">
              <span>共 {attachments.length} 个附件</span>
              {subFolder && <span>• 文件数量：{subFolder.count}</span>}
              {folder && !subFolder && <span>• 文件数量：{folder.count}</span>}
            </div>
          </div>

          {/* 子文件夹导航 */}
          {!subFolderId && folder?.subFolders && folder.subFolders.length > 0 && (
            <div className="clay-card p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold clay-title flex items-center gap-2">
                  <span className="text-xl">🗂️</span>
                  子文件夹
                </h2>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  共 {folder.subFolders.length} 个
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {folder.subFolders.map((sf) => (
                  <Link
                    key={sf.id}
                    to={`/products/${categoryId}/${folderId}/${sf.id}`}
                    className="group flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-white/5 to-white/10 hover:from-sky-500/20 hover:to-sky-600/20 transition-all"
                  >
                    <div className="text-3xl group-hover:scale-110 transition-transform">📁</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{sf.name}</h3>
                      <p className="text-xs text-gray-400 mt-1">
                        {sf.count} 个文件
                        {sf.attachments && sf.attachments.length > 0 && (
                          <span className="text-sky-400 ml-1">· {sf.attachments.length} 个附件</span>
                        )}
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 附件列表 */}
          {attachments.length === 0 ? (
            <div className="clay-card p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-clay-muted text-lg">暂无附件</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="clay-card p-6 hover:scale-105 transition-transform duration-300"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="text-4xl">{getFileIcon(attachment.mimeType)}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold clay-title truncate" title={attachment.name}>
                        {attachment.name}
                      </h3>
                      {attachment.description && (
                        <p className="text-sm clay-text-muted mt-1 line-clamp-2">
                          {attachment.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 文件信息 */}
                  <div className="flex items-center justify-between text-xs text-clay-muted mb-4">
                    <span>{formatFileSize(attachment.size)}</span>
                    <span>{attachment.uploadedAt?.split('T')[0]}</span>
                  </div>

                  {/* 操作按钮 */}
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2 bg-gradient-to-r from-sky-500 to-sky-700 text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>下载</span>
                  </a>
                </div>
              ))}
            </div>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default ProductFolderPage;
