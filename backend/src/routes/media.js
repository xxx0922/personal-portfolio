import express from 'express';
import { readData, writeData } from '../services/dataService.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// 获取所有媒体（电影/书籍）
router.get('/', async (req, res) => {
  try {
    const media = await readData('media') || [];
    res.json(media);
  } catch (error) {
    res.status(500).json({ error: '获取媒体列表失败' });
  }
});

// 添加媒体
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const media = await readData('media') || [];
    const newMedia = {
      id: Date.now().toString(),
      ...req.body,
      date: new Date().toISOString().split('T')[0]
    };
    media.push(newMedia);
    await writeData('media', media);
    res.status(201).json(newMedia);
  } catch (error) {
    res.status(500).json({ error: '添加媒体失败' });
  }
});

// 更新媒体
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const media = await readData('media') || [];
    const index = media.findIndex(m => m.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: '媒体不存在' });
    }

    media[index] = { ...media[index], ...req.body, id: req.params.id };
    await writeData('media', media);
    res.json(media[index]);
  } catch (error) {
    res.status(500).json({ error: '更新媒体失败' });
  }
});

// 删除媒体
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const media = await readData('media') || [];
    const filteredMedia = media.filter(m => m.id !== req.params.id);
    await writeData('media', filteredMedia);
    res.json({ message: '媒体已删除' });
  } catch (error) {
    res.status(500).json({ error: '删除媒体失败' });
  }
});

export default router;
