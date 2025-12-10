import express from 'express';
import { readData, writeData } from '../services/dataService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 获取网站配置
router.get('/', async (req, res) => {
  try {
    const config = await readData('site-config');
    res.json(config || getDefaultConfig());
  } catch (error) {
    console.error('Error reading site config:', error);
    res.json(getDefaultConfig());
  }
});

// 更新网站配置（需要认证）
router.put('/', authenticateToken, async (req, res) => {
  try {
    const config = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    await writeData('site-config', config);
    res.json({ message: '网站配置更新成功', data: config });
  } catch (error) {
    console.error('Error updating site config:', error);
    res.status(500).json({ message: '更新失败' });
  }
});

// 获取音乐配置
router.get('/music', async (req, res) => {
  try {
    const config = await readData('site-config');
    const musicConfig = config?.music || getDefaultMusicConfig();
    res.json(musicConfig);
  } catch (error) {
    console.error('Error reading music config:', error);
    res.json(getDefaultMusicConfig());
  }
});

// 更新音乐配置（需要认证）
router.put('/music', authenticateToken, async (req, res) => {
  try {
    // 读取现有配置
    const existingConfig = await readData('site-config');

    // 更新音乐部分
    const updatedConfig = {
      ...existingConfig,
      music: {
        ...req.body,
        updatedAt: new Date().toISOString()
      },
      updatedAt: new Date().toISOString()
    };

    await writeData('site-config', updatedConfig);
    res.json({ message: '音乐配置更新成功', data: updatedConfig.music });
  } catch (error) {
    console.error('Error updating music config:', error);
    res.status(500).json({ message: '更新失败' });
  }
});

// 默认配置
function getDefaultConfig() {
  return {
    general: {
      siteName: '个人作品集',
      siteSlogan: '展示个人项目、技能和经验',
      siteLogo: '',
      favicon: '/favicon.ico'
    },
    homepage: {
      heroTitle: '欢迎了解更多',
      heroDescription: '探索更多工作成就、兴趣爱好和知识文档',
      showHeroSection: true,
      showStatsSection: true
    },
    theme: {
      primaryColor: '#3B82F6',
      secondaryColor: '#10B981',
      accentColor: '#F59E0B'
    },
    contact: {
      showContactForm: true,
      contactEmail: 'contact@example.com'
    },
    music: getDefaultMusicConfig(),
    updatedAt: new Date().toISOString()
  };
}

// 默认音乐配置
function getDefaultMusicConfig() {
  return {
    enabled: false,
    musicUrl: '',
    volume: 0.3
  };
}

export default router;
