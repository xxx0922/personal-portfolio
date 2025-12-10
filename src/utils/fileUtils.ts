/**
 * 文件处理工具函数
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * 获取完整的文件URL
 * @param url 原始URL
 * @returns 处理后的完整URL
 */
export function getFullFileUrl(url: string): string {
  if (!url) return '';

  // 如果已经是完整URL，直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // 替换localhost为实际域名（生产环境）
    if (url.includes('localhost')) {
      return url.replace(/http:\/\/localhost:\d+/, window.location.origin);
    }
    return url;
  }

  // 相对路径，添加当前域名
  if (url.startsWith('/')) {
    return `${window.location.origin}${url}`;
  }

  // 其他情况，添加API基础URL
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

/**
 * 解码文件名
 * @param name 文件名
 * @param url 文件URL（备用）
 * @returns 解码后的文件名
 */
export function decodeFileName(name: string, url?: string): string {
  try {
    // 如果name包含编码字符，尝试解码
    if (name.includes('%')) {
      return decodeURIComponent(name);
    }

    // 如果name没有编码但URL有，从URL提取并解码
    if (url && url.includes('%')) {
      const urlParts = url.split('/');
      const encodedFilename = urlParts[urlParts.length - 1];
      return decodeURIComponent(encodedFilename);
    }

    return name;
  } catch (e) {
    // 解码失败，返回原始名称
    return name;
  }
}

/**
 * 判断是否为PDF文件
 * @param url 文件URL
 * @param type 文件MIME类型
 * @returns 是否为PDF
 */
export function isPDF(url: string, type?: string): boolean {
  return url.toLowerCase().endsWith('.pdf') || type === 'application/pdf';
}

/**
 * 判断是否为视频文件
 * @param url 文件URL
 * @returns 是否为视频
 */
export function isVideo(url: string): boolean {
  return /\.(mp4|webm|ogg|mov|avi|mkv)$/i.test(url);
}

/**
 * 判断是否为图片文件
 * @param url 文件URL
 * @returns 是否为图片
 */
export function isImage(url: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
}

/**
 * 获取文件扩展名
 * @param filename 文件名
 * @returns 扩展名（小写，不含点）
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的大小字符串
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * 在新窗口预览PDF
 * @param url PDF文件URL
 */
export function previewPDF(url: string): void {
  const fullUrl = getFullFileUrl(url);
  window.open(fullUrl, '_blank', 'noopener,noreferrer');
}

/**
 * 下载文件
 * @param url 文件URL
 * @param filename 文件名
 */
export function downloadFile(url: string, filename: string): void {
  const fullUrl = getFullFileUrl(url);
  const link = document.createElement('a');
  link.href = fullUrl;
  link.download = filename;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
