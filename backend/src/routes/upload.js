import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs/promises';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// 配置上传目录
const uploadDir = path.join(__dirname, '../../uploads');
const thumbnailDir = path.join(uploadDir, 'thumbnails');

// 确保上传目录存在
async function ensureDirectories() {
  try {
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.mkdir(thumbnailDir, { recursive: true });
  } catch (error) {
    console.error('Error creating directories:', error);
  }
}

ensureDirectories();

// 配置 multer
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('只支持 JPEG, PNG, WebP 和 GIF 格式的图片'));
    }
  },
});

// 配置文件上传（用于附件）
const fileUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const timestamp = Date.now();
      const sanitizedName = file.originalname.replace(/\s+/g, '-');
      cb(null, `${timestamp}-${sanitizedName}`);
    },
  }),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

// 上传单张图片（需要管理员权限）
router.post('/single', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请选择要上传的图片' });
    }

    const timestamp = Date.now();
    const filename = `${timestamp}-${req.file.originalname.replace(/\s+/g, '-')}`;
    const filePath = path.join(uploadDir, filename);
    const thumbnailPath = path.join(thumbnailDir, `thumb-${filename}`);

    // 压缩并保存原图
    await sharp(req.file.buffer)
      .resize(1920, 1920, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toFile(filePath);

    // 生成缩略图
    await sharp(req.file.buffer)
      .resize(400, 400, {
        fit: 'cover',
      })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    // 返回图片URL
    const imageUrl = `/uploads/${filename}`;
    const thumbnailUrl = `/uploads/thumbnails/thumb-${filename}`;

    res.status(201).json({
      success: true,
      message: '图片上传成功',
      data: {
        url: imageUrl,
        thumbnailUrl,
        filename,
        originalName: req.file.originalname,
        size: req.file.size,
      },
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: '图片上传失败: ' + error.message });
  }
});

// 上传多张图片（需要管理员权限）
router.post('/multiple', authenticateToken, requireAdmin, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: '请选择要上传的图片' });
    }

    const uploadedImages = [];

    for (const file of req.files) {
      const timestamp = Date.now();
      const filename = `${timestamp}-${file.originalname.replace(/\s+/g, '-')}`;
      const filePath = path.join(uploadDir, filename);
      const thumbnailPath = path.join(thumbnailDir, `thumb-${filename}`);

      // 压缩并保存原图
      await sharp(file.buffer)
        .resize(1920, 1920, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85 })
        .toFile(filePath);

      // 生成缩略图
      await sharp(file.buffer)
        .resize(400, 400, {
          fit: 'cover',
        })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);

      uploadedImages.push({
        url: `/uploads/${filename}`,
        thumbnailUrl: `/uploads/thumbnails/thumb-${filename}`,
        filename,
        originalName: file.originalname,
        size: file.size,
      });
    }

    res.status(201).json({
      success: true,
      message: `成功上传 ${uploadedImages.length} 张图片`,
      data: uploadedImages,
    });
  } catch (error) {
    console.error('Multiple image upload error:', error);
    res.status(500).json({ error: '图片上传失败: ' + error.message });
  }
});

// 上传文件附件（需要管理员权限）
router.post('/file', authenticateToken, requireAdmin, fileUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请选择要上传的文件' });
    }

    // 返回文件URL
    const fileUrl = `/uploads/${req.file.filename}`;

    res.status(201).json({
      success: true,
      message: '文件上传成功',
      data: {
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: '文件上传失败: ' + error.message });
  }
});

// 删除图片（需要管理员权限）
router.delete('/:filename', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadDir, filename);
    const thumbnailPath = path.join(thumbnailDir, `thumb-${filename}`);

    // 删除原图和缩略图
    await Promise.all([
      fs.unlink(filePath).catch(() => {}),
      fs.unlink(thumbnailPath).catch(() => {}),
    ]);

    res.json({ success: true, message: '图片删除成功' });
  } catch (error) {
    console.error('Image delete error:', error);
    res.status(500).json({ error: '图片删除失败' });
  }
});

// 获取所有上传的图片列表（需要管理员权限）
router.get('/list', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const files = await fs.readdir(uploadDir);
    const imageFiles = files.filter((file) =>
      ['.jpg', '.jpeg', '.png', '.webp', '.gif'].some((ext) => file.toLowerCase().endsWith(ext))
    );

    const images = imageFiles.map((file) => ({
      filename: file,
      url: `/uploads/${file}`,
      thumbnailUrl: `/uploads/thumbnails/thumb-${file}`,
    }));

    res.json({ success: true, data: images });
  } catch (error) {
    console.error('List images error:', error);
    res.status(500).json({ error: '获取图片列表失败' });
  }
});

export default router;
