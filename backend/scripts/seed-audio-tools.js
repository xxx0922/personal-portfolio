import { readData, writeData } from '../src/services/dataService.js';

// 音频工具列表
const audioTools = [
  { name: 'Suno 苏诺中文版', description: 'Suno AI 音乐生成器中文版', icon: '🎵', url: 'https://www.suno.cn/home/#/?from=invite&invite_id=9580359', category: '音频' },
  { name: '即梦 AI 音乐生成', description: '字节跳动即梦 AI 音乐生成平台', icon: '🎵', url: 'https://jimeng.linglu.pro', category: '音频' },
  { name: 'Mureka AI', description: 'AI 音乐创作平台', icon: '🎵', url: 'https://www.mureka.ai', category: '音频' },
  { name: '抖音音乐', description: '抖音官方音乐平台', icon: '🎵', url: 'https://music.douyin.com', category: '音频' },
  { name: 'OpenMusic AI', description: 'HuggingFace 开源 AI 音乐生成器', icon: '🎵', url: 'https://huggingface.co/jadechoghari/openmusic', category: '音频' },
  { name: '音潮', description: 'AI 音乐创作工具', icon: '🎵', url: 'https://www.yinchaoyongxian.com', category: '音频' },
  { name: '网易・天音', description: '网易云音乐 AI 音乐平台', icon: '🎵', url: 'https://tianyin.music.163.com', category: '音频' },
  { name: '苏诺 suno', description: 'Suno AI 原版音乐生成器', icon: '🎵', url: 'https://suno.com', category: '音频' },
  { name: 'AIVA', description: 'AI 作曲助手', icon: '🎵', url: 'https://www.aiva.ai', category: '音频' },
  { name: 'MuseNet', description: 'OpenAI 音乐生成模型', icon: '🎵', url: 'https://openai.com/research/musenet', category: '音频' },
  { name: 'Ecrett Music', description: '免版税 AI 音乐生成器', icon: '🎵', url: 'https://www.ecrett.com', category: '音频' },
  { name: 'EasyMusic', description: '简易 AI 音乐生成', icon: '🎵', url: 'https://easymusic.ai', category: '音频' },
  { name: 'SongGenerator', description: '在线 AI 歌曲生成器', icon: '🎵', url: 'https://songgenerator.org', category: '音频' },
  { name: 'AI Make Song', description: 'AI 歌曲制作工具', icon: '🎵', url: 'https://www.aimakesong.com', category: '音频' },
  { name: 'Brev AI', description: 'AI 音乐生成平台', icon: '🎵', url: 'https://brev.ai/zh-CN', category: '音频' },
  { name: 'Remusic', description: 'AI 音乐创作助手', icon: '🎵', url: 'https://remusic.ai/cn', category: '音频' },
  { name: 'MusicHero', description: 'AI 音乐英雄生成器', icon: '🎵', url: 'https://musichero.ai', category: '音频' },
  { name: 'Text-To-Song', description: '文本转歌曲生成器', icon: '🎵', url: 'https://texttosong.ai', category: '音频' }
];

async function seedAudioTools() {
  try {
    console.log('开始添加音频工具...');

    const tools = await readData('tools') || [];
    const existingCount = tools.length;

    // 检查是否已存在（通过 URL）
    const existingUrls = new Set(tools.map(t => t.url));

    let addedCount = 0;
    for (const tool of audioTools) {
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

seedAudioTools();
