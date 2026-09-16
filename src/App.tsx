import React, { useState, useEffect } from 'react';
import { 
  DEFAULT_SITE_CONFIG, 
  DEFAULT_EPISODES, 
  DEFAULT_SCHEDULES, 
  DEFAULT_GALLERY, 
  DEFAULT_TEAM 
} from './data/defaultData';
import { 
  SiteConfig, 
  PodcastEpisode, 
  PodcastSchedule, 
  GalleryItem, 
  TeamMember, 
  UserQuestionSubmission 
} from './types';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { EpisodesSection } from './components/EpisodesSection';
import { ScheduleSection } from './components/ScheduleSection';
import { GallerySection } from './components/GallerySection';
import { AboutSection } from './components/AboutSection';
import { TeamSection } from './components/TeamSection';
import { ContactSection } from './components/ContactSection';
import { PodcastPlayer } from './components/PodcastPlayer';
import { LiveEditorModal } from './components/LiveEditorModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { Edit3, MessageCircle, ArrowUp } from 'lucide-react';
import { normalizeCategory, syncEpisodesWithGallery } from './utils/categoryUtils';
import { 
  getAdminSession, 
  clearAdminSession, 
  AdminSession 
} from './utils/authStorage';
import { 
  saveGalleryToIndexedDB, 
  loadGalleryFromIndexedDB,
  saveEpisodesToIndexedDB,
  loadEpisodesFromIndexedDB,
  safeSetLocalStorage
} from './utils/galleryStorage';

const STORAGE_KEY_CONFIG = 'bapoles_site_config_v1';
const STORAGE_KEY_EPISODES = 'bapoles_episodes_v1';
const STORAGE_KEY_SCHEDULES = 'bapoles_schedules_v1';
const STORAGE_KEY_GALLERY = 'bapoles_gallery_v1';
const STORAGE_KEY_TEAM = 'bapoles_team_v1';
const STORAGE_KEY_QUESTIONS = 'bapoles_user_questions_v1';

// IDs and keywords of default episodes 7-12 to remove
const DUMMY_EPISODE_IDS = new Set(['eps-01', 'eps-02', 'eps-03', 'eps-04', 'eps-05', 'eps-06']);
const DUMMY_GALLERY_IDS = new Set(['gal-01', 'gal-02', 'gal-03', 'gal-04', 'gal-05']);

function isDefaultDummyEpisode(ep: PodcastEpisode): boolean {
  if (DUMMY_EPISODE_IDS.has(ep.id)) return true;
  const t = (ep.title || '').toLowerCase();
  return (
    t.includes('stunting di ntt') ||
    t.includes('cegah demam berdarah') ||
    t.includes('germas asyik') ||
    t.includes('kesehatan ibu & bayi') ||
    t.includes('kesehatan jiwa') ||
    t.includes('pola makan sehat berbasis kearifan')
  );
}

function isDefaultDummyGallery(item: GalleryItem): boolean {
  if (DUMMY_GALLERY_IDS.has(item.id)) return true;
  const t = (item.title || '').toLowerCase();
  return (
    (t.includes('stunting') && t.includes('podcast')) ||
    t.includes('sosialisasi germas') ||
    t.includes('kain tenun ikat khas ntt sebagai simbol') ||
    t.includes('behind the scenes produksi tim') ||
    t.includes('kunjungan lapangan & edukasi gizi')
  );
}

export default function App() {
  // State with LocalStorage initializers
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SITE_CONFIG,
          ...parsed,
          navMenus: parsed.navMenus && parsed.navMenus.length > 0 ? parsed.navMenus : DEFAULT_SITE_CONFIG.navMenus,
          homePillarsList: parsed.homePillarsList && parsed.homePillarsList.length > 0 ? parsed.homePillarsList : DEFAULT_SITE_CONFIG.homePillarsList,
          aboutPillarsList: parsed.aboutPillarsList && parsed.aboutPillarsList.length > 0 ? parsed.aboutPillarsList : DEFAULT_SITE_CONFIG.aboutPillarsList,
          aboutLogoSymbolsList: parsed.aboutLogoSymbolsList && parsed.aboutLogoSymbolsList.length > 0 ? parsed.aboutLogoSymbolsList : DEFAULT_SITE_CONFIG.aboutLogoSymbolsList,
          contactChannelsList: parsed.contactChannelsList && parsed.contactChannelsList.length > 0 ? parsed.contactChannelsList : DEFAULT_SITE_CONFIG.contactChannelsList,
        };
      }
      return DEFAULT_SITE_CONFIG;
    } catch {
      return DEFAULT_SITE_CONFIG;
    }
  });

  const [episodes, setEpisodes] = useState<PodcastEpisode[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EPISODES) || localStorage.getItem('bapoles_episodes_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = parsed
            .filter((ep: PodcastEpisode) => !isDefaultDummyEpisode(ep))
            .map((ep: PodcastEpisode, idx: number) => ({
              ...ep,
              episodeNumber: idx + 1,
              category: normalizeCategory(ep.category, ep.title, ep.description),
            }));
          safeSetLocalStorage(STORAGE_KEY_EPISODES, cleaned);
          safeSetLocalStorage('bapoles_episodes_data', cleaned);
          return cleaned.length > 0 ? cleaned : DEFAULT_EPISODES;
        }
      }
      return DEFAULT_EPISODES;
    } catch {
      return DEFAULT_EPISODES;
    }
  });

  const [schedules, setSchedules] = useState<PodcastSchedule[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SCHEDULES);
      return saved ? JSON.parse(saved) : DEFAULT_SCHEDULES;
    } catch {
      return DEFAULT_SCHEDULES;
    }
  });

  const [gallery, setGallery] = useState<GalleryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_GALLERY) || localStorage.getItem('bapoles_gallery_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = parsed
            .filter((item: GalleryItem) => !isDefaultDummyGallery(item))
            .map((item: GalleryItem) => {
              let youtubeUrl = item.youtubeUrl;
              if (!youtubeUrl) {
                const def = DEFAULT_GALLERY.find((d) => d.id === item.id);
                if (def?.youtubeUrl) {
                  youtubeUrl = def.youtubeUrl;
                }
              }
              return {
                ...item,
                category: normalizeCategory(item.category, item.title, item.description),
                youtubeUrl,
              };
            });
          safeSetLocalStorage(STORAGE_KEY_GALLERY, cleaned);
          safeSetLocalStorage('bapoles_gallery_data', cleaned);
          return cleaned.length > 0 ? cleaned : DEFAULT_GALLERY;
        }
      }
      return DEFAULT_GALLERY;
    } catch {
      return DEFAULT_GALLERY;
    }
  });

  const [team, setTeam] = useState<TeamMember[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TEAM);
      return saved ? JSON.parse(saved) : DEFAULT_TEAM;
    } catch {
      return DEFAULT_TEAM;
    }
  });

  const [userQuestions, setUserQuestions] = useState<UserQuestionSubmission[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_QUESTIONS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // App Navigation & Player State
  const [activeSection, setActiveSection] = useState('beranda');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentEpisode, setCurrentEpisode] = useState<PodcastEpisode | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editModalTab, setEditModalTab] = useState('beranda');
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Admin Authentication State
  const [adminSession, setAdminSession] = useState<AdminSession | null>(() => getAdminSession());
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const isAdmin = Boolean(adminSession && adminSession.isLoggedIn);

  const handleOpenAdminLogin = () => {
    setIsAdminLoginModalOpen(true);
  };

  const handleLoginSuccess = (session: AdminSession) => {
    setAdminSession(session);
    setIsAdminLoginModalOpen(false);
  };

  const handleLogout = () => {
    if (confirm('Apakah Anda yakin ingin keluar dari sesi Admin?')) {
      clearAdminSession();
      setAdminSession(null);
      setIsEditModalOpen(false);
    }
  };

  const handleOpenEditModal = (tab: string = 'beranda') => {
    if (!isAdmin) {
      setIsAdminLoginModalOpen(true);
      return;
    }
    setEditModalTab(tab);
    setIsEditModalOpen(true);
  };

  // Monitor scroll for back to top button & active navigation section
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);

      const sections = ['beranda', 'episodes-list', 'jadwal', 'galeri', 'tentang', 'tim', 'kontak'];
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 200) {
            setActiveSection(sectionId === 'episodes-list' ? 'beranda' : sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Automatically keep episodes in sync with gallery updates
  useEffect(() => {
    setEpisodes((prevEpisodes) => {
      const synced = syncEpisodesWithGallery(prevEpisodes, gallery);
      const isDifferent =
        synced.length !== prevEpisodes.length ||
        synced.some((ep, i) => {
          const prev = prevEpisodes[i];
          return (
            !prev ||
            prev.id !== ep.id ||
            prev.title !== ep.title ||
            prev.category !== ep.category ||
            prev.coverImage !== ep.coverImage ||
            prev.youtubeUrl !== ep.youtubeUrl
          );
        });

      if (isDifferent) {
        safeSetLocalStorage(STORAGE_KEY_EPISODES, synced);
        safeSetLocalStorage('bapoles_episodes_data', synced);
        saveEpisodesToIndexedDB(synced);
        return synced;
      }
      return prevEpisodes;
    });
  }, [gallery]);

  // Load unlimited gallery & episodes from IndexedDB on initial mount
  useEffect(() => {
    loadGalleryFromIndexedDB().then((items) => {
      if (items && items.length > 0) {
        const cleaned = items.filter((it) => !isDefaultDummyGallery(it));
        if (cleaned.length > 0) {
          setGallery((prev) => {
            const map = new Map<string, GalleryItem>();
            cleaned.forEach((it) => map.set(it.id, it));
            prev.forEach((it) => {
              if (!isDefaultDummyGallery(it) && !map.has(it.id)) {
                map.set(it.id, it);
              }
            });
            return Array.from(map.values());
          });
        }
      }
    });

    loadEpisodesFromIndexedDB().then((items) => {
      if (items && items.length > 0) {
        const cleaned = items.filter((it) => !isDefaultDummyEpisode(it));
        if (cleaned.length > 0) {
          setEpisodes((prev) => {
            const map = new Map<string, PodcastEpisode>();
            cleaned.forEach((it) => map.set(it.id, it));
            prev.forEach((it) => {
              if (!isDefaultDummyEpisode(it) && !map.has(it.id)) {
                map.set(it.id, it);
              }
            });
            return Array.from(map.values());
          });
        }
      }
    });
  }, []);

  // Save to IndexedDB whenever gallery or episodes state changes (unlimited storage)
  useEffect(() => {
    saveGalleryToIndexedDB(gallery);
  }, [gallery]);

  useEffect(() => {
    saveEpisodesToIndexedDB(episodes);
  }, [episodes]);

  // Batch add photos or links to gallery (unlimited)
  const handleBatchAddGallery = (newItems: GalleryItem[]) => {
    const updated = [...newItems, ...gallery];
    setGallery(updated);
    saveGalleryToIndexedDB(updated);
    const syncedEpisodes = syncEpisodesWithGallery(episodes, updated);
    setEpisodes(syncedEpisodes);
    saveEpisodesToIndexedDB(syncedEpisodes);
    safeSetLocalStorage(STORAGE_KEY_GALLERY, updated);
    safeSetLocalStorage('bapoles_gallery_data', updated);
    safeSetLocalStorage(STORAGE_KEY_EPISODES, syncedEpisodes);
    safeSetLocalStorage('bapoles_episodes_data', syncedEpisodes);
  };

  // Delete gallery item directly
  const handleDeleteGallery = (id: string) => {
    const updated = gallery.filter((item) => item.id !== id);
    setGallery(updated);
    saveGalleryToIndexedDB(updated);
    const syncedEpisodes = syncEpisodesWithGallery(episodes, updated);
    setEpisodes(syncedEpisodes);
    saveEpisodesToIndexedDB(syncedEpisodes);
    safeSetLocalStorage(STORAGE_KEY_GALLERY, updated);
    safeSetLocalStorage('bapoles_gallery_data', updated);
    safeSetLocalStorage(STORAGE_KEY_EPISODES, syncedEpisodes);
    safeSetLocalStorage('bapoles_episodes_data', syncedEpisodes);
  };

  // Save changes to localStorage
  const handleSaveToLocalStorage = () => {
    try {
      safeSetLocalStorage(STORAGE_KEY_CONFIG, siteConfig);
      safeSetLocalStorage(STORAGE_KEY_EPISODES, episodes);
      safeSetLocalStorage(STORAGE_KEY_SCHEDULES, schedules);
      safeSetLocalStorage(STORAGE_KEY_GALLERY, gallery);
      safeSetLocalStorage(STORAGE_KEY_TEAM, team);
      // Backup keys
      safeSetLocalStorage('bapoles_gallery_data', gallery);
      safeSetLocalStorage('bapoles_episodes_data', episodes);
      saveEpisodesToIndexedDB(episodes);
      saveGalleryToIndexedDB(gallery);
    } catch (err) {
      console.error('Gagal menyimpan ke storage:', err);
    }
  };

  // Reset to default
  const handleResetToDefault = () => {
    if (confirm('Apakah Anda yakin ingin mengembalikan semua data podcast ke pengaturan awal?')) {
      setSiteConfig(DEFAULT_SITE_CONFIG);
      setEpisodes(DEFAULT_EPISODES);
      setSchedules(DEFAULT_SCHEDULES);
      setGallery(DEFAULT_GALLERY);
      setTeam(DEFAULT_TEAM);
      localStorage.removeItem(STORAGE_KEY_CONFIG);
      localStorage.removeItem(STORAGE_KEY_EPISODES);
      localStorage.removeItem(STORAGE_KEY_SCHEDULES);
      localStorage.removeItem(STORAGE_KEY_GALLERY);
      localStorage.removeItem(STORAGE_KEY_TEAM);
      setIsEditModalOpen(false);
    }
  };

  // Handle Question Submission
  const handleSubmitQuestion = (data: Omit<UserQuestionSubmission, 'id' | 'submittedAt'>) => {
    const newSubmission: UserQuestionSubmission = {
      ...data,
      id: `q-${Date.now()}`,
      submittedAt: new Date().toLocaleString('id-ID'),
    };
    const updated = [newSubmission, ...userQuestions];
    setUserQuestions(updated);
    safeSetLocalStorage(STORAGE_KEY_QUESTIONS, updated);
  };

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cleanWa = siteConfig.whatsappNumber.replace(/^0/, '');
  const quickWaUrl = `https://wa.me/62${cleanWa}?text=${encodeURIComponent(siteConfig.whatsappMessage)}`;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#eaf6f0] via-[#f3faf6] to-[#e6f5ec] text-slate-800 selection:bg-emerald-600 selection:text-white relative">
      
      {/* Admin Top Notification Bar (Hanya Muncul Saat Admin Login) */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-[#0c3832] via-[#0f2b48] to-[#0c3832] text-white text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-2 shadow-md relative z-40 border-b border-emerald-500/30">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold">Mode Pengelola / Admin Aktif:</span>
            <span className="font-mono text-emerald-300 font-semibold">{adminSession?.userEmail}</span>
            <span className="hidden sm:inline text-slate-400 text-[11px]">(Tombol edit telah disembunyikan untuk pengunjung umum)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenEditModal('beranda')}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors cursor-pointer"
            >
              Buka Panel Editor
            </button>
            <button
              onClick={() => handleOpenEditModal('security')}
              className="px-2.5 py-1 rounded-lg bg-teal-800 hover:bg-teal-700 text-white font-bold text-[11px] transition-colors cursor-pointer"
            >
              🛡️ Keamanan Akun
            </button>
            <button
              onClick={handleLogout}
              className="text-red-300 hover:text-red-100 font-bold text-[11px] underline cursor-pointer ml-1"
            >
              Keluar
            </button>
          </div>
        </div>
      )}

      {/* 1. Header & Navigation (Pojok Kanan Atas) */}
      <Navbar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenEditModal={(tab) => handleOpenEditModal(tab || 'beranda')}
        siteConfig={siteConfig}
        isAdmin={isAdmin}
        adminUserEmail={adminSession?.userEmail}
        onLogout={handleLogout}
      />

      {/* 2. Hero Section (Latar Belakang Tenun NTT + Logo BAPOLES Asli Tanpa Editan) */}
      <main className="flex-grow">
        <HeroSection
          siteConfig={siteConfig}
          latestEpisode={episodes[0]}
          onPlayEpisode={(ep) => setCurrentEpisode(ep)}
          onNavigate={handleNavigate}
          onOpenEditModal={isAdmin ? (tab) => handleOpenEditModal(tab || 'beranda') : undefined}
          onUpdateBanner={isAdmin ? (newUrl) => {
            const updated = { ...siteConfig, bannerImageUrl: newUrl };
            setSiteConfig(updated);
            safeSetLocalStorage(STORAGE_KEY_CONFIG, updated);
          } : undefined}
          onUpdateOverlayOpacity={isAdmin ? (opacity) => {
            const updated = { ...siteConfig, bannerOverlayOpacity: opacity };
            setSiteConfig(updated);
            safeSetLocalStorage(STORAGE_KEY_CONFIG, updated);
          } : undefined}
        />

        {/* 3. Katalog Episode Podcast */}
        <EpisodesSection
          episodes={episodes}
          searchQuery={searchQuery}
          onPlayEpisode={(ep) => setCurrentEpisode(ep)}
          currentEpisodeId={currentEpisode?.id}
        />

        {/* 4. Jadwal Podcast Live */}
        <ScheduleSection 
          schedules={schedules} 
          onOpenEditModal={isAdmin ? (tab) => handleOpenEditModal(tab || 'schedules') : undefined} 
        />

        {/* 5. Galeri Dokumentasi */}
        <GallerySection 
          gallery={gallery} 
          isAdmin={isAdmin}
          onOpenEditModal={isAdmin ? (tab) => handleOpenEditModal(tab || 'gallery') : undefined} 
          onDeleteGallery={isAdmin ? handleDeleteGallery : undefined}
          onBatchAddGallery={isAdmin ? handleBatchAddGallery : undefined}
        />

        {/* 6. Tentang BAPOLES & Makna Logo */}
        <AboutSection 
          siteConfig={siteConfig} 
          onOpenEditModal={isAdmin ? (tab) => handleOpenEditModal(tab || 'about') : undefined} 
        />

        {/* 7. Tim Kami */}
        <TeamSection 
          team={team} 
          onOpenEditModal={isAdmin ? (tab) => handleOpenEditModal(tab || 'team') : undefined} 
        />

        {/* 8. Footer & Kontak WhatsApp + Medsos (@dinkesntt) */}
        <ContactSection
          siteConfig={siteConfig}
          onSubmitQuestion={handleSubmitQuestion}
          onOpenEditModal={isAdmin ? (tab) => handleOpenEditModal(tab || 'contact') : undefined}
          onOpenAdminLogin={handleOpenAdminLogin}
          isAdmin={isAdmin}
          onLogout={handleLogout}
          adminUserEmail={adminSession?.userEmail}
        />
      </main>

      {/* Floating Audio Player */}
      <PodcastPlayer
        currentEpisode={currentEpisode}
        onClose={() => setCurrentEpisode(null)}
      />

      {/* In-Browser Live Content Editor Modal (Mudah di-edit & gratis) */}
      <LiveEditorModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        siteConfig={siteConfig}
        setSiteConfig={setSiteConfig}
        episodes={episodes}
        setEpisodes={setEpisodes}
        schedules={schedules}
        setSchedules={setSchedules}
        gallery={gallery}
        setGallery={setGallery}
        team={team}
        setTeam={setTeam}
        onSaveToLocalStorage={handleSaveToLocalStorage}
        onResetToDefault={handleResetToDefault}
        initialTab={editModalTab}
        currentSession={adminSession}
        onLogout={handleLogout}
      />

      {/* Admin Login Modal (Khusus Admin Dinkes NTT) */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Floating Action Buttons (Right-Bottom Corner) */}
      <aside aria-label="Aksi Cepat" className="fixed bottom-24 sm:bottom-8 right-4 sm:right-6 z-40 flex flex-col items-center gap-3">
        {/* Quick WhatsApp Floating Button */}
        <a
          href={quickWaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-all cursor-pointer group"
          title={`WhatsApp BAPOLES (${siteConfig.whatsappNumber})`}
        >
          <svg className="w-6 h-6 sm:w-7 sm:h-7 fill-white" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
        </a>

        {/* Quick Edit Website Floating Pill (Hanya Jika Admin Login) */}
        {isAdmin && (
          <button
            onClick={() => handleOpenEditModal('beranda')}
            className="px-3.5 py-2 rounded-full bg-[#0f2b48] hover:bg-teal-700 text-teal-300 hover:text-white border border-teal-400/40 text-xs font-bold flex items-center gap-1.5 shadow-xl transition-all cursor-pointer"
            title="Buka Mode Edit Konten"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Edit Website</span>
          </button>
        )}

        {/* Back to top */}
        {showBackToTop && (
          <button
            onClick={scrollToTop}
            className="w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-900 text-white flex items-center justify-center shadow-md transition-all cursor-pointer"
            title="Kembali ke atas"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        )}
      </aside>

    </div>
  );
}
