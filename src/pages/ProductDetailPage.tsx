import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Skeleton, { SkeletonText, SkeletonImage } from '../components/Skeleton';
import type { ProductCategory, MediaResource } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<MediaResource | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/products/${id}`);
        if (!response.ok) {
          throw new Error('Product not found');
        }
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error('Failed to load product:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  const handleMediaClick = (media: MediaResource) => {
    setSelectedMedia(media);
    setIsLightboxOpen(true);
  };

  const handleSetCover = async (media: MediaResource, e: any) => {
    e.stopPropagation();
    const token = localStorage.getItem('adminToken');
    if (!token) { alert('请先登录管理员'); return; }
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ coverImage: media.url })
      });
      if (res.ok) {
        setProduct(prev => prev ? { ...prev, coverImage: media.url } : prev);
        alert('✅ 封面已更新');
      } else { alert('更新失败'); }
    } catch (err) { console.error('Set cover failed:', err); alert('更新失败'); }
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setTimeout(() => setSelectedMedia(null), 300);
  };

  if (loading) {
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
            {/* 返回按钮骨架屏 */}
            <div className="mb-8">
              <Skeleton variant="rounded" width={120} height={36} className="bg-gray-700/30" />
            </div>

            {/* 封面图片骨架屏 */}
            <SkeletonImage aspectRatio="video" className="mb-8" />

            {/* 产品信息骨架屏 */}
            <div className="clay-card p-8 mb-8">
              <div className="flex items-center gap-4 mb-6">
                <Skeleton variant="rounded" width={80} height={80} className="bg-gray-700/30" />
                <div className="flex-1">
                  <Skeleton variant="text" width="40%" height={32} className="bg-gray-600/50 mb-2" />
                  <Skeleton variant="text" width="60%" height={20} className="bg-gray-700/40" />
                </div>
              </div>

              {/* 状态标签骨架屏 */}
              <div className="flex items-center gap-4 mb-6">
                <Skeleton variant="rounded" width={80} height={28} className="bg-gray-700/30" />
                <Skeleton variant="rounded" width={100} height={28} className="bg-gray-700/30" />
              </div>

              {/* 详细介绍骨架屏 */}
              <SkeletonText lines={4} />
            </div>

            {/* 媒体资源骨架屏 */}
            <div className="clay-card p-8 mb-8">
              <Skeleton variant="text" width={120} height={24} className="bg-gray-600/50 mb-6" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <SkeletonImage key={i} aspectRatio="square" />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold clay-title mb-4">产品不存在</h1>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-sky-700 text-white rounded-full font-medium hover:opacity-90 transition-opacity"
          >
            返回产品列表
          </Link>
        </div>
      </div>
    );
  }

  // 排序媒体资源
  const sortedMediaResources = (product.mediaResources || []).sort(
    (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
  );

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
          {/* 返回按钮 */}
          <div className="mb-8">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              返回产品列表
            </Link>
          </div>

          {/* 产品封面 */}
          {product.coverImage ? (
            <div className="mb-8 rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={product.coverImage.startsWith('http') ? product.coverImage : `${BACKEND_URL}${product.coverImage}`}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            </div>
          ) : (
            <div className="mb-8 rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-r from-sky-500/20 to-purple-500/20 p-12 text-center">
              <div className="text-8xl mb-4">{product.icon}</div>
            </div>
          )}

          {/* 产品信息 */}
          <div className="clay-card p-8 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center shadow-lg">
                <span className="text-4xl">{product.icon}</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold clay-title mb-2">{product.name}</h1>
                {product.shortDescription && (
                  <p className="text-lg text-gray-300">{product.shortDescription}</p>
                )}
              </div>
            </div>

            {/* 状态标签 */}
            <div className="flex items-center gap-4 mb-6">
              {product.isPublished !== false ? (
                <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                  ✅ 已上架
                </span>
              ) : (
                <span className="px-4 py-2 bg-gray-500/20 text-gray-400 rounded-full text-sm font-medium">
                  ⏸️ 未上架
                </span>
              )}
              {product.folders?.length > 0 && (
                <span className="px-4 py-2 bg-sky-500/20 text-sky-400 rounded-full text-sm font-medium">
                  📁 {product.folders.length} 个文件夹
                </span>
              )}
              {sortedMediaResources.length > 0 && (
                <span className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium">
                  🎬 {sortedMediaResources.length} 个媒体资源
                </span>
              )}
            </div>

            {/* 外部链接按钮 */}
            {product.externalUrl && (
              <div className="mt-4">
                <a
                  href={product.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-lg font-semibold transition-all shadow-lg shadow-sky-500/30 hover:shadow-sky-500/50 hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  访问项目
                </a>
              </div>
            )}
          </div>

          {/* 详细描述 */}
          {product.detailedDescription && (
            <div className="clay-card p-8 mb-8">
              <h2 className="text-2xl font-bold clay-title mb-6 flex items-center gap-3">
                <svg className="w-8 h-8 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                详细介绍
              </h2>
              <div
                className="prose prose-invert prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: product.detailedDescription }}
              />
            </div>
          )}

          {/* 媒体资源 */}
          {sortedMediaResources.length > 0 && (
            <div className="clay-card p-8 mb-8">
              <h2 className="text-2xl font-bold clay-title mb-6 flex items-center gap-3">
                <svg className="w-8 h-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                媒体资源
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedMediaResources.map((media) => (
                  <div
                    key={media.id}
                    className="group relative rounded-xl overflow-hidden bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                    onClick={() => handleMediaClick(media)}
                  >
                    {media.type === 'image' ? (
                      <img
                        src={media.url.startsWith('http') ? media.url : `${BACKEND_URL}${media.url}`}
                        alt={media.title || '媒体资源'}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="relative w-full h-48">
                        {media.thumbnailUrl ? (
                          <img
                            src={media.thumbnailUrl.startsWith('http') ? media.thumbnailUrl : `${BACKEND_URL}${media.thumbnailUrl}`}
                            alt={media.title || '视频封面'}
                            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gradient-to-br from-purple-500/50 to-sky-500/50 flex items-center justify-center">
                            <svg className="w-16 h-16 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <svg className="w-8 h-8 text-sky-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                      {media.title && (
                        <p className="text-white font-medium truncate">{media.title}</p>
                      )}
                      {media.description && (
                        <p className="text-gray-300 text-sm truncate">{media.description}</p>
                      )}
                    </div>
                    <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 rounded text-xs text-white">
                      {media.type === 'image' ? '🖼️ 图片' : '🎬 视频'}
                    </div>
                    {media.type === 'image' && localStorage.getItem('adminToken') && (
                      <button
                        onClick={(e) => handleSetCover(media, e)}
                        className="absolute top-2 left-2 px-3 py-1 bg-sky-500/80 hover:bg-sky-500 rounded text-xs text-white transition-colors z-10"
                      >
                        设为封面
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 文件夹和 Demo 列表 */}
          {product.folders && product.folders.length > 0 && (
            <div className="clay-card p-8 mb-8">
              <h2 className="text-2xl font-bold clay-title mb-6 flex items-center gap-3">
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                Demo 文件
              </h2>
              <div className="space-y-6">
                {product.folders.map((folder) => (
                  <div key={folder.id} className="border border-white/10 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">📁</span>
                      <h3 className="text-xl font-bold clay-title">{folder.name}</h3>
                      <span className="text-sm text-gray-400">({folder.count} 个文件)</span>
                    </div>

                    {/* 文件夹直接附件 */}
                    {folder.attachments && folder.attachments.length > 0 && (
                      <div className="space-y-3 mb-4">
                        {folder.attachments.map((attachment) => (
                          <a
                            key={attachment.id}
                            href={attachment.url.startsWith('http') ? attachment.url : `${BACKEND_URL}${attachment.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <span className="text-3xl">
                                {attachment.mimeType?.includes('pdf') ? '📕' :
                                 attachment.mimeType?.includes('image') ? '🖼️' :
                                 attachment.mimeType?.includes('video') ? '🎬' :
                                 attachment.mimeType?.includes('excel') ? '📗' :
                                 attachment.mimeType?.includes('word') ? '📘' : '📄'}
                              </span>
                              <div>
                                <p className="font-medium text-white">{attachment.name}</p>
                                {attachment.description && (
                                  <p className="text-sm text-gray-400">{attachment.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-gray-400">
                                {(attachment.size / 1024 / 1024).toFixed(2)} MB
                              </span>
                              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </div>
                          </a>
                        ))}
                      </div>
                    )}

                    {/* 子文件夹 */}
                    {folder.subFolders && folder.subFolders.length > 0 && (
                      <div className="ml-8 space-y-3">
                        {folder.subFolders.map((subFolder) => (
                          <div key={subFolder.id} className="border-l-2 border-white/20 pl-4">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-xl">📄</span>
                              <h4 className="text-lg font-medium text-white">{subFolder.name}</h4>
                              <span className="text-xs text-gray-400">({subFolder.count} 个文件)</span>
                            </div>
                            {subFolder.attachments && subFolder.attachments.length > 0 && (
                              <div className="space-y-2">
                                {subFolder.attachments.map((attachment) => (
                                  <a
                                    key={attachment.id}
                                    href={attachment.url.startsWith('http') ? attachment.url : `${BACKEND_URL}${attachment.url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-sm"
                                  >
                                    <div className="flex items-center gap-3">
                                      <span className="text-xl">
                                        {attachment.mimeType?.includes('pdf') ? '📕' :
                                         attachment.mimeType?.includes('image') ? '🖼️' :
                                         attachment.mimeType?.includes('video') ? '🎬' : '📄'}
                                      </span>
                                      <span className="text-white">{attachment.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className="text-xs text-gray-400">
                                        {(attachment.size / 1024 / 1024).toFixed(2)} MB
                                      </span>
                                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                      </svg>
                                    </div>
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Lightbox 弹窗 */}
      {isLightboxOpen && selectedMedia && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={closeLightbox}
        >
          <div
            className="relative max-w-6xl max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeLightbox}
              className="absolute -top-12 right-0 text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {selectedMedia.type === 'image' ? (
              <img
                src={selectedMedia.url.startsWith('http') ? selectedMedia.url : `${BACKEND_URL}${selectedMedia.url}`}
                alt={selectedMedia.title || '媒体资源'}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
            ) : (
              <video
                src={selectedMedia.url.startsWith('http') ? selectedMedia.url : `${BACKEND_URL}${selectedMedia.url}`}
                controls
                autoPlay
                className="max-w-full max-h-[80vh] rounded-lg"
                poster={selectedMedia.thumbnailUrl || undefined}
              />
            )}
            {selectedMedia.title && (
              <p className="text-white text-center mt-4 text-lg">{selectedMedia.title}</p>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
