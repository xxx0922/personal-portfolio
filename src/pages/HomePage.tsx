import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Masonry from 'react-masonry-css';
import { getPersonalInfo, getSkills, getProjects, getMediaItems, getPhotos, getDocuments, getExperiences, getNews, getSiteConfig } from '../services/dataService';
import type { Skill, PersonalInfo, Project, MediaItem, Photo, Document, Experience, News } from '../types';
import LazyImage from '../components/LazyImage';
import Navbar from '../components/Navbar';
import ContactForm from '../components/ContactForm';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import ExperienceTimeline from '../components/ExperienceTimeline';
import NewsList from '../components/NewsList';
import { SkeletonProjectCard, SkeletonSkillCard, SkeletonMediaCard, SkeletonPhoto, SkeletonDocumentCard } from '../components/SkeletonLoader';
import { useSEO } from '../hooks/useSEO';
import { downloadVCard } from '../utils/vcard';

const HomePage = () => {
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [siteConfig, setSiteConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [infoData, skillsData, projectsData, mediaData, photosData, documentsData, experiencesData, newsData, configData] = await Promise.all([
          getPersonalInfo(),
          getSkills(),
          getProjects(),
          getMediaItems(),
          getPhotos(),
          getDocuments(),
          getExperiences(),
          getNews(),
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
        setSiteConfig(configData);
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

      {/* Skills Section */}
      <section id="skills" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            专业技能
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.entries(
              skills.reduce((acc, skill) => {
                if (!acc[skill.category]) acc[skill.category] = [];
                acc[skill.category].push(skill);
                return acc;
              }, {} as Record<string, Skill[]>)
            ).map(([category, categorySkills]) => (
              <div key={category} className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">{category}</h3>
                <div className="space-y-3">
                  {categorySkills.map((skill) => (
                    <div key={skill.name}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">{skill.name}</span>
                        <span className="text-sm text-gray-500">{skill.level}/5</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(skill.level / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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

      {/* Media Section */}
      {mediaItems.length > 0 && (
        <section id="media" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              影音书籍
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {mediaItems.slice(0, 8).map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-64 bg-gray-200 flex items-center justify-center">
                    {item.coverImage ? (
                      <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover" />
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

      {/* Photo Gallery Section */}
      {photos.length > 0 && (
        <section id="photos" className="py-16 bg-gray-50">
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
                  className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer mb-6"
                >
                  <LazyImage
                    src={photo.url}
                    alt={photo.title}
                    className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-opacity duration-300 flex items-end">
                    <div className="p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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

      {/* Experience Section */}
      {experiences.length > 0 && (
        <section id="experience" className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              工作经历
            </h2>
            <ExperienceTimeline experiences={experiences} />
          </div>
        </section>
      )}

      {/* News Section */}
      {news.length > 0 && (
        <section id="news" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-bold text-gray-900">
                新闻动态
              </h2>
              <Link to="/news" className="text-primary-600 hover:text-primary-700 font-medium flex items-center">
                查看全部
                <svg className="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <NewsList news={news} limit={6} />
          </div>
        </section>
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
                <div key={doc.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
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

      {/* Call to Action */}
      {siteConfig?.homepage?.showHeroSection && (
        <section className="py-20 bg-primary-600 text-white">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-4">
              {siteConfig?.homepage?.heroTitle || '欢迎了解更多'}
            </h2>
            <p className="text-xl mb-8 text-primary-100">
              {siteConfig?.homepage?.heroDescription || '探索更多工作成就、兴趣爱好和知识文档'}
            </p>
            {siteConfig?.homepage?.showStatsSection && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-3xl font-bold">{projects.length}</div>
                  <div className="text-sm text-primary-100">项目经验</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-3xl font-bold">{skills.length}</div>
                  <div className="text-sm text-primary-100">专业技能</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-3xl font-bold">{mediaItems.length}</div>
                  <div className="text-sm text-primary-100">影音书籍</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-3xl font-bold">{documents.length}</div>
                  <div className="text-sm text-primary-100">知识文档</div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;