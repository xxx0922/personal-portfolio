import { readData, writeData } from '../src/services/dataService.js';

// 大模型工具列表
const llmTools = [
  { name: 'OpenAI ChatGPT', description: 'OpenAI 开发的领先 AI 对话模型', icon: '🤖', url: 'https://chatgpt.com', category: '大模型' },
  { name: 'Google Gemini', description: 'Google 推出的多模态 AI 助手', icon: '✨', url: 'https://gemini.google.com', category: '大模型' },
  { name: 'Anthropic Claude', description: 'Anthropic 开发的安全 AI 助手', icon: '☀️', url: 'https://claude.ai', category: '大模型' },
  { name: 'Microsoft Copilot', description: '微软 AI 助手，集成 GPT-4', icon: '🟦', url: 'https://copilot.microsoft.com', category: '大模型' },
  { name: 'Meta Llama', description: 'Meta 开源的大语言模型系列', icon: '🦙', url: 'https://ai.meta.com/llama/', category: '大模型' },
  { name: 'Mistral AI', description: '法国 AI 公司开发的高效模型', icon: '💨', url: 'https://mistral.ai', category: '大模型' },
  { name: '豆包', description: '字节跳动推出的 AI 助手', icon: '🪄', url: 'https://www.doubao.com', category: '大模型' },
  { name: '文心一言', description: '百度开发的大语言模型', icon: '🧠', url: 'https://yiyan.baidu.com', category: '大模型' },
  { name: '通义千问', description: '阿里巴巴推出的 AI 大模型', icon: '💬', url: 'https://tongyi.aliyun.com', category: '大模型' },
  { name: '智谱清言', description: '智谱 AI 开发的对话助手', icon: '🔵', url: 'https://chatglm.cn', category: '大模型' },
  { name: 'Kimi', description: '月之暗面开发的 AI 助手', icon: '🔍', url: 'https://kimi.moonshot.cn', category: '大模型' },
  { name: 'DeepSeek', description: '深度求索开发的大模型', icon: '🌊', url: 'https://www.deepseek.com', category: '大模型' },
  { name: '讯飞星火', description: '科大讯飞推出的认知大模型', icon: '🔥', url: 'https://xinghuo.xfyun.cn', category: '大模型' },
  { name: '腾讯混元', description: '腾讯推出的大语言模型', icon: '🟢', url: 'https://hunyuan.tencent.com', category: '大模型' }
];

async function seedLLMTools() {
  try {
    console.log('开始添加大模型工具...');

    const tools = await readData('tools') || [];
    const existingCount = tools.length;

    // 检查是否已存在（通过 URL）
    const existingUrls = new Set(tools.map(t => t.url));

    let addedCount = 0;
    for (const tool of llmTools) {
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

seedLLMTools();
