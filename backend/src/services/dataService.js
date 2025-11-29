import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = path.join(__dirname, '../../data');

// 确保数据目录存在
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// 读取JSON文件
export async function readData(filename) {
  try {
    const filePath = path.join(DATA_DIR, `${filename}.json`);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null; // 文件不存在
    }
    throw error;
  }
}

// 写入JSON文件
export async function writeData(filename, data) {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, `${filename}.json`);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// 初始化数据
export async function initializeData() {
  await ensureDataDir();

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

  console.log('✅ Data initialized successfully');
}
