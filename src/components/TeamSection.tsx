import React from 'react';
import { Users, Award, Mic, Video, Sparkles, Edit3 } from 'lucide-react';
import { TeamMember } from '../types';

interface TeamSectionProps {
  team: TeamMember[];
  onOpenEditModal?: (tab: string) => void;
}

export const TeamSection: React.FC<TeamSectionProps> = ({ team, onOpenEditModal }) => {
  return (
    <section id="tim" className="py-20 bg-transparent text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 relative">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-3 border border-emerald-300">
            <Users className="w-3.5 h-3.5 text-emerald-700" />
            <span>Keluarga Besar BAPOLES</span>
          </div>

          {onOpenEditModal && (
            <div className="inline-block ml-3">
              <button
                onClick={() => onOpenEditModal('team')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-300 shadow-2xs hover:scale-105 transition-all cursor-pointer"
                title="Kelola & Tambah Anggota Tim"
              >
                <Edit3 className="w-3 h-3 text-emerald-600" />
                <span>Edit Tim Kami</span>
              </button>
            </div>
          )}

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0c3832] tracking-tight">
            Tim Kami
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Mengenal orang-orang berdedikasi di balik layar dan di depan mikrofon Podcast BAPOLES Dinas Kesehatan Provinsi Nusa Tenggara Timur.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {team.map((member) => (
            <div
              key={member.id}
              className="group bg-white rounded-2xl border border-slate-200 hover:border-teal-400 p-6 transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col items-center text-center"
            >
              {/* Photo Avatar */}
              <div className="relative mb-5">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-teal-500/30 group-hover:border-teal-500 transition-colors shadow-md bg-slate-100">
                  <img
                    src={member.photoUrl}
                    alt={member.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#0f2b48] text-white flex items-center justify-center border-2 border-white shadow">
                  <Mic className="w-3.5 h-3.5 text-teal-300" />
                </div>
              </div>

              {/* Info */}
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                {member.name}
              </h3>
              <p className="text-xs font-bold text-teal-700 uppercase tracking-wide mt-1">
                {member.role}
              </p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {member.institution}
              </p>

              {/* Bio */}
              <p className="text-xs text-slate-600 mt-4 leading-relaxed line-clamp-3">
                {member.bio}
              </p>
            </div>
          ))}
        </div>

        {/* Callout: Ingin Kolaborasi / Jadi Narasumber */}
        <div className="mt-16 text-center max-w-2xl mx-auto p-6 rounded-2xl bg-white border border-teal-200 shadow-sm">
          <h4 className="text-base font-bold text-[#0f2b48]">
            Tertarik Menjadi Narasumber Tamu di BAPOLES?
          </h4>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Bila Anda praktisi medis, akademisi, kader posyandu inspiratif, atau penggerak kesehatan masyarakat NTT, hubungi tim produksi kami melalui WhatsApp.
          </p>
          <a
            href="#kontak"
            className="inline-block mt-4 px-5 py-2.5 rounded-xl bg-[#0f2b48] hover:bg-teal-700 text-white font-bold text-xs transition-colors"
          >
            Hubungi Tim Produksi
          </a>
        </div>

      </div>
    </section>
  );
};
