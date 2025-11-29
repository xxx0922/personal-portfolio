import express from 'express';
import { readData, writeData } from '../services/dataService.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// 获取所有照片
router.get('/', async (req, res) => {
  try {
    const photos = await readData('photos') || [];
    res.json(photos);
  } catch (error) {
    res.status(500).json({ error: '获取照片列表失败' });
  }
});

// 添加照片
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const photos = await readData('photos') || [];
    const newPhoto = {
      id: Date.now().toString(),
      ...req.body,
      date: new Date().toISOString().split('T')[0]
    };
    photos.push(newPhoto);
    await writeData('photos', photos);
    res.status(201).json(newPhoto);
  } catch (error) {
    res.status(500).json({ error: '添加照片失败' });
  }
});

// 更新照片
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const photos = await readData('photos') || [];
    const index = photos.findIndex(p => p.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: '照片不存在' });
    }

    photos[index] = { ...photos[index], ...req.body, id: req.params.id };
    await writeData('photos', photos);
    res.json(photos[index]);
  } catch (error) {
    res.status(500).json({ error: '更新照片失败' });
  }
});

// 删除照片
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const photos = await readData('photos') || [];
    const filteredPhotos = photos.filter(p => p.id !== req.params.id);
    await writeData('photos', filteredPhotos);
    res.json({ message: '照片已删除' });
  } catch (error) {
    res.status(500).json({ error: '删除照片失败' });
  }
});

export default router;
