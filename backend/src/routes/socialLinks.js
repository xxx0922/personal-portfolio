import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// 模拟数据存储
let socialLinks = [
  { id: '1', platform: '抖音', url: 'https://www.douyin.com', icon: '🎵', order: 0, visible: true },
  { id: '2', platform: '小红书', url: 'https://www.xiaohongshu.com', icon: '📕', order: 1, visible: true },
  { id: '3', platform: 'GitHub', url: 'https://github.com', icon: '💻', order: 2, visible: true },
  { id: '4', platform: 'Email', url: 'mailto:bohenan@163.com', icon: '📧', order: 3, visible: true }
];

// 获取所有社交链接
router.get('/', (req, res) => {
  res.json(socialLinks);
});

// 创建社交链接
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  const { platform, url, icon, order, visible } = req.body;

  if (!platform || !url) {
    return res.status(400).json({ error: '平台和链接不能为空' });
  }

  const newLink = {
    id: Date.now().toString(),
    platform,
    url,
    icon: icon || '🔗',
    order: order || 0,
    visible: visible !== undefined ? visible : true
  };

  socialLinks.push(newLink);
  res.status(201).json(newLink);
});

// 更新社交链接
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  const index = socialLinks.findIndex(l => l.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '链接不存在' });
  }

  const { platform, url, icon, order, visible } = req.body;
  socialLinks[index] = {
    ...socialLinks[index],
    platform: platform || socialLinks[index].platform,
    url: url || socialLinks[index].url,
    icon: icon || socialLinks[index].icon,
    order: order !== undefined ? order : socialLinks[index].order,
    visible: visible !== undefined ? visible : socialLinks[index].visible
  };

  res.json(socialLinks[index]);
});

// 删除社交链接
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  const index = socialLinks.findIndex(l => l.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '链接不存在' });
  }

  socialLinks.splice(index, 1);
  res.json({ success: true, message: '删除成功' });
});

export default router;
