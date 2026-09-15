import React, { useState } from 'react';
import { 
  Phone, 
  Send, 
  MapPin, 
  Mail, 
  MessageCircle, 
  CheckCircle, 
  ExternalLink,
  Radio,
  Clock,
  Sparkles,
  Edit3
} from 'lucide-react';
import { BapolesLogo } from './BapolesLogo';
import { SiteConfig, UserQuestionSubmission } from '../types';

interface ContactSectionProps {
  siteConfig: SiteConfig;
  onSubmitQuestion: (data: Omit<UserQuestionSubmission, 'id' | 'submittedAt'>) => void;
  onOpenEditModal?: (tab: string) => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  siteConfig,
  onSubmitQuestion,
  onOpenEditModal,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    whatsapp: '',
    topicSuggestion: '',
    questionText: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.questionText) return;
    
    onSubmitQuestion({
      name: formData.name,
      city: formData.city || 'Kupang',
      whatsapp: formData.whatsapp || '-',
      topicSuggestion: formData.topicSuggestion || 'Pertanyaan Bebas',
      questionText: formData.questionText,
    });

    setSubmitted(true);
    setFormData({
      name: '',
      city: '',
      whatsapp: '',
      topicSuggestion: '',
      questionText: '',
    });

    setTimeout(() => {
      setSubmitted(false);
    }, 6000);
  };

  const cleanWaNumber = siteConfig.whatsappNumber.replace(/^0/, '');
  const waUrl = `https://wa.me/62${cleanWaNumber}?text=${encodeURIComponent(siteConfig.whatsappMessage)}`;

  return (
    <footer id="kontak" className="bg-gradient-to-br from-[#e8f7ee] via-[#f3faf6] to-[#daf1e2] text-slate-800 pt-20 pb-12 border-t border-emerald-300/70 relative overflow-hidden">
      {/* Background Accent Gradients */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-200/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-teal-200/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Contact Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 relative">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100/90 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-3 border border-emerald-300">
            <Phone className="w-3.5 h-3.5 text-emerald-700" />
            <span>Hubungi Kami & Interaksi</span>
          </div>

          {onOpenEditModal && (
            <div className="inline-block ml-3">
              <button
                onClick={() => onOpenEditModal('contact')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-300 shadow-2xs hover:scale-105 transition-all cursor-pointer"
                title="Kelola Nomor WhatsApp, Media Sosial, & Alamat"
              >
                <Edit3 className="w-3 h-3 text-emerald-600" />
                <span>Edit Kontak & Info</span>
              </button>
            </div>
          )}

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0c3832] tracking-tight">
            Kontak & Layanan BAPOLES
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Punya saran topik, pertanyaan kesehatan untuk narasumber dokter, atau ingin berkolaborasi? Hubungi kami langsung!
          </p>
        </div>

        {/* 2 Columns: Contact Channels & Question Submission Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-20 items-start">
          
          {/* Left Column (5 cols): WhatsApp & Social Media */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Direct WhatsApp Callout Card */}
            <div className="p-6 rounded-3xl bg-white/95 border border-emerald-200/90 shadow-xl relative overflow-hidden group">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                    Layanan Cepat Interaktif
                  </span>
                  <h3 className="text-xl font-extrabold text-[#0c3832] mt-1">
                    WhatsApp Center BAPOLES
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Kirim pesan suara, usulan topik podcast, dan pertanyaan kesehatan ke nomor resmi:
                  </p>
                </div>
                
                {/* Official WhatsApp Logo Icon */}
                <div className="w-14 h-14 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-[#25D366]/30 flex-shrink-0 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 fill-white" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </div>
              </div>

              {/* Number display */}
              <div className="mt-5 p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-emerald-800 uppercase tracking-widest font-mono font-bold">
                    Nomor WhatsApp
                  </span>
                  <p className="text-2xl font-black text-emerald-700 font-mono tracking-wider">
                    {siteConfig.whatsappNumber}
                  </p>
                </div>

                <a
                  id="wa-link-button"
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs flex items-center gap-1.5 transition-transform hover:scale-105 shadow-md cursor-pointer"
                >
                  <span>Chat Sekarang</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Social Media Section: All pointing to @dinkesntt */}
            <div className="p-6 rounded-3xl bg-white/95 border border-emerald-200/90 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-[#0c3832] text-base">
                  Media Sosial Resmi
                </h4>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-mono font-bold border border-emerald-300">
                  @{siteConfig.instagramHandle}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Ikuti seluruh kanal media sosial resmi Dinas Kesehatan Provinsi NTT untuk mendapatkan update jadwal siaran, cuplikan podcast, dan infografis kesehatan harian.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {(siteConfig.contactChannelsList && siteConfig.contactChannelsList.length > 0 ? siteConfig.contactChannelsList : [
                  { id: 'cc-1', platform: 'Instagram', handle: `@${siteConfig.instagramHandle}`, url: `https://instagram.com/${siteConfig.instagramHandle}`, iconType: 'instagram', note: 'Foto & Cuplikan Podcast' },
                  { id: 'cc-2', platform: 'Facebook', handle: `@${siteConfig.facebookHandle}`, url: `https://facebook.com/${siteConfig.facebookHandle}`, iconType: 'facebook', note: 'Live Stream Siaran' },
                  { id: 'cc-3', platform: 'TikTok', handle: `@${siteConfig.tiktokHandle}`, url: `https://tiktok.com/@${siteConfig.tiktokHandle}`, iconType: 'tiktok', note: 'Video Edukasi Singkat' },
                ]).map((ch) => (
                  <a
                    key={ch.id}
                    href={ch.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 rounded-xl bg-emerald-50/70 hover:bg-emerald-600 hover:text-white border border-emerald-200 transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 group-hover:bg-white/20 text-emerald-800 group-hover:text-white flex items-center justify-center font-bold text-xs mb-1">
                      {ch.platform === 'Instagram' ? '📸' : ch.platform === 'Facebook' ? '📘' : ch.platform === 'TikTok' ? '🎵' : ch.platform === 'YouTube' ? '▶️' : '🌐'}
                    </div>
                    <span className="text-xs font-bold text-slate-800 group-hover:text-white mt-1">{ch.platform}</span>
                    <span className="text-[11px] text-emerald-700 group-hover:text-white font-mono mt-0.5">{ch.handle}</span>
                    {ch.note && (
                      <span className="text-[10px] text-slate-500 group-hover:text-emerald-100 mt-1 line-clamp-1">{ch.note}</span>
                    )}
                  </a>
                ))}
              </div>
            </div>

            {/* Office Address Card */}
            <div className="p-5 rounded-2xl bg-white/95 border border-emerald-200/90 shadow-md text-xs text-slate-600 space-y-2">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="text-slate-900">Kantor Promosi Kesehatan:</strong><br />
                  {siteConfig.address}
                </p>
              </div>
              <div className="flex items-center gap-2.5 pt-1">
                <Mail className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span>{siteConfig.email}</span>
              </div>
            </div>

          </div>

          {/* Right Column (7 cols): Interactive Question Submission Form */}
          <div className="lg:col-span-7">
            <div className="bg-white/95 border border-emerald-200/90 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-emerald-700" />
                <h3 className="text-xl sm:text-2xl font-black text-[#0c3832]">
                  Tanya Dokter / Usulkan Topik
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
                Punya keluhan, pertanyaan mitos vs fakta kesehatan, atau ide isu yang ingin dibahas tuntas di episode podcast BAPOLES berikutnya? Tuliskan di sini!
              </p>

              {submitted ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-300 text-center space-y-2 animate-fadeIn">
                  <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h4 className="text-lg font-bold text-emerald-900">Terima Kasih Banyak!</h4>
                  <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed">
                    Pertanyaan dan usulan topik Anda telah kami terima. Tim produksi BAPOLES Dinkes NTT akan mengkaji dan menyiapkannya untuk dibahas bersama narasumber ahli di episode mendatang!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Nama Lengkap *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Maria da Silva"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-emerald-50/40 border border-emerald-200 focus:border-emerald-600 focus:bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Kabupaten / Kota di NTT
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Kota Kupang / Ende / Belu"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-emerald-50/40 border border-emerald-200 focus:border-emerald-600 focus:bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Nomor WhatsApp (Opsional)
                      </label>
                      <input
                        type="text"
                        placeholder="08..."
                        value={formData.whatsapp}
                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-emerald-50/40 border border-emerald-200 focus:border-emerald-600 focus:bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Topik Bahasan
                      </label>
                      <select
                        value={formData.topicSuggestion}
                        onChange={(e) => setFormData({ ...formData, topicSuggestion: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-emerald-50/40 border border-emerald-200 focus:border-emerald-600 focus:bg-white text-sm text-slate-800 focus:outline-none transition-colors"
                      >
                        <option value="Stunting & Gizi Anak">Stunting & Gizi Anak</option>
                        <option value="Pencegahan DBD & Malaria">Pencegahan DBD & Malaria</option>
                        <option value="Kesehatan Ibu Hamil & Balita">Kesehatan Ibu Hamil & Balita</option>
                        <option value="Gerakan Masyarakat Hidup Sehat (GERMAS)">GERMAS & Olahraga</option>
                        <option value="Kesehatan Jiwa & Stres">Kesehatan Jiwa</option>
                        <option value="Air Bersih & Jamban Sehat (STBM)">Sanitasi & Air Bersih</option>
                        <option value="Topik Lainnya">Topik Lainnya</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Pertanyaan atau Pesan Anda *
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Tuliskan pertanyaan atau cerita kesehatan yang ingin Anda ketahui jawabannya dari narasumber dokter BAPOLES..."
                      value={formData.questionText}
                      onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-emerald-50/40 border border-emerald-200 focus:border-emerald-600 focus:bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Kirim Pertanyaan ke Tim BAPOLES</span>
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

        {/* Bottom Bar / Copyright */}
        <div className="pt-8 border-t border-emerald-300/60 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <BapolesLogo size="sm" variant="icon-only" theme="light" />
            <div>
              <p className="font-bold text-slate-800">
                BAPOLES • Ba' Omong Pola Hidup Sehat
              </p>
              <p className="text-[11px] text-slate-600">
                Dinas Kesehatan Kependudukan dan Pencatatan Sipil Provinsi Nusa Tenggara Timur
              </p>
            </div>
          </div>

          <div className="text-center md:text-right text-[11px] text-slate-600">
            <p>© 2026 Dinas Kesehatan Provinsi NTT. Hak Cipta Dilindungi.</p>
            <p className="text-emerald-800 font-semibold mt-0.5">Mewujudkan Masyarakat Nusa Tenggara Timur yang Sehat & Tangguh.</p>
          </div>
        </div>

      </div>
    </footer>
  );
};
