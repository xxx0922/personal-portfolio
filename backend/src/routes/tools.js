import express from 'express';
import { readData, writeData } from '../services/dataService.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// 预定义分类列表
const predefinedCategories = ['模型', '编程', '视频', '音频', '图片', '其他', '网络工具', '布线工具', '电力工具', '实用工具'];

// 获取所有分类 - 必须在 /:id 之前定义
router.get('/utils/categories', async (req, res) => {
  try {
    res.json(predefinedCategories);
  } catch (error) {
    console.error('Failed to get categories:', error);
    res.status(500).json({ error: '获取分类失败' });
  }
});

// 获取所有工具
router.get('/', async (req, res) => {
  try {
    const tools = await readData('tools');
    res.json(tools || []);
  } catch (error) {
    console.error('Failed to load tools:', error);
    res.status(500).json({ error: '获取工具列表失败' });
  }
});

// 获取单个工具
router.get('/:id', async (req, res) => {
  try {
    const tools = await readData('tools');
    const tool = (tools || []).find(t => t.id === req.params.id);
    if (!tool) {
      return res.status(404).json({ error: '工具不存在' });
    }
    res.json(tool);
  } catch (error) {
    console.error('Failed to get tool:', error);
    res.status(500).json({ error: '获取工具失败' });
  }
});

// 创建工具
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, icon, url, category } = req.body;

    if (!name || !description || !url) {
      return res.status(400).json({ error: '名称、描述和链接不能为空' });
    }

    const tools = await readData('tools') || [];

    const newTool = {
      id: Date.now().toString(),
      name,
      description,
      icon: icon || '🔧',
      url,
      category: category || '其他'
    };

    tools.push(newTool);
    await writeData('tools', tools);

    res.status(201).json(newTool);
  } catch (error) {
    console.error('Failed to create tool:', error);
    res.status(500).json({ error: '创建工具失败' });
  }
});

// 更新工具
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const tools = await readData('tools') || [];
    const index = tools.findIndex(t => t.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: '工具不存在' });
    }

    const { name, description, icon, url, category } = req.body;
    tools[index] = {
      ...tools[index],
      name: name || tools[index].name,
      description: description || tools[index].description,
      icon: icon || tools[index].icon,
      url: url || tools[index].url,
      category: category || tools[index].category
    };

    await writeData('tools', tools);
    res.json(tools[index]);
  } catch (error) {
    console.error('Failed to update tool:', error);
    res.status(500).json({ error: '更新工具失败' });
  }
});

// 删除工具
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const tools = await readData('tools') || [];
    const index = tools.findIndex(t => t.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: '工具不存在' });
    }

    tools.splice(index, 1);
    await writeData('tools', tools);

    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('Failed to delete tool:', error);
    res.status(500).json({ error: '删除工具失败' });
  }
});

export default router;
