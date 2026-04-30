import { useState, useEffect } from 'react';

// API 基础 URL - 从环境变量读取
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

interface ContactImage {
  id?: string;
  title: string;
  url: string;
  order: number;
}

const ContactForm = () => {
  const [images, setImages] = useState<ContactImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 加载已保存的图片
    const loadImages = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/contact-images`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setImages(data.sort((a: ContactImage, b: ContactImage) => a.order - b.order));
          }
        }
      } catch (error) {
        console.error('Failed to load contact images:', error);
      } finally {
        setLoading(false);
      }
    };
    loadImages();
  }, []);

  if (loading) {
    return (
      <div className="p-8 md:p-12 flex items-center justify-center">
        <div className="text-clay-muted">加载中...</div>
      </div>
    );
  }

  return (
    <div className="p-8 md:p-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {images.length > 0 ? (
          images.map((item, index) => (
            <div
              key={item.id}
              className="relative clay-card overflow-hidden bg-[#F5E6C5] rounded-xl shadow-lg border-2 border-amber-200/50"
              style={{ aspectRatio: '3/2' }}
            >
              <div className="absolute inset-[8%] bg-[#F5E6C5] rounded-lg overflow-hidden flex items-center justify-center p-2">
                {item.url ? (
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-contain rounded-md"
                    style={{
                      mixBlendMode: 'multiply',
                      backgroundColor: '#F5E6C5'
                    }}
                  />
                ) : (
                  <div className="text-clay-muted text-sm">暂无图片</div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-4 text-center py-12 text-clay-muted">
            暂无联系方式二维码
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactForm;
