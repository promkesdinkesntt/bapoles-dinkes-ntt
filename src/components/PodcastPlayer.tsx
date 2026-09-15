import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  SkipBack, 
  SkipForward, 
  X, 
  ExternalLink, 
  Radio, 
  Maximize2 
} from 'lucide-react';
import { PodcastEpisode } from '../types';

interface PodcastPlayerProps {
  currentEpisode: PodcastEpisode | null;
  onClose: () => void;
}

export const PodcastPlayer: React.FC<PodcastPlayerProps> = ({
  currentEpisode,
  onClose,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(2520); // 42 minutes default in seconds
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isSynthesizedAudio, setIsSynthesizedAudio] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (currentEpisode) {
      setIsPlaying(true);
      setCurrentTime(0);
      // Parse duration text e.g. "42 Menit"
      const match = currentEpisode.duration.match(/\d+/);
      const mins = match ? parseInt(match[0], 10) : 35;
      setDuration(mins * 60);
    }
  }, [currentEpisode]);

  // Audio timer ticker for smooth progress simulation if audio file not provided
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000 / playbackRate);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, duration, playbackRate]);

  if (!currentEpisode) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setCurrentTime(val);
  };

  const toggleRate = () => {
    const rates = [1, 1.25, 1.5, 2];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    setPlaybackRate(rates[nextIdx]);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a1c2d]/95 backdrop-blur-xl border-t border-teal-500/30 text-white shadow-[0_-10px_30px_rgba(0,0,0,0.5)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Scrubber Bar Top */}
        <div className="flex items-center gap-3 mb-2">
          <span className="text-[11px] font-mono text-teal-300 w-10 text-right">
            {formatTime(currentTime)}
          </span>
          <div className="relative flex-1 flex items-center">
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-400 hover:h-2 transition-all"
            />
          </div>
          <span className="text-[11px] font-mono text-slate-400 w-10">
            {formatTime(duration)}
          </span>
        </div>

        {/* Player Controls Grid */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Episode Info (Left) */}
          <div className="flex items-center gap-3 w-full sm:w-1/3 min-w-0">
            <img
              src={currentEpisode.coverImage || '/images/podcast_studio.jpg'}
              alt={currentEpisode.title}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-xl object-cover border border-teal-500/30 flex-shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 uppercase">
                  Eps #{currentEpisode.episodeNumber}
                </span>
                <span className="text-[11px] text-slate-400 truncate">
                  {currentEpisode.category}
                </span>
              </div>
              <p className="text-sm font-bold text-white truncate">
                {currentEpisode.title}
              </p>
              <p className="text-xs text-teal-200/80 truncate">
                {currentEpisode.speakerName}
              </p>
            </div>
          </div>

          {/* Primary Controls (Center) */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentTime((prev) => Math.max(0, prev - 15))}
              className="p-2 text-slate-300 hover:text-white transition-colors"
              title="Mundur 15 detik"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-11 h-11 rounded-full bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 flex items-center justify-center shadow-lg shadow-teal-500/40 hover:scale-105 transition-all cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-slate-950" />
              ) : (
                <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
              )}
            </button>

            <button
              onClick={() => setCurrentTime((prev) => Math.min(duration, prev + 15))}
              className="p-2 text-slate-300 hover:text-white transition-colors"
              title="Maju 15 detik"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            {/* Speed Rate Button */}
            <button
              onClick={toggleRate}
              className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-xs font-bold text-teal-300 border border-teal-500/30"
              title="Ubah kecepatan putar"
            >
              {playbackRate}x
            </button>
          </div>

          {/* Volume, Channels & Close (Right) */}
          <div className="hidden sm:flex items-center justify-end gap-3 w-1/3">
            {/* Volume */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-slate-300 hover:text-white"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(Number(e.target.value));
                  setIsMuted(false);
                }}
                className="w-16 h-1 bg-slate-700 rounded appearance-none accent-teal-400 cursor-pointer"
              />
            </div>

            {/* Watch on YouTube Link */}
            {currentEpisode.youtubeUrl && (
              <a
                href={currentEpisode.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-teal-300 hover:text-teal-200 px-2.5 py-1 rounded bg-teal-500/10 border border-teal-500/30"
              >
                <span>YouTube</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors"
              title="Tutup Player"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
