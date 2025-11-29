import express from 'express';
import { readData, writeData } from '../services/dataService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 获取友情链接（公开）
router.get('/', async (req, res) => {
  try {
    const friendLinks = await readData('friend-links');
    const links = friendLinks?.links || [];
    // 只返回visible的链接，按order排序
    const visibleLinks = links
      .filter(link => link.visible)
      .sort((a, b) => a.order - b.order);
    res.json(visibleLinks);
  } catch (error) {
    console.error('Error reading friend links:', error);
    res.json([]);
  }
});

// 获取所有友情链接（管理员）
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const friendLinks = await readData('friend-links');
    const links = friendLinks?.links || [];
    // 按order排序
    const sortedLinks = links.sort((a, b) => a.order - b.order);
    res.json(sortedLinks);
  } catch (error) {
    console.error('Error reading friend links:', error);
    res.json([]);
  }
});

// 更新友情链接（批量更新，需要认证）
router.put('/', authenticateToken, async (req, res) => {
  try {
    const friendLinks = {
      links: req.body,
      updatedAt: new Date().toISOString()
    };

    await writeData('friend-links', friendLinks);
    res.json({ message: '友情链接更新成功', data: friendLinks });
  } catch (error) {
    console.error('Error updating friend links:', error);
    res.status(500).json({ message: '更新失败' });
  }
});

// 添加友情链接（需要认证）
router.post('/', authenticateToken, async (req, res) => {
  try {
    const friendLinks = await readData('friend-links');
    const links = friendLinks?.links || [];

    const newLink = {
      id: Date.now().toString(),
      ...req.body,
      order: links.length
    };

    links.push(newLink);

    await writeData('friend-links', { links, updatedAt: new Date().toISOString() });
    res.json({ message: '友情链接添加成功', data: newLink });
  } catch (error) {
    console.error('Error adding friend link:', error);
    res.status(500).json({ message: '添加失败' });
  }
});

// 删除友情链接（需要认证）
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const friendLinks = await readData('friend-links');
    const links = friendLinks?.links || [];

    const filteredLinks = links.filter(link => link.id !== req.params.id);

    await writeData('friend-links', { links: filteredLinks, updatedAt: new Date().toISOString() });
    res.json({ message: '友情链接删除成功' });
  } catch (error) {
    console.error('Error deleting friend link:', error);
    res.status(500).json({ message: '删除失败' });
  }
});

export default router;
