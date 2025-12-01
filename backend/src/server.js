import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Routes
import authRoutes from './routes/auth.js';
import personalInfoRoutes from './routes/personalInfo.js';
import projectRoutes from './routes/projects.js';
import skillRoutes from './routes/skills.js';
import mediaRoutes from './routes/media.js';
import photoRoutes from './routes/photos.js';
import documentRoutes from './routes/documents.js';
import regulationRoutes from './routes/regulations.js';
import statsRoutes from './routes/stats.js';
import messageRoutes from './routes/messages.js';
import uploadRoutes from './routes/upload.js';
import experienceRoutes from './routes/experiences.js';
import articleRoutes from './routes/articles.js';
import newsRoutes from './routes/news.js';
import footerSettingsRoutes from './routes/footer-settings.js';
import siteConfigRoutes from './routes/site-config.js';
import seoSettingsRoutes from './routes/seo-settings.js';
import navigationRoutes from './routes/navigation.js';
import friendLinksRoutes from './routes/friend-links.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// CORS 配置 - 允许前端域名访问
const corsOptions = {
  origin: function (origin, callback) {
    // 允许的源列表
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'https://www.bohenan.com',
      'https://bohenan.com',
      'https://velvety-travesseiro-9de532.netlify.app'
    ];

    // 允许没有 origin 的请求（如 Postman）
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS blocked origin: ${origin}`);
      callback(null, true); // 暂时允许所有源，方便调试
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

// 静态文件服务 - 提供上传的图片
app.use('/uploads', express.static(join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/personal-info', personalInfoRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/regulations', regulationRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/footer-settings', footerSettingsRoutes);
app.use('/api/site-config', siteConfigRoutes);
app.use('/api/seo-settings', seoSettingsRoutes);
app.use('/api/navigation', navigationRoutes);
app.use('/api/friend-links', friendLinksRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server is running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
});
