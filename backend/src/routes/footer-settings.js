import express from 'express';
import { readData, writeData } from '../services/dataService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 获取Footer设置
router.get('/', async (req, res) => {
  try {
    const settings = await readData('footer-settings');
    res.json(settings || getDefaultSettings());
  } catch (error) {
    console.error('Error reading footer settings:', error);
    res.json(getDefaultSettings());
  }
});

// 更新Footer设置（需要认证）
router.put('/', authenticateToken, async (req, res) => {
  try {
    const settings = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    await writeData('footer-settings', settings);
    res.json({ message: 'Footer设置更新成功', data: settings });
  } catch (error) {
    console.error('Error updating footer settings:', error);
    res.status(500).json({ message: '更新失败' });
  }
});

// 默认设置
function getDefaultSettings() {
  return {
    about: {
      title: '关于本站',
      description: '这是一个展示个人项目、技能和经验的个人网站。通过这个平台，您可以了解我的专业背景、工作经验以及兴趣爱好。',
      copyright: '丰生水起',
      icpNumber: '京ICP备XXXXXXXX号'
    },
    contact: {
      email: 'contact@example.com',
      phone: '+86 138-0000-0000',
      location: '中国·上海'
    },
    social: {
      wechat: 'YourWeChatID',
      github: 'https://github.com/yourusername',
      linkedin: 'https://linkedin.com/in/yourusername',
      email: 'mailto:contact@example.com'
    },
    links: {
      privacyPolicy: '#',
      termsOfService: '#'
    },
    branding: {
      designedBy: '丰生水起'
    },
    updatedAt: new Date().toISOString()
  };
}

export default router;
