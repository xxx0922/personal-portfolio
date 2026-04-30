# 🎵 开机音乐配置指南 - 宇宙大爆炸效果

## 📥 快速下载推荐

以下是免费的"宇宙初开/大爆炸"音效资源：

### 方案 1: Pixabay（推荐 - 完全免费）

1. 访问：https://pixabay.com/sound-effects/search/big-bang/
2. 推荐音效：
   - **Cinematic Trailer Hit** - 电影预告片冲击音
   - **Boom Impact** - 爆炸轰鸣
   - **Space Whoosh** - 太空呼啸

3. 点击下载按钮，保存为 `big-bang.mp3`

### 方案 2: Mixkit（免费可商用）

1. 访问：https://mixkit.co/free-sound-effects/cinematic/
2. 搜索关键词：`boom`, `explosion`, `whoosh`
3. 保存到项目目录

### 方案 3: YouTube Audio Library

1. 访问 YouTube 工作室
2. 进入音频库 → 音效
3. 搜索：`cinematic`, `explosion`, `space`

---

## 📁 文件放置位置

将下载的音效文件放入：
```
personal-portfolio/public/audio/boot/big-bang.mp3
```

支持格式：MP3, WAV, OGG

---

## ✅ 代码已配置

开机动画代码已添加音效播放功能：

- 在粒子爆炸时（第 60 帧）自动播放
- 音量设置为 80%
- 文件路径：`/audio/boot/big-bang.mp3`

---

## 🎬 推荐音效特征

| 特征 | 建议 |
|------|------|
| 时长 | 2-5 秒 |
| 类型 | 低音轰鸣 + 冲击波 |
| 风格 | 电影预告片风格 |
| 关键词 | `cinematic boom`, `trailer hit`, `space explosion` |

---

## 🧪 测试步骤

1. 将音效文件放入 `public/audio/boot/big-bang.mp3`
2. 重启开发服务器（如果正在运行）
   ```bash
   # 停止当前服务 (Ctrl+C)
   npm run dev
   ```
3. 刷新页面 http://localhost:5178
4. 应该能听到开机动画的爆炸音效

---

## ⚠️ 浏览器自动播放策略

如果音效没有自动播放，是因为浏览器阻止了自动播放：

**解决方法**：
1. 首次访问需要与页面交互（点击任意位置）
2. 或者点击页面右上角的音乐按钮解锁音频

---

## 📝 当前状态

- ✅ 代码已配置完成
- ⏳ 需要下载音效文件
- 📂 目标目录：`public/audio/boot/`
