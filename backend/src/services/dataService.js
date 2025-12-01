/**
 * 数据服务层 - 自动适配文件系统或 Netlify Blobs
 * 在 Netlify 环境使用 Blobs，本地开发使用文件系统
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = path.join(__dirname, '../../data');

// 检测是否在 Netlify 环境
const isNetlify = () => process.env.NETLIFY === 'true';

// Netlify Blobs 实例（延迟加载）
let blobsStore = null;

async function getBlobsStore() {
  if (!blobsStore) {
    const { getStore } = await import('@netlify/blobs');
    blobsStore = getStore('portfolio-data');
  }
  return blobsStore;
}

// ============ 文件系统操作（本地开发）============

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

async function readDataFromFile(filename) {
  try {
    const filePath = path.join(DATA_DIR, `${filename}.json`);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

async function writeDataToFile(filename, data) {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, `${filename}.json`);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ============ Netlify Blobs 操作 ============

async function readDataFromBlobs(key) {
  try {
    const store = await getBlobsStore();
    const data = await store.get(key, { type: 'json' });
    return data;
  } catch (error) {
    console.error(`Error reading from Blobs (key: ${key}):`, error);
    return null;
  }
}

async function writeDataToBlobs(key, data) {
  try {
    const store = await getBlobsStore();
    await store.setJSON(key, data);
  } catch (error) {
    console.error(`Error writing to Blobs (key: ${key}):`, error);
    throw error;
  }
}

// ============ 统一接口 ============

/**
 * 读取数据 - 自动选择存储方式
 */
export async function readData(filename) {
  if (isNetlify()) {
    return await readDataFromBlobs(filename);
  } else {
    return await readDataFromFile(filename);
  }
}

/**
 * 写入数据 - 自动选择存储方式
 */
export async function writeData(filename, data) {
  if (isNetlify()) {
    await writeDataToBlobs(filename, data);
  } else {
    await writeDataToFile(filename, data);
  }
}

/**
 * 初始化数据
 */
export async function initializeData() {
  if (!isNetlify()) {
    await ensureDataDir();
  }

  // 初始化个人信息
  const personalInfo = await readData('personalInfo');
  if (!personalInfo) {
    await writeData('personalInfo', {
      name: "丰生水起",
      title: "弱电工程师 & 项目经理",
      email: "contact@example.com",
      phone: "+86 138-0000-0000",
      location: "中国·上海",
      bio: "拥有8年弱电系统工程经验的专业工程师，专注于监控系统、门禁系统、综合布线等弱电工程的设计与实施。",
      avatar: "https://ui-avatars.com/api/?name=Feng+Sheng&size=400&background=3b82f6&color=fff",
      photos: [
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop"
      ]
    });
  }

  // 初始化项目数据
  const projects = await readData('projects');
  if (!projects) {
    await writeData('projects', []);
  }

  // 初始化技能数据
  const skills = await readData('skills');
  if (!skills) {
    await writeData('skills', []);
  }

  // 初始化媒体数据
  const media = await readData('media');
  if (!media) {
    await writeData('media', []);
  }

  // 初始化照片数据
  const photos = await readData('photos');
  if (!photos) {
    await writeData('photos', []);
  }

  // 初始化文档数据
  const documents = await readData('documents');
  if (!documents) {
    await writeData('documents', []);
  }

  // 初始化法规数据
  const regulations = await readData('regulations');
  if (!regulations) {
    await writeData('regulations', []);
  }

  // 初始化统计数据
  const stats = await readData('stats');
  if (!stats) {
    await writeData('stats', {
      yearly: [],
      techStack: [],
      performance: []
    });
  }

  // 初始化用户数据
  const users = await readData('users');
  if (!users) {
    await writeData('users', [
      {
        id: "1",
        username: "admin",
        password: "$2a$10$rQZ5qXqW5qXqW5qXqW5qXeO", // admin123 (需要实际加密)
        role: "admin"
      }
    ]);
  }

  console.log(`✅ Data initialized successfully (${isNetlify() ? 'Netlify Blobs' : 'File System'})`);
}
