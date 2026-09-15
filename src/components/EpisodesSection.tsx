import React, { useState, useMemo } from 'react';
import { 
  Play, 
  Calendar, 
  Clock, 
  User, 
  Headphones, 
  ExternalLink, 
  Share2, 
  Filter,
  Check,
  BookOpen
} from 'lucide-react';
import { PodcastEpisode } from '../types';
import { FILTER_CATEGORIES, normalizeCategory } from '../utils/categoryUtils';

interface EpisodesSectionProps {
  episodes: PodcastEpisode[];
  searchQuery: string;
  onPlayEpisode: (episode: PodcastEpisode) => void;
  currentEpisodeId?: string;
}

export const EpisodesSection: React.FC<EpisodesSectionProps> = ({
  episodes,
  searchQuery,
  onPlayEpisode,
  currentEpisodeId,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [activeModalEpisode, setActiveModalEpisode] = useState<PodcastEpisode | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = FILTER_CATEGORIES;

  const filteredEpisodes = useMemo(() => {
    return episodes.filter((ep) => {
      const epCat = normalizeCategory(ep.category, ep.title, ep.description);
      const matchCategory = selectedCategory === 'Semua' || epCat === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        !query ||
        ep.title.toLowerCase().includes(query) ||
        ep.speakerName.toLowerCase().includes(query) ||
        ep.description.toLowerCase().includes(query) ||
        epCat.toLowerCase().includes(query);
      return matchCategory && matchSearch;
    });
  }, [episodes, selectedCategory, searchQuery]);

  const handleShare = (ep: PodcastEpisode) => {
    if (navigator.share) {
      navigator.share({
        title: `Podcast BAPOLES: ${ep.title}`,
        text: `Dengarkan pembahasan kesehatan bermanfaat bersama ${ep.speakerName} di Podcast BAPOLES Dinkes NTT`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${window.location.href}#episode-${ep.id}`);
      setCopiedId(ep.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <section id="episodes-list" className="py-20 bg-transparent text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold uppercase tracking-wider mb-2">
              <Headphones className="w-3.5 h-3.5" />
              <span>Daftar Episode</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f2b48]">
              Edukasi Kesehatan Flobamorata
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-1">
              Dengarkan obrolan inspiratif bersama pakar kesehatan seputar isu kesehatan di NTT.
            </p>
          </div>

          <div className="text-sm font-semibold text-slate-500">
            Menampilkan <span className="text-teal-700 font-bold">{filteredEpisodes.length}</span> episode
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-8">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0 ml-1 mr-1" />
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#0f2b48] text-white shadow-md shadow-blue-900/20'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search Notice if active */}
        {searchQuery && (
          <div className="mb-6 p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs sm:text-sm text-teal-800 flex items-center justify-between">
            <span>Hasil pencarian untuk: <strong>"{searchQuery}"</strong></span>
            <span className="text-xs">{filteredEpisodes.length} ditemukan</span>
          </div>
        )}

        {/* Episodes Grid */}
        {filteredEpisodes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <Headphones className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Tidak ada episode yang cocok</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Coba cari dengan kata kunci lain atau pilih kategori "Semua".
            </p>
            <button
              onClick={() => {
                setSelectedCategory('Semua');
              }}
              className="mt-4 px-4 py-2 rounded-lg bg-teal-600 text-white text-xs font-bold"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEpisodes.map((episode) => {
              const isCurrentPlaying = currentEpisodeId === episode.id;

              return (
                <div
                  key={episode.id}
                  id={`episode-${episode.id}`}
                  className={`group bg-white rounded-2xl border transition-all duration-300 flex flex-col overflow-hidden shadow-sm hover:shadow-xl ${
                    isCurrentPlaying
                      ? 'border-teal-500 ring-2 ring-teal-400/30'
                      : 'border-slate-200 hover:border-teal-300'
                  }`}
                >
                  {/* Card Image Banner */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                    <img
                      src={episode.coverImage || '/images/podcast_studio.jpg'}
                      alt={episode.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Category & Episode Tag */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-[#0f2b48]/90 text-white text-xs font-extrabold shadow">
                        EPS #{episode.episodeNumber}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-teal-600/90 text-white text-xs font-semibold backdrop-blur-sm">
                        {normalizeCategory(episode.category, episode.title, episode.description)}
                      </span>
                    </div>

                    {/* Play Button Overlay */}
                    <button
                      onClick={() => onPlayEpisode(episode)}
                      className="absolute bottom-3 right-3 w-12 h-12 rounded-full bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform cursor-pointer"
                      title="Putar Podcast"
                    >
                      <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                    </button>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Meta info */}
                      <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {episode.date}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {episode.duration}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="font-bold text-base sm:text-lg text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-2 leading-snug">
                        {episode.title}
                      </h3>

                      {/* Speaker */}
                      <div className="flex items-start gap-2 mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <User className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-slate-800 line-clamp-1">{episode.speakerName}</p>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{episode.speakerRole}</p>
                        </div>
                      </div>

                      {/* Description preview */}
                      <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                        {episode.description}
                      </p>
                    </div>

                    {/* Bottom Card Actions */}
                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => setActiveModalEpisode(episode)}
                        className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Catatan Lengkap</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleShare(episode)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          title="Bagikan Episode"
                        >
                          {copiedId === episode.id ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Share2 className="w-4 h-4" />
                          )}
                        </button>

                        {episode.youtubeUrl && (
                          <a
                            href={episode.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 transition-colors"
                            title="Tonton di YouTube"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Episode Detail Modal */}
      {activeModalEpisode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-extrabold uppercase">
                  Episode #{activeModalEpisode.episodeNumber} • {activeModalEpisode.category}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-[#0f2b48] mt-2 leading-snug">
                  {activeModalEpisode.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalEpisode(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                  {activeModalEpisode.speakerName.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{activeModalEpisode.speakerName}</p>
                  <p className="text-xs text-slate-600">{activeModalEpisode.speakerRole}</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Ringkasan Diskusi:
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {activeModalEpisode.description}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200">
                <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider mb-2">
                  Pesan Kunci Promkes NTT:
                </h4>
                <ul className="text-xs text-teal-800 space-y-1.5 list-disc pl-4">
                  <li>Utamakan pencegahan daripada pengobatan melalui Gerakan Masyarakat Hidup Sehat (GERMAS).</li>
                  <li>Manfaatkan fasilitas Puskesmas dan Posyandu terdekat untuk konsultasi kesehatan berkala.</li>
                  <li>Dukung keluarga dan lingkungan sekitar dengan pola asuh dan nutrisi bergizi seimbang.</li>
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  onPlayEpisode(activeModalEpisode);
                  setActiveModalEpisode(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#0f2b48] text-white hover:bg-teal-700 text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Putar Sekarang</span>
              </button>

              <button
                onClick={() => setActiveModalEpisode(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
