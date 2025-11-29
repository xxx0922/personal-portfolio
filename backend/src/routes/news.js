import express from 'express';
import { readData, writeData } from '../services/dataService.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// 获取所有新闻动态（公开）
router.get('/', async (req, res) => {
  try {
    const news = await readData('news') || [];
    // 按发布日期降序排序
    const sortedNews = news
      .filter(item => item.status === 'published')
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    res.json(sortedNews);
  } catch (error) {
    res.status(500).json({ error: '获取新闻动态失败' });
  }
});

// 获取所有新闻（管理员，包括草稿）
router.get('/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const news = await readData('news') || [];
    const sortedNews = news.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    res.json(sortedNews);
  } catch (error) {
    res.status(500).json({ error: '获取新闻动态失败' });
  }
});

// 按类型获取新闻
router.get('/type/:type', async (req, res) => {
  try {
    const news = await readData('news') || [];
    const filteredNews = news
      .filter(item => item.status === 'published' && item.type === req.params.type)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    res.json(filteredNews);
  } catch (error) {
    res.status(500).json({ error: '获取新闻动态失败' });
  }
});

// 获取单条新闻（公开）
router.get('/:id', async (req, res) => {
  try {
    const news = await readData('news') || [];
    const newsItem = news.find(item => item.id === req.params.id);

    if (!newsItem) {
      return res.status(404).json({ error: '新闻不存在' });
    }

    if (newsItem.status !== 'published') {
      return res.status(404).json({ error: '新闻不存在' });
    }

    res.json(newsItem);
  } catch (error) {
    res.status(500).json({ error: '获取新闻失败' });
  }
});

// 创建新闻（需要管理员权限）
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const news = await readData('news') || [];
    const newNews = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: req.body.status === 'published' ? new Date().toISOString() : null
    };

    news.push(newNews);
    await writeData('news', news);

    res.status(201).json(newNews);
  } catch (error) {
    res.status(500).json({ error: '创建新闻失败' });
  }
});

// 更新新闻（需要管理员权限）
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const news = await readData('news') || [];
    const index = news.findIndex(item => item.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: '新闻不存在' });
    }

    const oldStatus = news[index].status;
    const newStatus = req.body.status;

    news[index] = {
      ...news[index],
      ...req.body,
      id: req.params.id,
      updatedAt: new Date().toISOString(),
      publishedAt: (oldStatus !== 'published' && newStatus === 'published')
        ? new Date().toISOString()
        : news[index].publishedAt
    };

    await writeData('news', news);
    res.json(news[index]);
  } catch (error) {
    res.status(500).json({ error: '更新新闻失败' });
  }
});

// 删除新闻（需要管理员权限）
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const news = await readData('news') || [];
    const filteredNews = news.filter(item => item.id !== req.params.id);

    await writeData('news', filteredNews);
    res.json({ message: '新闻已删除' });
  } catch (error) {
    res.status(500).json({ error: '删除新闻失败' });
  }
});

export default router;
