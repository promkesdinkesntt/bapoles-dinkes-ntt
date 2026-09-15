import React, { useState, useEffect, useCallback } from 'react';
import { 
  Image as ImageIcon, 
  Maximize2, 
  Calendar, 
  X, 
  Edit3, 
  Youtube, 
  ExternalLink, 
  Play, 
  Trash2, 
  CheckCircle2, 
  Upload, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Link2, 
  Plus, 
  Layers, 
  Loader2, 
  Sparkles,
  Info
} from 'lucide-react';
import { GalleryItem } from '../types';
import { FILTER_CATEGORIES, BAPOLES_CATEGORIES, normalizeCategory } from '../utils/categoryUtils';
import { processBatchFiles, parseBatchLinks, extractYouTubeThumbnail } from '../utils/galleryStorage';
import { compressAndProcessImage } from '../utils/imageUpload';

interface GallerySectionProps {
  gallery: GalleryItem[];
  onOpenEditModal?: (tab: string) => void;
  onDeleteGallery?: (id: string) => void;
  onBatchAddGallery?: (items: GalleryItem[]) => void;
}

function getYouTubeEmbedUrl(url?: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/|live\/)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[2] && match[2].length === 11) {
    return `https://www.youtube-nocookie.com/embed/${match[2]}?autoplay=1&rel=0`;
  }
  return null;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ 
  gallery, 
  onOpenEditModal,
  onDeleteGallery,
  onBatchAddGallery
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [activeMediaTab, setActiveMediaTab] = useState<'photo' | 'video'>('photo');
  const [photoToDelete, setPhotoToDelete] = useState<GalleryItem | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Quick Upload Modal state (Direct upload from Gallery section)
  const [showQuickUploadModal, setShowQuickUploadModal] = useState<boolean>(false);
  const [quickUploadTab, setQuickUploadTab] = useState<'files' | 'links' | 'single'>('files');
  const [selectedCategoryForBatch, setSelectedCategoryForBatch] = useState<string>('Kesehatan Masyarakat');
  
  // Batch files state
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [isProcessingBatch, setIsProcessingBatch] = useState<boolean>(false);
  const [batchProgressText, setBatchProgressText] = useState<string>('');
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);

  // Batch links state
  const [batchLinksText, setBatchLinksText] = useState<string>('');

  // Single upload state
  const [singleTitle, setSingleTitle] = useState<string>('');
  const [singleCategory, setSingleCategory] = useState<string>('Kesehatan Masyarakat');
  const [singleDate, setSingleDate] = useState<string>('');
  const [singleYoutubeUrl, setSingleYoutubeUrl] = useState<string>('');
  const [singleImageUrl, setSingleImageUrl] = useState<string>('');
  const [singleImageFile, setSingleImageFile] = useState<File | null>(null);
  const [singleDescription, setSingleDescription] = useState<string>('');

  const showFeedbackToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  // Filter gallery by category & search query
  const filteredGallery = gallery.filter((item) => {
    const matchesCategory =
      selectedCategory === 'Semua' ||
      normalizeCategory(item.category, item.title, item.description) === selectedCategory ||
      item.category === selectedCategory;

    if (!matchesCategory) return false;

    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const titleMatch = item.title?.toLowerCase().includes(query);
    const descMatch = item.description?.toLowerCase().includes(query);
    const categoryMatch = item.category?.toLowerCase().includes(query);
    const dateMatch = item.date?.toLowerCase().includes(query);

    return titleMatch || descMatch || categoryMatch || dateMatch;
  });

  const activePhoto = activePhotoIndex !== null && filteredGallery[activePhotoIndex] ? filteredGallery[activePhotoIndex] : null;
  const activeEmbedUrl = activePhoto?.youtubeUrl ? getYouTubeEmbedUrl(activePhoto.youtubeUrl) : null;

  // Keyboard navigation for Lightbox
  const handleNextPhoto = useCallback(() => {
    if (activePhotoIndex === null || filteredGallery.length === 0) return;
    const nextIdx = (activePhotoIndex + 1) % filteredGallery.length;
    setActivePhotoIndex(nextIdx);
    const nextItem = filteredGallery[nextIdx];
    setActiveMediaTab(nextItem?.youtubeUrl && getYouTubeEmbedUrl(nextItem.youtubeUrl) ? 'video' : 'photo');
  }, [activePhotoIndex, filteredGallery]);

  const handlePrevPhoto = useCallback(() => {
    if (activePhotoIndex === null || filteredGallery.length === 0) return;
    const prevIdx = (activePhotoIndex - 1 + filteredGallery.length) % filteredGallery.length;
    setActivePhotoIndex(prevIdx);
    const prevItem = filteredGallery[prevIdx];
    setActiveMediaTab(prevItem?.youtubeUrl && getYouTubeEmbedUrl(prevItem.youtubeUrl) ? 'video' : 'photo');
  }, [activePhotoIndex, filteredGallery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activePhotoIndex === null) return;
      if (e.key === 'ArrowRight') {
        handleNextPhoto();
      } else if (e.key === 'ArrowLeft') {
        handlePrevPhoto();
      } else if (e.key === 'Escape') {
        setActivePhotoIndex(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePhotoIndex, handleNextPhoto, handlePrevPhoto]);

  const handleOpenPhoto = (item: GalleryItem) => {
    const idx = filteredGallery.findIndex((p) => p.id === item.id);
    if (idx !== -1) {
      setActivePhotoIndex(idx);
      setActiveMediaTab(item.youtubeUrl && getYouTubeEmbedUrl(item.youtubeUrl) ? 'video' : 'photo');
    }
  };

  const handleConfirmDelete = () => {
    if (!photoToDelete) return;
    const title = photoToDelete.title;
    if (onDeleteGallery) {
      onDeleteGallery(photoToDelete.id);
    }
    if (activePhoto?.id === photoToDelete.id) {
      setActivePhotoIndex(null);
    }
    setPhotoToDelete(null);
    showFeedbackToast(`Dokumentasi "${title}" berhasil dihapus!`);
  };

  // 1. Process Batch File Upload
  const handleProcessBatchFiles = async () => {
    if (batchFiles.length === 0) return;
    setIsProcessingBatch(true);
    setBatchProgressText(`Memproses 0 dari ${batchFiles.length} foto...`);

    try {
      const newItems = await processBatchFiles(
        batchFiles,
        selectedCategoryForBatch,
        (processed, total, currentName) => {
          setBatchProgressText(`Memproses foto ${processed}/${total}: ${currentName}`);
        }
      );

      if (newItems.length > 0 && onBatchAddGallery) {
        onBatchAddGallery(newItems);
        showFeedbackToast(`Berhasil menambahkan ${newItems.length} foto ke galeri!`);
        setBatchFiles([]);
        setShowQuickUploadModal(false);
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kendala saat memproses foto. Silakan coba lagi.');
    } finally {
      setIsProcessingBatch(false);
      setBatchProgressText('');
    }
  };

  // 2. Process Batch Links
  const handleProcessBatchLinks = () => {
    if (!batchLinksText.trim()) return;
    const parsed = parseBatchLinks(batchLinksText, selectedCategoryForBatch);
    if (parsed.length === 0) {
      alert('Tidak ada tautan (URL) valid yang ditemukan. Pastikan tautan diawali dengan http:// atau https://');
      return;
    }

    if (onBatchAddGallery) {
      onBatchAddGallery(parsed);
      showFeedbackToast(`Berhasil menambahkan ${parsed.length} tautan ke galeri!`);
      setBatchLinksText('');
      setShowQuickUploadModal(false);
    }
  };

  // 3. Process Single Photo Upload
  const handleProcessSingleItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleTitle.trim()) {
      alert('Harap isi judul foto atau video kegiatan.');
      return;
    }

    let finalImageUrl = singleImageUrl.trim();

    // If file provided, compress and use dataUrl
    if (singleImageFile) {
      setIsProcessingBatch(true);
      try {
        const compressed = await compressAndProcessImage(singleImageFile, 1280, 1280, 0.82);
        finalImageUrl = compressed.dataUrl;
      } catch (err: any) {
        alert(err?.message || 'Gagal memproses file foto');
        setIsProcessingBatch(false);
        return;
      }
      setIsProcessingBatch(false);
    }

    // If only youtube URL provided and no image, derive thumbnail
    if (!finalImageUrl && singleYoutubeUrl) {
      const yt = extractYouTubeThumbnail(singleYoutubeUrl);
      if (yt.thumbnailUrl) {
        finalImageUrl = yt.thumbnailUrl;
      }
    }

    if (!finalImageUrl) {
      alert('Harap unggah file foto atau masukkan tautan (URL) gambar/video.');
      return;
    }

    const newItem: GalleryItem = {
      id: `gal-single-${Date.now()}`,
      title: singleTitle.trim(),
      category: singleCategory as any,
      date: singleDate.trim() || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      imageUrl: finalImageUrl,
      youtubeUrl: singleYoutubeUrl.trim() || undefined,
      description: singleDescription.trim() || `Dokumentasi kegiatan: ${singleTitle.trim()}`,
    };

    if (onBatchAddGallery) {
      onBatchAddGallery([newItem]);
      showFeedbackToast(`Dokumentasi "${newItem.title}" berhasil ditambahkan!`);
      // Reset
      setSingleTitle('');
      setSingleImageUrl('');
      setSingleYoutubeUrl('');
      setSingleDescription('');
      setSingleImageFile(null);
      setShowQuickUploadModal(false);
    }
  };

  return (
    <section id="galeri" className="py-20 bg-transparent text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Total Count & Action Buttons */}
        <div className="text-center max-w-3xl mx-auto mb-10 relative">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-950 text-xs font-extrabold uppercase tracking-wider mb-3 border border-emerald-300 shadow-2xs">
            <ImageIcon className="w-3.5 h-3.5 text-emerald-700" />
            <span>Dokumentasi Visual & Video BAPOLES</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            <span className="text-emerald-800">Total {gallery.length} Item (Tanpa Batas)</span>
          </div>

          <div className="flex items-center gap-2.5 justify-center flex-wrap mt-2 mb-3">
            {/* Quick Upload Button directly in Gallery Section */}
            <button
              onClick={() => setShowQuickUploadModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md hover:scale-105 transition-all cursor-pointer"
              title="Unggah Foto atau Tautan Banyak Sekaligus Tanpa Batas"
            >
              <Plus className="w-4 h-4" />
              <span>Unggah Foto & Tautan (Tanpa Batas)</span>
            </button>

            {onOpenEditModal && (
              <button
                onClick={() => onOpenEditModal('gallery')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white hover:bg-emerald-50 text-emerald-900 text-xs font-bold border border-emerald-300 shadow-2xs hover:scale-105 transition-all cursor-pointer"
                title="Kelola & Atur Galeri di Editor"
              >
                <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Kelola Galeri</span>
              </button>
            )}
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0c3832] tracking-tight">
            Galeri Kegiatan BAPOLES
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Dokumentasi lengkap momen rekaman podcast, interaksi narasumber, serta aksi nyata promosi kesehatan di seluruh kabupaten/kota se-Nusa Tenggara Timur.
          </p>
        </div>

        {/* Search Bar and Category Controls */}
        <div className="max-w-4xl mx-auto mb-8 space-y-4">
          {/* Live Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Cari dokumentasi kegiatan berdasarkan judul, topik, atau tanggal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 shadow-xs transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Pills with Dynamic Counts */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {FILTER_CATEGORIES.map((cat) => {
              const count = cat === 'Semua' 
                ? gallery.length 
                : gallery.filter((g) => normalizeCategory(g.category, g.title, g.description) === cat || g.category === cat).length;

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedCategory === cat
                      ? 'bg-teal-700 text-white shadow-md shadow-teal-700/20 scale-105'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedCategory === cat ? 'bg-teal-800 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Results Summary Info */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-2">
            <span>
              Menampilkan <strong className="text-slate-800">{filteredGallery.length}</strong> dari <strong className="text-slate-800">{gallery.length}</strong> dokumentasi kegiatan
            </span>
            {(selectedCategory !== 'Semua' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory('Semua');
                  setSearchQuery('');
                }}
                className="text-teal-700 hover:underline font-bold cursor-pointer"
              >
                Reset Filter & Pencarian
              </button>
            )}
          </div>
        </div>

        {/* Photos Grid - Unlimited items displayed seamlessly */}
        {filteredGallery.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGallery.map((item) => (
              <div
                key={item.id}
                onClick={() => handleOpenPhoto(item)}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-200 cursor-pointer transition-all duration-300 flex flex-col"
              >
                {/* Image Container */}
                <div className="relative h-60 w-full overflow-hidden bg-slate-900">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // Graceful fallback for broken image links
                      (e.target as HTMLImageElement).src = '/images/podcast_studio.jpg';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                  {/* Category Tag & Video Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap max-w-[80%]">
                    <span className="px-2.5 py-1 rounded-lg bg-[#0f2b48]/85 text-white text-[11px] font-bold backdrop-blur-sm shadow">
                      {normalizeCategory(item.category, item.title, item.description)}
                    </span>
                    {item.youtubeUrl && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-600 text-white text-[10px] font-bold shadow backdrop-blur-xs">
                        <Youtube className="w-3 h-3 fill-white text-white" />
                        <span>Video</span>
                      </div>
                    )}
                  </div>

                  {/* Delete Action Button on Card Top Right */}
                  {onDeleteGallery && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPhotoToDelete(item);
                      }}
                      className="absolute top-3 right-3 z-10 p-2 rounded-xl bg-red-600/90 hover:bg-red-700 text-white shadow-md transition-all hover:scale-110 cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                      title="Hapus foto dokumentasi ini dari galeri"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="text-[10px]">Hapus</span>
                    </button>
                  )}

                  {/* Play or Zoom indicator */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    {item.youtubeUrl && (
                      <span className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                        <Play className="w-4 h-4 fill-white ml-0.5" />
                      </span>
                    )}
                    <div className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Text Info */}
                <div className="p-4 flex-1 flex flex-col justify-between bg-white">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{item.date}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-teal-700 transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Bottom Card Actions */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    {item.youtubeUrl ? (
                      <a
                        href={item.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 transition-colors"
                      >
                        <Youtube className="w-3.5 h-3.5" />
                        <span>Tonton Video</span>
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                        <ImageIcon className="w-3 h-3 text-slate-400" />
                        <span>Dokumentasi Foto</span>
                      </span>
                    )}

                    <span className="text-[11px] font-bold text-teal-700 hover:text-teal-800 flex items-center gap-0.5">
                      Lihat Detail &rarr;
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-lg mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Tidak Ada Dokumentasi yang Cocok
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              {searchQuery 
                ? `Tidak ditemukan foto atau video yang memuat kata "${searchQuery}".`
                : `Belum ada foto dalam kategori "${selectedCategory}".`}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setSelectedCategory('Semua');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Tampilkan Semua
              </button>
              <button
                onClick={() => setShowQuickUploadModal(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Unggah Foto Sekarang</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* LIGHTBOX MODAL WITH PREV / NEXT CYCLE NAVIGATION */}
      {/* ======================================================== */}
      {activePhoto && activePhotoIndex !== null && (
        <div 
          onClick={() => setActivePhotoIndex(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative bg-slate-900 rounded-3xl overflow-hidden max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-700 animate-scaleUp"
          >
            {/* Top Navigation & Media Toggle Bar */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-slate-950 border-b border-slate-800 text-white">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-300">
                  Foto {activePhotoIndex + 1} dari {filteredGallery.length}
                </span>
                {activePhoto.youtubeUrl && (
                  <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700 ml-2">
                    <button
                      onClick={() => setActiveMediaTab('photo')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                        activeMediaTab === 'photo' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Foto
                    </button>
                    <button
                      onClick={() => setActiveMediaTab('video')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                        activeMediaTab === 'video' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Video YouTube</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {activePhoto.youtubeUrl && (
                  <a
                    href={activePhoto.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1 underline hidden sm:flex"
                    title="Buka langsung di tab baru YouTube"
                  >
                    <span>Buka YouTube</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                <button
                  onClick={() => setActivePhotoIndex(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Tutup (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Media Area with Prev/Next Navigation Controls */}
            <div className="relative min-h-[300px] max-h-[62vh] w-full bg-black flex items-center justify-center overflow-hidden">
              {/* Previous Photo Arrow */}
              {filteredGallery.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevPhoto();
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all hover:scale-110 cursor-pointer backdrop-blur-sm border border-white/20"
                  title="Foto Sebelumnya (Panah Kiri)"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              {/* Next Photo Arrow */}
              {filteredGallery.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextPhoto();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all hover:scale-110 cursor-pointer backdrop-blur-sm border border-white/20"
                  title="Foto Selanjutnya (Panah Kanan)"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}

              {activeMediaTab === 'video' && activeEmbedUrl ? (
                <div className="w-full aspect-video max-h-[60vh]">
                  <iframe
                    src={activeEmbedUrl}
                    title={activePhoto.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              ) : (
                <img
                  src={activePhoto.imageUrl}
                  alt={activePhoto.title}
                  referrerPolicy="no-referrer"
                  className="max-h-[60vh] w-full object-contain"
                />
              )}
            </div>

            {/* Content Details */}
            <div className="p-5 sm:p-6 overflow-y-auto bg-slate-900 border-t border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
                    {normalizeCategory(activePhoto.category, activePhoto.title, activePhoto.description)}
                  </span>
                  <span className="text-xs text-slate-300">• {activePhoto.date}</span>
                </div>

                {/* Action Buttons: YouTube & Delete */}
                <div className="flex items-center gap-2 flex-wrap">
                  {activePhoto.youtubeUrl && (
                    <a
                      href={activePhoto.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md hover:scale-105 cursor-pointer w-fit"
                    >
                      <Youtube className="w-4 h-4 fill-white text-white" />
                      <span>Tonton di YouTube</span>
                      <ExternalLink className="w-3.5 h-3.5 text-red-200" />
                    </a>
                  )}

                  {onDeleteGallery && (
                    <button
                      type="button"
                      onClick={() => setPhotoToDelete(activePhoto)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 text-xs font-bold transition-all cursor-pointer"
                      title="Hapus foto dokumentasi ini dari galeri"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Foto Ini</span>
                    </button>
                  )}
                </div>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-white">
                {activePhoto.title}
              </h3>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                {activePhoto.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* QUICK UPLOAD MODAL (UNLIMITED PHOTOS & LINKS) */}
      {/* ======================================================== */}
      {showQuickUploadModal && (
        <div 
          onClick={() => {
            if (!isProcessingBatch) setShowQuickUploadModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-2xl w-full p-6 text-slate-800 shadow-2xl border border-emerald-300 flex flex-col max-h-[92vh] overflow-y-auto animate-scaleUp"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Unggah Galeri Kegiatan (Tanpa Batas)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pilih banyak foto sekaligus dari perangkat atau tempel tautan/link video.
                  </p>
                </div>
              </div>
              <button
                disabled={isProcessingBatch}
                onClick={() => setShowQuickUploadModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl mb-5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setQuickUploadTab('files')}
                className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  quickUploadTab === 'files'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Banyak Foto Sekaligus</span>
              </button>

              <button
                type="button"
                onClick={() => setQuickUploadTab('links')}
                className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  quickUploadTab === 'links'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Tempel Tautan / Link</span>
              </button>

              <button
                type="button"
                onClick={() => setQuickUploadTab('single')}
                className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  quickUploadTab === 'single'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Foto Tunggal Detail</span>
              </button>
            </div>

            {/* TAB 1: BATCH FILES UPLOAD */}
            {quickUploadTab === 'files' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-700">
                    Pilih Kategori untuk Semua Foto Terpilih:
                  </label>
                  <select
                    value={selectedCategoryForBatch}
                    onChange={(e) => setSelectedCategoryForBatch(e.target.value)}
                    className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white font-medium"
                  >
                    {BAPOLES_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Drag & Drop Box with Multiple Support */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingOver(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDraggingOver(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingOver(false);
                    if (e.dataTransfer.files) {
                      const filesArray = Array.from<File>(e.dataTransfer.files).filter((f: File) =>
                        f.type.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(f.name)
                      );
                      setBatchFiles((prev) => [...prev, ...filesArray]);
                    }
                  }}
                  className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all ${
                    isDraggingOver
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-300 hover:border-emerald-400 bg-slate-50'
                  }`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                    <Upload className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">
                    Tarik & Lepaskan File Foto ke Sini
                  </h4>
                  <p className="text-xs text-slate-500 mb-4">
                    Pilih 5, 10, 50, atau berapapun jumlah foto (PNG, JPG, JPEG, WebP).
                  </p>
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-sm">
                    <Plus className="w-4 h-4" />
                    <span>Pilih Foto dari Perangkat</span>
                    <input
                      type="file"
                      multiple
                      accept=".png, .jpg, .jpeg, .webp, image/*"
                      onChange={(e) => {
                        if (e.target.files) {
                          const filesArray = Array.from(e.target.files);
                          setBatchFiles((prev) => [...prev, ...filesArray]);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Selected Files List & Counter */}
                {batchFiles.length > 0 && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        {batchFiles.length} foto siap diunggah
                      </span>
                      <button
                        type="button"
                        onClick={() => setBatchFiles([])}
                        className="text-xs text-red-600 hover:underline font-bold cursor-pointer"
                      >
                        Hapus Semua Pilihan
                      </button>
                    </div>

                    <div className="max-h-36 overflow-y-auto space-y-1 text-xs text-slate-600 pr-1">
                      {batchFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-200">
                          <span className="truncate max-w-[80%] font-medium">{idx + 1}. {file.name}</span>
                          <span className="text-[10px] text-slate-400">{(file.size / 1024).toFixed(0)} KB</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Progress Bar while compressing & uploading */}
                {isProcessingBatch && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-emerald-600 animate-spin shrink-0" />
                    <span className="text-xs font-bold text-emerald-900">{batchProgressText}</span>
                  </div>
                )}

                {/* Submit Batch Files Button */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    disabled={isProcessingBatch}
                    onClick={() => setShowQuickUploadModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={batchFiles.length === 0 || isProcessingBatch}
                    onClick={handleProcessBatchFiles}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-bold shadow-md cursor-pointer transition-colors flex items-center gap-2"
                  >
                    {isProcessingBatch ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sedang Memproses...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Unggah Semua Foto ({batchFiles.length}) Sekarang</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: BATCH LINKS / URLS UPLOAD */}
            {quickUploadTab === 'links' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 flex items-start gap-2.5 text-xs text-teal-900">
                  <Info className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Mendukung Tautan Gambar & Video YouTube</p>
                    <p className="text-teal-700 mt-0.5">
                      Tempel tautan (URL) gambar langsung atau link video YouTube. Masukkan 1 link per baris atau pisahkan dengan koma.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-700">
                    Kategori untuk Tautan Ini:
                  </label>
                  <select
                    value={selectedCategoryForBatch}
                    onChange={(e) => setSelectedCategoryForBatch(e.target.value)}
                    className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white font-medium"
                  >
                    {BAPOLES_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Daftar Tautan / Link (1 baris per link):
                  </label>
                  <textarea
                    rows={6}
                    placeholder={`Contoh:\nhttps://www.youtube.com/watch?v=...\nhttps://images.unsplash.com/photo-...\nhttps://example.com/foto-kegiatan.jpg`}
                    value={batchLinksText}
                    onChange={(e) => setBatchLinksText(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-mono rounded-2xl border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-800 placeholder:text-slate-400"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowQuickUploadModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={!batchLinksText.trim()}
                    onClick={handleProcessBatchLinks}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-bold shadow-md cursor-pointer transition-colors flex items-center gap-2"
                  >
                    <Link2 className="w-4 h-4" />
                    <span>Tambahkan Semua Tautan Sekarang</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: SINGLE PHOTO FORM WITH FULL DETAILS */}
            {quickUploadTab === 'single' && (
              <form onSubmit={handleProcessSingleItem} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Judul Foto / Video Kegiatan *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Talkshow BAPOLES Bersama Nakes Dinkes NTT"
                    value={singleTitle}
                    onChange={(e) => setSingleTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Kategori</label>
                    <select
                      value={singleCategory}
                      onChange={(e) => setSingleCategory(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                    >
                      {BAPOLES_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Kegiatan</label>
                    <input
                      type="text"
                      placeholder="Contoh: 15 Mei 2026"
                      value={singleDate}
                      onChange={(e) => setSingleDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Unggah File Foto (PNG, JPG, WebP)
                    </label>
                    <input
                      type="file"
                      accept=".png, .jpg, .jpeg, .webp, image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSingleImageFile(file);
                        }
                      }}
                      className="w-full text-xs text-slate-600 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Atau Masukkan URL Gambar Langsung
                    </label>
                    <input
                      type="url"
                      placeholder="https://.../gambar.jpg"
                      value={singleImageUrl}
                      onChange={(e) => setSingleImageUrl(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5 text-red-600">
                    <Youtube className="w-3.5 h-3.5" />
                    <span>Link Video YouTube (Opsional)</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={singleYoutubeUrl}
                    onChange={(e) => setSingleYoutubeUrl(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Singkat</label>
                  <textarea
                    rows={2}
                    placeholder="Ringkasan momen kegiatan..."
                    value={singleDescription}
                    onChange={(e) => setSingleDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowQuickUploadModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessingBatch}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer transition-colors flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Simpan ke Galeri</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ======================================================== */}
      {photoToDelete && (
        <div 
          onClick={() => setPhotoToDelete(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-md w-full p-6 text-slate-800 shadow-2xl border border-red-200 flex flex-col items-center text-center animate-scaleUp"
          >
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-3">
              <Trash2 className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-black text-slate-900 mb-1">
              Hapus Foto Dokumentasi?
            </h3>
            
            <p className="text-xs text-slate-600 mb-4">
              Apakah Anda yakin ingin menghapus dokumentasi kegiatan ini dari galeri?
            </p>

            <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 mb-5 flex items-center gap-3 text-left">
              <img
                src={photoToDelete.imageUrl}
                alt={photoToDelete.title}
                className="w-16 h-12 rounded-xl object-cover border border-slate-300 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                  {photoToDelete.category}
                </span>
                <h4 className="text-xs font-bold text-slate-900 truncate mt-1">
                  {photoToDelete.title}
                </h4>
                <p className="text-[11px] text-slate-500">{photoToDelete.date}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full">
              <button
                type="button"
                onClick={() => setPhotoToDelete(null)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-4 py-2.5 rounded-2xl bg-emerald-900 text-white border border-emerald-400/50 shadow-2xl flex items-center gap-2 text-xs font-bold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}
    </section>
  );
};
