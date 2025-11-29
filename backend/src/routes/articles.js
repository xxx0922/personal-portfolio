import express from 'express';
import { readData, writeData } from '../services/dataService.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// 获取所有文章（公开，只显示已发布的）
router.get('/', async (req, res) => {
  try {
    const articles = await readData('articles') || [];
    // 只返回已发布的文章，按发布日期降序排序
    const publishedArticles = articles
      .filter(article => article.status === 'published')
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    res.json(publishedArticles);
  } catch (error) {
    res.status(500).json({ error: '获取文章列表失败' });
  }
});

// 获取所有文章（管理员，包括草稿）
router.get('/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const articles = await readData('articles') || [];
    const sortedArticles = articles.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    res.json(sortedArticles);
  } catch (error) {
    res.status(500).json({ error: '获取文章列表失败' });
  }
});

// 获取单篇文章（公开）
router.get('/:id', async (req, res) => {
  try {
    const articles = await readData('articles') || [];
    const article = articles.find(art => art.id === req.params.id);

    if (!article) {
      return res.status(404).json({ error: '文章不存在' });
    }

    // 如果不是管理员，只能查看已发布的文章
    if (article.status !== 'published') {
      return res.status(404).json({ error: '文章不存在' });
    }

    // 增加阅读量
    article.views = (article.views || 0) + 1;
    await writeData('articles', articles);

    res.json(article);
  } catch (error) {
    res.status(500).json({ error: '获取文章失败' });
  }
});

// 按分类获取文章
router.get('/category/:category', async (req, res) => {
  try {
    const articles = await readData('articles') || [];
    const filteredArticles = articles
      .filter(article => article.status === 'published' && article.category === req.params.category)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    res.json(filteredArticles);
  } catch (error) {
    res.status(500).json({ error: '获取文章失败' });
  }
});

// 按标签获取文章
router.get('/tag/:tag', async (req, res) => {
  try {
    const articles = await readData('articles') || [];
    const filteredArticles = articles
      .filter(article =>
        article.status === 'published' &&
        article.tags &&
        article.tags.includes(req.params.tag)
      )
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    res.json(filteredArticles);
  } catch (error) {
    res.status(500).json({ error: '获取文章失败' });
  }
});

// 创建文章（需要管理员权限）
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const articles = await readData('articles') || [];
    const newArticle = {
      id: Date.now().toString(),
      ...req.body,
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: req.body.status === 'published' ? new Date().toISOString() : null
    };

    articles.push(newArticle);
    await writeData('articles', articles);

    res.status(201).json(newArticle);
  } catch (error) {
    res.status(500).json({ error: '创建文章失败' });
  }
});

// 更新文章（需要管理员权限）
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const articles = await readData('articles') || [];
    const index = articles.findIndex(art => art.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: '文章不存在' });
    }

    const oldStatus = articles[index].status;
    const newStatus = req.body.status;

    articles[index] = {
      ...articles[index],
      ...req.body,
      id: req.params.id,
      updatedAt: new Date().toISOString(),
      // 如果从草稿变为发布，更新发布时间
      publishedAt: (oldStatus !== 'published' && newStatus === 'published')
        ? new Date().toISOString()
        : articles[index].publishedAt
    };

    await writeData('articles', articles);
    res.json(articles[index]);
  } catch (error) {
    res.status(500).json({ error: '更新文章失败' });
  }
});

// 删除文章（需要管理员权限）
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const articles = await readData('articles') || [];
    const filteredArticles = articles.filter(art => art.id !== req.params.id);

    await writeData('articles', filteredArticles);
    res.json({ message: '文章已删除' });
  } catch (error) {
    res.status(500).json({ error: '删除文章失败' });
  }
});

export default router;
