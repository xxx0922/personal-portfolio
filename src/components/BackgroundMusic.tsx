import { useState, useEffect, useRef } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface MusicSettings {
  enabled: boolean;
  musicList: Array<{
    url: string;
    name: string;
  }>;
  volume: number;
}

export default function BackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // 移除 localStorage 记忆，刷新后恢复初始状态
  const [volume, setVolume] = useState(0.3);
  const [settings, setSettings] = useState<MusicSettings | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // 加载音乐设置
  useEffect(() => {
    loadMusicSettings();
  }, []);

  const loadMusicSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/site-config/music`);
      if (response.ok) {
        const data = await response.json();
        // 确保 musicList 存在
        if (!data.musicList) {
          data.musicList = [];
        }
        setSettings(data);
        if (data.volume !== undefined) {
          setVolume(data.volume);
        }
      }
    } catch (error) {
      console.error('Failed to load music settings:', error);
    }
  };

  // 控制音频播放 - 刷新后自动播放
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume;

    if (settings?.enabled && settings?.musicList && settings.musicList.length > 0 && !isMuted) {
      audio.play().catch(err => {
        console.log('Auto-play prevented:', err);
      });
      setIsPlaying(true);
    }
  }, [settings, isMuted, volume, currentIndex]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(err => console.log('Play failed:', err));
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);

    const audio = audioRef.current;
    if (audio) {
      audio.volume = newMuted ? 0 : volume;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current && !isMuted) {
      audioRef.current.volume = newVolume;
    }
  };

  // 播放下一首
  const playNext = () => {
    if (!settings?.musicList || settings.musicList.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % settings.musicList.length);
  };

  // 播放上一首
  const playPrevious = () => {
    if (!settings?.musicList || settings.musicList.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + settings.musicList.length) % settings.musicList.length);
  };

  // 当歌曲结束时自动播放下一首
  const handleEnded = () => {
    playNext();
  };

  // 如果没有启用音乐或没有音乐列表，不显示
  if (!settings?.enabled || !settings?.musicList || settings.musicList.length === 0) {
    return null;
  }

  const currentSong = settings.musicList[currentIndex];

  return (
    <>
      {/* 音频元素 */}
      <audio
        ref={audioRef}
        src={currentSong.url}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={handleEnded}
      />

      {/* 音乐控制器 - 固定在右下角 */}
      <div className="fixed bottom-20 right-8 z-40 bg-white rounded-full shadow-lg p-3 flex items-center space-x-2 hover:shadow-xl transition-all">
        {/* 上一首按钮 */}
        {settings.musicList.length > 1 && (
          <button
            onClick={playPrevious}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
            aria-label="上一首"
          >
            <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z"/>
            </svg>
          </button>
        )}

        {/* 播放/暂停按钮 */}
        <button
          onClick={togglePlay}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
          aria-label={isPlaying ? '暂停音乐' : '播放音乐'}
        >
          {isPlaying ? (
            <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
          ) : (
            <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </button>

        {/* 下一首按钮 */}
        {settings.musicList.length > 1 && (
          <button
            onClick={playNext}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
            aria-label="下一首"
          >
            <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 18h2V6h-2v12zM6 18l8.5-6L6 6v12z"/>
            </svg>
          </button>
        )}

        {/* 音量图标 */}
        <button
          onClick={toggleMute}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
          aria-label={isMuted ? '取消静音' : '静音'}
        >
          {isMuted ? (
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
        </button>

        {/* 音量滑块 */}
        {!isMuted && (
          <div className="w-20">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${volume * 100}%, #d1d5db ${volume * 100}%, #d1d5db 100%)`
              }}
            />
          </div>
        )}

        {/* 当前播放信息 */}
        <div className="text-xs text-gray-500 flex items-center max-w-32 truncate">
          <span className="mr-1">🎵</span>
          <span className="truncate" title={currentSong.name}>
            {currentSong.name || `歌曲 ${currentIndex + 1}`}
          </span>
        </div>

        {/* 播放列表指示器 */}
        {settings.musicList.length > 1 && (
          <div className="text-xs text-gray-400">
            {currentIndex + 1}/{settings.musicList.length}
          </div>
        )}
      </div>
    </>
  );
}
