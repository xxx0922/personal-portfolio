// Netlify Function - 统一 API 处理器
// 将所有后端 API 请求路由到这个 Function

import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

// 导入所有路由
import authRoutes from '../../backend/src/routes/auth.js';
import personalInfoRoutes from '../../backend/src/routes/personalInfo.js';
import projectRoutes from '../../backend/src/routes/projects.js';
import skillRoutes from '../../backend/src/routes/skills.js';
import mediaRoutes from '../../backend/src/routes/media.js';
import photoRoutes from '../../backend/src/routes/photos.js';
import documentRoutes from '../../backend/src/routes/documents.js';
import regulationRoutes from '../../backend/src/routes/regulations.js';
import statsRoutes from '../../backend/src/routes/stats.js';
import messageRoutes from '../../backend/src/routes/messages.js';
import experienceRoutes from '../../backend/src/routes/experiences.js';
import articleRoutes from '../../backend/src/routes/articles.js';
import newsRoutes from '../../backend/src/routes/news.js';
import footerSettingsRoutes from '../../backend/src/routes/footer-settings.js';
import siteConfigRoutes from '../../backend/src/routes/site-config.js';
import seoSettingsRoutes from '../../backend/src/routes/seo-settings.js';
import navigationRoutes from '../../backend/src/routes/navigation.js';
import friendLinksRoutes from '../../backend/src/routes/friend-links.js';

const app = express();

// CORS 配置
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'https://www.bohenan.com',
      'https://bohenan.com',
      'https://velvety-travesseiro-9de532.netlify.app'
    ];

    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // 允许所有源，方便调试
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 挂载所有路由
app.use('/auth', authRoutes);
app.use('/personal-info', personalInfoRoutes);
app.use('/projects', projectRoutes);
app.use('/skills', skillRoutes);
app.use('/media', mediaRoutes);
app.use('/photos', photoRoutes);
app.use('/documents', documentRoutes);
app.use('/regulations', regulationRoutes);
app.use('/stats', statsRoutes);
app.use('/messages', messageRoutes);
app.use('/experiences', experienceRoutes);
app.use('/articles', articleRoutes);
app.use('/news', newsRoutes);
app.use('/footer-settings', footerSettingsRoutes);
app.use('/site-config', siteConfigRoutes);
app.use('/seo-settings', seoSettingsRoutes);
app.use('/navigation', navigationRoutes);
app.use('/friend-links', friendLinksRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Netlify Function is running' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 导出为 Netlify Function
export const handler = serverless(app);
