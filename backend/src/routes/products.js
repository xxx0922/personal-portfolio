import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { readData, writeData } from '../services/dataService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// 文件上传配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/products');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `product-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB 限制
});

// 上传媒体资源（图片/视频）
router.post('/upload-media', authenticateToken, requireAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传文件' });
    }

    const isVideo = req.file.mimetype.startsWith('video/');
    const mediaUrl = `/uploads/products/${req.file.filename}`;

    res.json({
      success: true,
      data: {
        url: mediaUrl,
        type: isVideo ? 'video' : 'image',
        mimeType: req.file.mimetype,
        size: req.file.size,
        originalName: req.file.originalname
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: '上传文件失败' });
  }
});

// 获取所有产品分类
router.get('/', async (req, res) => {
  try {
    const products = await readData('products') || [];
    res.json(products);
  } catch (error) {
    console.error('Failed to load products:', error);
    res.status(500).json({ error: '获取产品分类列表失败' });
  }
});

// 获取单个产品分类
router.get('/:id', async (req, res) => {
  try {
    const products = await readData('products') || [];
    const product = products.find(p => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ error: '产品分类不存在' });
    }
    res.json(product);
  } catch (error) {
    console.error('Failed to get product:', error);
    res.status(500).json({ error: '获取产品分类详情失败' });
  }
});

// 创建产品分类
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const products = await readData('products') || [];
    const { name, description, icon, coverImage, shortDescription, detailedDescription, mediaResources, sortOrder, isPublished, folders } = req.body;

    if (!name) {
      return res.status(400).json({ error: '产品名称不能为空' });
    }

    const newProduct = {
      id: Date.now().toString(),
      name,
      description: description || '',
      icon: icon || '📦',
      coverImage: coverImage || '',
      shortDescription: shortDescription || '',
      detailedDescription: detailedDescription || '',
      mediaResources: mediaResources || [],
      sortOrder: sortOrder !== undefined ? sortOrder : 0,
      isPublished: isPublished !== false,
      folders: folders || []
    };

    products.push(newProduct);
    await writeData('products', products);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Failed to create product:', error);
    res.status(500).json({ error: '创建产品分类失败' });
  }
});

// 更新产品分类
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const products = await readData('products') || [];
    const index = products.findIndex(p => p.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: '产品分类不存在' });
    }

    const { name, description, icon, coverImage, shortDescription, detailedDescription, mediaResources, sortOrder, isPublished, folders } = req.body;
    products[index] = {
      ...products[index],
      name: name !== undefined ? name : products[index].name,
      description: description !== undefined ? description : products[index].description,
      icon: icon !== undefined ? icon : products[index].icon,
      coverImage: coverImage !== undefined ? coverImage : products[index].coverImage,
      shortDescription: shortDescription !== undefined ? shortDescription : products[index].shortDescription,
      detailedDescription: detailedDescription !== undefined ? detailedDescription : products[index].detailedDescription,
      mediaResources: mediaResources !== undefined ? mediaResources : products[index].mediaResources,
      sortOrder: sortOrder !== undefined ? sortOrder : products[index].sortOrder,
      isPublished: isPublished !== undefined ? isPublished : products[index].isPublished,
      folders: folders !== undefined ? folders : products[index].folders
    };

    await writeData('products', products);
    res.json(products[index]);
  } catch (error) {
    console.error('Failed to update product:', error);
    res.status(500).json({ error: '更新产品分类失败' });
  }
});

// 删除产品分类
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const products = await readData('products') || [];
    const index = products.findIndex(p => p.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: '产品分类不存在' });
    }

    products.splice(index, 1);
    await writeData('products', products);
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('Failed to delete product:', error);
    res.status(500).json({ error: '删除产品分类失败' });
  }
});

// 添加一级文件夹到产品分类
router.post('/:id/folders', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const products = await readData('products') || [];
    const product = products.find(p => p.id === req.params.id);

    if (!product) {
      return res.status(404).json({ error: '产品分类不存在' });
    }

    const { name, count } = req.body;
    if (!name) {
      return res.status(400).json({ error: '文件夹名称不能为空' });
    }

    const newFolder = {
      id: `${product.id}-${Date.now()}`,
      name,
      count: count || 0,
      attachments: [], // 每个文件夹可以有多个附件
      subFolders: [] // 三级文件夹（子文件夹）
    };

    product.folders.push(newFolder);
    await writeData('products', products);
    res.json(newFolder);
  } catch (error) {
    console.error('Failed to add folder:', error);
    res.status(500).json({ error: '添加文件夹失败' });
  }
});

// 添加子文件夹（三级文件夹）
router.post('/:productId/folders/:folderId/subfolders', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const products = await readData('products') || [];
    const product = products.find(p => p.id === req.params.productId);

    if (!product) {
      return res.status(404).json({ error: '产品分类不存在' });
    }

    const folder = product.folders.find(f => f.id === req.params.folderId);
    if (!folder) {
      return res.status(404).json({ error: '文件夹不存在' });
    }

    const { name, count } = req.body;
    if (!name) {
      return res.status(400).json({ error: '子文件夹名称不能为空' });
    }

    if (!folder.subFolders) {
      folder.subFolders = [];
    }

    const newSubFolder = {
      id: `${folder.id}-${Date.now()}`,
      name,
      count: count || 0,
      attachments: []
    };

    folder.subFolders.push(newSubFolder);
    await writeData('products', products);
    res.json(newSubFolder);
  } catch (error) {
    console.error('Failed to add subfolder:', error);
    res.status(500).json({ error: '添加子文件夹失败' });
  }
});

// 删除文件夹
router.delete('/:productId/folders/:folderId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const products = await readData('products') || [];
    const product = products.find(p => p.id === req.params.productId);

    if (!product) {
      return res.status(404).json({ error: '产品分类不存在' });
    }

    const folderIndex = product.folders.findIndex(f => f.id === req.params.folderId);
    if (folderIndex === -1) {
      return res.status(404).json({ error: '文件夹不存在' });
    }

    product.folders.splice(folderIndex, 1);
    await writeData('products', products);
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('Failed to delete folder:', error);
    res.status(500).json({ error: '删除文件夹失败' });
  }
});

// 删除子文件夹（三级文件夹）
router.delete('/:productId/folders/:folderId/subfolders/:subfolderId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const products = await readData('products') || [];
    const product = products.find(p => p.id === req.params.productId);

    if (!product) {
      return res.status(404).json({ error: '产品分类不存在' });
    }

    const folder = product.folders.find(f => f.id === req.params.folderId);
    if (!folder) {
      return res.status(404).json({ error: '文件夹不存在' });
    }

    if (!folder.subFolders) {
      return res.status(404).json({ error: '子文件夹不存在' });
    }

    const subfolderIndex = folder.subFolders.findIndex(sf => sf.id === req.params.subfolderId);
    if (subfolderIndex === -1) {
      return res.status(404).json({ error: '子文件夹不存在' });
    }

    folder.subFolders.splice(subfolderIndex, 1);
    await writeData('products', products);
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('Failed to delete subfolder:', error);
    res.status(500).json({ error: '删除子文件夹失败' });
  }
});

// 上传附件到文件夹
router.post('/:productId/folders/:folderId/attachments', authenticateToken, requireAdmin, upload.single('file'), async (req, res) => {
  try {
    const products = await readData('products') || [];
    const product = products.find(p => p.id === req.params.productId);

    if (!product) {
      return res.status(404).json({ error: '产品分类不存在' });
    }

    const folder = product.folders.find(f => f.id === req.params.folderId);
    if (!folder) {
      return res.status(404).json({ error: '文件夹不存在' });
    }

    if (!req.file) {
      return res.status(400).json({ error: '请上传文件' });
    }

    const { name, description } = req.body;
    const newAttachment = {
      id: Date.now().toString(),
      name: name || req.file.originalname,
      description: description || '',
      url: `/uploads/products/${req.file.filename}`,
      originalName: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
      uploadedAt: new Date().toISOString()
    };

    if (!folder.attachments) {
      folder.attachments = [];
    }
    folder.attachments.push(newAttachment);

    await writeData('products', products);
    res.status(201).json(newAttachment);
  } catch (error) {
    console.error('Failed to upload attachment:', error);
    res.status(500).json({ error: '上传附件失败' });
  }
});

// 上传附件到子文件夹（三级文件夹）
router.post('/:productId/folders/:folderId/subfolders/:subfolderId/attachments', authenticateToken, requireAdmin, upload.single('file'), async (req, res) => {
  try {
    const products = await readData('products') || [];
    const product = products.find(p => p.id === req.params.productId);

    if (!product) {
      return res.status(404).json({ error: '产品分类不存在' });
    }

    const folder = product.folders.find(f => f.id === req.params.folderId);
    if (!folder) {
      return res.status(404).json({ error: '文件夹不存在' });
    }

    const subFolder = folder.subFolders.find(sf => sf.id === req.params.subfolderId);
    if (!subFolder) {
      return res.status(404).json({ error: '子文件夹不存在' });
    }

    if (!req.file) {
      return res.status(400).json({ error: '请上传文件' });
    }

    const { name, description } = req.body;
    const newAttachment = {
      id: Date.now().toString(),
      name: name || req.file.originalname,
      description: description || '',
      url: `/uploads/products/${req.file.filename}`,
      originalName: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
      uploadedAt: new Date().toISOString()
    };

    if (!subFolder.attachments) {
      subFolder.attachments = [];
    }
    subFolder.attachments.push(newAttachment);

    await writeData('products', products);
    res.status(201).json(newAttachment);
  } catch (error) {
    console.error('Failed to upload attachment to subfolder:', error);
    res.status(500).json({ error: '上传附件失败' });
  }
});

// 获取文件夹的附件列表
router.get('/:productId/folders/:folderId/attachments', async (req, res) => {
  try {
    const products = await readData('products') || [];
    const product = products.find(p => p.id === req.params.productId);

    if (!product) {
      return res.status(404).json({ error: '产品分类不存在' });
    }

    const folder = product.folders.find(f => f.id === req.params.folderId);
    if (!folder) {
      return res.status(404).json({ error: '文件夹不存在' });
    }

    res.json(folder.attachments || []);
  } catch (error) {
    console.error('Failed to get attachments:', error);
    res.status(500).json({ error: '获取附件列表失败' });
  }
});

// 获取子文件夹的附件列表
router.get('/:productId/folders/:folderId/subfolders/:subfolderId/attachments', async (req, res) => {
  try {
    const products = await readData('products') || [];
    const product = products.find(p => p.id === req.params.productId);

    if (!product) {
      return res.status(404).json({ error: '产品分类不存在' });
    }

    const folder = product.folders.find(f => f.id === req.params.folderId);
    if (!folder) {
      return res.status(404).json({ error: '文件夹不存在' });
    }

    const subFolder = folder.subFolders.find(sf => sf.id === req.params.subfolderId);
    if (!subFolder) {
      return res.status(404).json({ error: '子文件夹不存在' });
    }

    res.json(subFolder.attachments || []);
  } catch (error) {
    console.error('Failed to get subfolder attachments:', error);
    res.status(500).json({ error: '获取附件列表失败' });
  }
});

// 删除附件
router.delete('/:productId/folders/:folderId/attachments/:attachmentId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const products = await readData('products') || [];
    const product = products.find(p => p.id === req.params.productId);

    if (!product) {
      return res.status(404).json({ error: '产品分类不存在' });
    }

    const folder = product.folders.find(f => f.id === req.params.folderId);
    if (!folder) {
      return res.status(404).json({ error: '文件夹不存在' });
    }

    if (!folder.attachments) {
      return res.status(404).json({ error: '附件不存在' });
    }

    const attachmentIndex = folder.attachments.findIndex(a => a.id === req.params.attachmentId);
    if (attachmentIndex === -1) {
      return res.status(404).json({ error: '附件不存在' });
    }

    folder.attachments.splice(attachmentIndex, 1);
    await writeData('products', products);
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('Failed to delete attachment:', error);
    res.status(500).json({ error: '删除附件失败' });
  }
});

// 删除子文件夹的附件
router.delete('/:productId/folders/:folderId/subfolders/:subfolderId/attachments/:attachmentId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const products = await readData('products') || [];
    const product = products.find(p => p.id === req.params.productId);

    if (!product) {
      return res.status(404).json({ error: '产品分类不存在' });
    }

    const folder = product.folders.find(f => f.id === req.params.folderId);
    if (!folder) {
      return res.status(404).json({ error: '文件夹不存在' });
    }

    const subFolder = folder.subFolders.find(sf => sf.id === req.params.subfolderId);
    if (!subFolder) {
      return res.status(404).json({ error: '子文件夹不存在' });
    }

    if (!subFolder.attachments) {
      return res.status(404).json({ error: '附件不存在' });
    }

    const attachmentIndex = subFolder.attachments.findIndex(a => a.id === req.params.attachmentId);
    if (attachmentIndex === -1) {
      return res.status(404).json({ error: '附件不存在' });
    }

    subFolder.attachments.splice(attachmentIndex, 1);
    await writeData('products', products);
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('Failed to delete subfolder attachment:', error);
    res.status(500).json({ error: '删除附件失败' });
  }
});

// 更新附件信息
router.put('/:productId/folders/:folderId/attachments/:attachmentId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const products = await readData('products') || [];
    const product = products.find(p => p.id === req.params.productId);

    if (!product) {
      return res.status(404).json({ error: '产品分类不存在' });
    }

    const folder = product.folders.find(f => f.id === req.params.folderId);
    if (!folder) {
      return res.status(404).json({ error: '文件夹不存在' });
    }

    if (!folder.attachments) {
      return res.status(404).json({ error: '附件不存在' });
    }

    const attachment = folder.attachments.find(a => a.id === req.params.attachmentId);
    if (!attachment) {
      return res.status(404).json({ error: '附件不存在' });
    }

    const { name, description } = req.body;
    if (name) attachment.name = name;
    if (description !== undefined) attachment.description = description;

    await writeData('products', products);
    res.json(attachment);
  } catch (error) {
    console.error('Failed to update attachment:', error);
    res.status(500).json({ error: '更新附件失败' });
  }
});

// 更新子文件夹的附件信息
router.put('/:productId/folders/:folderId/subfolders/:subfolderId/attachments/:attachmentId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const products = await readData('products') || [];
    const product = products.find(p => p.id === req.params.productId);

    if (!product) {
      return res.status(404).json({ error: '产品分类不存在' });
    }

    const folder = product.folders.find(f => f.id === req.params.folderId);
    if (!folder) {
      return res.status(404).json({ error: '文件夹不存在' });
    }

    const subFolder = folder.subFolders.find(sf => sf.id === req.params.subfolderId);
    if (!subFolder) {
      return res.status(404).json({ error: '子文件夹不存在' });
    }

    if (!subFolder.attachments) {
      return res.status(404).json({ error: '附件不存在' });
    }

    const attachment = subFolder.attachments.find(a => a.id === req.params.attachmentId);
    if (!attachment) {
      return res.status(404).json({ error: '附件不存在' });
    }

    const { name, description } = req.body;
    if (name) attachment.name = name;
    if (description !== undefined) attachment.description = description;

    await writeData('products', products);
    res.json(attachment);
  } catch (error) {
    console.error('Failed to update subfolder attachment:', error);
    res.status(500).json({ error: '更新附件失败' });
  }
});

// 添加媒体资源到产品
router.post('/:id/media', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const products = await readData('products') || [];
    const product = products.find(p => p.id === req.params.id);

    if (!product) {
      return res.status(404).json({ error: '产品分类不存在' });
    }

    const { type, url, thumbnailUrl, title, description, sortOrder } = req.body;
    if (!type || !url) {
      return res.status(400).json({ error: '类型和 URL 不能为空' });
    }

    if (!product.mediaResources) {
      product.mediaResources = [];
    }

    const newMedia = {
      id: Date.now().toString(),
      type,
      url,
      thumbnailUrl: thumbnailUrl || '',
      title: title || '',
      description: description || '',
      sortOrder: sortOrder !== undefined ? sortOrder : product.mediaResources.length,
      uploadedAt: new Date().toISOString()
    };

    product.mediaResources.push(newMedia);
    await writeData('products', products);
    res.status(201).json(newMedia);
  } catch (error) {
    console.error('Failed to add media resource:', error);
    res.status(500).json({ error: '添加媒体资源失败' });
  }
});

// 更新媒体资源
router.put('/:productId/media/:mediaId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const products = await readData('products') || [];
    const product = products.find(p => p.id === req.params.productId);

    if (!product) {
      return res.status(404).json({ error: '产品分类不存在' });
    }

    if (!product.mediaResources) {
      return res.status(404).json({ error: '媒体资源不存在' });
    }

    const media = product.mediaResources.find(m => m.id === req.params.mediaId);
    if (!media) {
      return res.status(404).json({ error: '媒体资源不存在' });
    }

    const { type, url, thumbnailUrl, title, description, sortOrder } = req.body;
    if (type) media.type = type;
    if (url) media.url = url;
    if (thumbnailUrl !== undefined) media.thumbnailUrl = thumbnailUrl;
    if (title !== undefined) media.title = title;
    if (description !== undefined) media.description = description;
    if (sortOrder !== undefined) media.sortOrder = sortOrder;

    await writeData('products', products);
    res.json(media);
  } catch (error) {
    console.error('Failed to update media resource:', error);
    res.status(500).json({ error: '更新媒体资源失败' });
  }
});

// 删除媒体资源
router.delete('/:productId/media/:mediaId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const products = await readData('products') || [];
    const product = products.find(p => p.id === req.params.productId);

    if (!product) {
      return res.status(404).json({ error: '产品分类不存在' });
    }

    if (!product.mediaResources) {
      return res.status(404).json({ error: '媒体资源不存在' });
    }

    const mediaIndex = product.mediaResources.findIndex(m => m.id === req.params.mediaId);
    if (mediaIndex === -1) {
      return res.status(404).json({ error: '媒体资源不存在' });
    }

    product.mediaResources.splice(mediaIndex, 1);
    await writeData('products', products);
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('Failed to delete media resource:', error);
    res.status(500).json({ error: '删除媒体资源失败' });
  }
});

// 排序媒体资源
router.put('/:id/media/reorder', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const products = await readData('products') || [];
    const product = products.find(p => p.id === req.params.id);

    if (!product) {
      return res.status(404).json({ error: '产品分类不存在' });
    }

    if (!product.mediaResources) {
      return res.status(404).json({ error: '媒体资源不存在' });
    }

    const { mediaIds } = req.body; // 排序后的媒体 ID 数组
    if (!Array.isArray(mediaIds)) {
      return res.status(400).json({ error: '无效的媒体 ID 列表' });
    }

    const reorderedMedia = [];
    for (const id of mediaIds) {
      const media = product.mediaResources.find(m => m.id === id);
      if (media) {
        reorderedMedia.push(media);
      }
    }

    // 更新排序值
    reorderedMedia.forEach((media, index) => {
      media.sortOrder = index;
    });

    product.mediaResources = reorderedMedia;
    await writeData('products', products);
    res.json(product.mediaResources);
  } catch (error) {
    console.error('Failed to reorder media resources:', error);
    res.status(500).json({ error: '排序媒体资源失败' });
  }
});

export default router;
