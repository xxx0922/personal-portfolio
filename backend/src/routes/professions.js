import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { readData, writeData } from '../services/dataService.js';

const router = express.Router();

// 获取所有专业
router.get('/', async (req, res) => {
  try {
    let professions = await readData('professions');
    // 如果数据不存在，初始化默认数据
    if (!professions || professions.length === 0) {
      professions = [
        {
          id: '1',
          name: 'AI 人工智能',
          description: 'AI 应用开发、大模型技术、智能体设计与实现',
          icon: '🤖',
          skills: [
            { id: '1-1', name: 'Python 编程', level: 5 },
            { id: '1-2', name: '大模型应用', level: 5 },
            { id: '1-3', name: 'AI Agent 开发', level: 4 },
            { id: '1-4', name: '机器学习', level: 4 }
          ],
          certifications: [
            { id: '1-c1', name: 'AI 大模型应用认证', date: '2025-06-15' },
            { id: '1-c2', name: 'Python 高级开发认证', date: '2025-08-20' }
          ]
        },
        {
          id: '2',
          name: '弱电系统工程',
          description: '弱电系统设计、施工与维护，专注智能化工程',
          icon: '🔌',
          skills: [
            { id: '2-1', name: '监控系统', level: 5 },
            { id: '2-2', name: '门禁系统', level: 5 },
            { id: '2-3', name: '综合布线', level: 5 },
            { id: '2-4', name: '智能楼宇', level: 4 }
          ],
          certifications: [
            { id: '2-c1', name: '一级注册建造师', date: '2022-05-10' },
            { id: '2-c2', name: '弱电智能化工程师', date: '2023-09-01' }
          ]
        }
      ];
      await writeData('professions', professions);
    }
    res.json(professions);
  } catch (error) {
    console.error('Failed to load professions:', error);
    res.status(500).json({ error: '获取专业列表失败' });
  }
});

// 获取单个专业
router.get('/:id', async (req, res) => {
  try {
    let professions = await readData('professions') || [];
    const profession = professions.find(p => p.id === req.params.id);
    if (!profession) {
      return res.status(404).json({ error: '专业不存在' });
    }
    res.json(profession);
  } catch (error) {
    console.error('Failed to get profession:', error);
    res.status(500).json({ error: '获取专业详情失败' });
  }
});

// 创建专业
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, icon, skills, certifications } = req.body;

    if (!name || !description) {
      return res.status(400).json({ error: '名称和描述不能为空' });
    }

    let professions = await readData('professions') || [];
    const newProfession = {
      id: Date.now().toString(),
      name,
      description,
      icon: icon || '🤖',
      skills: skills || [],
      certifications: certifications || []
    };

    professions.push(newProfession);
    await writeData('professions', professions);
    res.status(201).json(newProfession);
  } catch (error) {
    console.error('Failed to create profession:', error);
    res.status(500).json({ error: '创建专业失败' });
  }
});

// 更新专业
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    let professions = await readData('professions') || [];
    const index = professions.findIndex(p => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: '专业不存在' });
    }

    const { name, description, icon, skills, certifications } = req.body;
    professions[index] = {
      ...professions[index],
      name: name || professions[index].name,
      description: description || professions[index].description,
      icon: icon || professions[index].icon,
      skills: skills || professions[index].skills,
      certifications: certifications || professions[index].certifications
    };

    await writeData('professions', professions);
    res.json(professions[index]);
  } catch (error) {
    console.error('Failed to update profession:', error);
    res.status(500).json({ error: '更新专业失败' });
  }
});

// 删除专业
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    let professions = await readData('professions') || [];
    const index = professions.findIndex(p => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: '专业不存在' });
    }

    professions.splice(index, 1);
    await writeData('professions', professions);
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('Failed to delete profession:', error);
    res.status(500).json({ error: '删除专业失败' });
  }
});

export default router;
