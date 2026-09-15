import React, { useState } from 'react';
import { Plus, Trash2, Award, Heart } from 'lucide-react';
import { SiteConfig, LogoSymbolItem, PillarItem } from '../../types';

interface AboutSymbolsAndPillarsEditorProps {
  siteConfig: SiteConfig;
  setSiteConfig: React.Dispatch<React.SetStateAction<SiteConfig>>;
  onShowToast: (msg: string) => void;
}

const DEFAULT_SYMBOLS: LogoSymbolItem[] = [
  { id: 'ls-1', title: 'Mikrofon Podcast', desc: 'Simbol keterbukaan ruang dialog, edukasi audio-visual, dan penyuluhan kesehatan modern.', iconType: 'mic' },
  { id: 'ls-2', title: 'Gelombang Suara', desc: 'Jangkauan siaran yang melintasi 22 kabupaten/kota kepulauan di NTT tanpa batas wilayah.', iconType: 'waves' },
  { id: 'ls-3', title: 'Palang Medis Hijau', desc: 'Komitmen pelayanan kesehatan promotif, preventif, dan kuratif yang berbasis bukti ilmiah.', iconType: 'cross' },
  { id: 'ls-4', title: 'Warna Hijau & Emas', desc: 'Representasi alam Nusa Tenggara Timur, kesuburan, optimisme, dan kesehatan sejati.', iconType: 'shield' },
];

const DEFAULT_ABOUT_PILLARS: PillarItem[] = [
  { id: 'ap-1', title: 'Berbasis Bukti Medis', desc: 'Materi disusun dan disampaikan bersama dokter spesialis, perawat, bidan, sanitarian, dan akademisi gizi terpercaya.' },
  { id: 'ap-2', title: 'Menjangkau 22 Daerah', desc: 'Siaran multiplatform via YouTube, Facebook, WhatsApp Center, dan radio komunitas di seluruh kepulauan NTT.' },
];

export const AboutSymbolsAndPillarsEditor: React.FC<AboutSymbolsAndPillarsEditorProps> = ({
  siteConfig,
  setSiteConfig,
  onShowToast,
}) => {
  const symbols: LogoSymbolItem[] = (
    siteConfig.aboutLogoSymbolsList && siteConfig.aboutLogoSymbolsList.length > 0
      ? siteConfig.aboutLogoSymbolsList
      : DEFAULT_SYMBOLS
  );

  const aboutPillars: PillarItem[] = (
    siteConfig.aboutPillarsList && siteConfig.aboutPillarsList.length > 0
      ? siteConfig.aboutPillarsList
      : DEFAULT_ABOUT_PILLARS
  );

  // States for adding Symbol
  const [showAddSymbol, setShowAddSymbol] = useState(false);
  const [newSymbolTitle, setNewSymbolTitle] = useState('');
  const [newSymbolDesc, setNewSymbolDesc] = useState('');
  const [newSymbolIconType, setNewSymbolIconType] = useState('mic');

  // States for adding Pillar
  const [showAddPillar, setShowAddPillar] = useState(false);
  const [newPillarTitle, setNewPillarTitle] = useState('');
  const [newPillarDesc, setNewPillarDesc] = useState('');

  // 1. Symbol Handlers
  const handleAddSymbol = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbolTitle.trim()) return;

    const newItem: LogoSymbolItem = {
      id: `ls-${Date.now()}`,
      title: newSymbolTitle.trim(),
      desc: newSymbolDesc.trim() || 'Penjelasan makna filosofis lambang.',
      iconType: newSymbolIconType,
    };

    const updated = [...symbols, newItem];
    setSiteConfig({
      ...siteConfig,
      aboutLogoSymbolsList: updated,
    });

    setNewSymbolTitle('');
    setNewSymbolDesc('');
    setShowAddSymbol(false);
    onShowToast(`Makna lambang "${newItem.title}" berhasil ditambahkan!`);
  };

  const handleUpdateSymbol = (id: string, patch: Partial<LogoSymbolItem>) => {
    const updated = symbols.map((s) => (s.id === id ? { ...s, ...patch } : s));
    setSiteConfig({
      ...siteConfig,
      aboutLogoSymbolsList: updated,
    });
  };

  const handleDeleteSymbol = (id: string, title: string) => {
    if (window.confirm(`Hapus makna lambang "${title}"?`)) {
      const updated = symbols.filter((s) => s.id !== id);
      setSiteConfig({
        ...siteConfig,
        aboutLogoSymbolsList: updated,
      });
      onShowToast(`Makna lambang "${title}" berhasil dihapus!`);
    }
  };

  // 2. Pillar Handlers
  const handleAddPillar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPillarTitle.trim()) return;

    const newItem: PillarItem = {
      id: `ap-${Date.now()}`,
      title: newPillarTitle.trim(),
      desc: newPillarDesc.trim() || 'Penjelasan pilar pelayanan.',
    };

    const updated = [...aboutPillars, newItem];
    setSiteConfig({
      ...siteConfig,
      aboutPillarsList: updated,
    });

    setNewPillarTitle('');
    setNewPillarDesc('');
    setShowAddPillar(false);
    onShowToast(`Pilar pelayanan "${newItem.title}" berhasil ditambahkan!`);
  };

  const handleUpdatePillar = (id: string, patch: Partial<PillarItem>) => {
    const updated = aboutPillars.map((p) => (p.id === id ? { ...p, ...patch } : p));
    setSiteConfig({
      ...siteConfig,
      aboutPillarsList: updated,
    });
  };

  const handleDeletePillar = (id: string, title: string) => {
    if (window.confirm(`Hapus pilar pelayanan "${title}"?`)) {
      const updated = aboutPillars.filter((p) => p.id !== id);
      setSiteConfig({
        ...siteConfig,
        aboutPillarsList: updated,
      });
      onShowToast(`Pilar pelayanan "${title}" berhasil dihapus!`);
    }
  };

  return (
    <div className="space-y-6">
      {/* SECTION 1: Makna Filosofis Lambang Logo BAPOLES */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider text-emerald-800">
              Makna Filosofis Unsur Lambang Logo ({symbols.length})
            </h4>
          </div>

          <button
            type="button"
            onClick={() => setShowAddSymbol(!showAddSymbol)}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer ml-auto sm:ml-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddSymbol ? 'Batal Tambah' : '+ Tambah Makna Lambang'}</span>
          </button>
        </div>

        {/* Add Symbol Form */}
        {showAddSymbol && (
          <form onSubmit={handleAddSymbol} className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-300 space-y-3 animate-fadeIn">
            <span className="text-xs font-black text-emerald-950 uppercase tracking-wider block">
              Form Tambah Makna Unsur Logo Baru
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                  Nama Unsur / Lambang *
                </label>
                <input
                  type="text"
                  required
                  value={newSymbolTitle}
                  onChange={(e) => setNewSymbolTitle(e.target.value)}
                  placeholder="Contoh: Sasando Musik NTT / Cincin Emas"
                  className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 bg-white"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                  Ikon Visual
                </label>
                <select
                  value={newSymbolIconType}
                  onChange={(e) => setNewSymbolIconType(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                >
                  <option value="mic">🎙️ Mikrofon</option>
                  <option value="waves">🌊 Gelombang Suara</option>
                  <option value="cross">➕ Palang Medis</option>
                  <option value="shield">🛡️ Perisai / Pelindung</option>
                  <option value="heart">❤️ Hati / Peduli</option>
                  <option value="star">⭐ Bintang Kejayaan</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                Makna Filosofis / Penjelasan *
              </label>
              <textarea
                rows={2}
                required
                value={newSymbolDesc}
                onChange={(e) => setNewSymbolDesc(e.target.value)}
                placeholder="Jelaskan arti filosofis unsur logo ini..."
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddSymbol(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Simpan Unsur Logo</span>
              </button>
            </div>
          </form>
        )}

        {/* List of Symbols */}
        <div className="space-y-3">
          {symbols.map((sym, idx) => (
            <div
              key={sym.id}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-colors space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-200">
                  Unsur #{idx + 1} ({sym.iconType})
                </span>
                <button
                  type="button"
                  onClick={() => handleDeleteSymbol(sym.id, sym.title)}
                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                  title="Hapus unsur ini"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                    Nama Unsur
                  </label>
                  <input
                    type="text"
                    value={sym.title}
                    onChange={(e) => handleUpdateSymbol(sym.id, { title: e.target.value })}
                    className="w-full px-2.5 py-1 text-xs font-bold rounded border border-slate-300 bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                    Makna Filosofis
                  </label>
                  <input
                    type="text"
                    value={sym.desc}
                    onChange={(e) => handleUpdateSymbol(sym.id, { desc: e.target.value })}
                    className="w-full px-2.5 py-1 text-xs rounded border border-slate-300 bg-white"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: Pilar Pelayanan BAPOLES */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-emerald-600" />
            <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider text-emerald-800">
              Pilar Pelayanan BAPOLES ({aboutPillars.length})
            </h4>
          </div>

          <button
            type="button"
            onClick={() => setShowAddPillar(!showAddPillar)}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer ml-auto sm:ml-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddPillar ? 'Batal Tambah' : '+ Tambah Pilar Pelayanan'}</span>
          </button>
        </div>

        {/* Add Pillar Form */}
        {showAddPillar && (
          <form onSubmit={handleAddPillar} className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-300 space-y-3 animate-fadeIn">
            <span className="text-xs font-black text-emerald-950 uppercase tracking-wider block">
              Form Tambah Pilar Pelayanan Baru
            </span>

            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                Judul Pilar *
              </label>
              <input
                type="text"
                required
                value={newPillarTitle}
                onChange={(e) => setNewPillarTitle(e.target.value)}
                placeholder="Contoh: Pendekatan Humanis & Komunikatif"
                className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 bg-white"
                autoFocus
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                Penjelasan Pilar *
              </label>
              <textarea
                rows={2}
                required
                value={newPillarDesc}
                onChange={(e) => setNewPillarDesc(e.target.value)}
                placeholder="Tuliskan komitmen atau cara pelaksanaan pilar ini..."
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddPillar(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Simpan Pilar</span>
              </button>
            </div>
          </form>
        )}

        {/* List of About Pillars */}
        <div className="space-y-3">
          {aboutPillars.map((p, idx) => (
            <div
              key={p.id}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-colors space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-200">
                  Pilar Pelayanan #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleDeletePillar(p.id, p.title)}
                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                  title="Hapus pilar ini"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                    Judul Pilar
                  </label>
                  <input
                    type="text"
                    value={p.title}
                    onChange={(e) => handleUpdatePillar(p.id, { title: e.target.value })}
                    className="w-full px-2.5 py-1 text-xs font-bold rounded border border-slate-300 bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                    Penjelasan
                  </label>
                  <input
                    type="text"
                    value={p.desc}
                    onChange={(e) => handleUpdatePillar(p.id, { desc: e.target.value })}
                    className="w-full px-2.5 py-1 text-xs rounded border border-slate-300 bg-white"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
