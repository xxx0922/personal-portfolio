# 音频文件目录说明

## 目录结构

```
public/audio/
├── boot/          # 开机动画音频
├── bgm/           # 背景音乐 (Background Music)
└── sfx/           # 音效 (Sound Effects)
```

## 各目录用途

### 1. boot/ - 开机动画音频

存放开机动画的配套音频文件。

**推荐格式**: MP3 或 WAV
**建议时长**: 与开机动画视频时长匹配（通常 3-10 秒）

**示例文件名**:
- `boot-intro.mp3` - 开机片头音乐
- `logo-sound.wav` - Logo 出现音效

**使用方法**:
```tsx
// 在 BootAnimation.tsx 中添加
<audio autoPlay>
  <source src="/audio/boot/boot-intro.mp3" type="audio/mpeg" />
</audio>
```

---

### 2. bgm/ - 背景音乐

存放页面背景音乐文件。

**推荐格式**: MP3
**建议时长**: 1-3 分钟（可循环）

**示例文件名**:
- `relaxing-1.mp3` - 轻音乐 1
- `ambient-space.mp3` - 星空氛围音乐
- `piano-lofi.mp3` - 钢琴 Lo-fi

**使用方法**:
```tsx
// 在 BackgroundMusic.tsx 中添加
const tracks = [
  { name: '星空', url: '/audio/bgm/ambient-space.mp3' },
  { name: '轻音乐', url: '/audio/bgm/relaxing-1.mp3' },
];
```

---

### 3. sfx/ - 音效

存放交互音效文件。

**推荐格式**: WAV 或 MP3
**建议时长**: 0.5-2 秒

**示例文件名**:
- `click.mp3` - 点击音效
- `hover.wav` - 悬停音效
- `success.mp3` - 成功提示音
- `notification.wav` - 通知提示音

**使用方法**:
```tsx
// 播放音效
const playSound = (soundName: string) => {
  const audio = new Audio(`/audio/sfx/${soundName}.mp3`);
  audio.play();
};

// 按钮点击时
onClick={() => playSound('click')}
```

---

## 音频格式建议

| 格式 | 用途 | 优点 | 缺点 |
|------|------|------|------|
| MP3 | 背景音乐 | 文件小，兼容性好 | 有损压缩 |
| WAV | 音效 | 无损音质 | 文件较大 |
| OGG | 备用格式 | 开源，音质好 | 兼容性稍差 |

---

## 浏览器自动播放策略

⚠️ **重要提示**: 现代浏览器（Chrome、Safari 等）通常阻止带声音的媒体自动播放。

**解决方案**:
1. 首次播放仍需用户交互（点击任意位置）
2. 使用 `muted` 属性先播放，再通过用户交互解锁声音
3. 在用户首次与页面交互后（点击、键盘等），才能播放带声音的内容

**推荐做法**:
```tsx
// 用户首次交互后解锁音频
useEffect(() => {
  const unlockAudio = () => {
    // 播放一个静音音频解锁音频上下文
    const audio = new Audio();
    audio.play().catch(() => {});
    document.removeEventListener('click', unlockAudio);
  };
  document.addEventListener('click', unlockAudio);
}, []);
```

---

## 推荐音频资源

### 免费音乐资源
- [Pixabay Music](https://pixabay.com/music/) - 免费可商用
- [YouTube Audio Library](https://www.youtube.com/audiolibrary) - 免费音乐库
- [FreePD](https://freepd.com/) - 公共领域音乐
- [Bensound](https://www.bensound.com/) - 部分免费

### 音效资源
- [Freesound](https://freesound.org/) - 社区音效分享
- [Zapsplat](https://www.zapsplat.com/) - 免费音效库
- [SoundBible](http://soundbible.com/) - 免费音效下载

---

## 待添加文件清单

- [ ] `/audio/boot/` - 开机动画配乐
- [ ] `/audio/bgm/` - 背景音乐（多首）
- [ ] `/audio/sfx/click.mp3` - 点击音效
- [ ] `/audio/sfx/hover.wav` - 悬停音效
- [ ] `/audio/sfx/success.mp3` - 成功音效
