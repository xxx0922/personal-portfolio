import { readData, writeData } from '../src/services/dataService.js';

// 视频工具列表
const videoTools = [
  { name: '度加剪辑', description: '百度推出的 AI 视频剪辑工具', icon: '🎬', url: 'https://aigc.baidu.com/make', category: '视频' },
  { name: '堆友 AI 视频', description: '阿里堆友 AI 视频生成', icon: '🎬', url: 'https://d.design', category: '视频' },
  { name: '可灵 AI 电影级视频创作', description: '快手可灵 AI 视频生成平台', icon: '🎬', url: 'https://klingai.kuaishou.com', category: '视频' },
  { name: '绘蛙 AI 视频', description: '绘蛙 AI 视频生成工具', icon: '🎬', url: 'https://www.ihuiwa.com', category: '视频' },
  { name: 'Liblib AI - 视频', description: '哩布哩布 AI 视频创作', icon: '🎬', url: 'https://www.liblib.art', category: '视频' },
  { name: '白日梦 AI 生成视频', description: 'AI 视频生成平台', icon: '🎬', url: 'https://www.aibrm.com', category: '视频' },
  { name: '即剪桌面版 (剪映)', description: '剪映桌面版下载', icon: '🎬', url: 'https://www.capcut.cn', category: '视频' },
  { name: 'LibTV - SeeDance2.0', description: 'AI 舞蹈视频生成', icon: '🎬', url: 'https://www.liblib.tv', category: '视频' },
  { name: '即梦 AI 视频生成', description: '字节即梦 AI 视频生成器', icon: '🎬', url: 'https://jimeng.jianying.com', category: '视频' },
  { name: '有言 - 一键生成视频', description: 'AI 一键生成 3D 视频', icon: '🎬', url: 'https://www.youyan3d.com', category: '视频' },
  { name: '闪剪_AI 视频剪辑', description: '智能 AI 视频剪辑工具', icon: '🎬', url: 'https://www.shanjian.tv', category: '视频' },
  { name: 'A9 AI', description: 'AI 视频创作工具', icon: '🎬', url: 'https://a9app.cn', category: '视频' },
  { name: '献丑 AI', description: 'AI 视频生成平台', icon: '🎬', url: 'https://xianchou.com', category: '视频' },
  { name: 'Flova AI', description: 'AI 视频编辑工具', icon: '🎬', url: 'https://www.flova.ai/zh-CN', category: '视频' },
  { name: '海螺 AI 视频', description: '海螺 AI 视频生成', icon: '🎬', url: 'https://www.hailuoai.com', category: '视频' },
  { name: 'Vidu', description: '国产 AI 视频生成模型', icon: '🎬', url: 'https://www.viduai.com', category: '视频' },
  { name: 'WanX2.1', description: '阿里万相 AI 视频生成', icon: '🎬', url: 'https://www.wanx.ai', category: '视频' },
  { name: 'Veo3', description: 'Google DeepMind 视频生成模型', icon: '🎬', url: 'https://deepmind.google/discover/blog/veo3/', category: '视频' }
];

async function seedVideoTools() {
  try {
    console.log('开始添加视频工具...');

    const tools = await readData('tools') || [];
    const existingCount = tools.length;

    // 检查是否已存在（通过 URL）
    const existingUrls = new Set(tools.map(t => t.url));

    let addedCount = 0;
    for (const tool of videoTools) {
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

seedVideoTools();
