import express from 'express';
import { readData, writeData } from '../services/dataService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 获取SEO设置
router.get('/', async (req, res) => {
  try {
    const settings = await readData('seo-settings');
    res.json(settings || getDefaultSettings());
  } catch (error) {
    console.error('Error reading SEO settings:', error);
    res.json(getDefaultSettings());
  }
});

// 更新SEO设置（需要认证）
router.put('/', authenticateToken, async (req, res) => {
  try {
    const settings = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    await writeData('seo-settings', settings);
    res.json({ message: 'SEO设置更新成功', data: settings });
  } catch (error) {
    console.error('Error updating SEO settings:', error);
    res.status(500).json({ message: '更新失败' });
  }
});

// 默认SEO设置
function getDefaultSettings() {
  return {
    basic: {
      siteTitle: '个人作品集',
      siteDescription: '展示个人项目、技能和经验的个人网站',
      keywords: ['个人网站', '全栈开发', '项目管理', '技术博客']
    },
    og: {
      ogTitle: '个人作品集',
      ogDescription: '展示个人项目、技能和经验',
      ogImage: '',
      ogUrl: ''
    },
    verification: {
      googleSiteVerification: '',
      baiduSiteVerification: '',
      bingSiteVerification: ''
    },
    updatedAt: new Date().toISOString()
  };
}

export default router;
