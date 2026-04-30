import { useState, useRef, useEffect } from 'react';

// API 基础 URL - 从环境变量读取
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

// 获取完整的图片 URL（添加后端服务器地址）
const getImageUrl = (url: string) => {
  if (!url) return '';
  // 如果已经是完整 URL，直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // 如果是相对路径（如 /uploads/xxx），添加后端服务器地址
  // 注意：这里使用 localhost:3002 而不是 API_URL，因为 uploads 是静态文件目录
  const backendUrl = 'http://localhost:3002';
  return `${backendUrl}${url}`;
};

interface ImageUploaderProps {
  onUploadSuccess: (imageUrl: string) => void;
  currentImage?: string;
  label?: string;
  multiple?: boolean;
  showPreview?: boolean; // 新增参数控制是否显示预览
}

const ImageUploader = ({
  onUploadSuccess,
  currentImage,
  label = '上传图片',
  multiple = false,
  showPreview = true, // 新增参数控制是否显示预览
}: ImageUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage ? getImageUrl(currentImage) : null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // 跟踪是否是上传操作触发的变化
  const isUploadingRef = useRef(false);

  // 当 currentImage 变化时，更新预览（仅在非上传状态时）
  useEffect(() => {
    // 如果是上传过程中，不更新预览，避免覆盖上传后的预览
    if (isUploadingRef.current) {
      isUploadingRef.current = false;
      return;
    }
    if (currentImage) {
      setPreview(getImageUrl(currentImage));
      setPreviewError(false);
    } else {
      setPreview(null);
      setPreviewError(false);
    }
  }, [currentImage]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    setUploading(true);

    try {
      // 检查是否登录
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('请先登录管理后台');
      }

      const formData = new FormData();

      if (multiple) {
        Array.from(files).forEach((file) => {
          formData.append('images', file);
        });
      } else {
        formData.append('image', files[0]);
      }

      const endpoint = multiple ? '/upload/multiple' : '/upload/single';

      console.log('Uploading to:', `${API_BASE_URL}${endpoint}`);

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `上传失败，状态码：${response.status}`);
      }

      const result = await response.json();
      console.log('Upload result:', result);

      if (multiple) {
        // 多图上传
        result.data.forEach((img: any) => {
          onUploadSuccess(img.url);
        });
        // 多图上传不显示预览
        setPreview(null);
      } else {
        // 单图上传 - 使用服务器返回的完整 URL
        const imageUrl = result.data.url;
        const fullUrl = getImageUrl(imageUrl);
        isUploadingRef.current = true; // 标记是上传操作
        setPreview(fullUrl);
        setPreviewError(false);
        onUploadSuccess(imageUrl); // 传递相对路径给表单保存
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : '上传失败，请重试');
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

      {/* 预览区域 - 仅在 showPreview 为 true 且不是多图上传时显示 */}
      {preview && !multiple && showPreview && (
        <div className="relative w-full h-48 border-2 border-blue-300 rounded-lg overflow-hidden bg-gray-50">
          {previewLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
            onLoad={() => setPreviewLoading(false)}
            onError={() => {
              setPreviewLoading(false);
              setPreviewError(true);
            }}
          />
          {previewError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500">
              <div className="text-center">
                <span className="text-4xl">📸</span>
                <p className="text-sm mt-2">图片加载失败</p>
              </div>
            </div>
          )}
          <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium shadow">
            预览
          </div>
          <button
            type="button"
            onClick={() => {
              setPreview(null);
              setPreviewError(false);
              onUploadSuccess('');
            }}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition shadow-lg"
            title="删除图片"
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
