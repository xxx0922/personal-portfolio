import express from 'express';
import { readData, writeData } from '../services/dataService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 获取导航菜单
router.get('/', async (req, res) => {
  try {
    const navigation = await readData('navigation');
    const items = navigation?.items || getDefaultNavigation();
    // 按order排序并过滤visible的项目（公开API）
    const sortedItems = items
      .filter(item => item.visible)
      .sort((a, b) => a.order - b.order);
    res.json(sortedItems);
  } catch (error) {
    console.error('Error reading navigation:', error);
    res.json(getDefaultNavigation());
  }
});

// 获取所有导航菜单（包括隐藏的，管理员用）
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const navigation = await readData('navigation');
    const items = navigation?.items || getDefaultNavigation();
    // 按order排序
    const sortedItems = items.sort((a, b) => a.order - b.order);
    res.json(sortedItems);
  } catch (error) {
    console.error('Error reading navigation:', error);
    res.json(getDefaultNavigation());
  }
});

// 更新导航菜单（需要认证）
router.put('/', authenticateToken, async (req, res) => {
  try {
    const navigation = {
      items: req.body,
      updatedAt: new Date().toISOString()
    };

    await writeData('navigation', navigation);
    res.json({ message: '导航菜单更新成功', data: navigation });
  } catch (error) {
    console.error('Error updating navigation:', error);
    res.status(500).json({ message: '更新失败' });
  }
});

// 添加导航项（需要认证）
router.post('/', authenticateToken, async (req, res) => {
  try {
    const navigation = await readData('navigation');
    const items = navigation?.items || [];

    const newItem = {
      id: Date.now().toString(),
      ...req.body,
      order: items.length
    };

    items.push(newItem);

    await writeData('navigation', { items, updatedAt: new Date().toISOString() });
    res.json({ message: '导航项添加成功', data: newItem });
  } catch (error) {
    console.error('Error adding navigation item:', error);
    res.status(500).json({ message: '添加失败' });
  }
});

// 删除导航项（需要认证）
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const navigation = await readData('navigation');
    const items = navigation?.items || [];

    const filteredItems = items.filter(item => item.id !== req.params.id);

    await writeData('navigation', { items: filteredItems, updatedAt: new Date().toISOString() });
    res.json({ message: '导航项删除成功' });
  } catch (error) {
    console.error('Error deleting navigation item:', error);
    res.status(500).json({ message: '删除失败' });
  }
});

// 默认导航菜单
function getDefaultNavigation() {
  return [
    { id: '1', label: '首页', path: '/', order: 0, visible: true, isExternal: false },
    { id: '2', label: '项目经验', path: '#projects', order: 1, visible: true, isExternal: false },
    { id: '3', label: '专业技能', path: '#skills', order: 2, visible: true, isExternal: false },
    { id: '4', label: '影音书籍', path: '#media', order: 3, visible: true, isExternal: false },
    { id: '5', label: '精彩瞬间', path: '#photos', order: 4, visible: true, isExternal: false },
    { id: '6', label: '知识文档', path: '#documents', order: 5, visible: true, isExternal: false },
    { id: '7', label: '联系我', path: '#contact', order: 6, visible: true, isExternal: false }
  ];
}

export default router;
