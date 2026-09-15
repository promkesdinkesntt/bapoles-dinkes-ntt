import React, { useState } from 'react';
import { 
  X, 
  Plus, 
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
  Folder 
} from 'lucide-react';
import { SiteConfig, NavMenuItem } from '../../types';

interface AddMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteConfig: SiteConfig;
  setSiteConfig: React.Dispatch<React.SetStateAction<SiteConfig>>;
  onShowToast: (msg: string) => void;
}

const AVAILABLE_ICONS = [
  { name: 'Radio', label: 'Radio/Podcast', Icon: Radio },
  { name: 'Calendar', label: 'Jadwal/Agenda', Icon: Calendar },
  { name: 'ImageIcon', label: 'Galeri/Media', Icon: ImageIcon },
  { name: 'Info', label: 'Informasi', Icon: Info },
  { name: 'Users', label: 'Tim/Orang', Icon: Users },
  { name: 'Phone', label: 'Kontak/Telepon', Icon: Phone },
  { name: 'FileText', label: 'Dokumen/Artikel', Icon: FileText },
  { name: 'Sparkles', label: 'Inovasi/Fitur', Icon: Sparkles },
  { name: 'Heart', label: 'Kesehatan/Peduli', Icon: Heart },
  { name: 'Activity', label: 'Aktivitas/Grafik', Icon: Activity },
  { name: 'Globe', label: 'Situs/Publik', Icon: Globe },
  { name: 'Award', label: 'Prestasi/Standar', Icon: Award },
  { name: 'HelpCircle', label: 'Bantuan/FAQ', Icon: HelpCircle },
  { name: 'Folder', label: 'Arsip/Koleksi', Icon: Folder },
];

export const AddMenuModal: React.FC<AddMenuModalProps> = ({
  isOpen,
  onClose,
  siteConfig,
  setSiteConfig,
  onShowToast,
}) => {
  const [label, setLabel] = useState('');
  const [iconName, setIconName] = useState('Radio');
  const [targetType, setTargetType] = useState<'section' | 'external' | 'modal'>('section');
  const [targetValue, setTargetValue] = useState('beranda');
  const [customSectionId, setCustomSectionId] = useState('');
  const [externalUrl, setExternalUrl] = useState('https://');
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    let finalTargetValue = targetValue;
    if (targetType === 'section') {
      finalTargetValue = targetValue === 'custom' ? customSectionId.trim() || 'beranda' : targetValue;
    } else if (targetType === 'external') {
      finalTargetValue = externalUrl.trim();
    } else if (targetType === 'modal') {
      finalTargetValue = modalTitle.trim() || label.trim();
    }

    const currentNavMenus = siteConfig.navMenus && siteConfig.navMenus.length > 0
      ? [...siteConfig.navMenus]
      : [
          { id: 'beranda', label: siteConfig.menuLabels?.beranda || 'Beranda', iconName: 'Radio', targetType: 'section' as const, targetValue: 'beranda', isVisible: true, order: 1 },
          { id: 'jadwal', label: siteConfig.menuLabels?.jadwal || 'Jadwal Podcast', iconName: 'Calendar', targetType: 'section' as const, targetValue: 'jadwal', isVisible: true, order: 2 },
          { id: 'galeri', label: siteConfig.menuLabels?.galeri || 'Galeri', iconName: 'ImageIcon', targetType: 'section' as const, targetValue: 'galeri', isVisible: true, order: 3 },
          { id: 'tentang', label: siteConfig.menuLabels?.tentang || 'Tentang', iconName: 'Info', targetType: 'section' as const, targetValue: 'tentang', isVisible: true, order: 4 },
          { id: 'tim', label: siteConfig.menuLabels?.tim || 'Tim Kami', iconName: 'Users', targetType: 'section' as const, targetValue: 'tim', isVisible: true, order: 5 },
          { id: 'kontak', label: siteConfig.menuLabels?.kontak || 'Kontak', iconName: 'Phone', targetType: 'section' as const, targetValue: 'kontak', isVisible: true, order: 6 },
        ];

    const newMenuItem: NavMenuItem = {
      id: `menu-${Date.now()}`,
      label: label.trim(),
      iconName,
      targetType,
      targetValue: finalTargetValue,
      modalContent: targetType === 'modal' ? modalContent.trim() : undefined,
      isVisible: true,
      order: currentNavMenus.length + 1,
    };

    const updated = [...currentNavMenus, newMenuItem];

    setSiteConfig({
      ...siteConfig,
      navMenus: updated,
    });

    onShowToast(`Menu baru "${label}" berhasil ditambahkan ke navigasi!`);
    onClose();

    // Reset form
    setLabel('');
    setIconName('Radio');
    setTargetType('section');
    setTargetValue('beranda');
    setCustomSectionId('');
    setExternalUrl('https://');
    setModalContent('');
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-emerald-500/50 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Plus className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-base">
              Tambahkan Menu Baru ke Website
            </h4>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Menu Name Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Nama Label Menu *
            </label>
            <input
              type="text"
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Contoh: Info Stunting, Tanya Dokter, Unduh Materi..."
              className="w-full px-3.5 py-2 text-sm font-semibold rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200"
              autoFocus
            />
          </div>

          {/* Select Icon */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Pilih Ikon Menu
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 max-h-32 overflow-y-auto p-1.5 border border-slate-200 rounded-xl bg-slate-50">
              {AVAILABLE_ICONS.map((item) => {
                const IconComponent = item.Icon;
                const isSelected = iconName === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setIconName(item.name)}
                    className={`p-2 rounded-lg flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                    title={item.label}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="text-[9px] mt-0.5 truncate w-full">{item.label.split('/')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Tindakan Saat Menu Diklik
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTargetType('section')}
                className={`px-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  targetType === 'section'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-500 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                Scroll ke Bagian
              </button>
              <button
                type="button"
                onClick={() => setTargetType('external')}
                className={`px-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  targetType === 'external'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-500 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                Link Website Luar
              </button>
              <button
                type="button"
                onClick={() => setTargetType('modal')}
                className={`px-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  targetType === 'modal'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-500 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                Jendela Pop-up
              </button>
            </div>
          </div>

          {/* Dynamic Target Inputs based on targetType */}
          {targetType === 'section' && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pilih Bagian Halaman:
              </label>
              <select
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 bg-white"
              >
                <option value="beranda">Beranda (Atas)</option>
                <option value="jadwal">Jadwal Podcast</option>
                <option value="galeri">Galeri Foto</option>
                <option value="tentang">Tentang BAPOLES</option>
                <option value="tim">Tim Kami</option>
                <option value="kontak">Kontak & WA Center</option>
                <option value="custom">Bagian ID Khusus Lainnya...</option>
              </select>

              {targetValue === 'custom' && (
                <input
                  type="text"
                  placeholder="ID HTML Bagian (contoh: faq-section)"
                  value={customSectionId}
                  onChange={(e) => setCustomSectionId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                />
              )}
            </div>
          )}

          {targetType === 'external' && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Alamat URL Tujuan (Akan dibuka di tab baru):
              </label>
              <input
                type="url"
                required
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="https://dinkes.nttprov.go.id"
                className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300 bg-white"
              />
            </div>
          )}

          {targetType === 'modal' && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Judul Pop-up:
                </label>
                <input
                  type="text"
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  placeholder="Contoh: Informasi Khusus Pemirsa"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Isi Konten Pesan Pop-up:
                </label>
                <textarea
                  rows={3}
                  value={modalContent}
                  onChange={(e) => setModalContent(e.target.value)}
                  placeholder="Tuliskan keterangan lengkap atau pengumuman yang akan muncul saat menu diklik..."
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white resize-none"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambahkan ke Navigasi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
