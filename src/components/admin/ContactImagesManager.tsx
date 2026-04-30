import { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

interface ContactImage {
  id: string;
  title: string;
  url: string;
  order: number;
  date?: string;
}

export default function ContactImagesManager() {
  const [images, setImages] = useState<ContactImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<number | null>(null);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/contact-images`);
      if (response.ok) {
        const data = await response.json();
        setImages(data.sort((a: ContactImage, b: ContactImage) => a.order - b.order));
      }
    } catch (error) {
      console.error('Failed to load contact images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (order: number, file: File) => {
    setUploading(order);
    try {
      const token = localStorage.getItem('adminToken');
      const titles = ['微信公众号', '抖音', '小红书'];
      const formData = new FormData();
      formData.append('image', file);
      formData.append('title', titles[order] || '二维码');
      formData.append('order', order.toString());

      const response = await fetch(`${API_BASE_URL}/contact-images`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        loadImages();
      } else {
        const error = await response.json();
        alert(`上传失败：${error.error}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('上传失败，请重试');
    } finally {
      setUploading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个二维码吗？')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/contact-images/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        loadImages();
      } else {
        alert('删除失败');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('删除失败，请重试');
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">加载中...</div>;
  }

  const titles = ['微信公众号', '抖音', '小红书'];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">联系方式二维码管理</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {titles.map((title, index) => {
          const image = images.find(img => img.order === index);
          return (
            <div
              key={title}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-semibold mb-3 text-center">{title}</h3>
              {image?.url ? (
                <div className="relative">
                  <img
                    src={image.url}
                    alt={title}
                    className="w-full aspect-square object-contain bg-gray-50 rounded-lg mb-3"
                  />
                  <button
                    onClick={() => handleDelete(image.id)}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                    title="删除"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="w-full aspect-square bg-gray-50 rounded-lg mb-3 flex items-center justify-center text-gray-400">
                  暂无图片
                </div>
              )}
              <label className="block w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white text-center rounded-lg cursor-pointer transition-colors disabled:opacity-50">
                {image?.url ? '更换图片' : '上传图片'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleUpload(index, file);
                    }
                  }}
                  disabled={uploading === index}
                  className="hidden"
                />
              </label>
              {uploading === index && (
                <p className="text-center text-sm text-gray-500 mt-2">上传中...</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
