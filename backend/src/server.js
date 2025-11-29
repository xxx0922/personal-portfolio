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

// Middleware
app.use(cors());
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
