import { useState, useEffect } from 'react';
import Masonry from 'react-masonry-css';
import { getMediaItems, getPhotos } from '../services/dataService';
import type { MediaItem, Photo } from '../types';
import LazyImage from '../components/LazyImage';
import { useSEO } from '../hooks/useSEO';

const LifestylePage = () => {
  const [activeTab, setActiveTab] = useState<'movies' | 'books' | 'photos'>('movies');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [mediaData, photosData] = await Promise.all([
          getMediaItems(),
          getPhotos()
        ]);
        setMediaItems(mediaData);
        setPhotos(photosData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const movies = mediaItems.filter(item => item.type === 'movie');
  const books = mediaItems.filter(item => item.type === 'book');

  // SEO优化
  useSEO({
    title: '娱乐生活 - 电影、图书与摄影作品',
    description: '分享喜爱的电影、书籍推荐和生活中的美好瞬间。记录生活点滴，分享快乐时光。',
    keywords: '电影推荐, 图书推荐, 摄影作品, 生活分享, 影评, 书评',
    ogTitle: '娱乐生活 - 精彩生活记录',
    ogDescription: '探索电影、图书与摄影的精彩世界',
  });

  const renderStars = (rating: number) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">娱乐生活</h1>
          <p className="text-xl text-purple-100">
            分享喜爱的电影、书籍和生活中的美好瞬间
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('movies')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'movies'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              🎬 电影推荐 ({movies.length})
            </button>
            <button
              onClick={() => setActiveTab('books')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'books'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📚 阅读推荐 ({books.length})
            </button>
            <button
              onClick={() => setActiveTab('photos')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'photos'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📷 摄影作品 ({photos.length})
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Movies Section */}
        {activeTab === 'movies' && (
          <div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {movies.map((movie) => (
                <div
                  key={movie.id}
                  className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer"
                  onClick={() => setSelectedMedia(movie)}
                >
                  <div className="h-64 bg-gray-200">
                    <LazyImage
                      src={movie.coverImage}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{movie.title}</h3>
                    <div className="flex items-center mb-3">
                      <span className="text-yellow-500 mr-2">{renderStars(movie.rating)}</span>
                      <span className="text-sm text-gray-600">({movie.rating}/5)</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {movie.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-3">{movie.review}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Books Section */}
        {activeTab === 'books' && (
          <div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {books.map((book) => (
                <div
                  key={book.id}
                  className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer"
                  onClick={() => setSelectedMedia(book)}
                >
                  <div className="h-64 bg-gray-200">
                    <LazyImage
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{book.title}</h3>
                    <div className="flex items-center mb-3">
                      <span className="text-yellow-500 mr-2">{renderStars(book.rating)}</span>
                      <span className="text-sm text-gray-600">({book.rating}/5)</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {book.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-3">{book.review}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Photos Section */}
        {activeTab === 'photos' && (
          <div>
            {/* Photo Categories */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(photos.map(photo => photo.category))).map((category) => (
                  <button
                    key={category}
                    className="px-4 py-2 bg-white rounded-lg border hover:border-purple-300 transition-colors"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Gallery */}
            <Masonry
              breakpointCols={{
                default: 4,
                1280: 4,
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
                  className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer mb-6"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <LazyImage
                    src={photo.url}
                    alt={photo.title}
                    className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <h4 className="font-semibold">{photo.title}</h4>
                      <p className="text-sm opacity-90">{photo.category}</p>
                    </div>
                  </div>
                </div>
              ))}
            </Masonry>
          </div>
        )}
      </div>

      {/* Media Detail Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">{selectedMedia.title}</h2>
              <button
                onClick={() => setSelectedMedia(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <LazyImage
                    src={selectedMedia.coverImage}
                    alt={selectedMedia.title}
                    className="w-full rounded-lg shadow-lg"
                  />
                </div>

                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">
                      {selectedMedia.type === 'movie' ? '🎬 电影' : '📚 图书'}
                    </h3>
                    <div className="flex items-center mb-4">
                      <span className="text-yellow-500 text-lg mr-2">
                        {renderStars(selectedMedia.rating)}
                      </span>
                      <span className="text-gray-600">({selectedMedia.rating}/5)</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedMedia.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold mb-2">推荐理由</h4>
                    <p className="text-gray-700 leading-relaxed">{selectedMedia.review}</p>
                  </div>

                  <div>
                    <span className="text-sm text-gray-500">推荐日期：{selectedMedia.date}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-5xl w-full">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-75 z-10"
            >
              ×
            </button>

            <LazyImage
              src={selectedPhoto.url}
              alt={selectedPhoto.title}
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6 text-white">
              <h3 className="text-2xl font-bold mb-2">{selectedPhoto.title}</h3>
              <p className="text-lg mb-2">{selectedPhoto.description}</p>
              <div className="flex justify-between items-center">
                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                  {selectedPhoto.category}
                </span>
                <span className="text-sm opacity-75">{selectedPhoto.date}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LifestylePage;