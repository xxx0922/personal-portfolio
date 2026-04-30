import { useState, useEffect, useRef } from 'react';
import { useMusic } from '../contexts/MusicContext';

export default function BackgroundMusic() {
  const {
    isPlaying,
    isMuted,
    volume,
    currentTrack,
    tracks,
    togglePlay,
    toggleMute,
    setVolume
  } = useMusic();

  const [showControls, setShowControls] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const currentIndex = tracks.findIndex(t => t === currentTrack);
  const displayIndex = currentIndex >= 0 ? currentIndex : 0;

  const hasTracks = tracks && tracks.length > 0;

  return (
    <>
      {/* 音乐控制按钮 - 固定在右上角 */}
      <div className="fixed top-24 right-6 z-50">
        {/* 音乐符号按钮 */}
        <button
          onClick={() => {
            togglePlay();
            setShowControls(true);
          }}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className={`relative w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${
            isPlaying
              ? 'bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 text-white animate-spin-slow'
              : 'bg-gradient-to-br from-blue-400 via-cyan-400 to-blue-500 text-white'
          } border-4 border-white/30`}
          title={isPlaying ? '暂停音乐' : '播放背景音乐'}
        >
          {/* 发光效果 - 始终显示 */}
          <div className="absolute inset-0 rounded-full animate-pulse bg-white/20"></div>

          {/* 播放时的额外光效 */}
          {isPlaying && (
            <>
              <div className="absolute inset-0 rounded-full animate-ping bg-gradient-to-br from-purple-400/30 to-pink-400/30"></div>
              <div className="absolute -inset-2 rounded-full border-2 border-purple-300/40 animate-pulse"></div>
            </>
          )}

          {/* 音乐音符图标 */}
          <div className="relative z-10">
            <svg
              className="w-9 h-9 text-white drop-shadow-lg"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          </div>

          {/* 播放状态指示器 - 跳动的音量条 */}
          {isPlaying && (
            <div className="absolute -top-1 -right-1 flex gap-1 items-end">
              <span className="w-2 h-5 bg-white rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0ms', animationDuration: '0.6s' }}></span>
              <span className="w-2 h-4 bg-white rounded-full animate-bounce shadow-lg" style={{ animationDelay: '150ms', animationDuration: '0.7s' }}></span>
              <span className="w-2 h-6 bg-white rounded-full animate-bounce shadow-lg" style={{ animationDelay: '300ms', animationDuration: '0.5s' }}></span>
            </div>
          )}

          {/* 未播放时的旋转光环 */}
          {!isPlaying && (
            <div className="absolute inset-0 rounded-full border-4 border-cyan-300/60 animate-spin-slow"></div>
          )}

          {/* Tooltip 提示 */}
          <div
            className={`absolute right-20 top-1/2 -translate-y-1/2 bg-gray-900/95 backdrop-blur-sm text-white px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 ${
              showTooltip ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'
            }`}
          >
            <span className="text-sm font-medium">
              {isPlaying ? '🎵 正在播放' : '🎵 点击播放背景音乐'}
            </span>
            {!hasTracks && (
              <span className="block text-xs text-gray-400 mt-1">
                需在后台添加音乐
              </span>
            )}
          </div>
        </button>

        {/* 展开的控制面板 */}
        {showControls && (
          <div className="absolute top-20 right-0 bg-white/98 backdrop-blur-xl rounded-3xl shadow-2xl p-6 w-80 border-2 border-purple-100">
            {/* 关闭按钮 */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">🎵 背景音乐</h3>
              <button
                onClick={() => setShowControls(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 播放状态提示 */}
            {!hasTracks && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-amber-700">
                  ⚠️ 暂无音乐
                </p>
                <p className="text-xs text-amber-600 mt-2">
                  请登录管理后台添加背景音乐
                </p>
              </div>
            )}

            {/* 播放/暂停按钮 */}
            <div className="flex items-center justify-center mb-5">
              <button
                onClick={togglePlay}
                disabled={!hasTracks}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 ${
                  !hasTracks
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : isPlaying
                    ? 'bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-xl shadow-purple-500/40'
                    : 'bg-gradient-to-br from-blue-400 to-cyan-500 text-white shadow-xl shadow-blue-500/40'
                }`}
              >
                {isPlaying ? (
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                  </svg>
                ) : (
                  <svg className="w-10 h-10 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>
            </div>

            {/* 歌曲信息 */}
            {hasTracks && (
              <div className="text-center mb-5">
                <p className="text-base font-semibold text-gray-800 truncate">
                  {currentTrack?.name || `歌曲 ${displayIndex + 1}`}
                </p>
                {tracks.length > 1 && (
                  <p className="text-sm text-gray-500 mt-2">
                    {displayIndex + 1} / {tracks.length}
                  </p>
                )}
              </div>
            )}

            {/* 音量控制 */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-4">
              <button
                onClick={toggleMute}
                className="flex-shrink-0 text-purple-600 hover:text-purple-800 transition-colors"
                title={isMuted ? '取消静音' : '静音'}
              >
                {isMuted ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                )}
              </button>
              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full h-3 bg-white rounded-lg appearance-none cursor-pointer transition-all shadow-inner"
                  style={{
                    background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${volume * 100}%, #e5e7eb ${volume * 100}%, #e5e7eb 100%)`
                  }}
                />
              </div>
              <span className="text-sm font-medium text-purple-600 w-10 text-right">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
