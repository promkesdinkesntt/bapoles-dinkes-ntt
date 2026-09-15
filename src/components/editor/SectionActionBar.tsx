import React, { useState } from 'react';
import { Edit2, Trash2, Plus, Eye, EyeOff, Check } from 'lucide-react';
import { SiteConfig, NavMenuItem } from '../../types';

interface SectionActionBarProps {
  menuKey: string; // 'beranda' | 'jadwal' | 'galeri' | 'tentang' | 'tim' | 'kontak'
  defaultLabel: string;
  siteConfig: SiteConfig;
  setSiteConfig: React.Dispatch<React.SetStateAction<SiteConfig>>;
  onOpenAddMenu: () => void;
  onShowToast: (msg: string) => void;
}

export const SectionActionBar: React.FC<SectionActionBarProps> = ({
  menuKey,
  defaultLabel,
  siteConfig,
  setSiteConfig,
  onOpenAddMenu,
  onShowToast,
}) => {
  const currentLabel = siteConfig.menuLabels?.[menuKey as keyof typeof siteConfig.menuLabels] || defaultLabel;
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [tempLabel, setTempLabel] = useState(currentLabel);

  // Find corresponding item in navMenus if available
  const navMenus = siteConfig.navMenus || [];
  const targetMenuItem = navMenus.find(
    (m) => m.id === menuKey || m.targetValue === menuKey
  );
  const isVisible = targetMenuItem ? targetMenuItem.isVisible !== false : true;

  const handleSaveLabel = () => {
    const trimmed = tempLabel.trim();
    if (!trimmed) return;

    const updatedLabels = {
      ...siteConfig.menuLabels,
      [menuKey]: trimmed,
    };

    // Also update in navMenus array if exists
    let updatedNavMenus = [...navMenus];
    const itemIndex = updatedNavMenus.findIndex(
      (m) => m.id === menuKey || m.targetValue === menuKey
    );
    if (itemIndex >= 0) {
      updatedNavMenus[itemIndex] = {
        ...updatedNavMenus[itemIndex],
        label: trimmed,
      };
    } else {
      // If not yet in navMenus, add it
      updatedNavMenus.push({
        id: menuKey,
        label: trimmed,
        targetType: 'section',
        targetValue: menuKey,
        isVisible: true,
        order: updatedNavMenus.length + 1,
      });
    }

    setSiteConfig({
      ...siteConfig,
      menuLabels: updatedLabels as any,
      navMenus: updatedNavMenus,
    });

    setIsEditingLabel(false);
    onShowToast(`Nama menu "${trimmed}" berhasil diperbarui!`);
  };

  const handleDeleteOrHideMenu = () => {
    const confirmText = isVisible
      ? `Sembunyikan / Hapus menu "${currentLabel}" dari bilah navigasi website? Anda dapat menampilkannya kembali kapan saja.`
      : `Tampilkan kembali menu "${currentLabel}" di bilah navigasi website?`;

    if (window.confirm(confirmText)) {
      let updatedNavMenus = [...navMenus];
      const itemIndex = updatedNavMenus.findIndex(
        (m) => m.id === menuKey || m.targetValue === menuKey
      );

      if (itemIndex >= 0) {
        updatedNavMenus[itemIndex] = {
          ...updatedNavMenus[itemIndex],
          isVisible: !isVisible,
        };
      } else {
        updatedNavMenus.push({
          id: menuKey,
          label: currentLabel,
          targetType: 'section',
          targetValue: menuKey,
          isVisible: false,
          order: updatedNavMenus.length + 1,
        });
      }

      setSiteConfig({
        ...siteConfig,
        navMenus: updatedNavMenus,
      });

      onShowToast(
        isVisible
          ? `Menu "${currentLabel}" berhasil dihapus / disembunyikan dari navigasi!`
          : `Menu "${currentLabel}" ditampilkan kembali di navigasi!`
      );
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0c3832] via-teal-900 to-[#072420] text-white shadow-md border border-emerald-500/40">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Info Status */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-black uppercase tracking-wider">
              Aksi Menu: {currentLabel}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                isVisible
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                  : 'bg-red-950/80 text-red-300 border border-red-500/40'
              }`}
            >
              {isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              <span>{isVisible ? 'Aktif di Navbar' : 'Disembunyikan dari Navbar'}</span>
            </span>
          </div>
          <p className="text-xs text-emerald-100/90">
            Kelola tampilan menu ini: Anda bisa mengedit label nama, menghapus dari header website, atau menambahkan menu baru.
          </p>
        </div>

        {/* Right: Action Buttons (Edit, Hapus, Tambahkan) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 1. Tombol Edit Label Menu */}
          <button
            type="button"
            onClick={() => {
              setTempLabel(currentLabel);
              setIsEditingLabel(!isEditingLabel);
            }}
            className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-white/20"
            title="Edit teks nama menu ini di bilah navigasi"
          >
            <Edit2 className="w-3.5 h-3.5 text-emerald-300" />
            <span>Edit Nama Menu</span>
          </button>

          {/* 2. Tombol Hapus / Sembunyikan Menu */}
          <button
            type="button"
            onClick={handleDeleteOrHideMenu}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              isVisible
                ? 'bg-red-500/80 hover:bg-red-600 text-white border-red-400/30'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-400/30'
            }`}
            title={isVisible ? 'Hapus / Sembunyikan menu ini dari navigasi website' : 'Tampilkan kembali menu ini di navigasi'}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isVisible ? 'Hapus Menu' : 'Pulihkan Menu'}</span>
          </button>

          {/* 3. Tombol Tambahkan Menu Baru */}
          <button
            type="button"
            onClick={onOpenAddMenu}
            className="px-3 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            title="Buka form untuk menambahkan menu baru ke website"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Tambahkan Menu</span>
          </button>
        </div>
      </div>

      {/* Inline Label Editor Form */}
      {isEditingLabel && (
        <div className="mt-3 pt-3 border-t border-emerald-700/50 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 animate-fadeIn">
          <label className="text-xs font-bold text-emerald-200 whitespace-nowrap">
            Ubah Nama Tampilan:
          </label>
          <input
            type="text"
            value={tempLabel}
            onChange={(e) => setTempLabel(e.target.value)}
            className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-white text-slate-900 font-bold border border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            placeholder={`Masukkan nama baru (misal: ${defaultLabel})`}
            autoFocus
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveLabel}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Simpan Nama</span>
            </button>
            <button
              type="button"
              onClick={() => setIsEditingLabel(false)}
              className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium cursor-pointer"
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
