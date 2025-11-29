import express from 'express';
import { readData, writeData } from '../services/dataService.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// 获取所有工作经历（公开）
router.get('/', async (req, res) => {
  try {
    const experiences = await readData('experiences') || [];
    // 按开始日期降序排序
    const sortedExperiences = experiences.sort((a, b) => {
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });
    res.json(sortedExperiences);
  } catch (error) {
    res.status(500).json({ error: '获取工作经历失败' });
  }
});

// 获取单个工作经历（公开）
router.get('/:id', async (req, res) => {
  try {
    const experiences = await readData('experiences') || [];
    const experience = experiences.find(exp => exp.id === req.params.id);

    if (!experience) {
      return res.status(404).json({ error: '工作经历不存在' });
    }

    res.json(experience);
  } catch (error) {
    res.status(500).json({ error: '获取工作经历失败' });
  }
});

// 创建工作经历（需要管理员权限）
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const experiences = await readData('experiences') || [];
    const newExperience = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    experiences.push(newExperience);
    await writeData('experiences', experiences);

    res.status(201).json(newExperience);
  } catch (error) {
    res.status(500).json({ error: '创建工作经历失败' });
  }
});

// 更新工作经历（需要管理员权限）
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const experiences = await readData('experiences') || [];
    const index = experiences.findIndex(exp => exp.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: '工作经历不存在' });
    }

    experiences[index] = {
      ...experiences[index],
      ...req.body,
      id: req.params.id,
      updatedAt: new Date().toISOString()
    };

    await writeData('experiences', experiences);
    res.json(experiences[index]);
  } catch (error) {
    res.status(500).json({ error: '更新工作经历失败' });
  }
});

// 删除工作经历（需要管理员权限）
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const experiences = await readData('experiences') || [];
    const filteredExperiences = experiences.filter(exp => exp.id !== req.params.id);

    await writeData('experiences', filteredExperiences);
    res.json({ message: '工作经历已删除' });
  } catch (error) {
    res.status(500).json({ error: '删除工作经历失败' });
  }
});

export default router;
