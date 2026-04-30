/**
 * 修复批量替换脚本造成的错误
 * 将所有 API_BASE_URL 常量定义改为正确的形式
 */

const fs = require('fs');
const path = require('path');

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

filesToFix.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  跳过不存在的文件: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');

  // 修复错误的 API_BASE_URL 定义
  // 查找包含 ${API_BASE_URL 的常量定义行
  const badPattern = /const API_BASE_URL = import\.meta\.env\.VITE_API_URL \|\| `\$\{API_BASE_URL[^}]*\}[^`]*`;/g;

  if (content.match(badPattern)) {
    content = content.replace(
      badPattern,
      "const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';"
    );

    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ 已修复: ${filePath}`);
  } else {
    console.log(`ℹ️  无需修改: ${filePath}`);
  }
});

console.log('\n🎉 修复完成！');
