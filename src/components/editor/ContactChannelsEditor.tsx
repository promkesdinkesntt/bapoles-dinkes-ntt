import React, { useState } from 'react';
import { Plus, Trash2, Share2 } from 'lucide-react';
import { SiteConfig, ContactChannelItem } from '../../types';

interface ContactChannelsEditorProps {
  siteConfig: SiteConfig;
  setSiteConfig: React.Dispatch<React.SetStateAction<SiteConfig>>;
  onShowToast: (msg: string) => void;
}

const DEFAULT_CHANNELS: ContactChannelItem[] = [
  { id: 'cc-1', platform: 'Instagram', handle: '@dinkesntt', url: 'https://instagram.com/dinkesntt', iconType: 'instagram', note: 'Foto & Cuplikan Podcast' },
  { id: 'cc-2', platform: 'Facebook', handle: '@dinkesntt', url: 'https://facebook.com/dinkesntt', iconType: 'facebook', note: 'Live Stream Siaran' },
  { id: 'cc-3', platform: 'TikTok', handle: '@dinkesntt', url: 'https://tiktok.com/@dinkesntt', iconType: 'tiktok', note: 'Video Edukasi Singkat' },
];

export const ContactChannelsEditor: React.FC<ContactChannelsEditorProps> = ({
  siteConfig,
  setSiteConfig,
  onShowToast,
}) => {
  const channels: ContactChannelItem[] = (
    siteConfig.contactChannelsList && siteConfig.contactChannelsList.length > 0
      ? siteConfig.contactChannelsList
      : DEFAULT_CHANNELS
  );

  const [showAddForm, setShowAddForm] = useState(false);
  const [platform, setPlatform] = useState('Instagram');
  const [handle, setHandle] = useState('@dinkesntt');
  const [url, setUrl] = useState('https://');
  const [note, setNote] = useState('');

  const handleAddChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!platform.trim() || !handle.trim()) return;

    const newItem: ContactChannelItem = {
      id: `cc-${Date.now()}`,
      platform: platform.trim(),
      handle: handle.trim(),
      url: url.trim() || 'https://dinkes.nttprov.go.id',
      note: note.trim() || undefined,
    };

    const updated = [...channels, newItem];
    setSiteConfig({
      ...siteConfig,
      contactChannelsList: updated,
    });

    setPlatform('Instagram');
    setHandle('@dinkesntt');
    setUrl('https://');
    setNote('');
    setShowAddForm(false);
    onShowToast(`Saluran kontak "${newItem.platform}" berhasil ditambahkan!`);
  };

  const handleUpdateChannel = (id: string, patch: Partial<ContactChannelItem>) => {
    const updated = channels.map((ch) => (ch.id === id ? { ...ch, ...patch } : ch));
    setSiteConfig({
      ...siteConfig,
      contactChannelsList: updated,
    });
  };

  const handleDeleteChannel = (id: string, platformName: string) => {
    if (window.confirm(`Hapus saluran "${platformName}" dari daftar kontak?`)) {
      const updated = channels.filter((ch) => ch.id !== id);
      setSiteConfig({
        ...siteConfig,
        contactChannelsList: updated,
      });
      onShowToast(`Saluran "${platformName}" berhasil dihapus!`);
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <Share2 className="w-5 h-5 text-emerald-600" />
          <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider text-emerald-800">
            Daftar Saluran Media Sosial & Kontak Tambahan ({channels.length})
          </h4>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer ml-auto sm:ml-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{showAddForm ? 'Batal Tambah' : '+ Tambah Saluran Kontak'}</span>
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <form onSubmit={handleAddChannel} className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-300 space-y-3 animate-fadeIn">
          <span className="text-xs font-black text-emerald-950 uppercase tracking-wider block">
            Form Tambah Saluran Kontak Baru
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                Nama Platform / Saluran *
              </label>
              <input
                type="text"
                required
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                placeholder="Contoh: Instagram, YouTube, Spotify, Telegram..."
                className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 bg-white"
                autoFocus
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                Nama Akun / Handle / Nomor *
              </label>
              <input
                type="text"
                required
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="@dinkesntt atau 0812-xxxx-xxxx"
                className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                Link URL Tujuan
              </label>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300 bg-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                Keterangan Singkat
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Misal: Siaran Ulang Podcast Lengkap"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
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
              <span>Simpan Saluran</span>
            </button>
          </div>
        </form>
      )}

      {/* List of Channels */}
      <div className="space-y-3">
        {channels.map((ch, idx) => (
          <div
            key={ch.id}
            className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-colors space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-200">
                Saluran #{idx + 1}: {ch.platform}
              </span>
              <button
                type="button"
                onClick={() => handleDeleteChannel(ch.id, ch.platform)}
                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                title="Hapus saluran ini"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                  Platform
                </label>
                <input
                  type="text"
                  value={ch.platform}
                  onChange={(e) => handleUpdateChannel(ch.id, { platform: e.target.value })}
                  className="w-full px-2.5 py-1 text-xs font-bold rounded border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                  Handle / Nomor
                </label>
                <input
                  type="text"
                  value={ch.handle}
                  onChange={(e) => handleUpdateChannel(ch.id, { handle: e.target.value })}
                  className="w-full px-2.5 py-1 text-xs font-mono rounded border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                  Keterangan Singkat
                </label>
                <input
                  type="text"
                  value={ch.note || ''}
                  onChange={(e) => handleUpdateChannel(ch.id, { note: e.target.value })}
                  className="w-full px-2.5 py-1 text-xs rounded border border-slate-300 bg-white"
                  placeholder="Catatan"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                Link URL Web
              </label>
              <input
                type="url"
                value={ch.url}
                onChange={(e) => handleUpdateChannel(ch.id, { url: e.target.value })}
                className="w-full px-2.5 py-1 text-xs font-mono text-emerald-800 rounded border border-slate-300 bg-white"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
