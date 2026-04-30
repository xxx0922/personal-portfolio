import express from 'express';
import { readData, writeData } from '../services/dataService.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// 获取音乐配置
router.get('/music', async (req, res) => {
  try {
    const config = await readData('siteConfig');
    res.json(config?.music || { enabled: false, musicList: [], volume: 0.3 });
  } catch (error) {
    console.error('Failed to load music config:', error);
    res.json({ enabled: false, musicList: [], volume: 0.3 });
  }
});

// 更新音乐配置
router.put('/music', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { enabled, musicList, volume } = req.body;

    const config = await readData('siteConfig') || {};

    config.music = {
      enabled: enabled !== undefined ? enabled : config.music?.enabled,
      musicList: musicList !== undefined ? musicList : config.music?.musicList || [],
      volume: volume !== undefined ? volume : config.music?.volume ?? 0.3
    };

    await writeData('siteConfig', config);
    res.json(config.music);
  } catch (error) {
    console.error('Failed to update music config:', error);
    res.status(500).json({ error: '更新音乐配置失败' });
  }
});

// 获取完整站点配置
router.get('/', async (req, res) => {
  try {
    const config = await readData('siteConfig');
    res.json(config || {});
  } catch (error) {
    console.error('Failed to load site config:', error);
    res.status(500).json({ error: '获取站点配置失败' });
  }
});

// 更新完整站点配置
router.put('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await writeData('siteConfig', req.body);
    res.json(req.body);
  } catch (error) {
    console.error('Failed to update site config:', error);
    res.status(500).json({ error: '更新站点配置失败' });
  }
});

export default router;
