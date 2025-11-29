import express from 'express';
import { readData, writeData } from '../services/dataService.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// 获取所有法规
router.get('/', async (req, res) => {
  try {
    const regulations = await readData('regulations') || [];
    res.json(regulations);
  } catch (error) {
    res.status(500).json({ error: '获取法规列表失败' });
  }
});

// 添加法规
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const regulations = await readData('regulations') || [];
    const newRegulation = {
      id: Date.now().toString(),
      ...req.body,
      publishDate: req.body.publishDate || new Date().toISOString().split('T')[0]
    };
    regulations.push(newRegulation);
    await writeData('regulations', regulations);
    res.status(201).json(newRegulation);
  } catch (error) {
    res.status(500).json({ error: '添加法规失败' });
  }
});

// 更新法规
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const regulations = await readData('regulations') || [];
    const index = regulations.findIndex(r => r.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: '法规不存在' });
    }

    regulations[index] = { ...regulations[index], ...req.body, id: req.params.id };
    await writeData('regulations', regulations);
    res.json(regulations[index]);
  } catch (error) {
    res.status(500).json({ error: '更新法规失败' });
  }
});

// 删除法规
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const regulations = await readData('regulations') || [];
    const filteredRegulations = regulations.filter(r => r.id !== req.params.id);
    await writeData('regulations', filteredRegulations);
    res.json({ message: '法规已删除' });
  } catch (error) {
    res.status(500).json({ error: '删除法规失败' });
  }
});

export default router;
