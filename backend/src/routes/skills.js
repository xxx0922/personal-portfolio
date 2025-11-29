import express from 'express';
import { readData, writeData } from '../services/dataService.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// 获取所有技能
router.get('/', async (req, res) => {
  try {
    const skills = await readData('skills') || [];
    res.json(skills);
  } catch (error) {
    res.status(500).json({ error: '获取技能列表失败' });
  }
});

// 添加技能
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const skills = await readData('skills') || [];
    const newSkill = {
      id: Date.now().toString(),
      ...req.body
    };
    skills.push(newSkill);
    await writeData('skills', skills);
    res.status(201).json(newSkill);
  } catch (error) {
    res.status(500).json({ error: '添加技能失败' });
  }
});

// 更新技能
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const skills = await readData('skills') || [];
    const index = skills.findIndex(s => s.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: '技能不存在' });
    }

    skills[index] = { ...skills[index], ...req.body, id: req.params.id };
    await writeData('skills', skills);
    res.json(skills[index]);
  } catch (error) {
    res.status(500).json({ error: '更新技能失败' });
  }
});

// 删除技能
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const skills = await readData('skills') || [];
    const filteredSkills = skills.filter(s => s.id !== req.params.id);
    await writeData('skills', filteredSkills);
    res.json({ message: '技能已删除' });
  } catch (error) {
    res.status(500).json({ error: '删除技能失败' });
  }
});

export default router;
