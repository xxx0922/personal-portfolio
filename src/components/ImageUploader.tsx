import { useState, useRef } from 'react';

// API 基础 URL - 从环境变量读取
const API_BASE_URL = import.meta.env.VITE_API_URL || `${API_BASE_URL.replace('/api', '')}/api`;

interface ImageUploaderProps {
  onUploadSuccess: (imageUrl: string) => void;
  currentImage?: string;
  label?: string;
  multiple?: boolean;
}

const ImageUploader = ({
  onUploadSuccess,
  currentImage,
  label = '上传图片',
  multiple = false,
}: ImageUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();

      if (multiple) {
        Array.from(files).forEach((file) => {
          formData.append('images', file);
        });
      } else {
        formData.append('image', files[0]);
        // 显示预览
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(files[0]);
      }

      const token = localStorage.getItem('adminToken');
      const endpoint = multiple ? '/api/upload/multiple' : '/api/upload/single';

      const response = await fetch(`http://localhost:3001${endpoint}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('上传失败');
      }

      const result = await response.json();

      if (multiple) {
        // 多图上传
        result.data.forEach((img: any) => {
          onUploadSuccess(`http://localhost:3001${img.url}`);
        });
      } else {
        // 单图上传
        const imageUrl = `http://localhost:3001${result.data.url}`;
        setPreview(imageUrl);
        onUploadSuccess(imageUrl);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('上传失败，请重试');
      setPreview(currentImage || null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {/* 预览区域 */}
      {preview && !multiple && (
        <div className="relative w-full h-48 border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => {
              setPreview(null);
              onUploadSuccess('');
            }}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {/* 上传按钮 */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />

        <button
          type="button"
          onClick={handleClick}
          disabled={uploading}
          className="w-full flex flex-col items-center justify-center px-6 py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-2"></div>
              <span className="text-sm text-gray-600">上传中...</span>
            </>
          ) : (
            <>
              <svg
                className="w-8 h-8 text-gray-400 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <span className="text-sm text-gray-600">
                点击{multiple ? '选择多张图片' : '选择图片'}或拖拽至此
              </span>
              <span className="text-xs text-gray-500 mt-1">
                支持 JPG, PNG, WebP, GIF 格式，最大 10MB
              </span>
            </>
          )}
        </button>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* 提示信息 */}
      <p className="text-xs text-gray-500">
        图片将自动压缩优化，建议上传宽度不超过 1920px 的图片
      </p>
    </div>
  );
};

export default ImageUploader;
