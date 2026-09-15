import React from 'react';
import { Info, ShieldCheck, HeartPulse, Sparkles, Award, Users, Compass, Edit3 } from 'lucide-react';
import { BapolesLogo } from './BapolesLogo';
import { SiteConfig } from '../types';

interface AboutSectionProps {
  siteConfig: SiteConfig;
  onOpenEditModal?: (tab: string) => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ siteConfig, onOpenEditModal }) => {
  const about = siteConfig.aboutData || {
    badge: 'Mengenal BAPOLES',
    title: 'Tentang Podcast BAPOLES Dinkes NTT',
    subtitle: 'Inovasi komunikasi publik dari Dinas Kesehatan Provinsi Nusa Tenggara Timur untuk mewujudkan masyarakat NTT yang sehat, bugar, dan berdaya melalui obrolan santai namun berbobot.',
    philosophyTitle: 'Filosofi "Ba\' Omong Pola Hidup Sehat"',
    philosophyP1: 'Dalam dialek Kupang dan bahasa keseharian masyarakat NTT, kata "Ba\' Omong" bermakna bercakap-cakap atau berdiskusi dengan hangat, akrab, dan tanpa jarak.',
    philosophyP2: 'Melalui BAPOLES, Dinas Kesehatan Provinsi NTT ingin mengubah paradigma penyuluhan kesehatan yang formal menjadi obrolan interaktif yang menyenangkan. Topik kesehatan yang rumit disederhanakan agar mudah dipahami oleh mama-mama, bapa-bapa, dan generasi muda di seluruh pelosok desa dan kota di NTT.',
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

  return (
    <section id="tentang" className="py-20 bg-transparent text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 relative">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-3 border border-emerald-300">
            <Info className="w-3.5 h-3.5 text-emerald-700" />
            <span>{about.badge}</span>
          </div>

          {onOpenEditModal && (
            <div className="inline-block ml-3">
              <button
                onClick={() => onOpenEditModal('about')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-300 shadow-2xs hover:scale-105 transition-all cursor-pointer"
                title="Edit Teks & Makna Lambang Bagian Tentang"
              >
                <Edit3 className="w-3 h-3 text-emerald-600" />
                <span>Edit Bagian Tentang</span>
              </button>
            </div>
          )}

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0c3832] tracking-tight mt-1">
            {about.title}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
            {about.subtitle}
          </p>
        </div>

        {/* 2 Column: Philosophy & Logo Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          {/* Left Column: Meaning & Story */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-2xl bg-white/95 border border-emerald-200/90 shadow-xs">
              <h3 className="text-xl font-black text-[#0c3832] flex items-center gap-2">
                <span className="w-2.5 h-6 bg-emerald-600 rounded-full inline-block"></span>
                <span>{about.philosophyTitle}</span>
              </h3>
              <p className="text-slate-700 text-sm sm:text-base mt-3 leading-relaxed">
                {about.philosophyP1}
              </p>
              <p className="text-slate-700 text-sm sm:text-base mt-3 leading-relaxed">
                {about.philosophyP2}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(siteConfig.aboutPillarsList && siteConfig.aboutPillarsList.length > 0 ? siteConfig.aboutPillarsList : [
                { id: 'ap-1', title: about.pillar1Title, desc: about.pillar1Desc },
                { id: 'ap-2', title: about.pillar2Title, desc: about.pillar2Desc },
              ]).map((pillar, idx) => (
                <div key={pillar.id || idx} className="p-4 rounded-xl bg-white/90 border border-emerald-200 shadow-2xs">
                  <div className={`w-9 h-9 rounded-lg ${idx % 2 === 0 ? 'bg-emerald-600' : 'bg-[#0c3832]'} text-white flex items-center justify-center mb-2`}>
                    {idx % 2 === 0 ? <ShieldCheck className="w-5 h-5" /> : <Compass className="w-5 h-5" />}
                  </div>
                  <h4 className="font-bold text-emerald-950 text-sm">{pillar.title}</h4>
                  <p className="text-xs text-emerald-800 mt-1">
                    {pillar.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Visual Logo Showcase with Tenun Accent */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-8 rounded-3xl bg-gradient-to-b from-[#0c3832] to-[#072420] text-white relative shadow-2xl overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <img
                src={siteConfig.bannerImageUrl || "/images/tenun_ntt_banner.jpg"}
                alt="Tenun Ikat NTT Background"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <BapolesLogo size="lg" variant="full" />
              <div className="mt-4 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
                Lambang Resmi BAPOLES
              </div>
              <p className="text-xs text-slate-300 mt-2 max-w-xs">
                Perpaduan Mikrofon Penyiaran, Siluet Komodo, Palang Medis (+), Denyut Nadi Sehat, dan Tenun Ikat NTT.
              </p>
            </div>
          </div>
        </div>

        {/* Logo Symbolism Cards */}
        <div className="border-t border-emerald-200/80 pt-12">
          <h3 className="text-xl font-bold text-center text-[#0c3832] mb-8">
            {about.logoSectionTitle}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(siteConfig.aboutLogoSymbolsList && siteConfig.aboutLogoSymbolsList.length > 0 ? siteConfig.aboutLogoSymbolsList : [
              { id: 'ls-1', title: about.symbol1Title, desc: about.symbol1Desc, iconType: 'mic' },
              { id: 'ls-2', title: about.symbol2Title, desc: about.symbol2Desc, iconType: 'shield' },
              { id: 'ls-3', title: about.symbol3Title, desc: about.symbol3Desc, iconType: 'cross' },
              { id: 'ls-4', title: about.symbol4Title, desc: about.symbol4Desc, iconType: 'heartbeat' },
            ]).map((symbol, sIdx) => {
              const icons = ['🎙️', '🦎', '➕', '📈', '✨', '🩺', '💡', '🌟'];
              const iconChar = icons[sIdx % icons.length];
              return (
                <div key={symbol.id || sIdx} className="p-5 rounded-2xl bg-white/95 border border-emerald-200 hover:border-emerald-500 transition-all shadow-2xs">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold mb-3 text-lg">
                    {iconChar}
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{symbol.title}</h4>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {symbol.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
