import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Video, Bell, BellRing, Check, User, Radio, ExternalLink, Sparkles, Edit3 } from 'lucide-react';
import { PodcastSchedule } from '../types';

interface ScheduleSectionProps {
  schedules: PodcastSchedule[];
  onOpenEditModal?: (tab: string) => void;
}

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({ schedules, onOpenEditModal }) => {
  const [reminders, setReminders] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toggleReminder = (id: string, title: string) => {
    const nextState = !reminders[id];
    setReminders((prev) => ({ ...prev, [id]: nextState }));
    
    if (nextState) {
      setToastMessage(`Pengingat disetel untuk "${title}"! Kami akan ingatkan sebelum siaran.`);
    } else {
      setToastMessage(`Pengingat dibatalkan.`);
    }

    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  return (
    <section id="jadwal" className="py-20 bg-transparent text-slate-900 relative">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-24 right-4 z-50 bg-[#0f2b48] text-white text-xs sm:text-sm px-4 py-3 rounded-xl shadow-2xl border border-teal-400/40 flex items-center gap-2 animate-bounce">
          <BellRing className="w-4 h-4 text-teal-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 relative">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-3 border border-emerald-300">
            <CalendarIcon className="w-3.5 h-3.5 text-emerald-700" />
            <span>Jadwal Siaran Langsung</span>
          </div>

          {onOpenEditModal && (
            <div className="inline-block ml-3">
              <button
                onClick={() => onOpenEditModal('schedules')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-300 shadow-2xs hover:scale-105 transition-all cursor-pointer"
                title="Kelola & Tambah Jadwal Podcast"
              >
                <Edit3 className="w-3 h-3 text-emerald-600" />
                <span>Edit Jadwal Podcast</span>
              </button>
            </div>
          )}

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0c3832] tracking-tight">
            Jadwal Podcast BAPOLES
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Ikuti siaran live interaktif setiap Kamis pukul 15.00 WITA. Anda bisa bertanya langsung kepada narasumber melalui kolom komentar live chat!
          </p>
        </div>

        {/* Schedule List */}
        <div className="space-y-6 max-w-4xl mx-auto">
          {schedules.map((item, index) => {
            const hasReminder = !!reminders[item.id];

            return (
              <div
                key={item.id}
                className="group relative bg-slate-50 hover:bg-white rounded-2xl border border-slate-200 hover:border-teal-400/60 p-6 sm:p-8 transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Left: Date badge & time */}
                <div className="flex sm:flex-col items-center sm:items-start justify-between sm:justify-center border-b sm:border-b-0 sm:border-r border-slate-200 pb-4 sm:pb-0 sm:pr-8 min-w-[200px]">
                  <div className="flex items-center gap-2 text-teal-700 font-extrabold text-sm uppercase">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span>
                    <span>{item.date.split(',')[0] || 'Kamis'}</span>
                  </div>
                  <p className="text-lg font-black text-slate-900 mt-1">
                    {item.date.split(',')[1] || item.date}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    <span className="font-semibold">{item.time}</span>
                  </div>
                  <div className="mt-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-teal-50 text-teal-800 text-[11px] font-bold border border-teal-200">
                      <Radio className="w-3 h-3 text-teal-600" />
                      <span>{item.platform}</span>
                    </span>
                  </div>
                </div>

                {/* Center: Topic & Speaker */}
                <div className="flex-1">
                  <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
                    Topik Bahasan:
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-teal-800 transition-colors mt-0.5">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                    {item.topic}
                  </p>

                  <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 shadow-xs">
                    <div className="w-8 h-8 rounded-full bg-[#0f2b48] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{item.guestName}</p>
                      <p className="text-[11px] text-slate-500">{item.guestRole}</p>
                    </div>
                  </div>
                </div>

                {/* Right: Reminder & Watch Live Button */}
                <div className="flex sm:flex-col items-center gap-3 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                  <button
                    onClick={() => toggleReminder(item.id, item.title)}
                    className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      hasReminder
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                    }`}
                  >
                    {hasReminder ? (
                      <>
                        <BellRing className="w-4 h-4 text-emerald-600" />
                        <span>Pengingat Aktif</span>
                      </>
                    ) : (
                      <>
                        <Bell className="w-4 h-4 text-slate-500" />
                        <span>Ingatkan Saya</span>
                      </>
                    )}
                  </button>

                  <a
                    href={item.streamUrl || 'https://www.youtube.com/@dinkesntt'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#0f2b48] hover:bg-teal-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Video className="w-4 h-4 text-teal-300" />
                    <span>Tonton Siaran</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

              </div>
            );
          })}
        </div>

        {/* Banner Note for interactive community */}
        <div className="mt-12 max-w-4xl mx-auto p-5 rounded-2xl bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Ingin Mengusulkan Topik Diskusi atau Pertanyaan?</p>
              <p className="text-xs text-slate-600">Kirimkan pertanyaan Anda melalui form kontak di bawah atau via WhatsApp!</p>
            </div>
          </div>
          <a
            href="#kontak"
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors whitespace-nowrap"
          >
            Kirim Pertanyaan
          </a>
        </div>

      </div>
    </section>
  );
};
