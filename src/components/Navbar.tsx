import React, { useState } from 'react';
import { 
  Search, 
  Menu, 
  X, 
  Edit3, 
  Radio, 
  Calendar, 
  Image as ImageIcon, 
  Info, 
  Users, 
  Phone, 
  ExternalLink,
  FileText,
  Sparkles,
  Heart,
  Activity,
  Globe,
  Award,
  HelpCircle,
  Folder,
  Plus
} from 'lucide-react';
import { BapolesLogo } from './BapolesLogo';
import { SiteConfig, NavMenuItem } from '../types';

interface NavbarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenEditModal: (tab?: string) => void;
  siteConfig: SiteConfig;
  onCustomMenuClick?: (menu: NavMenuItem) => void;
}

const getMenuIcon = (iconName?: string) => {
  switch (iconName) {
    case 'Radio': return Radio;
    case 'Calendar': return Calendar;
    case 'ImageIcon': return ImageIcon;
    case 'Info': return Info;
    case 'Users': return Users;
    case 'Phone': return Phone;
    case 'FileText': return FileText;
    case 'Sparkles': return Sparkles;
    case 'Heart': return Heart;
    case 'Activity': return Activity;
    case 'Globe': return Globe;
    case 'Award': return Award;
    case 'HelpCircle': return HelpCircle;
    case 'Folder': return Folder;
    default: return Radio;
  }
};

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  setActiveSection,
  searchQuery,
  setSearchQuery,
  onOpenEditModal,
  siteConfig,
  onCustomMenuClick,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Dynamic Navigation Items from siteConfig.navMenus
  const navItems: NavMenuItem[] = (
    siteConfig.navMenus && siteConfig.navMenus.length > 0
      ? siteConfig.navMenus
      : [
          { id: 'beranda', label: siteConfig.menuLabels?.beranda || 'Beranda', iconName: 'Radio', targetType: 'section', targetValue: 'beranda', isVisible: true, order: 1 },
          { id: 'jadwal', label: siteConfig.menuLabels?.jadwal || 'Jadwal Podcast', iconName: 'Calendar', targetType: 'section', targetValue: 'jadwal', isVisible: true, order: 2 },
          { id: 'galeri', label: siteConfig.menuLabels?.galeri || 'Galeri', iconName: 'ImageIcon', targetType: 'section', targetValue: 'galeri', isVisible: true, order: 3 },
          { id: 'tentang', label: siteConfig.menuLabels?.tentang || 'Tentang', iconName: 'Info', targetType: 'section', targetValue: 'tentang', isVisible: true, order: 4 },
          { id: 'tim', label: siteConfig.menuLabels?.tim || 'Tim Kami', iconName: 'Users', targetType: 'section', targetValue: 'tim', isVisible: true, order: 5 },
          { id: 'kontak', label: siteConfig.menuLabels?.kontak || 'Kontak', iconName: 'Phone', targetType: 'section', targetValue: 'kontak', isVisible: true, order: 6 },
        ]
  ).filter((item) => item.isVisible !== false);

  const handleNavClick = (item: NavMenuItem) => {
    setMobileMenuOpen(false);
    if (item.targetType === 'external' && item.targetValue) {
      window.open(item.targetValue, '_blank');
      return;
    }
    if (item.targetType === 'modal' && onCustomMenuClick) {
      onCustomMenuClick(item);
      return;
    }
    const sectionTarget = item.targetValue || item.id;
    setActiveSection(sectionTarget);
    const element = document.getElementById(sectionTarget);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-emerald-200/70 text-slate-800 shadow-xs transition-all">
      {/* Top Banner Ticker */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-[#0c3832] text-white text-xs px-4 py-1.5 flex flex-wrap justify-between items-center gap-2 font-medium">
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <span className="font-bold text-emerald-300">Siaran Rutin:</span>
          <span>{siteConfig.homeData?.tickerText || 'Setiap Kamis Pukul 15.00 WITA | Live YouTube & FB @dinkesntt'}</span>
        </div>

        <div className="flex items-center gap-3 ml-auto text-[11px]">
          <a 
            href={`https://wa.me/62${siteConfig.whatsappNumber.replace(/^0/, '')}?text=${encodeURIComponent(siteConfig.whatsappMessage)}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-emerald-300 transition-colors"
          >
            <span>WA Center:</span>
            <span className="font-bold tracking-wider underline">{siteConfig.whatsappNumber}</span>
          </a>
          <span className="text-teal-400/50">|</span>
          <span className="text-teal-200 hidden sm:inline">Dinas Kesehatan Prov. NTT</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Logo (Left) */}
        <div 
          onClick={() => handleNavClick({ id: 'beranda', label: 'Beranda', targetType: 'section', targetValue: 'beranda' } as NavMenuItem)}
          className="cursor-pointer group flex items-center gap-3 transition-transform hover:scale-[1.02]"
          title="BAPOLES - Ba' Omong Pola Hidup Sehat | Dinas Kesehatan Provinsi NTT"
        >
          <BapolesLogo 
            variant="horizontal" 
            size="sm" 
            showSubtitle={true} 
            theme="light" 
            customLogoUrl={siteConfig.logoUrl || '/images/bapoles_logo.svg'}
          />
        </div>

        {/* Right side: Navigation Menu, Search Bar, and Edit Mode Button */}
        <div className="hidden lg:flex items-center gap-4 xl:gap-6">
          {/* Menu Navigasi (Pojok Kanan Atas) */}
          <nav className="flex items-center space-x-1 xl:space-x-1.5">
            {navItems.map((item) => {
              const Icon = getMenuIcon(item.iconName);
              const targetSec = item.targetValue || item.id;
              const isActive = activeSection === targetSec;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => handleNavClick(item)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-teal-50 text-teal-800 border border-teal-300 shadow-xs'
                      : 'text-slate-700 hover:text-teal-800 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-700' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Quick Button to edit menu titles */}
            <button
              onClick={() => onOpenEditModal('nav')}
              className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
              title="Kelola & Tambah Menu Navigasi"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </nav>

          {/* Kolom Pencarian (Search Bar) */}
          <div className="relative">
            <div className="flex items-center bg-slate-100 hover:bg-slate-200/70 focus-within:bg-white border border-slate-200 focus-within:border-teal-600 rounded-full px-3 py-1.5 transition-all w-44 xl:w-56 shadow-inner">
              <Search className="w-4 h-4 text-teal-600 flex-shrink-0 mr-2" />
              <input
                id="search-input-desktop"
                type="text"
                placeholder="Cari podcast..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none w-full"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-slate-400 hover:text-slate-700 ml-1 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Tombol Mode Edit (Mudah Di-Edit & Gratis) */}
          <button
            id="btn-open-edit-mode"
            onClick={() => onOpenEditModal('beranda')}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-xs hover:shadow-md transition-all cursor-pointer"
            title="Edit konten website podcast dengan mudah dan gratis"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Mode Edit</span>
          </button>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 lg:hidden">
          {/* Search Toggle Mobile */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 focus:outline-none"
            aria-label="Cari"
          >
            <Search className="w-5 h-5 text-teal-700" />
          </button>

          {/* Quick Edit Button Mobile */}
          <button
            onClick={() => onOpenEditModal('beranda')}
            className="p-2 rounded-lg bg-teal-600 text-white font-bold hover:bg-teal-700"
            title="Mode Edit"
          >
            <Edit3 className="w-5 h-5" />
          </button>

          {/* Hamburger Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 focus:outline-none"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar Dropdown */}
      {searchOpen && (
        <div className="lg:hidden px-4 pb-3 pt-1 border-t border-slate-200 bg-white shadow-md">
          <div className="flex items-center bg-slate-100 border border-teal-300 rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-teal-600 mr-2" />
            <input
              id="search-input-mobile"
              type="text"
              placeholder="Cari judul, topik, atau narasumber..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none w-full"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-slate-400 text-xs">
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-2 shadow-xl animate-fadeIn">
          {navItems.map((item) => {
            const Icon = getMenuIcon(item.iconName);
            const targetSec = item.targetValue || item.id;
            const isActive = activeSection === targetSec;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-left transition-colors ${
                  isActive
                    ? 'bg-teal-50 text-teal-800 border border-teal-300'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-teal-700' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenEditModal('nav');
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold text-sm"
            >
              <Edit3 className="w-4 h-4" />
              <span>Buka Mode Edit & Ganti Label Menu</span>
            </button>

            <a
              href={`https://wa.me/62${siteConfig.whatsappNumber.replace(/^0/, '')}?text=${encodeURIComponent(siteConfig.whatsappMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#25D366] text-white font-bold text-sm shadow-md"
            >
              <Phone className="w-4 h-4" />
              <span>WhatsApp Kami ({siteConfig.whatsappNumber})</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
