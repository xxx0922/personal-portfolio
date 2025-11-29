import express from 'express';
import { readData, writeData } from '../services/dataService.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// 获取个人信息
router.get('/', async (req, res) => {
  try {
    const personalInfo = await readData('personalInfo');
    res.json(personalInfo || {});
  } catch (error) {
    res.status(500).json({ error: '获取个人信息失败' });
  }
});

// 更新个人信息 (需要管理员权限)
router.put('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await writeData('personalInfo', req.body);
    res.json(req.body);
  } catch (error) {
    res.status(500).json({ error: '更新个人信息失败' });
  }
});

export default router;
