import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Masonry from 'react-masonry-css';
import { getPersonalInfo, getSkills, getProjects, getMediaItems, getPhotos, getDocuments, getExperiences, getNews, getSiteConfig, getArticles } from '../services/dataService';
import type { Skill, PersonalInfo, Project, MediaItem, Photo, Document, Experience, News, Article } from '../types';
import LazyImage from '../components/LazyImage';
import Navbar from '../components/Navbar';
import ContactForm from '../components/ContactForm';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import ExperienceTimeline from '../components/ExperienceTimeline';
import NewsList from '../components/NewsList';
import BackgroundMusic from '../components/BackgroundMusic';
import { SkeletonProjectCard, SkeletonSkillCard, SkeletonMediaCard, SkeletonPhoto, SkeletonDocumentCard } from '../components/SkeletonLoader';
import { useSEO } from '../hooks/useSEO';
import { downloadVCard } from '../utils/vcard';

// Fix: Suppress unused imports warning
void downloadVCard;

const HomePage = () => {
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [selectedGalleryPhoto, setSelectedGalleryPhoto] = useState<Photo | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [siteConfig, setSiteConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [infoData, skillsData, projectsData, mediaData, photosData, documentsData, experiencesData, newsData, articlesData, configData] = await Promise.all([
          getPersonalInfo(),
          getSkills(),
          getProjects(),
          getMediaItems(),
          getPhotos(),
          getDocuments(),
          getExperiences(),
          getNews(),
          getArticles(),
          getSiteConfig()
        ]);
        setPersonalInfo(infoData);
        setSkills(skillsData);
        setProjects(projectsData);
        setMediaItems(mediaData);
        setPhotos(photosData);
        setDocuments(documentsData);
        setExperiences(experiencesData);
        setNews(newsData);
        setArticles(articlesData);
        setSiteConfig(configData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // 照片墙自动轮播
  useEffect(() => {
    if (!personalInfo || !personalInfo.photos || personalInfo.photos.length === 0) {
      return;
    }

    // 设置定时器，每6秒切换一张照片
    const interval = setInterval(() => {
      setSelectedPhoto((prevPhoto) => {
        const currentIndex = prevPhoto === null ? 0 : prevPhoto;
        const nextIndex = (currentIndex + 1) % personalInfo.photos.length;
        return nextIndex;
      });
    }, 6000); // 6000毫秒 = 6秒

    // 清理定时器，避免内存泄漏
    return () => clearInterval(interval);
  }, [personalInfo]);

  // SEO优化
  useSEO({
    title: personalInfo ? `${personalInfo.name} - ${personalInfo.title}` : '个人主页',
    description: personalInfo?.bio || '个人展示网站',
    keywords: '个人网站, 全栈开发, 项目管理, 技术博客',
    ogTitle: personalInfo ? `${personalInfo.name} - 个人主页` : '个人主页',
    ogDescription: personalInfo?.bio || '个人展示网站',
    ogImage: personalInfo?.avatar,
    ogUrl: window.location.href,
  });

  if (loading || !personalInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="加载中..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar personalInfo={personalInfo} />

      {/* Background Music */}
      <BackgroundMusic />

      {/* Hero Section */}
      <section id="home" className="bg-gradient-to-r from-primary-600 to-primary-700 text-white pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* 左侧：个人信息 */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <LazyImage
                  src={personalInfo.avatar}
                  alt={personalInfo.name}
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                  effect="opacity"
                />
                <div>
                  <h1 className="text-4xl font-bold">{personalInfo.name}</h1>
                  <p className="text-xl text-primary-100">{personalInfo.title}</p>
                </div>
              </div>

              <p className="text-lg text-primary-100 leading-relaxed">
                {personalInfo.bio}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-primary-200">📧</span>
                  <span>{personalInfo.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-primary-200">📱</span>
                  <span>{personalInfo.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-primary-200">📍</span>
                  <span>{personalInfo.location}</span>
                </div>
              </div>

              {/* 电子名片按钮 */}
              <div className="mt-6">
                <button
                  onClick={() => downloadVCard(personalInfo)}
                  className="inline-flex items-center px-6 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors shadow-lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                  下载电子名片
                </button>
              </div>
            </div>

            {/* 右侧：照片轮播 */}
            <div className="relative">
              <div className="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden shadow-2xl">
                <LazyImage
                  src={selectedPhoto !== null ? personalInfo.photos[selectedPhoto] : personalInfo.photos[0]}
                  alt="个人照片"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* 照片缩略图 */}
              <div className="flex space-x-2 mt-4 overflow-x-auto">
                {personalInfo.photos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedPhoto(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedPhoto === index
                        ? 'border-primary-400 scale-110'
                        : 'border-gray-300 hover:border-primary-400'
                    }`}
                  >
                    <LazyImage
                      src={photo}
                      alt={`照片 ${index + 1}`}
                      className="w-full h-full object-cover"
                      effect="opacity"
                      threshold={50}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Articles & News Combined Section */}
      {(articles.length > 0 || news.length > 0) && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Articles/Blog Section */}
              <div id="articles">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">
                    📝 博客文章
                  </h2>
                  {articles.length > 0 && (
                    <Link to="/blog" className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center">
                      查看全部
                      <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  )}
                </div>
                {articles.length > 0 ? (
                  <div className="space-y-6">
                    {articles.slice(0, 3).map((article) => (
                      <Link
                        key={article.id}
                        to={`/article/${article.id}`}
                        className="block bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        <div className="p-6">
                          <div className="flex items-center mb-2 text-xs text-gray-500">
                            <span>{article.publishedAt || article.createdAt}</span>
                            {article.category && (
                              <>
                                <span className="mx-2">•</span>
                                <span className="text-primary-600">{article.category}</span>
                              </>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold mb-2 text-gray-900 line-clamp-2">{article.title}</h3>
                          <p className="text-gray-600 text-sm line-clamp-2">{article.summary || article.excerpt || article.content.substring(0, 100) + '...'}</p>
                          {article.tags && article.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {article.tags.slice(0, 3).map((tag, idx) => (
                                <span key={idx} className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">暂无博客文章</p>
                    <p className="text-sm text-gray-400 mt-2">请在管理后台添加文章</p>
                  </div>
                )}
              </div>

              {/* News Section */}
              <div id="news">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">
                    📰 新闻动态
                  </h2>
                  {news.length > 0 && (
                    <Link to="/news" className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center">
                      查看全部
                      <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  )}
                </div>
                {news.length > 0 ? (
                  <NewsList news={news} limit={3} />
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">暂无新闻动态</p>
                    <p className="text-sm text-gray-400 mt-2">请在管理后台添加新闻</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Projects Section */}
      {projects.length > 0 && (
        <section id="projects" className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              项目经验
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.slice(0, 6).map((project) => (
                <Link
                  key={project.id}
                  to={`/project/${project.id}`}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                >
                  {project.images && project.images[0] && (
                    <div className="h-48 bg-gray-200">
                      <img src={project.images[0]} alt={project.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">{project.title}</h3>
                    <p className="text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <span>👤 {project.role}</span>
                      <span>⏱️ {project.duration}</span>
                    </div>
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.slice(0, 3).map((tech, idx) => (
                          <span key={idx} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Photo Gallery Section */}
      {photos.length > 0 && (
        <section id="photos" className="pt-24 pb-16 bg-gray-50 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              精彩瞬间
            </h2>
            <Masonry
              breakpointCols={{
                default: 4,
                1280: 3,
                1024: 3,
                768: 2,
                640: 1
              }}
              className="flex -ml-6 w-auto"
              columnClassName="pl-6 bg-clip-padding"
            >
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer mb-6 aspect-square"
                  onClick={() => setSelectedGalleryPhoto(photo)}
                >
                  <LazyImage
                    src={photo.url}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    wrapperClassName="w-full h-full"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-opacity duration-300 flex items-end opacity-0 group-hover:opacity-100">
                    <div className="p-4 text-white transition-opacity duration-300">
                      <h3 className="font-semibold mb-1">{photo.title}</h3>
                      {photo.description && (
                        <p className="text-sm text-gray-200">{photo.description}</p>
                      )}
                      <span className="text-xs bg-white/20 px-2 py-1 rounded mt-2 inline-block">
                        {photo.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </Masonry>
          </div>
        </section>
      )}

      {/* Media Section */}
      {mediaItems.length > 0 && (
        <section id="media" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              影音书籍
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {mediaItems.slice(0, 8).map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedMedia(item)}
                >
                  <div className="h-64 bg-gray-200 flex items-center justify-center overflow-hidden relative group">
                    {item.coverImage ? (
                      <>
                        <LazyImage
                          src={item.coverImage}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          wrapperClassName="w-full h-full"
                        />
                        {/* 播放按钮覆盖层 (仅电影类型显示) */}
                        {item.type === 'movie' && item.videoUrl && (
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:scale-110">
                              <svg className="w-8 h-8 text-purple-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-5xl">{item.type === 'movie' ? '🎬' : '📚'}</span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        item.type === 'movie' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {item.type === 'movie' ? '电影' : '书籍'}
                      </span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`text-sm ${i < item.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <h3 className="font-semibold mb-2 line-clamp-1">{item.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{item.review}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Media Detail Modal */}
      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <div
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 关闭按钮 */}
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* 视频或封面 */}
            {selectedMedia.type === 'movie' && selectedMedia.videoUrl ? (
              <div className="relative pb-[56.25%] bg-black">
                <video
                  controls
                  autoPlay
                  className="absolute inset-0 w-full h-full"
                  poster={selectedMedia.coverImage?.replace(/http:\/\/localhost:\d+/, 'https://www.bohenan.com')}
                >
                  <source src={selectedMedia.videoUrl.replace(/http:\/\/localhost:\d+/, 'https://www.bohenan.com')} type="video/mp4" />
                  您的浏览器不支持视频播放
                </video>
              </div>
            ) : (
              selectedMedia.coverImage && (
                <div className="w-full">
                  <img
                    src={selectedMedia.coverImage}
                    alt={selectedMedia.title}
                    className="w-full h-auto"
                  />
                </div>
              )
            )}

            {/* 详情内容 */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className={`text-xs px-2 py-1 rounded mr-2 ${
                      selectedMedia.type === 'movie' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {selectedMedia.type === 'movie' ? '电影' : '书籍'}
                    </span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-lg ${i < selectedMedia.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedMedia.title}</h2>
                </div>
              </div>

              <div className="prose max-w-none mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">我的评价</h3>
                <p className="text-gray-700 whitespace-pre-line">{selectedMedia.review}</p>
              </div>

              {/* 附件列表（PDF、文档等） */}
              {selectedMedia.attachments && selectedMedia.attachments.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">相关资料</h3>
                  <div className="space-y-2">
                    {selectedMedia.attachments.map((attachment, index) => {
                      const isPDF = attachment.url.toLowerCase().endsWith('.pdf') || attachment.type === 'application/pdf';
                      const isVideo = attachment.url.toLowerCase().match(/\.(mp4|webm|ogg|mov)$/);
                      // 处理URL：替换localhost为正确的域名，或添加域名前缀
                      let fullUrl = attachment.url;
                      if (fullUrl.includes('localhost')) {
                        fullUrl = fullUrl.replace(/http:\/\/localhost:\d+/, 'https://www.bohenan.com');
                      } else if (!fullUrl.startsWith('http')) {
                        fullUrl = `https://www.bohenan.com${fullUrl}`;
                      }

                      // 从URL中提取并解码文件名
                      let displayName = attachment.name;
                      try {
                        // 如果name包含编码字符，尝试解码
                        if (attachment.name.includes('%')) {
                          displayName = decodeURIComponent(attachment.name);
                        } else if (fullUrl.includes('%')) {
                          // 从URL中提取文件名并解码
                          const urlParts = fullUrl.split('/');
                          const encodedFilename = urlParts[urlParts.length - 1];
                          displayName = decodeURIComponent(encodedFilename);
                        }
                      } catch (e) {
                        // 解码失败，使用原始名称
                        displayName = attachment.name;
                      }

                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                          <div className="flex items-center flex-1">
                            <div className={`w-10 h-10 rounded flex items-center justify-center mr-3 ${
                              isPDF ? 'bg-red-100' : isVideo ? 'bg-purple-100' : 'bg-blue-100'
                            }`}>
                              {isPDF ? (
                                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M4 18h12V6h-4V2H4v16zm-2 1V0h12l4 4v16H2v-1z"/>
                                  <text x="6" y="14" fontSize="8" fill="currentColor">PDF</text>
                                </svg>
                              ) : isVideo ? (
                                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z"/>
                                </svg>
                              ) : (
                                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{displayName}</p>
                              {attachment.size && (
                                <p className="text-sm text-gray-500">{(attachment.size / 1024 / 1024).toFixed(2)} MB</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            {isPDF && (
                              <a
                                href={fullUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition flex items-center"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                预览
                              </a>
                            )}
                            {isVideo && (
                              <a
                                href={fullUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition flex items-center"
                              >
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z"/>
                                </svg>
                                播放
                              </a>
                            )}
                            <a
                              href={fullUrl}
                              download={attachment.name}
                              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition flex items-center"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              下载
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Documents Section */}
      {documents.length > 0 && (
        <section id="documents" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              知识文档
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {documents.slice(0, 6).map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedDocument(doc)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2 text-gray-900">{doc.title}</h3>
                      <span className="inline-block text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {doc.category}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">{doc.date}</span>
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-3">{doc.content}</p>
                  {doc.tags && doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {doc.tags.slice(0, 4).map((tag, idx) => (
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
        </section>
      )}

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            联系我
          </h2>
          <ContactForm />
        </div>
      </section>

      {/* Photo Lightbox Modal */}
      {selectedGalleryPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedGalleryPhoto(null)}
        >
          <button
            onClick={() => setSelectedGalleryPhoto(null)}
            className="absolute top-4 right-4 z-10 w-12 h-12 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full shadow-lg flex items-center justify-center transition"
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div
            className="max-w-7xl max-h-[95vh] w-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedGalleryPhoto.url}
              alt={selectedGalleryPhoto.title}
              className="max-w-full max-h-[95vh] object-contain"
            />
          </div>
        </div>
      )}

      {/* Document Detail Modal */}
      {selectedDocument && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedDocument(null)}
        >
          <div
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 关闭按钮 */}
            <button
              onClick={() => setSelectedDocument(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* 详情内容 */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="text-xs px-2 py-1 rounded mr-2 bg-blue-100 text-blue-700">
                      {selectedDocument.category}
                    </span>
                    <span className="text-sm text-gray-500">{selectedDocument.date}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedDocument.title}</h2>
                </div>
              </div>

              <div className="prose max-w-none mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">内容详情</h3>
                <p className="text-gray-700 whitespace-pre-line">{selectedDocument.content}</p>
              </div>

              {/* 标签 */}
              {selectedDocument.tags && selectedDocument.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">相关标签</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedDocument.tags.map((tag, idx) => (
                      <span key={idx} className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 附件列表 */}
              {selectedDocument.attachments && selectedDocument.attachments.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">相关资料</h3>
                  <div className="space-y-2">
                    {selectedDocument.attachments.map((attachment, index) => {
                      const isPDF = attachment.url.toLowerCase().endsWith('.pdf') || attachment.type === 'application/pdf';
                      const isVideo = attachment.url.toLowerCase().match(/\.(mp4|webm|ogg|mov)$/);
                      // 处理URL：替换localhost为正确的域名，或添加域名前缀
                      let fullUrl = attachment.url;
                      if (fullUrl.includes('localhost')) {
                        fullUrl = fullUrl.replace(/http:\/\/localhost:\d+/, 'https://www.bohenan.com');
                      } else if (!fullUrl.startsWith('http')) {
                        fullUrl = `https://www.bohenan.com${fullUrl}`;
                      }

                      // 从URL中提取并解码文件名
                      let displayName = attachment.name;
                      try {
                        // 如果name包含编码字符，尝试解码
                        if (attachment.name.includes('%')) {
                          displayName = decodeURIComponent(attachment.name);
                        } else if (fullUrl.includes('%')) {
                          // 从URL中提取文件名并解码
                          const urlParts = fullUrl.split('/');
                          const encodedFilename = urlParts[urlParts.length - 1];
                          displayName = decodeURIComponent(encodedFilename);
                        }
                      } catch (e) {
                        // 解码失败，使用原始名称
                        displayName = attachment.name;
                      }

                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                          <div className="flex items-center flex-1">
                            <div className={`w-10 h-10 rounded flex items-center justify-center mr-3 ${
                              isPDF ? 'bg-red-100' : isVideo ? 'bg-purple-100' : 'bg-blue-100'
                            }`}>
                              {isPDF ? (
                                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M4 18h12V6h-4V2H4v16zm-2 1V0h12l4 4v16H2v-1z"/>
                                  <text x="6" y="14" fontSize="8" fill="currentColor">PDF</text>
                                </svg>
                              ) : isVideo ? (
                                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z"/>
                                </svg>
                              ) : (
                                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{displayName}</p>
                              {attachment.size && (
                                <p className="text-sm text-gray-500">{(attachment.size / 1024 / 1024).toFixed(2)} MB</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            {isPDF && (
                              <a
                                href={fullUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition flex items-center"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                预览
                              </a>
                            )}
                            {isVideo && (
                              <a
                                href={fullUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition flex items-center"
                              >
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z"/>
                                </svg>
                                播放
                              </a>
                            )}
                            <a
                              href={fullUrl}
                              download={attachment.name}
                              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition flex items-center"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              下载
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;