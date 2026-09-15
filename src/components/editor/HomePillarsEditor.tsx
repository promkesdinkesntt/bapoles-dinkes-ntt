import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { SiteConfig, PillarItem } from '../../types';

interface HomePillarsEditorProps {
  siteConfig: SiteConfig;
  setSiteConfig: React.Dispatch<React.SetStateAction<SiteConfig>>;
  onShowToast: (msg: string) => void;
}

const DEFAULT_HOME_PILLARS: PillarItem[] = [
  {
    id: 'hp-1',
    title: 'Informasi Resmi Terpercaya',
    desc: 'Langsung dari dokter, narasumber ahli, dan tenaga kesehatan Dinas Kesehatan Provinsi NTT.',
  },
  {
    id: 'hp-2',
    title: 'Topik Relevan & Aplikatif',
    desc: 'Membahas stunting, gizi balita, pencegahan rabies, DBD, hingga kesehatan reproduksi & jiwa.',
  },
  {
    id: 'hp-3',
    title: 'Interaktif & Terbuka',
    desc: 'Pemirsa dapat bertanya langsung lewat WhatsApp Center maupun kolom live chat siaran rutin.',
  },
];

export const HomePillarsEditor: React.FC<HomePillarsEditorProps> = ({
  siteConfig,
  setSiteConfig,
  onShowToast,
}) => {
  const pillars: PillarItem[] = (
    siteConfig.homePillarsList && siteConfig.homePillarsList.length > 0
      ? siteConfig.homePillarsList
      : DEFAULT_HOME_PILLARS
  );

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleAddPillar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: PillarItem = {
      id: `hp-${Date.now()}`,
      title: newTitle.trim(),
      desc: newDesc.trim() || 'Keterangan pilar keunggulan.',
    };

    const updated = [...pillars, newItem];
    setSiteConfig({
      ...siteConfig,
      homePillarsList: updated,
    });

    setNewTitle('');
    setNewDesc('');
    setShowAddForm(false);
    onShowToast(`Pilar keunggulan "${newItem.title}" berhasil ditambahkan!`);
  };

  const handleUpdatePillar = (id: string, patch: Partial<PillarItem>) => {
    const updated = pillars.map((p) => {
      if (p.id === id) {
        return { ...p, ...patch };
      }
      return p;
    });

    setSiteConfig({
      ...siteConfig,
      homePillarsList: updated,
    });
  };

  const handleDeletePillar = (id: string, title: string) => {
    if (window.confirm(`Hapus pilar "${title}" dari Beranda?`)) {
      const updated = pillars.filter((p) => p.id !== id);
      setSiteConfig({
        ...siteConfig,
        homePillarsList: updated,
      });
      onShowToast(`Pilar "${title}" berhasil dihapus!`);
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider text-emerald-800">
            Pilar Keunggulan BAPOLES di Beranda ({pillars.length})
          </h4>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer ml-auto sm:ml-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{showAddForm ? 'Batal Tambah' : '+ Tambah Pilar Baru'}</span>
        </button>
      </div>

      {/* Add New Pillar Form */}
      {showAddForm && (
        <form onSubmit={handleAddPillar} className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-300 space-y-3 animate-fadeIn">
          <span className="text-xs font-black text-emerald-950 uppercase tracking-wider block">
            Form Tambah Pilar Keunggulan Baru
          </span>

          <div className="space-y-2">
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                Judul Pilar *
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Contoh: Konsultasi Terpadu Berkelanjutan"
                className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 bg-white focus:border-emerald-600"
                autoFocus
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                Keterangan / Penjelasan Pilar *
              </label>
              <textarea
                rows={2}
                required
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Jelaskan secara ringkas manfaat atau keunggulan pilar ini bagi masyarakat NTT..."
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white resize-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
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

      {/* List of Pillars */}
      <div className="space-y-3">
        {pillars.map((pillar, idx) => (
          <div
            key={pillar.id}
            className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-colors space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-200">
                Pilar #{idx + 1}
              </span>
              <button
                type="button"
                onClick={() => handleDeletePillar(pillar.id, pillar.title)}
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
                  value={pillar.title}
                  onChange={(e) => handleUpdatePillar(pillar.id, { title: e.target.value })}
                  className="w-full px-2.5 py-1 text-xs font-bold rounded border border-slate-300 bg-white"
                  placeholder="Judul Pilar"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                  Keterangan / Penjelasan
                </label>
                <input
                  type="text"
                  value={pillar.desc}
                  onChange={(e) => handleUpdatePillar(pillar.id, { desc: e.target.value })}
                  className="w-full px-2.5 py-1 text-xs rounded border border-slate-300 bg-white"
                  placeholder="Keterangan Pilar"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
