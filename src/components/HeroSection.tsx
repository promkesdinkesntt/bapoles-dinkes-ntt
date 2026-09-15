import React, { useState, useRef } from 'react';
import { 
  Play, 
  Calendar, 
  MessageSquare, 
  Volume2, 
  Sparkles, 
  CheckCircle2, 
  Upload,
  Edit3
} from 'lucide-react';
import { SiteConfig, PodcastEpisode } from '../types';

interface HeroSectionProps {
  siteConfig: SiteConfig;
  latestEpisode?: PodcastEpisode;
  onPlayEpisode: (episode: PodcastEpisode) => void;
  onNavigate: (section: string) => void;
  onUpdateBanner?: (newUrl: string) => void;
  onUpdateOverlayOpacity?: (opacity: number) => void;
  onOpenEditModal?: (tab: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  siteConfig,
  latestEpisode,
  onPlayEpisode,
  onNavigate,
  onUpdateBanner,
  onOpenEditModal,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [showFullImageModal, setShowFullImageModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bannerImage = siteConfig.bannerImageUrl || '/images/bapoles_original_bg.jpg';

  const handleFile = (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result && onUpdateBanner) {
        onUpdateBanner(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  return (
    <section 
      id="beranda" 
      className="relative bg-gradient-to-b from-emerald-100/70 via-teal-50/50 to-transparent text-slate-900 pt-8 sm:pt-12 pb-16 overflow-hidden"
    >
      {/* Ambient background subtle lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Header Badge & Tagline */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-900 text-xs sm:text-sm font-semibold mb-3 shadow-xs">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span>Podcast Resmi Dinas Kesehatan Provinsi Nusa Tenggara Timur</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            <span className="text-emerald-800 font-normal">Flobamorata</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0c3832] tracking-tight">
            {siteConfig.tagline}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-2xl mx-auto">
            {siteConfig.description}
          </p>
        </div>

        {/* 1. THE MAIN FULL BAPOLES LOGO & TENUN NTT BACKGROUND BANNER (Professional, Full, Clean) */}
        <div className="relative w-full max-w-6xl mx-auto mb-8 sm:mb-12">
          
          {/* Banner Container Full & Professional - Clickable for Fullscreen */}
          <div 
            onClick={() => setShowFullImageModal(true)}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`group relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-2 transition-all duration-300 aspect-[16/9] md:aspect-[21/9] bg-slate-900 flex items-center justify-center cursor-pointer ${
              isDragOver 
                ? 'border-emerald-500 ring-4 ring-emerald-400/30 scale-[1.01]' 
                : 'border-emerald-500/30 hover:border-emerald-500/60'
            }`}
            title="Klik untuk melihat banner penuh"
          >
            {/* The Authentic Original Image (Tenun + Logo BAPOLES displayed completely and sharp) */}
            <img
              src={bannerImage}
              alt="Logo BAPOLES dan Latar Belakang Kain Tenun Asli NTT - Dinas Kesehatan Provinsi NTT"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.01]"
            />

            {/* Hidden file input for drag & drop or script fallback */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
            />

            {/* Drop Overlay Indicator */}
            {isDragOver && (
              <div className="absolute inset-0 bg-emerald-950/85 backdrop-blur-sm flex flex-col items-center justify-center text-emerald-300 p-6 text-center animate-fadeIn z-20">
                <Upload className="w-12 h-12 mb-2 animate-bounce" />
                <p className="font-extrabold text-base sm:text-lg text-white">Lepaskan file gambar di sini</p>
                <p className="text-xs text-emerald-200 mt-1">Untuk memperbarui banner utama</p>
              </div>
            )}
          </div>
        </div>

        {/* 2. ACTION CONTROLS */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-4xl mx-auto">
          {latestEpisode && (
            <button
              id="hero-btn-play"
              onClick={() => onPlayEpisode(latestEpisode)}
              className="flex items-center gap-3 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-700/20 hover:-translate-y-0.5 transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-white text-emerald-800 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                <Play className="w-4 h-4 fill-emerald-800 ml-0.5" />
              </div>
              <span>Putar Episode #{latestEpisode.episodeNumber}</span>
            </button>
          )}

          <button
            id="hero-btn-schedule"
            onClick={() => onNavigate('jadwal')}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#0c3832] hover:bg-[#124d45] text-white font-bold text-sm sm:text-base shadow-md transition-all cursor-pointer"
          >
            <Calendar className="w-5 h-5 text-emerald-300" />
            <span>Jadwal Siaran Live</span>
          </button>

          <button
            id="hero-btn-question"
            onClick={() => onNavigate('kontak')}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-white hover:bg-emerald-50/50 border border-emerald-300 text-emerald-950 font-bold text-sm sm:text-base shadow-xs transition-all cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-emerald-700" />
            <span>Tanya Dokter / Usul Topik</span>
          </button>

          {onOpenEditModal && (
            <button
              onClick={() => onOpenEditModal('beranda')}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-300 text-emerald-900 font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
              title="Edit Teks Tagline, Banner, dan Pilar Beranda"
            >
              <Edit3 className="w-4 h-4 text-emerald-700" />
              <span>Edit Beranda</span>
            </button>
          )}
        </div>

        {/* 3. Featured Mini Teaser */}
        {latestEpisode && (
          <div className="mt-8 sm:mt-10 max-w-3xl mx-auto bg-white/95 border border-emerald-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-100/80 border border-emerald-200 flex items-center justify-center text-emerald-700 flex-shrink-0">
                <Volume2 className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                  Episode Terbaru • {latestEpisode.category}
                </span>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-1">
                  {latestEpisode.title}
                </h2>
                <p className="text-xs text-slate-600 line-clamp-1">
                  Narasumber: {latestEpisode.speakerName} ({latestEpisode.speakerRole})
                </p>
              </div>
            </div>

            <button
              onClick={() => onPlayEpisode(latestEpisode)}
              className="flex-shrink-0 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Dengarkan</span>
            </button>
          </div>
        )}

        {/* 4. Pillars Values of BAPOLES */}
        <div className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto text-left">
          {(siteConfig.homePillarsList && siteConfig.homePillarsList.length > 0 ? siteConfig.homePillarsList : [
            { id: 'hp-1', title: siteConfig.homeData?.pillar1Title || 'Edukasi Terpercaya', desc: siteConfig.homeData?.pillar1Desc || 'Disampaikan langsung oleh dokter spesialis & praktisi kesehatan NTT.' },
            { id: 'hp-2', title: siteConfig.homeData?.pillar2Title || 'Kearifan Lokal NTT', desc: siteConfig.homeData?.pillar2Desc || 'Pangan lokal marungga, tradisi sehat, dan budaya Flobamorata.' },
            { id: 'hp-3', title: siteConfig.homeData?.pillar3Title || 'Interaktif & Terbuka', desc: siteConfig.homeData?.pillar3Desc || 'Tanya jawab langsung via WhatsApp dan live chat media sosial.' },
          ]).map((pillar) => (
            <div key={pillar.id} className="p-3.5 rounded-xl bg-white/90 border border-emerald-200/80 flex items-start gap-3 shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  {pillar.title}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  {pillar.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Fullscreen Lightbox Modal for Original Artwork */}
      {showFullImageModal && (
        <div 
          onClick={() => setShowFullImageModal(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-fadeIn"
        >
          <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3 text-white">
              <span className="text-sm font-bold text-teal-300">
                Gambar Asli: Pola Kain Tenun NTT & Logo Resmi BAPOLES
              </span>
              <button
                onClick={() => setShowFullImageModal(false)}
                className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-bold"
              >
                Tutup (Esc)
              </button>
            </div>
            <img
              src={bannerImage}
              alt="Full Banner Original BAPOLES"
              referrerPolicy="no-referrer"
              className="w-full rounded-2xl shadow-2xl border border-teal-500/40 object-contain max-h-[80vh]"
            />
          </div>
        </div>
      )}
    </section>
  );
};
