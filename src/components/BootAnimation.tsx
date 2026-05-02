import { useState, useEffect } from 'react';

interface BootAnimationProps {
  onComplete: () => void;
}

const BootAnimation = ({ onComplete }: BootAnimationProps) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  useEffect(() => {
    // 检查是否已经播放过开机动画
    const hasPlayedBefore = sessionStorage.getItem('bootAnimationPlayed');

    if (hasPlayedBefore) {
      // 如果已经播放过，直接跳过
      onComplete();
      setIsPlaying(false);
    }
  }, [onComplete]);

  // 解锁音频（浏览器需要用户交互才能播放声音）
  useEffect(() => {
    const unlockAudio = () => {
      setAudioUnlocked(true);
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };

    document.addEventListener('click', unlockAudio, { once: true });
    document.addEventListener('keydown', unlockAudio, { once: true });

    return () => {
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  const handleVideoEnd = () => {
    // 标记动画已播放
    sessionStorage.setItem('bootAnimationPlayed', 'true');
    setIsPlaying(false);
    onComplete();
  };

  const handleSkip = () => {
    // 允许用户跳过动画
    sessionStorage.setItem('bootAnimationPlayed', 'true');
    setIsPlaying(false);
    onComplete();
  };

  if (!isPlaying) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* 开机动画视频 */}
      <video
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnd}
        className="w-full h-full object-cover"
      >
        <source src="/boot-animation.mp4" type="video/mp4" />
        您的浏览器不支持视频播放
      </video>

      {/*
        开机音效 - 取消下面的注释并添加音频文件即可启用

        支持的文件位置:
        - /audio/boot/boot-intro.mp3
        - /audio/boot/logo-sound.wav
        - 或其他你放在 public/audio/boot/ 目录下的文件
      */}
      {audioUnlocked && (
        <audio autoPlay muted>
          <source src="/audio/boot/boot-intro.mp3" type="audio/mpeg" />
        </audio>
      )}

      {/* 跳过按钮 */}
      <button
        onClick={handleSkip}
        className="absolute bottom-8 right-8 px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg backdrop-blur-sm transition-all duration-300 border border-white/30"
      >
        跳过动画
      </button>
    </div>
  );
};

export default BootAnimation;
