import express from 'express';
import { readData, writeData } from '../services/dataService.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// 获取所有项目
router.get('/', async (req, res) => {
  try {
    const projects = await readData('projects') || [];
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: '获取项目列表失败' });
  }
});

// 获取单个项目
router.get('/:id', async (req, res) => {
  try {
    const projects = await readData('projects') || [];
    const project = projects.find(p => p.id === req.params.id);

    if (!project) {
      return res.status(404).json({ error: '项目不存在' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: '获取项目失败' });
  }
});

// 创建项目 (需要管理员权限)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const projects = await readData('projects') || [];
    const newProject = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString()
    };

    projects.push(newProject);
    await writeData('projects', projects);

    res.status(201).json(newProject);
  } catch (error) {
    res.status(500).json({ error: '创建项目失败' });
  }
});

// 更新项目 (需要管理员权限)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const projects = await readData('projects') || [];
    const index = projects.findIndex(p => p.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: '项目不存在' });
    }

    projects[index] = {
      ...projects[index],
      ...req.body,
      id: req.params.id,
      updatedAt: new Date().toISOString()
    };

    await writeData('projects', projects);
    res.json(projects[index]);
  } catch (error) {
    res.status(500).json({ error: '更新项目失败' });
  }
});

// 删除项目 (需要管理员权限)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const projects = await readData('projects') || [];
    const filteredProjects = projects.filter(p => p.id !== req.params.id);

    if (projects.length === filteredProjects.length) {
      return res.status(404).json({ error: '项目不存在' });
    }

    await writeData('projects', filteredProjects);
    res.json({ message: '项目已删除' });
  } catch (error) {
    res.status(500).json({ error: '删除项目失败' });
  }
});

export default router;
