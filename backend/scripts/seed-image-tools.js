import { readData, writeData } from '../src/services/dataService.js';

// 图片工具列表
const imageTools = [
  { name: '堆友 AI 绘画', description: '阿里推出的 AI 绘画工具', icon: '🎨', url: 'https://d.design', category: '图片' },
  { name: '搞定 AI - 文生图', description: '在线文生图 AI 工具', icon: '🎨', url: 'https://gaoding.com', category: '图片' },
  { name: 'LiblibAI - 哩布哩布 AI', description: 'AI 模型分享与创作平台', icon: '🎨', url: 'https://www.liblibai.com', category: '图片' },
  { name: '阿贝 AI 绘画', description: '在线 AI 绘画创作工具', icon: '🎨', url: 'https://www.abeiai.com', category: '图片' },
  { name: '可图 AI 绘画', description: '快手推出的 AI 绘画平台', icon: '🎨', url: 'https://kolors.kuaishou.com', category: '图片' },
  { name: '绘蛙 AI - 创意文生图', description: '创意 AI 文生图工具', icon: '🎨', url: 'https://www.ihuiwa.com', category: '图片' },
  { name: 'MX 绘画中文站', description: 'AI 绘画创作平台', icon: '🎨', url: 'https://www.mxai.cn', category: '图片' },
  { name: '巨日禄 AI 漫画', description: 'AI 漫画生成工具', icon: '🎨', url: 'https://ai.jurilu.com', category: '图片' },
  { name: '图星人 AI 生图', description: 'AI 图像生成平台', icon: '🎨', url: 'https://www.tuxingren.com', category: '图片' },
  { name: 'LinkFox AI', description: 'AI 设计与创作工具', icon: '🎨', url: 'https://linkfox.com', category: '图片' },
  { name: '摄图 AI 画图', description: '摄图网 AI 绘画工具', icon: '🎨', url: 'https://image.shitu.com', category: '图片' },
  { name: '即梦 AI 图片生成', description: '字节即梦 AI 图片生成器', icon: '🎨', url: 'https://jimeng.jianying.com', category: '图片' },
  { name: 'Openflow', description: 'AI 工作流与图像生成', icon: '🎨', url: 'https://www.openflowai.net', category: '图片' },
  { name: '造点 AI', description: '夸克 AI 绘画工具', icon: '🎨', url: 'https://zaodian.quark.cn', category: '图片' },
  { name: '包图 AI 文生图', description: '包图网 AI 文生图工具', icon: '🎨', url: 'https://ibaotu.com', category: '图片' },
  { name: 'Holopix AI', description: '3D 全景 AI 创作平台', icon: '🎨', url: 'https://www.holopix.com', category: '图片' },
  { name: '吐司 AI 绘画', description: '在线 AI 绘画社区', icon: '🎨', url: 'https://tusi.art', category: '图片' },
  { name: '触手 AI 绘画', description: 'AI 绘画创作社区', icon: '🎨', url: 'https://www.chushouai.com', category: '图片' }
];

async function seedImageTools() {
  try {
    console.log('开始添加图片工具...');

    const tools = await readData('tools') || [];
    const existingCount = tools.length;

    // 检查是否已存在（通过 URL）
    const existingUrls = new Set(tools.map(t => t.url));

    let addedCount = 0;
    for (const tool of imageTools) {
      if (!existingUrls.has(tool.url)) {
        const newTool = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          ...tool
        };
        tools.push(newTool);
        addedCount++;
        console.log(`✅ 添加：${tool.name}`);
      } else {
        console.log(`⏭️ 已存在：${tool.name}`);
      }
    }

    await writeData('tools', tools);

    console.log(`\n完成！`);
    console.log(`原有工具：${existingCount} 个`);
    console.log(`新增工具：${addedCount} 个`);
    console.log(`总计工具：${tools.length} 个`);

  } catch (error) {
    console.error('错误:', error);
    process.exit(1);
  }
}

seedImageTools();
