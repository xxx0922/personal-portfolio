import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

interface ProductMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
  sortOrder: number;
}

interface ProductCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  coverImage?: string;
  shortDescription?: string;
  detailedDescription?: string;
  mediaResources?: ProductMedia[];
  sortOrder?: number;
  isPublished?: boolean;
  folders?: any[];
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002';

const ProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  // 获取图片 URL（处理相对路径）
  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${BACKEND_URL}${url}`;
  };

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/products`);
        if (!response.ok) throw new Error('获取产品数据失败');
        const data = await response.json();

        // 过滤已上架的产品，并按 sortOrder 排序
        const publishedProducts = data
          .filter((p: ProductCategory) => p.isPublished !== false)
          .sort((a: ProductCategory, b: ProductCategory) => (a.sortOrder || 0) - (b.sortOrder || 0));

        setProducts(publishedProducts);
        setError(null);
      } catch (error) {
        console.error('Failed to load products:', error);
        setError('加载产品数据失败，请检查网络连接后刷新页面');
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // 过滤产品
  const filteredProducts = filterType === 'all'
    ? products
    : products.filter(product => {
        const nameLower = product.name.toLowerCase();
        if (filterType === 'web') return nameLower.includes('web');
        if (filterType === 'app') return nameLower.includes('app') || nameLower.includes('移动');
        return true;
      });

  // 获取产品卡片图标
  const getProductIcon = (product: ProductCategory) => {
    if (product.coverImage) {
      const url = product.coverImage.startsWith('http')
        ? product.coverImage
        : `${BACKEND_URL}${product.coverImage}`;
      return (
        <img
          src={url}
          alt={product.name}
          className="w-20 h-20 object-contain"
        />
      );
    }
    // 默认使用 emoji 图标
    return (
      <div className="text-6xl">
        {product.icon || '📦'}
      </div>
    );
  };

  // 获取产品类型标签
  const getProductType = (product: ProductCategory) => {
    const nameLower = product.name.toLowerCase();
    if (nameLower.includes('app') || nameLower.includes('移动') || nameLower.includes('ios') || nameLower.includes('android')) {
      return { label: 'App', color: 'bg-blue-500/30 text-blue-300' };
    }
    if (nameLower.includes('web') || nameLower.includes('网站') || nameLower.includes('系统')) {
      return { label: 'Web', color: 'bg-green-500/30 text-green-300' };
    }
    return { label: '其他', color: 'bg-gray-500/30 text-gray-300' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/60 text-lg">加载中...</div>
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
          {/* 页面标题 */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-balance">
              产品中心
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto text-pretty">
              探索我们的创新产品与解决方案
            </p>
          </div>

          {/* 筛选栏 */}
          <div className="mb-12">
            <div className="flex justify-center gap-4">
              {[
                { id: 'all', label: '全部产品' },
                { id: 'web', label: 'Web 系统' },
                { id: 'app', label: '移动 App' }
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setFilterType(type.id)}
                  aria-pressed={filterType === type.id}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                    filterType === type.id
                      ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
                      : 'bg-[#334155] text-white/80 hover:bg-[#334155]/80'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* 产品统计 */}
          <div className="text-center mb-8">
            <p className="text-white/60">
              共 <span className="text-sky-400 font-bold">{filteredProducts.length}</span> 个产品
            </p>
          </div>

          {/* 错误状态 */}
          {error && (
            <div className="rounded-2xl p-12 text-center bg-red-900/30 backdrop-blur-sm border border-red-500/30 mb-8" role="alert">
              <div className="text-6xl mb-4" aria-hidden="true">⚠️</div>
              <h3 className="text-xl font-bold text-red-300 mb-3">加载失败</h3>
              <p className="text-red-200/70 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              >
                重新加载
              </button>
            </div>
          )}

          {/* 产品卡片网格 */}
          {filteredProducts.length === 0 && !error && products.length === 0 ? (
            <div className="rounded-2xl p-16 text-center bg-[#1E293B]/50 backdrop-blur-sm border border-white/10">
              <div className="text-8xl mb-6" aria-hidden="true">📦</div>
              <h3 className="text-2xl font-bold text-white mb-4">暂无产品</h3>
              <p className="text-white/60 mb-6">
                还没有添加任何产品，请在后台管理中添加
              </p>
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-sky-700 text-white rounded-lg font-medium hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                去后台添加
              </Link>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-2xl p-16 text-center bg-[#1E293B]/50 backdrop-blur-sm border border-white/10">
              <div className="text-8xl mb-6" aria-hidden="true">🔍</div>
              <h3 className="text-2xl font-bold text-white mb-4">筛选无结果</h3>
              <p className="text-white/60 mb-6">
                当前筛选条件下没有匹配的产品，请尝试其他筛选条件
              </p>
              <button
                onClick={() => setFilterType('all')}
                className="px-6 py-3 bg-gradient-to-r from-sky-500 to-sky-700 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                查看全部产品
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => {
                const productType = getProductType(product);
                return (
                  <button
                    key={product.id}
                    onClick={() => navigate(`/products/${product.id}`)}
                    className="group relative rounded-2xl p-6 bg-[#1E293B]/95 backdrop-blur-sm border border-white/10 cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-sky-500/20 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                  >
                    {/* 类型标签 */}
                    <div className="absolute top-4 right-4">
                      <span className={`text-xs px-3 py-1 rounded-full ${productType.color}`}>
                        {productType.label}
                      </span>
                    </div>

                    {/* 图标区域 */}
                    <div className="h-40 flex items-center justify-center rounded-xl overflow-hidden mb-6">
                      {getProductIcon(product)}
                    </div>

                    {/* 产品名称 */}
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-sky-400 transition-colors">
                      {product.name}
                    </h3>

                    {/* 产品描述 */}
                    {product.shortDescription && (
                      <p className="text-sm text-white/60 mb-4 line-clamp-2">
                        {product.shortDescription}
                      </p>
                    )}

                    {/* 媒体资源预览 */}
                    {product.mediaResources && product.mediaResources.length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-white/40 mb-4" aria-hidden="true">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{product.mediaResources.length} 个媒体资源</span>
                      </div>
                    )}

                    {/* 底部装饰线 */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-sky-700 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </button>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductsPage;
