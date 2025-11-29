import express from 'express';
import { readData, writeData } from '../services/dataService.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// 获取所有文档
router.get('/', async (req, res) => {
  try {
    const documents = await readData('documents') || [];
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: '获取文档列表失败' });
  }
});

// 添加文档
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const documents = await readData('documents') || [];
    const newDocument = {
      id: Date.now().toString(),
      ...req.body,
      date: new Date().toISOString().split('T')[0]
    };
    documents.push(newDocument);
    await writeData('documents', documents);
    res.status(201).json(newDocument);
  } catch (error) {
    res.status(500).json({ error: '添加文档失败' });
  }
});

// 更新文档
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const documents = await readData('documents') || [];
    const index = documents.findIndex(d => d.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: '文档不存在' });
    }

    documents[index] = { ...documents[index], ...req.body, id: req.params.id };
    await writeData('documents', documents);
    res.json(documents[index]);
  } catch (error) {
    res.status(500).json({ error: '更新文档失败' });
  }
});

// 删除文档
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const documents = await readData('documents') || [];
    const filteredDocuments = documents.filter(d => d.id !== req.params.id);
    await writeData('documents', filteredDocuments);
    res.json({ message: '文档已删除' });
  } catch (error) {
    res.status(500).json({ error: '删除文档失败' });
  }
});

export default router;
