import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// Routes - 核心功能
import authRoutes from './routes/auth.js';
import personalInfoRoutes from './routes/personalInfo.js';
import projectRoutes from './routes/projects.js';
import skillRoutes from './routes/skills.js';
import mediaRoutes from './routes/media.js';
import photoRoutes from './routes/photos.js';
import documentRoutes from './routes/documents.js';
import messageRoutes from './routes/messages.js';
import uploadRoutes from './routes/upload.js';
import experienceRoutes from './routes/experiences.js';
import articleRoutes from './routes/articles.js';
import newsRoutes from './routes/news.js';
import productRoutes from './routes/products.js';
import toolRoutes from './routes/tools.js';
import professionRoutes from './routes/professions.js';
import socialLinksRoutes from './routes/socialLinks.js';
import siteConfigRoutes from './routes/siteConfig.js';
import contactRoutes from './routes/contact.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3002;
const NODE_ENV = process.env.NODE_ENV || 'development';

// CORS 配置 - 从环境变量读取允许的源
const corsOptions = {
  origin: function (origin, callback) {
    // 从环境变量读取允许的源
    const envOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [];

    // 允许的源列表
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'http://localhost:5177',
      'http://localhost:5178',
      'http://localhost:5179',
      'http://localhost:5180',
      'https://www.bohenan.com',
      'https://bohenan.com',
      'https://velvety-travesseiro-9de532.netlify.app',
      ...envOrigins
    ];

    // 允许所有 localhost 端口（开发环境）
    if (origin && origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }

    // 允许没有 origin 的请求（如 Postman）
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS blocked origin: ${origin}`);
      if (NODE_ENV === 'production') {
        return callback(new Error('Not allowed by CORS'));
      }
      callback(null, true); // 开发环境暂时允许
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
// 增加请求体大小限制到 50MB（用于文件上传）
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

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
app.use('/api/messages', messageRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/products', productRoutes);
app.use('/api/tools', toolRoutes);
app.use('/api/professions', professionRoutes);
app.use('/api/social-links', socialLinksRoutes);
app.use('/api/site-config', siteConfigRoutes);
app.use('/api/contact', contactRoutes);

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
  console.log(`\n🚀 Backend server is running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`🔧 Environment: ${NODE_ENV}`);

  // 检查 JWT_SECRET 是否安全
  if (process.env.JWT_SECRET === 'your-secret-key-change-in-production' || !process.env.JWT_SECRET) {
    console.warn('\n⚠️  WARNING: JWT_SECRET is not set or using default value!');
    console.warn('⚠️  Please set JWT_SECRET in .env file before deploying to production.\n');
  } else {
    console.log(`✅ JWT_SECRET configured (${process.env.JWT_SECRET.length} chars)`);
  }
});
