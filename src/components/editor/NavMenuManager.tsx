import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown, 
  Radio, 
  Calendar, 
  Image as ImageIcon, 
  Info, 
  Users, 
  Phone, 
  FileText, 
  Sparkles, 
  Heart, 
  Activity, 
  Globe, 
  Award, 
  HelpCircle, 
  Folder,
  RotateCcw,
  Check,
  ExternalLink
} from 'lucide-react';
import { SiteConfig, NavMenuItem } from '../../types';

interface NavMenuManagerProps {
  siteConfig: SiteConfig;
  setSiteConfig: React.Dispatch<React.SetStateAction<SiteConfig>>;
  onOpenAddMenu: () => void;
  onShowToast: (msg: string) => void;
}

const getMenuIconComponent = (iconName?: string) => {
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

const DEFAULT_MENUS: NavMenuItem[] = [
  { id: 'beranda', label: 'Beranda', iconName: 'Radio', targetType: 'section', targetValue: 'beranda', isVisible: true, order: 1 },
  { id: 'jadwal', label: 'Jadwal Podcast', iconName: 'Calendar', targetType: 'section', targetValue: 'jadwal', isVisible: true, order: 2 },
  { id: 'galeri', label: 'Galeri', iconName: 'ImageIcon', targetType: 'section', targetValue: 'galeri', isVisible: true, order: 3 },
  { id: 'tentang', label: 'Tentang', iconName: 'Info', targetType: 'section', targetValue: 'tentang', isVisible: true, order: 4 },
  { id: 'tim', label: 'Tim Kami', iconName: 'Users', targetType: 'section', targetValue: 'tim', isVisible: true, order: 5 },
  { id: 'kontak', label: 'Kontak', iconName: 'Phone', targetType: 'section', targetValue: 'kontak', isVisible: true, order: 6 },
];

export const NavMenuManager: React.FC<NavMenuManagerProps> = ({
  siteConfig,
  setSiteConfig,
  onOpenAddMenu,
  onShowToast,
}) => {
  const currentMenus: NavMenuItem[] = (
    siteConfig.navMenus && siteConfig.navMenus.length > 0
      ? siteConfig.navMenus
      : DEFAULT_MENUS
  );

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<NavMenuItem>>({});

  const handleStartEdit = (menu: NavMenuItem) => {
    setEditingId(menu.id);
    setEditForm({ ...menu });
  };

  const handleSaveEdit = (id: string) => {
    if (!editForm.label?.trim()) return;

    const updated = currentMenus.map((m) => {
      if (m.id === id) {
        return {
          ...m,
          ...editForm,
          label: editForm.label?.trim() || m.label,
        };
      }
      return m;
    });

    // Also sync siteConfig.menuLabels if it's one of the 6 core keys
    const menuKey = id as keyof typeof siteConfig.menuLabels;
    let updatedLabels = { ...siteConfig.menuLabels };
    if (menuKey in updatedLabels) {
      updatedLabels = {
        ...updatedLabels,
        [menuKey]: editForm.label?.trim() || updatedLabels[menuKey],
      };
    }

    setSiteConfig({
      ...siteConfig,
      navMenus: updated,
      menuLabels: updatedLabels as any,
    });

    setEditingId(null);
    onShowToast(`Perubahan menu "${editForm.label}" berhasil disimpan!`);
  };

  const handleDeleteMenu = (id: string, label: string) => {
    if (window.confirm(`Hapus menu "${label}" dari bilah navigasi website?`)) {
      const updated = currentMenus.filter((m) => m.id !== id);
      setSiteConfig({
        ...siteConfig,
        navMenus: updated,
      });
      onShowToast(`Menu "${label}" berhasil dihapus dari navigasi!`);
    }
  };

  const handleToggleVisibility = (id: string) => {
    const updated = currentMenus.map((m) => {
      if (m.id === id) {
        const nextState = m.isVisible === false ? true : false;
        return { ...m, isVisible: nextState };
      }
      return m;
    });

    setSiteConfig({
      ...siteConfig,
      navMenus: updated,
    });

    const target = currentMenus.find((m) => m.id === id);
    onShowToast(
      target?.isVisible === false
        ? `Menu "${target?.label}" sekarang tampil di navigasi!`
        : `Menu "${target?.label}" disembunyikan dari navigasi!`
    );
  };

  const handleMoveOrder = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentMenus.length) return;

    const reordered = [...currentMenus];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    // Update order indices
    const updated = reordered.map((item, idx) => ({ ...item, order: idx + 1 }));

    setSiteConfig({
      ...siteConfig,
      navMenus: updated,
    });
    onShowToast('Urutan menu berhasil diperbarui!');
  };

  const handleResetToDefault = () => {
    if (window.confirm('Kembalikan susunan menu navigasi ke setelan awal bawaan?')) {
      setSiteConfig({
        ...siteConfig,
        navMenus: DEFAULT_MENUS,
        menuLabels: {
          beranda: 'Beranda',
          jadwal: 'Jadwal Podcast',
          galeri: 'Galeri',
          tentang: 'Tentang',
          tim: 'Tim Kami',
          kontak: 'Kontak',
        },
      });
      onShowToast('Menu navigasi berhasil dikembalikan ke default bawaan!');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header & Main Actions */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0c3832] via-teal-900 to-[#072420] text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-emerald-500/40">
        <div>
          <h4 className="font-extrabold text-base sm:text-lg flex items-center gap-2">
            <span>Kelola Seluruh Menu Navigasi Website</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-black">
              {currentMenus.length} Menu
            </span>
          </h4>
          <p className="text-xs text-emerald-100/90 mt-1">
            Anda dapat menambah menu baru, mengubah teks nama, mengatur ikon, menyembunyikan, menghapus, atau memindahkan urutan posisi di header.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onOpenAddMenu}
            className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambahkan Menu Baru</span>
          </button>
        </div>
      </div>

      {/* Menu Items List */}
      <div className="space-y-3">
        {currentMenus.map((menu, index) => {
          const IconComp = getMenuIconComponent(menu.iconName);
          const isEditing = editingId === menu.id;
          const isVisible = menu.isVisible !== false;

          return (
            <div
              key={menu.id}
              className={`p-4 rounded-2xl bg-white border transition-all shadow-xs ${
                !isVisible
                  ? 'border-slate-300 opacity-60 bg-slate-50'
                  : 'border-slate-200 hover:border-emerald-300'
              }`}
            >
              {!isEditing ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Icon, Label, and Target info */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm">
                          {menu.label}
                        </span>
                        {!isVisible && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold">
                            Disembunyikan
                          </span>
                        )}
                        <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          Tipe: {menu.targetType === 'external' ? 'Link Eksternal' : menu.targetType === 'modal' ? 'Pop-up Modal' : `Bagian (${menu.targetValue || menu.id})`}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Posisi urutan #{index + 1} di bilah navigasi header
                      </p>
                    </div>
                  </div>

                  {/* Right: Controls (Reorder, Visibility, Edit, Delete) */}
                  <div className="flex items-center gap-1.5 flex-wrap ml-auto sm:ml-0">
                    {/* Reorder Up */}
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveOrder(index, 'up')}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title="Geser ke kiri / atas"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>

                    {/* Reorder Down */}
                    <button
                      type="button"
                      disabled={index === currentMenus.length - 1}
                      onClick={() => handleMoveOrder(index, 'down')}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title="Geser ke kanan / bawah"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Toggle Visibility */}
                    <button
                      type="button"
                      onClick={() => handleToggleVisibility(menu.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                        isVisible
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          : 'bg-red-50 text-red-700 hover:bg-red-100'
                      }`}
                      title={isVisible ? 'Sembunyikan dari navbar' : 'Tampilkan di navbar'}
                    >
                      {isVisible ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-red-500" />}
                      <span className="hidden sm:inline">{isVisible ? 'Tampil' : 'Sembunyi'}</span>
                    </button>

                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={() => handleStartEdit(menu)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      title="Edit rincian menu"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteMenu(menu.id, menu.label)}
                      className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer"
                      title="Hapus menu dari website"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Inline Edit Form */
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-bold text-emerald-800 uppercase">
                      Edit Rincian Menu Navigasi
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="text-xs text-slate-500 hover:text-slate-800"
                    >
                      Batal
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 uppercase">
                        Label Menu
                      </label>
                      <input
                        type="text"
                        value={editForm.label || ''}
                        onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 font-bold focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 uppercase">
                        Ikon
                      </label>
                      <select
                        value={editForm.iconName || 'Radio'}
                        onChange={(e) => setEditForm({ ...editForm, iconName: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                      >
                        <option value="Radio">Radio (Podcast)</option>
                        <option value="Calendar">Kalender (Jadwal)</option>
                        <option value="ImageIcon">Gambar (Galeri)</option>
                        <option value="Info">Info (Tentang)</option>
                        <option value="Users">Pengguna (Tim)</option>
                        <option value="Phone">Telepon (Kontak)</option>
                        <option value="FileText">Dokumen</option>
                        <option value="Sparkles">Bintang</option>
                        <option value="Heart">Hati/Sehat</option>
                        <option value="Activity">Aktivitas</option>
                        <option value="Globe">Web/Global</option>
                        <option value="Award">Penghargaan</option>
                        <option value="HelpCircle">Bantuan</option>
                        <option value="Folder">Folder</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 uppercase">
                        Tipe Target
                      </label>
                      <select
                        value={editForm.targetType || 'section'}
                        onChange={(e) => setEditForm({ ...editForm, targetType: e.target.value as any })}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                      >
                        <option value="section">Bagian Halaman (Section)</option>
                        <option value="external">Link Eksternal</option>
                        <option value="modal">Jendela Pop-up Modal</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 uppercase">
                        Target Tujuan (ID Bagian / URL)
                      </label>
                      <input
                        type="text"
                        value={editForm.targetValue || ''}
                        onChange={(e) => setEditForm({ ...editForm, targetValue: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300"
                        placeholder="beranda, jadwal, https://..., dsb"
                      />
                    </div>

                    {editForm.targetType === 'modal' && (
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 uppercase">
                          Isi Konten Pop-up
                        </label>
                        <input
                          type="text"
                          value={editForm.modalContent || ''}
                          onChange={(e) => setEditForm({ ...editForm, modalContent: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300"
                          placeholder="Pesan info saat menu diklik"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(menu.id)}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Simpan Perubahan</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Reset to Default Button */}
      <div className="pt-4 text-center">
        <button
          type="button"
          onClick={handleResetToDefault}
          className="text-xs font-bold text-slate-500 hover:text-emerald-700 underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Kembalikan Seluruh Menu ke Setelan Default Bawaan</span>
        </button>
      </div>
    </div>
  );
};
