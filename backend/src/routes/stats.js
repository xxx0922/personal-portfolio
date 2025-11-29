import express from 'express';
import { readData, writeData } from '../services/dataService.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// 获取统计数据
router.get('/', async (req, res) => {
  try {
    const stats = await readData('stats') || {
      yearly: [],
      techStack: [],
      performance: []
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: '获取统计数据失败' });
  }
});

// 更新统计数据
router.put('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await writeData('stats', req.body);
    res.json(req.body);
  } catch (error) {
    res.status(500).json({ error: '更新统计数据失败' });
  }
});

export default router;
