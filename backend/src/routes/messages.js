import express from 'express';
import { readData, writeData } from '../services/dataService.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// 获取所有留言（管理员）
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const messages = await readData('messages') || [];
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: '获取留言列表失败' });
  }
});

// 提交留言（公开）
router.post('/', async (req, res) => {
  try {
    const messages = await readData('messages') || [];
    const newMessage = {
      id: Date.now().toString(),
      ...req.body,
      status: 'unread', // 未读
      createdAt: new Date().toISOString()
    };
    messages.push(newMessage);
    await writeData('messages', messages);
    res.status(201).json({ success: true, message: '留言提交成功' });
  } catch (error) {
    res.status(500).json({ error: '提交留言失败' });
  }
});

// 标记留言为已读（管理员）
router.put('/:id/read', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const messages = await readData('messages') || [];
    const index = messages.findIndex(m => m.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: '留言不存在' });
    }

    messages[index].status = 'read';
    messages[index].readAt = new Date().toISOString();
    await writeData('messages', messages);
    res.json(messages[index]);
  } catch (error) {
    res.status(500).json({ error: '更新留言状态失败' });
  }
});

// 删除留言（管理员）
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const messages = await readData('messages') || [];
    const filteredMessages = messages.filter(m => m.id !== req.params.id);
    await writeData('messages', filteredMessages);
    res.json({ message: '留言已删除' });
  } catch (error) {
    res.status(500).json({ error: '删除留言失败' });
  }
});

export default router;
