import { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

interface MusicTrack {
  url: string;
  name: string;
}

interface MusicContextType {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  currentTrack: MusicTrack | null;
  tracks: MusicTrack[];
  togglePlay: () => void;
  toggleMute: () => void;
  setVolume: (volume: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  setEnabled: (enabled: boolean) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

export const MusicProvider = ({ children }: { children: ReactNode }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [enabled, setEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 加载音乐设置
  useEffect(() => {
    loadMusicSettings();
  }, []);

  // 初始化音频元素
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.loop = false;

    const audio = audioRef.current;

    const handleEnded = () => {
      playNext();
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.pause();
      audio.src = '';
    };
  }, []);

  // 当音轨列表或 currentIndex 变化时，更新播放
  useEffect(() => {
    if (!audioRef.current || !enabled || tracks.length === 0) return;

    const currentTrack = tracks[currentIndex];
    if (currentTrack) {
      audioRef.current.src = currentTrack.url;
      if (!isMuted) {
        audioRef.current.volume = volume;
        audioRef.current.play().catch(() => {
          setIsPlaying(false);
        });
      }
    }
  }, [currentIndex, tracks, enabled]);

  // 音量/静音变化时更新
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const loadMusicSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/site-config/music`);
      if (response.ok) {
        const data = await response.json();
        setEnabled(data.enabled ?? false);
        setTracks(data.musicList || []);
        setVolume(data.volume ?? 0.3);
      } else {
        // 如果 API 不可用，仍然显示按钮但不播放
        setEnabled(true);
      }
    } catch (error) {
      console.error('Failed to load music settings:', error);
      // 出错时仍然允许使用
      setEnabled(true);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || tracks.length === 0) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  const handleSetVolume = (newVolume: number) => {
    setVolume(newVolume);
    if (!isMuted && audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const playNext = () => {
    if (tracks.length === 0) return;
    setCurrentIndex(prev => (prev + 1) % tracks.length);
  };

  const playPrevious = () => {
    if (tracks.length === 0) return;
    setCurrentIndex(prev => (prev - 1 + tracks.length) % tracks.length);
  };

  const currentTrack = tracks.length > 0 ? tracks[currentIndex] : null;

  return (
    <MusicContext.Provider value={{
      isPlaying,
      isMuted,
      volume,
      currentTrack,
      tracks,
      togglePlay,
      toggleMute,
      setVolume: handleSetVolume,
      playNext,
      playPrevious,
      setEnabled
    }}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};
