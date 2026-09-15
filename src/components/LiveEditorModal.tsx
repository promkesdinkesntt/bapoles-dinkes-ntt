import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  RotateCcw, 
  Download, 
  Upload, 
  Plus, 
  Trash2, 
  Edit2, 
  Headphones, 
  Calendar, 
  Image as ImageIcon, 
  Users, 
  Settings, 
  Check,
  HelpCircle,
  Radio,
  Info,
  Phone,
  Compass,
  CheckCircle2,
  Share2,
  Youtube,
  ExternalLink,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { compressAndProcessImage } from '../utils/imageUpload';
import { 
  safeSetLocalStorage, 
  saveEpisodesToIndexedDB, 
  saveGalleryToIndexedDB 
} from '../utils/galleryStorage';
import { 
  SiteConfig, 
  PodcastEpisode, 
  PodcastSchedule, 
  GalleryItem, 
  TeamMember,
  NavMenuItem
} from '../types';
import { BAPOLES_CATEGORIES, normalizeCategory, syncEpisodesWithGallery } from '../utils/categoryUtils';
import { SectionActionBar } from './editor/SectionActionBar';
import { AddMenuModal } from './editor/AddMenuModal';
import { NavMenuManager } from './editor/NavMenuManager';
import { HomePillarsEditor } from './editor/HomePillarsEditor';
import { AboutSymbolsAndPillarsEditor } from './editor/AboutSymbolsAndPillarsEditor';
import { ContactChannelsEditor } from './editor/ContactChannelsEditor';

interface LiveEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteConfig: SiteConfig;
  setSiteConfig: React.Dispatch<React.SetStateAction<SiteConfig>>;
  episodes: PodcastEpisode[];
  setEpisodes: React.Dispatch<React.SetStateAction<PodcastEpisode[]>>;
  schedules: PodcastSchedule[];
  setSchedules: React.Dispatch<React.SetStateAction<PodcastSchedule[]>>;
  gallery: GalleryItem[];
  setGallery: React.Dispatch<React.SetStateAction<GalleryItem[]>>;
  team: TeamMember[];
  setTeam: React.Dispatch<React.SetStateAction<TeamMember[]>>;
  onSaveToLocalStorage: () => void;
  onResetToDefault: () => void;
  initialTab?: string;
}

export const LiveEditorModal: React.FC<LiveEditorModalProps> = ({
  isOpen,
  onClose,
  siteConfig,
  setSiteConfig,
  episodes,
  setEpisodes,
  schedules,
  setSchedules,
  gallery,
  setGallery,
  team,
  setTeam,
  onSaveToLocalStorage,
  onResetToDefault,
  initialTab = 'beranda',
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [savedAlert, setSavedAlert] = useState(false);
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Safe delete states (bypass iframe window.confirm restriction)
  const [deletingGalleryId, setDeletingGalleryId] = useState<string | null>(null);
  const [deletingEpisodeId, setDeletingEpisodeId] = useState<string | null>(null);
  const [deletingScheduleId, setDeletingScheduleId] = useState<string | null>(null);
  const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3000);
  };

  // Sync activeTab when modal is reopened or initialTab changes
  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Safe accessor helpers
  const menuLabels = siteConfig.menuLabels || {
    beranda: 'Beranda',
    jadwal: 'Jadwal Podcast',
    galeri: 'Galeri',
    tentang: 'Tentang',
    tim: 'Tim Kami',
    kontak: 'Kontak',
  };

  const aboutData = siteConfig.aboutData || {
    badge: 'Mengenal BAPOLES',
    title: 'Tentang Podcast BAPOLES Dinkes NTT',
    subtitle: 'Inovasi komunikasi publik dari Dinas Kesehatan Provinsi Nusa Tenggara Timur untuk mewujudkan masyarakat NTT yang sehat, bugar, dan berdaya melalui obrolan santai namun berbobot.',
    philosophyTitle: 'Filosofi "Ba\' Omong Pola Hidup Sehat"',
    philosophyP1: 'Dalam dialek Kupang dan bahasa keseharian masyarakat NTT, kata "Ba\' Omong" bermakna bercakap-cakap atau berdiskusi dengan hangat, akrab, dan tanpa jarak.',
    philosophyP2: 'Melalui BAPOLES, Dinas Kesehatan Provinsi NTT ingin mengubah paradigma penyuluhan kesehatan yang formal menjadi obrolan interaktif yang menyenangkan.',
    pillar1Title: 'Berbasis Bukti Medis',
    pillar1Desc: 'Materi disusun dan disampaikan bersama dokter spesialis, perawat, bidan, sanitarian, dan akademisi gizi terpercaya.',
    pillar2Title: 'Menjangkau 22 Daerah',
    pillar2Desc: 'Siaran multiplatform via YouTube, Facebook, WhatsApp Center, dan radio komunitas di seluruh kepulauan NTT.',
    logoSectionTitle: 'Makna Filosofis Unsur Logo BAPOLES',
    symbol1Title: 'Mikrofon Podcast',
    symbol1Desc: 'Melambangkan sarana komunikasi terbuka, suara masyarakat, dan wadah edukasi kesehatan yang menjangkau seluruh warga NTT tanpa batasan wilayah.',
    symbol2Title: 'Siluet Komodo NTT',
    symbol2Desc: 'Satwa ikonik kebanggaan Nusa Tenggara Timur yang melambangkan ketangguhan, kearifan lokal, dan identitas khas Bumi Flobamorata.',
    symbol3Title: 'Palang Medis Putih',
    symbol3Desc: 'Representasi pelayanan medis yang bersih, profesional, dan komitmen Dinas Kesehatan dalam mewujudkan pelayanan kesehatan paripurna.',
    symbol4Title: 'Detak Jantung & Panah Naik',
    symbol4Desc: 'Garis kardiogram dinamis dan panah melesat ke atas mencerminkan peningkatan status kesehatan dan vitalitas hidup masyarakat NTT.',
  };

  const homeData = siteConfig.homeData || {
    tickerText: 'Setiap Kamis Pukul 15.00 WITA | Live YouTube & FB @dinkesntt',
    pillar1Title: 'Edukasi Terpercaya',
    pillar1Desc: 'Disampaikan langsung oleh dokter spesialis & praktisi kesehatan NTT.',
    pillar2Title: 'Kearifan Lokal NTT',
    pillar2Desc: 'Pangan lokal marungga, tradisi sehat, dan budaya Flobamorata.',
    pillar3Title: 'Interaktif & Terbuka',
    pillar3Desc: 'Tanya jawab langsung via WhatsApp dan live chat media sosial.',
  };

  // New Episode Form State
  const [showAddEpisode, setShowAddEpisode] = useState(false);
  const [newEpisode, setNewEpisode] = useState<Partial<PodcastEpisode>>({
    title: '',
    category: 'Kesehatan Masyarakat',
    date: 'Hari ini',
    duration: '35 Menit',
    speakerName: '',
    speakerRole: '',
    coverImage: '/images/podcast_studio.jpg',
    description: '',
    youtubeUrl: 'https://youtube.com/@dinkesntt',
  });

  // New Schedule Form State
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [newSchedule, setNewSchedule] = useState<Partial<PodcastSchedule>>({
    title: '',
    date: 'Kamis, 15 Oktober 2026',
    time: '15:00 - 16:30 WITA',
    topic: 'Kesehatan Masyarakat',
    guestName: '',
    guestRole: 'Dokter Spesialis',
    platform: 'YouTube & FB Live',
    streamUrl: 'https://youtube.com/@dinkesntt',
    status: 'upcoming',
  });

  // New Gallery Form State & Upload States
  const [showAddGallery, setShowAddGallery] = useState(false);
  const [galleryUploadMeta, setGalleryUploadMeta] = useState<{
    name: string;
    sizeFormatted: string;
    isProcessing?: boolean;
  } | null>(null);
  const [isDraggingGallery, setIsDraggingGallery] = useState(false);
  const [galleryUploadError, setGalleryUploadError] = useState<string | null>(null);

  const [newGalleryItem, setNewGalleryItem] = useState<Partial<GalleryItem>>({
    title: '',
    category: 'Kesehatan Masyarakat',
    date: 'Oktober 2026',
    imageUrl: '',
    description: '',
    youtubeUrl: '',
  });

  // New Team Member Form State
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [newTeamMember, setNewTeamMember] = useState<Partial<TeamMember>>({
    name: '',
    role: '',
    institution: 'Dinas Kesehatan Prov. NTT',
    photoUrl: '/images/dr_speaker.jpg',
    bio: '',
  });

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveToLocalStorage();
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 2500);
  };

  const handleExportJSON = () => {
    const backupData = {
      siteConfig,
      episodes,
      schedules,
      gallery,
      team,
      exportedAt: new Date().toISOString(),
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `bapoles_dinkes_ntt_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.siteConfig) setSiteConfig(json.siteConfig);
        if (json.episodes) setEpisodes(json.episodes);
        if (json.schedules) setSchedules(json.schedules);
        if (json.gallery) setGallery(json.gallery);
        if (json.team) setTeam(json.team);
        alert('Data berhasil diimpor!');
      } catch (err) {
        alert('File JSON tidak valid atau format salah.');
      }
    };
    reader.readAsText(file);
  };

  // Add Handlers
  const handleAddEpisodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEpisode.title || !newEpisode.speakerName) return;

    const item: PodcastEpisode = {
      id: `ep-${Date.now()}`,
      title: newEpisode.title || 'Episode Baru',
      description: newEpisode.description || 'Deskripsi episode...',
      episodeNumber: episodes.length + 1,
      duration: newEpisode.duration || '30 Menit',
      date: newEpisode.date || 'Hari ini',
      category: newEpisode.category as any || 'Gaya Hidup Sehat',
      speakerName: newEpisode.speakerName || 'Narasumber',
      speakerRole: newEpisode.speakerRole || 'Praktisi Kesehatan',
      coverImage: newEpisode.coverImage || '/images/podcast_studio.jpg',
      audioUrl: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg',
      youtubeUrl: newEpisode.youtubeUrl || 'https://youtube.com/@dinkesntt',
      listensCount: 125,
    };

    setEpisodes([item, ...episodes]);
    setShowAddEpisode(false);
    setNewEpisode({
      title: '',
      category: 'Gaya Hidup Sehat',
      date: 'Hari ini',
      duration: '35 Menit',
      speakerName: '',
      speakerRole: '',
      coverImage: '/images/podcast_studio.jpg',
      description: '',
      youtubeUrl: 'https://youtube.com/@dinkesntt',
    });
  };

  const handleAddScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchedule.title || !newSchedule.guestName) return;

    const item: PodcastSchedule = {
      id: `sched-${Date.now()}`,
      title: newSchedule.title || 'Siaran Baru',
      date: newSchedule.date || 'Kamis, Mendatang',
      time: newSchedule.time || '15:00 - 16:30 WITA',
      topic: newSchedule.topic || 'Kesehatan',
      guestName: newSchedule.guestName || 'Dokter Spesialis',
      guestRole: newSchedule.guestRole || 'Narasumber Ahli',
      platform: newSchedule.platform as any || 'YouTube & FB Live',
      streamUrl: newSchedule.streamUrl || 'https://youtube.com/@dinkesntt',
      status: 'upcoming',
    };

    setSchedules([item, ...schedules]);
    setShowAddSchedule(false);
    setNewSchedule({
      title: '',
      date: 'Kamis, Mendatang',
      time: '15:00 - 16:30 WITA',
      topic: '',
      guestName: '',
      guestRole: '',
      platform: 'YouTube & FB Live',
      streamUrl: 'https://youtube.com/@dinkesntt',
      status: 'upcoming',
    });
  };

  const handleGalleryFileChange = async (file?: File) => {
    if (!file) return;
    setGalleryUploadError(null);
    setGalleryUploadMeta({
      name: file.name,
      sizeFormatted: 'Mengoptimalkan...',
      isProcessing: true,
    });
    try {
      const result = await compressAndProcessImage(file);
      setNewGalleryItem((prev) => ({ ...prev, imageUrl: result.dataUrl }));
      setGalleryUploadMeta({
        name: result.name,
        sizeFormatted: result.sizeFormatted,
        isProcessing: false,
      });
      showToast(`Foto "${result.name}" berhasil diproses & siap disimpan (${result.sizeFormatted})`);
    } catch (err: any) {
      setGalleryUploadError(err?.message || 'Gagal memproses file foto. Pastikan format PNG, JPG, atau JPEG.');
      setGalleryUploadMeta(null);
    }
  };

  const handleUpdateGalleryItemField = (idx: number, patch: Partial<GalleryItem>) => {
    const updated = [...gallery];
    updated[idx] = { ...updated[idx], ...patch };
    setGallery(updated);
    const synced = syncEpisodesWithGallery(episodes, updated);
    setEpisodes(synced);
    safeSetLocalStorage('bapoles_gallery_data', updated);
    safeSetLocalStorage('bapoles_gallery_v1', updated);
    safeSetLocalStorage('bapoles_episodes_data', synced);
    safeSetLocalStorage('bapoles_episodes_v1', synced);
    saveGalleryToIndexedDB(updated);
    saveEpisodesToIndexedDB(synced);
  };

  const handleUpdateExistingGalleryImage = async (idx: number, file?: File) => {
    if (!file) return;
    try {
      const result = await compressAndProcessImage(file);
      const updated = [...gallery];
      const targetTitle = updated[idx]?.title || 'Dokumentasi';
      updated[idx] = { ...updated[idx], imageUrl: result.dataUrl };
      setGallery(updated);
      const synced = syncEpisodesWithGallery(episodes, updated);
      setEpisodes(synced);
      safeSetLocalStorage('bapoles_gallery_data', updated);
      safeSetLocalStorage('bapoles_gallery_v1', updated);
      safeSetLocalStorage('bapoles_episodes_data', synced);
      safeSetLocalStorage('bapoles_episodes_v1', synced);
      saveGalleryToIndexedDB(updated);
      saveEpisodesToIndexedDB(synced);
      onSaveToLocalStorage();
      showToast(`Foto "${targetTitle}" berhasil diperbarui! (${result.sizeFormatted})`);
    } catch (err: any) {
      showToast(err?.message || 'Gagal memproses file foto.');
    }
  };

  const handleAddGallerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalleryItem.title || !newGalleryItem.title.trim()) {
      showToast('Harap masukkan Judul Foto Kegiatan terlebih dahulu!');
      return;
    }
    if (!newGalleryItem.imageUrl) {
      showToast('Harap pilih atau unggah file foto kegiatan (PNG, JPG, JPEG)!');
      return;
    }

    const item: GalleryItem = {
      id: `gal-${Date.now()}`,
      title: newGalleryItem.title.trim(),
      category: (newGalleryItem.category as any) || 'Kesehatan Masyarakat',
      imageUrl: newGalleryItem.imageUrl,
      date: newGalleryItem.date?.trim() || '2026',
      description: newGalleryItem.description?.trim() || '',
      youtubeUrl: newGalleryItem.youtubeUrl?.trim() || '',
    };

    const updated = [item, ...gallery];
    setGallery(updated);
    const synced = syncEpisodesWithGallery(episodes, updated);
    setEpisodes(synced);
    safeSetLocalStorage('bapoles_gallery_data', updated);
    safeSetLocalStorage('bapoles_gallery_v1', updated);
    safeSetLocalStorage('bapoles_episodes_data', synced);
    safeSetLocalStorage('bapoles_episodes_v1', synced);
    saveGalleryToIndexedDB(updated);
    saveEpisodesToIndexedDB(synced);
    onSaveToLocalStorage();
    setShowAddGallery(false);
    setNewGalleryItem({
      title: '',
      category: 'Kesehatan Masyarakat',
      date: 'Oktober 2026',
      imageUrl: '',
      description: '',
      youtubeUrl: '',
    });
    setGalleryUploadMeta(null);
    setGalleryUploadError(null);
    showToast(`Dokumentasi "${item.title}" berhasil disimpan ke Galeri!`);
  };

  const handleAddTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamMember.name || !newTeamMember.role) return;

    const item: TeamMember = {
      id: `tm-${Date.now()}`,
      name: newTeamMember.name || 'Nama Lengkap',
      role: newTeamMember.role || 'Jabatan / Tim',
      institution: newTeamMember.institution || 'Dinas Kesehatan Prov. NTT',
      photoUrl: newTeamMember.photoUrl || '/images/dr_speaker.jpg',
      bio: newTeamMember.bio || '',
    };

    setTeam([...team, item]);
    setShowAddTeam(false);
    setNewTeamMember({
      name: '',
      role: '',
      institution: 'Dinas Kesehatan Prov. NTT',
      photoUrl: '/images/dr_speaker.jpg',
      bio: '',
    });
  };

  const executeDeleteEpisode = (id: string) => {
    const item = episodes.find((ep) => ep.id === id);
    const updated = episodes.filter((ep) => ep.id !== id);
    setEpisodes(updated);
    safeSetLocalStorage('bapoles_episodes_data', updated);
    safeSetLocalStorage('bapoles_episodes_v1', updated);
    saveEpisodesToIndexedDB(updated);
    setDeletingEpisodeId(null);
    showToast(`Episode "${item?.title || ''}" berhasil dihapus!`);
  };

  const executeDeleteSchedule = (id: string) => {
    const item = schedules.find((s) => s.id === id);
    const updated = schedules.filter((s) => s.id !== id);
    setSchedules(updated);
    safeSetLocalStorage('bapoles_schedules_data', updated);
    safeSetLocalStorage('bapoles_schedules_v1', updated);
    setDeletingScheduleId(null);
    showToast(`Jadwal "${item?.title || ''}" berhasil dihapus!`);
  };

  const executeDeleteGallery = (id: string) => {
    const item = gallery.find((g) => g.id === id);
    const updated = gallery.filter((g) => g.id !== id);
    setGallery(updated);
    const synced = syncEpisodesWithGallery(episodes, updated);
    setEpisodes(synced);
    safeSetLocalStorage('bapoles_gallery_data', updated);
    safeSetLocalStorage('bapoles_gallery_v1', updated);
    safeSetLocalStorage('bapoles_episodes_data', synced);
    safeSetLocalStorage('bapoles_episodes_v1', synced);
    saveGalleryToIndexedDB(updated);
    saveEpisodesToIndexedDB(synced);
    setDeletingGalleryId(null);
    showToast(`Foto "${item?.title || ''}" berhasil dihapus dari galeri!`);
  };

  const executeDeleteTeam = (id: string) => {
    const item = team.find((t) => t.id === id);
    const updated = team.filter((t) => t.id !== id);
    setTeam(updated);
    safeSetLocalStorage('bapoles_team_data', updated);
    safeSetLocalStorage('bapoles_team_v1', updated);
    setDeletingTeamId(null);
    showToast(`Anggota tim "${item?.name || ''}" berhasil dihapus!`);
  };

  const updateMenuLabel = (key: keyof typeof menuLabels, value: string) => {
    setSiteConfig({
      ...siteConfig,
      menuLabels: {
        ...menuLabels,
        [key]: value,
      },
    });
  };

  const updateHomeData = (patch: Partial<typeof homeData>) => {
    setSiteConfig({
      ...siteConfig,
      homeData: {
        ...homeData,
        ...patch,
      },
    });
  };

  const updateAboutData = (patch: Partial<typeof aboutData>) => {
    setSiteConfig({
      ...siteConfig,
      aboutData: {
        ...aboutData,
        ...patch,
      },
    });
  };

  const navTabList = [
    { id: 'beranda', label: '1. Beranda', icon: Radio },
    { id: 'schedules', label: '2. Jadwal Podcast', icon: Calendar },
    { id: 'gallery', label: '3. Galeri', icon: ImageIcon },
    { id: 'about', label: '4. Tentang', icon: Info },
    { id: 'team', label: '5. Tim Kami', icon: Users },
    { id: 'contact', label: '6. Kontak & Layanan', icon: Phone },
    { id: 'nav', label: '⚙️ Kelola Semua Menu (Tambah/Edit/Hapus)', icon: Settings },
    { id: 'episodes', label: '🎙️ Episode Podcast', icon: Headphones },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-emerald-500/40 overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#0c3832] via-teal-900 to-[#072420] text-white px-6 py-4 flex items-center justify-between border-b border-emerald-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg sm:text-xl text-white">
                  Pengelola Konten & Menu Website BAPOLES
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-black uppercase">
                  Langsung & Interaktif
                </span>
              </div>
              <p className="text-xs text-emerald-200">
                Pilih menu di bawah untuk mengedit teks judul, label menu, jadwal, galeri foto, filosofi tentang, tim, maupun kontak.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation (6 Requested Menus + Nav Labels + Episodes) */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 sm:px-6 flex items-center gap-1.5 overflow-x-auto scrollbar-none py-2.5">
          {navTabList.map((tab) => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  isTabActive
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isTabActive ? 'text-emerald-200' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-800 bg-slate-50/50 relative">
          {/* Action Notification Toast */}
          {toastMessage && (
            <div className="sticky top-0 z-40 p-3 mb-4 rounded-xl bg-emerald-700 text-white font-bold text-xs flex items-center justify-between shadow-lg animate-fadeIn border border-emerald-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>{toastMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setToastMessage(null)}
                className="text-white hover:text-emerald-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          
          {/* ======================================================== */}
          {/* MENU 1: BERANDA */}
          {/* ======================================================== */}
          {activeTab === 'beranda' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              {/* Menu Action Bar (Edit Label, Hapus Menu, Tambah Menu) */}
              <SectionActionBar
                menuKey="beranda"
                defaultLabel="Beranda"
                siteConfig={siteConfig}
                setSiteConfig={setSiteConfig}
                onOpenAddMenu={() => setShowAddMenuModal(true)}
                onShowToast={showToast}
              />

              {/* Taglines and Description */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider text-emerald-800 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-600" />
                  <span>Judul & Narasi Utama Beranda</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Tagline / Slogan Utama
                    </label>
                    <input
                      type="text"
                      value={siteConfig.tagline}
                      onChange={(e) => setSiteConfig({ ...siteConfig, tagline: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Sub-Tagline
                    </label>
                    <input
                      type="text"
                      value={siteConfig.subTagline}
                      onChange={(e) => setSiteConfig({ ...siteConfig, subTagline: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Deskripsi Ringkas Beranda
                  </label>
                  <textarea
                    rows={2}
                    value={siteConfig.description}
                    onChange={(e) => setSiteConfig({ ...siteConfig, description: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 text-xs sm:text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Teks Ticker Siaran Rutin (Paling Atas Website)
                  </label>
                  <input
                    type="text"
                    value={homeData.tickerText}
                    onChange={(e) => updateHomeData({ tickerText: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 text-xs sm:text-sm"
                    placeholder="Setiap Kamis Pukul 15.00 WITA | Live YouTube & FB @dinkesntt"
                  />
                </div>
              </div>

              {/* Dynamic Pillars Values of BAPOLES (Full CRUD: Tambah, Edit, Hapus) */}
              <HomePillarsEditor
                siteConfig={siteConfig}
                setSiteConfig={setSiteConfig}
                onShowToast={showToast}
              />

              {/* Logo BAPOLES Pojok Kiri Atas Control */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider text-emerald-800 flex items-center justify-between">
                  <span>Logo BAPOLES (Pojok Kiri Atas)</span>
                  <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/60">
                    Logo Resmi Dinkes NTT
                  </span>
                </h4>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-5">
                  <div className="relative w-24 h-24 rounded-2xl p-2 bg-white border border-teal-500/30 flex items-center justify-center shadow-xs flex-shrink-0">
                    <img
                      src={siteConfig.logoUrl || '/images/bapoles_logo.svg'}
                      alt="Logo BAPOLES Preview"
                      referrerPolicy="no-referrer"
                      className="max-h-full max-w-full object-contain drop-shadow-xs"
                    />
                  </div>
                  <div className="flex-1 space-y-2 text-xs text-slate-600 w-full">
                    <p className="font-semibold text-slate-800">
                      Logo resmi BAPOLES (Microphone + Lambang NTT + Komodo Dragon + Palang Medis + Detak Jantung / Cardiogram).
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Logo ini ditampilkan di pojok kiri atas bilah navigasi dan bagian identitas podcast.
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <label className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Unggah Logo Baru</span>
                        <input
                          type="file"
                          accept="image/*,.svg"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const res = event.target?.result as string;
                                if (res) {
                                  setSiteConfig({ ...siteConfig, logoUrl: res });
                                  showToast('Logo berhasil diperbarui!');
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setSiteConfig({ ...siteConfig, logoUrl: '/images/bapoles_logo.svg' });
                          showToast('Logo dikembalikan ke Logo Resmi BAPOLES!');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Kembalikan Logo Resmi</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Banner Control */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider text-emerald-800">
                  Gambar Banner Utama Beranda
                </h4>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative w-full sm:w-48 aspect-[16/9] rounded-xl overflow-hidden border border-emerald-500/30 bg-slate-900 flex-shrink-0">
                    <img
                      src={siteConfig.bannerImageUrl || '/images/bapoles_original_bg.jpg'}
                      alt="Banner Preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-2 text-xs text-slate-600 w-full">
                    <p className="font-semibold text-slate-800">
                      Banner ini menampilkan keaslian logo BAPOLES dan pola kain tenun NTT.
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Unggah File Gambar</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const res = event.target?.result as string;
                                if (res) {
                                  setSiteConfig({ ...siteConfig, bannerImageUrl: res });
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setSiteConfig({ ...siteConfig, bannerImageUrl: '/images/bapoles_original_bg.jpg', bannerOverlayOpacity: 0.15 })}
                        className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Kembalikan Banner Asli</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      Kepekatan Lapisan Gelap / Overlay: {Math.round(siteConfig.bannerOverlayOpacity * 100)}%
                    </label>
                    <span className="text-xs font-mono font-bold text-emerald-700">
                      {siteConfig.bannerOverlayOpacity === 0 ? '100% Asli Jernih' : `${Math.round((1 - siteConfig.bannerOverlayOpacity) * 100)}% Jernih`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.8"
                    step="0.05"
                    value={siteConfig.bannerOverlayOpacity}
                    onChange={(e) => setSiteConfig({ ...siteConfig, bannerOverlayOpacity: parseFloat(e.target.value) })}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MENU 2: JADWAL PODCAST */}
          {/* ======================================================== */}
          {activeTab === 'schedules' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              {/* Menu Action Bar (Edit Label, Hapus Menu, Tambah Menu) */}
              <SectionActionBar
                menuKey="jadwal"
                defaultLabel="Jadwal Podcast"
                siteConfig={siteConfig}
                setSiteConfig={setSiteConfig}
                onOpenAddMenu={() => setShowAddMenuModal(true)}
                onShowToast={showToast}
              />

              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-slate-900 text-base">
                  Daftar Jadwal Siaran Langsung ({schedules.length})
                </h4>
                <button
                  onClick={() => setShowAddSchedule(!showAddSchedule)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-700 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>{showAddSchedule ? 'Batal' : 'Tambah Jadwal Baru'}</span>
                </button>
              </div>

              {/* Add Schedule Form */}
              {showAddSchedule && (
                <form onSubmit={handleAddScheduleSubmit} className="p-5 rounded-2xl bg-white border border-emerald-400 shadow-sm space-y-4">
                  <h5 className="text-sm font-black text-emerald-900 uppercase tracking-wider">
                    Form Tambah Jadwal Siaran Baru
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Judul Siaran *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Kupas Tuntas Pola Hidup Sehat Flobamorata"
                        value={newSchedule.title}
                        onChange={(e) => setNewSchedule({ ...newSchedule, title: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Hari & Tanggal *</label>
                      <input
                        type="text"
                        required
                        placeholder="Kamis, 15 Oktober 2026"
                        value={newSchedule.date}
                        onChange={(e) => setNewSchedule({ ...newSchedule, date: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Waktu (WITA)</label>
                      <input
                        type="text"
                        placeholder="15:00 - 16:30 WITA"
                        value={newSchedule.time}
                        onChange={(e) => setNewSchedule({ ...newSchedule, time: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Nama Narasumber / Tamu *</label>
                      <input
                        type="text"
                        required
                        placeholder="dr. Spesialis / Bidan Ahli"
                        value={newSchedule.guestName}
                        onChange={(e) => setNewSchedule({ ...newSchedule, guestName: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Jabatan / Profesi Narasumber</label>
                      <input
                        type="text"
                        placeholder="Dokter Spesialis Anak"
                        value={newSchedule.guestRole}
                        onChange={(e) => setNewSchedule({ ...newSchedule, guestRole: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Topik Utama</label>
                      <input
                        type="text"
                        placeholder="Pencegahan Stunting & Gizi Marungga"
                        value={newSchedule.topic}
                        onChange={(e) => setNewSchedule({ ...newSchedule, topic: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Platform Siaran</label>
                      <select
                        value={newSchedule.platform}
                        onChange={(e) => setNewSchedule({ ...newSchedule, platform: e.target.value as any })}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                      >
                        <option value="YouTube & FB Live">YouTube & FB Live</option>
                        <option value="Live TikTok">Live TikTok</option>
                        <option value="RRI Kupang">RRI Kupang</option>
                        <option value="Studio BAPOLES">Studio BAPOLES</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                  >
                    Simpan Jadwal Ini
                  </button>
                </form>
              )}

              {/* Schedule List & In-Place Editing */}
              <div className="space-y-3">
                {schedules.map((s, idx) => (
                  <div
                    key={s.id}
                    className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Jadwal #{idx + 1}
                      </span>
                      <button
                        onClick={() => executeDeleteSchedule(s.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        title="Hapus jadwal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Judul Siaran</label>
                        <input
                          type="text"
                          value={s.title}
                          onChange={(e) => {
                            const updated = [...schedules];
                            updated[idx].title = e.target.value;
                            setSchedules(updated);
                          }}
                          className="w-full px-2.5 py-1 text-xs rounded border border-slate-300 font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Hari & Tanggal</label>
                        <input
                          type="text"
                          value={s.date}
                          onChange={(e) => {
                            const updated = [...schedules];
                            updated[idx].date = e.target.value;
                            setSchedules(updated);
                          }}
                          className="w-full px-2.5 py-1 text-xs rounded border border-slate-300 text-emerald-700 font-semibold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Waktu</label>
                        <input
                          type="text"
                          value={s.time}
                          onChange={(e) => {
                            const updated = [...schedules];
                            updated[idx].time = e.target.value;
                            setSchedules(updated);
                          }}
                          className="w-full px-2.5 py-1 text-xs rounded border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Narasumber</label>
                        <input
                          type="text"
                          value={s.guestName}
                          onChange={(e) => {
                            const updated = [...schedules];
                            updated[idx].guestName = e.target.value;
                            setSchedules(updated);
                          }}
                          className="w-full px-2.5 py-1 text-xs rounded border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Peran / Profesi</label>
                        <input
                          type="text"
                          value={s.guestRole}
                          onChange={(e) => {
                            const updated = [...schedules];
                            updated[idx].guestRole = e.target.value;
                            setSchedules(updated);
                          }}
                          className="w-full px-2.5 py-1 text-xs rounded border border-slate-300"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MENU 3: GALERI */}
          {/* ======================================================== */}
          {activeTab === 'gallery' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              {/* Menu Action Bar (Edit Label, Hapus Menu, Tambah Menu) */}
              <SectionActionBar
                menuKey="galeri"
                defaultLabel="Galeri"
                siteConfig={siteConfig}
                setSiteConfig={setSiteConfig}
                onOpenAddMenu={() => setShowAddMenuModal(true)}
                onShowToast={showToast}
              />

              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-slate-900 text-base">
                  Foto Dokumentasi Kegiatan ({gallery.length})
                </h4>
                <button
                  onClick={() => setShowAddGallery(!showAddGallery)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-700 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>{showAddGallery ? 'Batal' : 'Tambah Foto Baru'}</span>
                </button>
              </div>

              {/* Add Gallery Form */}
              {showAddGallery && (
                <form onSubmit={handleAddGallerySubmit} className="p-5 rounded-2xl bg-white border border-emerald-400 shadow-sm space-y-4">
                  <h5 className="text-sm font-black text-emerald-900 uppercase tracking-wider">
                    Form Tambah Foto Dokumentasi Baru
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Judul Foto Kegiatan *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Sesi Edukasi Bersama Kader Posyandu"
                        value={newGalleryItem.title}
                        onChange={(e) => setNewGalleryItem({ ...newGalleryItem, title: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Kategori</label>
                      <select
                        value={newGalleryItem.category}
                        onChange={(e) => setNewGalleryItem({ ...newGalleryItem, category: e.target.value as any })}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                      >
                        {BAPOLES_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal / Bulan Kegiatan</label>
                      <input
                        type="text"
                        placeholder="Contoh: 12 Maret 2026"
                        value={newGalleryItem.date}
                        onChange={(e) => setNewGalleryItem({ ...newGalleryItem, date: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-red-600 font-bold">
                          <Youtube className="w-3.5 h-3.5" />
                          Link Video YouTube (Opsional)
                        </span>
                      </label>
                      <input
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=... atau https://youtube.com/live/..."
                        value={newGalleryItem.youtubeUrl || ''}
                        onChange={(e) => setNewGalleryItem({ ...newGalleryItem, youtubeUrl: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 font-medium text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Unggah Foto / Gambar Kegiatan (PNG, JPG, JPEG) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Unggah Foto / Gambar Kegiatan *</span>
                      </label>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-300">
                        PNG • JPG • JPEG • WebP
                      </span>
                    </div>

                    {/* Interactive Dropzone & File Picker */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingGallery(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        setIsDraggingGallery(false);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingGallery(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleGalleryFileChange(file);
                      }}
                      className={`relative rounded-2xl border-2 transition-all p-4 text-center ${
                        isDraggingGallery
                          ? 'border-emerald-500 bg-emerald-50/90 scale-[1.01]'
                          : newGalleryItem.imageUrl
                          ? 'border-emerald-300 bg-emerald-50/20'
                          : 'border-dashed border-slate-300 hover:border-emerald-400 bg-slate-50/60 hover:bg-emerald-50/30'
                      }`}
                    >
                      {galleryUploadMeta?.isProcessing ? (
                        <div className="py-6 flex flex-col items-center justify-center gap-2">
                          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                          <p className="text-xs font-bold text-emerald-900">Sedang memproses & mengoptimalkan foto...</p>
                          <span className="text-[11px] text-slate-500">Mendukung format PNG, JPG, JPEG</span>
                        </div>
                      ) : newGalleryItem.imageUrl ? (
                        <div className="flex flex-col sm:flex-row items-center gap-4 text-left">
                          <div className="relative w-36 h-24 sm:w-44 sm:h-28 rounded-xl overflow-hidden bg-slate-900 border-2 border-emerald-500 shadow-sm shrink-0">
                            <img
                              src={newGalleryItem.imageUrl}
                              alt="Pratinjau Foto Dokumentasi"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-emerald-700 text-white text-[9px] font-black uppercase tracking-wider shadow">
                              ✓ Foto Terpilih
                            </div>
                          </div>

                          <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>Foto Siap Disimpan ke Galeri</span>
                            </div>

                            <p className="text-xs font-semibold text-slate-800 truncate">
                              {galleryUploadMeta?.name || 'File Foto Dokumentasi'}
                            </p>

                            {galleryUploadMeta?.sizeFormatted && (
                              <p className="text-[11px] text-slate-500">
                                Ukuran Optimal: <span className="font-bold text-slate-700">{galleryUploadMeta.sizeFormatted}</span>
                              </p>
                            )}

                            <div className="flex items-center gap-2 pt-1 flex-wrap">
                              <label className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-2xs">
                                <Upload className="w-3.5 h-3.5" />
                                <span>Ganti Foto (PNG/JPG)</span>
                                <input
                                  type="file"
                                  accept=".png, .jpg, .jpeg, .webp, image/png, image/jpeg, image/webp, image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleGalleryFileChange(file);
                                  }}
                                  className="hidden"
                                />
                              </label>

                              <button
                                type="button"
                                onClick={() => {
                                  setNewGalleryItem({ ...newGalleryItem, imageUrl: '' });
                                  setGalleryUploadMeta(null);
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Hapus</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="py-4 flex flex-col items-center justify-center">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 shadow-2xs">
                            <Upload className="w-6 h-6" />
                          </div>
                          <p className="text-xs font-bold text-slate-800 mb-0.5">
                            Tarik & lepas file foto ke sini, atau klik tombol di bawah
                          </p>
                          <p className="text-[11px] text-slate-500 mb-3">
                            Format yang didukung: <strong className="text-emerald-700">PNG, JPG, JPEG, WebP</strong>
                          </p>

                          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all hover:scale-105 cursor-pointer">
                            <Upload className="w-4 h-4" />
                            <span>Pilih File Foto (PNG / JPG / JPEG)</span>
                            <input
                              type="file"
                              accept=".png, .jpg, .jpeg, .webp, image/png, image/jpeg, image/webp, image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleGalleryFileChange(file);
                              }}
                              className="hidden"
                            />
                          </label>

                          <div className="mt-3 pt-3 border-t border-slate-200/80 w-full max-w-sm">
                            <span className="text-[11px] text-slate-500 font-medium block mb-1">
                              Atau masukkan tautan / URL gambar langsung:
                            </span>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="url"
                                placeholder="https://.../foto-kegiatan.jpg"
                                value={newGalleryItem.imageUrl || ''}
                                onChange={(e) => {
                                  setNewGalleryItem({ ...newGalleryItem, imageUrl: e.target.value });
                                  setGalleryUploadMeta(null);
                                  setGalleryUploadError(null);
                                }}
                                className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {galleryUploadError && (
                        <div className="mt-2.5 p-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 text-left">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{galleryUploadError}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Ringkas Kegiatan (Opsional)</label>
                    <textarea
                      rows={2}
                      placeholder="Momen kegiatan di lapangan bersama masyarakat..."
                      value={newGalleryItem.description}
                      onChange={(e) => setNewGalleryItem({ ...newGalleryItem, description: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-md flex items-center gap-2 hover:scale-[1.02] transition-transform"
                    >
                      <Check className="w-4 h-4" />
                      <span>Simpan Foto ke Galeri</span>
                    </button>
                    <span className="text-[11px] text-slate-400 italic">
                      * Foto langsung otomatis tersimpan ke website
                    </span>
                  </div>
                </form>
              )}

              {/* Gallery Cards List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {gallery.map((item, idx) => (
                  <div key={item.id} className="relative p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3 overflow-hidden">
                    {/* In-Card Delete Confirmation Overlay */}
                    {deletingGalleryId === item.id && (
                      <div className="absolute inset-0 bg-slate-900/95 text-white z-30 p-4 rounded-2xl flex flex-col items-center justify-center text-center animate-fadeIn backdrop-blur-xs">
                        <Trash2 className="w-8 h-8 text-red-400 mb-2 animate-bounce" />
                        <h4 className="text-xs font-bold text-white mb-1">Hapus Foto dari Galeri?</h4>
                        <p className="text-[11px] text-slate-300 mb-3 px-2 line-clamp-2">"{item.title}"</p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => executeDeleteGallery(item.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Ya, Hapus Sekarang</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingGalleryId(null)}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold cursor-pointer transition-colors"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#0c3832]/80 text-white backdrop-blur-xs">
                        {item.category}
                      </span>
                      
                      {/* Change photo button on card */}
                      <label 
                        className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/70 hover:bg-black/85 text-white text-[10px] font-bold backdrop-blur-xs flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                        title="Ganti foto dokumentasi ini (PNG, JPG, JPEG)"
                      >
                        <Upload className="w-3 h-3 text-emerald-400" />
                        <span>Ganti Foto</span>
                        <input
                          type="file"
                          accept=".png, .jpg, .jpeg, .webp, image/png, image/jpeg, image/webp, image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUpdateExistingGalleryImage(idx, file);
                          }}
                          className="hidden"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => setDeletingGalleryId(item.id)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-md cursor-pointer transition-transform hover:scale-110"
                        title="Hapus foto ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => handleUpdateGalleryItemField(idx, { title: e.target.value })}
                        className="w-full px-2.5 py-1 text-xs rounded border border-slate-300 font-bold"
                        placeholder="Judul Foto"
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={normalizeCategory(item.category, item.title, item.description)}
                          onChange={(e) => handleUpdateGalleryItemField(idx, { category: e.target.value as any })}
                          className="px-2 py-1 text-[11px] rounded border border-slate-300 bg-white font-semibold text-slate-700"
                        >
                          {BAPOLES_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>

                        <input
                          type="text"
                          value={item.date}
                          onChange={(e) => handleUpdateGalleryItemField(idx, { date: e.target.value })}
                          className="px-2 py-1 text-[11px] rounded border border-slate-300 text-emerald-700"
                          placeholder="Bulan/Tahun"
                        />
                      </div>

                      {/* YouTube Link Field */}
                      <div className="p-2 rounded-xl bg-red-50/70 border border-red-200/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-red-800 uppercase flex items-center gap-1">
                            <Youtube className="w-3 h-3 text-red-600 fill-red-600" />
                            Link Video YouTube:
                          </label>
                          {item.youtubeUrl && (
                            <a
                              href={item.youtubeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-bold text-red-600 hover:text-red-800 flex items-center gap-0.5 underline cursor-pointer"
                              title="Buka langsung video YouTube di tab baru"
                            >
                              <span>Tes Link</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                        <input
                          type="url"
                          value={item.youtubeUrl || ''}
                          onChange={(e) => handleUpdateGalleryItemField(idx, { youtubeUrl: e.target.value })}
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="w-full px-2 py-1 text-xs rounded border border-red-300 bg-white font-medium text-slate-800 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        />
                      </div>

                      <div>
                        <textarea
                          rows={2}
                          value={item.description || ''}
                          onChange={(e) => handleUpdateGalleryItemField(idx, { description: e.target.value })}
                          className="w-full px-2 py-1 text-[11px] rounded border border-slate-300 resize-none text-slate-600"
                          placeholder="Deskripsi ringkas kegiatan..."
                        />
                      </div>

                      {/* Explicit Delete Button at bottom */}
                      <button
                        type="button"
                        onClick={() => setDeletingGalleryId(item.id)}
                        className="w-full py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        title="Hapus foto dokumentasi ini dari galeri"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus Dokumentasi Ini</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MENU 4: TENTANG */}
          {/* ======================================================== */}
          {activeTab === 'about' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              {/* Menu Action Bar (Edit Label, Hapus Menu, Tambah Menu) */}
              <SectionActionBar
                menuKey="tentang"
                defaultLabel="Tentang"
                siteConfig={siteConfig}
                setSiteConfig={setSiteConfig}
                onOpenAddMenu={() => setShowAddMenuModal(true)}
                onShowToast={showToast}
              />

              {/* Main Titles */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider text-emerald-800 flex items-center gap-2">
                  <Info className="w-4 h-4 text-emerald-600" />
                  <span>Judul & Narasi Bagian Tentang BAPOLES</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Badge Atas</label>
                    <input
                      type="text"
                      value={aboutData.badge}
                      onChange={(e) => updateAboutData({ badge: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Judul Utama Tentang</label>
                    <input
                      type="text"
                      value={aboutData.title}
                      onChange={(e) => updateAboutData({ title: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Subjudul / Deskripsi Pembuka</label>
                  <textarea
                    rows={2}
                    value={aboutData.subtitle}
                    onChange={(e) => updateAboutData({ subtitle: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 resize-none"
                  />
                </div>
              </div>

              {/* Philosophy */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider text-emerald-800">
                  Filosofi Nama "Ba' Omong"
                </h4>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Judul Filosofi</label>
                  <input
                    type="text"
                    value={aboutData.philosophyTitle}
                    onChange={(e) => updateAboutData({ philosophyTitle: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Paragraf 1 (Makna Ba' Omong)</label>
                  <textarea
                    rows={2}
                    value={aboutData.philosophyP1}
                    onChange={(e) => updateAboutData({ philosophyP1: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Paragraf 2 (Misi Dinas Kesehatan)</label>
                  <textarea
                    rows={2}
                    value={aboutData.philosophyP2}
                    onChange={(e) => updateAboutData({ philosophyP2: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 resize-none"
                  />
                </div>

              </div>

              {/* Dynamic Makna Unsur Logo & Pilar Pelayanan (Full CRUD: Tambah, Edit, Hapus) */}
              <AboutSymbolsAndPillarsEditor
                siteConfig={siteConfig}
                setSiteConfig={setSiteConfig}
                onShowToast={showToast}
              />
            </div>
          )}

          {/* ======================================================== */}
          {/* MENU 5: TIM KAMI */}
          {/* ======================================================== */}
          {activeTab === 'team' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              {/* Menu Action Bar (Edit Label, Hapus Menu, Tambah Menu) */}
              <SectionActionBar
                menuKey="tim"
                defaultLabel="Tim Kami"
                siteConfig={siteConfig}
                setSiteConfig={setSiteConfig}
                onOpenAddMenu={() => setShowAddMenuModal(true)}
                onShowToast={showToast}
              />

              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-slate-900 text-base">
                  Anggota Tim Pengelola & Narasumber ({team.length})
                </h4>
                <button
                  onClick={() => setShowAddTeam(!showAddTeam)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-700 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>{showAddTeam ? 'Batal' : 'Tambah Anggota Tim'}</span>
                </button>
              </div>

              {/* Add Team Form */}
              {showAddTeam && (
                <form onSubmit={handleAddTeamSubmit} className="p-5 rounded-2xl bg-white border border-emerald-400 shadow-sm space-y-4">
                  <h5 className="text-sm font-black text-emerald-900 uppercase tracking-wider">
                    Form Tambah Anggota Tim Baru
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap & Gelar *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: drg. Elisabeth, M.Kes"
                        value={newTeamMember.name}
                        onChange={(e) => setNewTeamMember({ ...newTeamMember, name: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Jabatan / Peran di Podcast *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Host & Dokter Narasumber"
                        value={newTeamMember.role}
                        onChange={(e) => setNewTeamMember({ ...newTeamMember, role: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Instansi / Divisi</label>
                      <input
                        type="text"
                        value={newTeamMember.institution}
                        onChange={(e) => setNewTeamMember({ ...newTeamMember, institution: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Foto Anggota</label>
                      <div className="flex items-center gap-2">
                        <label className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Pilih Foto</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (evt) => {
                                  const res = evt.target?.result as string;
                                  if (res) {
                                    setNewTeamMember({ ...newTeamMember, photoUrl: res });
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                        <span className="text-[11px] text-slate-500 truncate max-w-xs">
                          {newTeamMember.photoUrl?.startsWith('data:') ? '✓ Foto dipilih' : newTeamMember.photoUrl}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Biodata Singkat</label>
                    <textarea
                      rows={2}
                      placeholder="Dedikasi dan keahlian di bidang promosi kesehatan..."
                      value={newTeamMember.bio}
                      onChange={(e) => setNewTeamMember({ ...newTeamMember, bio: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                  >
                    Simpan Anggota Tim
                  </button>
                </form>
              )}

              {/* Team List & In-Place Editing */}
              <div className="space-y-3">
                {team.map((member, idx) => (
                  <div key={member.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <img
                      src={member.photoUrl}
                      alt={member.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500/40 flex-shrink-0"
                    />
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Nama Anggota</label>
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => {
                            const updated = [...team];
                            updated[idx].name = e.target.value;
                            setTeam(updated);
                          }}
                          className="w-full px-2.5 py-1 text-xs rounded border border-slate-300 font-bold"
                          placeholder="Nama Anggota"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Jabatan / Peran</label>
                        <input
                          type="text"
                          value={member.role}
                          onChange={(e) => {
                            const updated = [...team];
                            updated[idx].role = e.target.value;
                            setTeam(updated);
                          }}
                          className="w-full px-2.5 py-1 text-xs rounded border border-slate-300 text-emerald-800 font-semibold"
                          placeholder="Jabatan"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Instansi / Divisi</label>
                        <input
                          type="text"
                          value={member.institution}
                          onChange={(e) => {
                            const updated = [...team];
                            updated[idx].institution = e.target.value;
                            setTeam(updated);
                          }}
                          className="w-full px-2.5 py-1 text-xs rounded border border-slate-300 text-slate-600"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => executeDeleteTeam(member.id)}
                      className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                      title="Hapus anggota ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MENU 6: KONTAK & LAYANAN */}
          {/* ======================================================== */}
          {activeTab === 'contact' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              {/* Menu Action Bar (Edit Label, Hapus Menu, Tambah Menu) */}
              <SectionActionBar
                menuKey="kontak"
                defaultLabel="Kontak"
                siteConfig={siteConfig}
                setSiteConfig={setSiteConfig}
                onOpenAddMenu={() => setShowAddMenuModal(true)}
                onShowToast={showToast}
              />

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider text-emerald-800 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>Saluran WhatsApp Center & Media Sosial</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Nomor WhatsApp Resmi
                    </label>
                    <input
                      type="text"
                      value={siteConfig.whatsappNumber}
                      onChange={(e) => setSiteConfig({ ...siteConfig, whatsappNumber: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 text-xs sm:text-sm font-mono font-bold"
                      placeholder="085182697288"
                    />
                    <span className="text-[11px] text-slate-500">Nomor ini terhubung ke tombol WA mengambang dan header</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Pesan Otomatis WhatsApp (Template)
                    </label>
                    <input
                      type="text"
                      value={siteConfig.whatsappMessage}
                      onChange={(e) => setSiteConfig({ ...siteConfig, whatsappMessage: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Akun Media Sosial Resmi (@)
                    </label>
                    <input
                      type="text"
                      value={siteConfig.instagramHandle}
                      onChange={(e) => {
                        const val = e.target.value.replace(/^@/, '');
                        setSiteConfig({
                          ...siteConfig,
                          instagramHandle: val,
                          facebookHandle: val,
                          tiktokHandle: val,
                          youtubeHandle: val,
                        });
                      }}
                      className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 text-xs sm:text-sm font-mono"
                      placeholder="dinkesntt"
                    />
                    <span className="text-[11px] text-slate-500">Instagram, Facebook, TikTok, & YouTube (@dinkesntt)</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Email Resmi
                    </label>
                    <input
                      type="email"
                      value={siteConfig.email}
                      onChange={(e) => setSiteConfig({ ...siteConfig, email: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 text-xs sm:text-sm"
                      placeholder="promkes@dinkes.nttprov.go.id"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Alamat Kantor Dinas Kesehatan Provinsi NTT
                  </label>
                  <input
                    type="text"
                    value={siteConfig.address}
                    onChange={(e) => setSiteConfig({ ...siteConfig, address: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Dynamic Contact Channels (Full CRUD: Tambah, Edit, Hapus) */}
              <ContactChannelsEditor
                siteConfig={siteConfig}
                setSiteConfig={setSiteConfig}
                onShowToast={showToast}
              />
            </div>
          )}

          {/* ======================================================== */}
          {/* SPECIAL TAB: KELOLA SEMUA MENU NAVIGASI WEBSITE */}
          {/* ======================================================== */}
          {activeTab === 'nav' && (
            <NavMenuManager
              siteConfig={siteConfig}
              setSiteConfig={setSiteConfig}
              onOpenAddMenu={() => setShowAddMenuModal(true)}
              onShowToast={showToast}
            />
          )}

          {/* ======================================================== */}
          {/* TAB: EPISODES */}
          {/* ======================================================== */}
          {activeTab === 'episodes' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-slate-900 text-base">
                  Daftar Episode Podcast ({episodes.length})
                </h4>
                <button
                  onClick={() => setShowAddEpisode(!showAddEpisode)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-700 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>{showAddEpisode ? 'Batal' : 'Tambah Episode Baru'}</span>
                </button>
              </div>

              {/* Add Episode Form Drawer */}
              {showAddEpisode && (
                <form onSubmit={handleAddEpisodeSubmit} className="p-5 rounded-2xl bg-white border border-emerald-400 shadow-sm space-y-4">
                  <h5 className="text-sm font-black text-emerald-900 uppercase tracking-wider">
                    Form Episode Baru
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Judul Episode *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Pentingnya ASI Eksklusif 6 Bulan"
                        value={newEpisode.title}
                        onChange={(e) => setNewEpisode({ ...newEpisode, title: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Kategori</label>
                      <select
                        value={newEpisode.category}
                        onChange={(e) => setNewEpisode({ ...newEpisode, category: e.target.value as any })}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                      >
                        {BAPOLES_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Nama Narasumber *</label>
                      <input
                        type="text"
                        required
                        placeholder="dr. Maria L. Sp.A"
                        value={newEpisode.speakerName}
                        onChange={(e) => setNewEpisode({ ...newEpisode, speakerName: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Profesi / Jabatan</label>
                      <input
                        type="text"
                        placeholder="Dokter Spesialis Anak RSUD Prof. W.Z. Johannes"
                        value={newEpisode.speakerRole}
                        onChange={(e) => setNewEpisode({ ...newEpisode, speakerRole: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Durasi</label>
                      <input
                        type="text"
                        placeholder="42 Menit"
                        value={newEpisode.duration}
                        onChange={(e) => setNewEpisode({ ...newEpisode, duration: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Ringkasan Materi Episode</label>
                    <textarea
                      rows={2}
                      placeholder="Penjelasan singkat apa yang dibahas pada episode ini..."
                      value={newEpisode.description}
                      onChange={(e) => setNewEpisode({ ...newEpisode, description: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                  >
                    Simpan Episode Ini
                  </button>
                </form>
              )}

              {/* Episode list */}
              <div className="space-y-3">
                {episodes.map((ep) => (
                  <div
                    key={ep.id}
                    className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-4 shadow-2xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900">
                          EPS #{ep.episodeNumber}
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-700">
                          {normalizeCategory(ep.category, ep.title, ep.description)}
                        </span>
                        {ep.galleryId && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">
                            Sinkron Galeri
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">• {ep.date}</span>
                      </div>
                      <h5 className="text-sm font-bold text-slate-900 truncate mt-0.5">{ep.title}</h5>
                      <p className="text-xs text-slate-500 truncate">Narasumber: {ep.speakerName}</p>
                    </div>

                    <button
                      onClick={() => executeDeleteEpisode(ep.id)}
                      className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                      title="Hapus episode"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJSON}
              className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Unduh cadangan data ke format JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor JSON</span>
            </button>

            <label className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Impor JSON</span>
              <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            </label>

            <button
              onClick={onResetToDefault}
              className="px-3 py-1.5 rounded-lg text-slate-500 hover:text-red-600 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              title="Kembalikan ke data bawaan semula"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Bawaan</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {savedAlert && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-pulse">
                <Check className="w-4 h-4" />
                <span>Tersimpan di Browser!</span>
              </span>
            )}

            <button
              id="btn-save-edit-mode"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </div>

        {/* Modal Tambah Menu Baru */}
        <AddMenuModal
          isOpen={showAddMenuModal}
          onClose={() => setShowAddMenuModal(false)}
          siteConfig={siteConfig}
          setSiteConfig={setSiteConfig}
          onSuccess={(label) => showToast(`Menu "${label}" berhasil ditambahkan!`)}
        />
      </div>
    </div>
  );
};
