/**
 * 批量修复所有文件中硬编码的 localhost:3001 API 地址
 * 使其使用环境变量 VITE_API_URL
 */

const fs = require('fs');
const path = require('path');

// 需要处理的文件列表
const filesToFix = [
  'src/components/ContactForm.tsx',
  'src/components/FileUploader.tsx',
  'src/components/ImageUploader.tsx',
  'src/components/admin/ExperiencesManager.tsx',
  'src/components/admin/ArticlesManager.tsx',
  'src/components/admin/FilesManager.tsx',
  'src/components/admin/FriendLinksManager.tsx',
  'src/components/admin/NewsManager.tsx',
  'src/components/admin/NavigationManager.tsx',
  'src/components/admin/AnalyticsManager.tsx',
  'src/components/admin/TagsManager.tsx',
  'src/components/admin/SocialMediaManager.tsx',
  'src/components/admin/SeoSettingsManager.tsx',
  'src/components/admin/SiteConfigManager.tsx',
  'src/components/admin/FooterSettingsManager.tsx',
  'src/pages/AdminPage.tsx',
];

// API 基础 URL 常量定义
const API_CONSTANT = "const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';";

filesToFix.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  跳过不存在的文件: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;

  // 检查是否已经有 API_BASE_URL 常量
  if (!content.includes('const API_BASE_URL')) {
    // 在第一个 import 语句后添加常量
    const importEndIndex = content.lastIndexOf('import ');
    const nextLineIndex = content.indexOf('\n', importEndIndex);

    content = content.slice(0, nextLineIndex + 1) +
              '\n// API 基础 URL - 从环境变量读取\n' +
              API_CONSTANT + '\n' +
              content.slice(nextLineIndex + 1);
    modified = true;
  }

  // 替换所有硬编码的 localhost:3001
  const patterns = [
    // 完整的 API 调用
    /'http:\/\/localhost:3001\/api\/([^']+)'/g,
    /"http:\/\/localhost:3001\/api\/([^"]+)"/g,
    /`http:\/\/localhost:3001\/api\/([^`]+)`/g,

    // 单独的 URL
    /'http:\/\/localhost:3001([^']*)'/g,
    /"http:\/\/localhost:3001([^"]*)"/g,
    /`http:\/\/localhost:3001([^`]*)`/g,
  ];

  patterns.forEach((pattern, index) => {
    if (content.match(pattern)) {
      if (index < 3) {
        // API 调用
        content = content.replace(pattern, '`${API_BASE_URL}/$1`');
      } else {
        // 其他 URL (上传的文件路径等)
        content = content.replace(pattern, (match, path) => {
          if (path.startsWith('/api/')) {
            return `\`\${API_BASE_URL}${path.substring(4)}\``;
          } else if (path.startsWith('/')) {
            return `\`\${API_BASE_URL.replace('/api', '')}${path}\``;
          }
          return match;
        });
      }
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ 已修复: ${filePath}`);
  } else {
    console.log(`ℹ️  无需修改: ${filePath}`);
  }
});

console.log('\n🎉 批量修复完成！');
