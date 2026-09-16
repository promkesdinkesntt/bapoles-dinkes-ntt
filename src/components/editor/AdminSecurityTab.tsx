import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Key, 
  Mail, 
  Plus, 
  Trash2, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  Lock,
  Eye,
  EyeOff,
  UserCheck
} from 'lucide-react';
import { 
  getAuthorizedAdminEmails, 
  addAuthorizedAdminEmail, 
  removeAuthorizedAdminEmail, 
  setAdminPassword,
  getAdminPassword,
  AdminSession
} from '../../utils/authStorage';

interface AdminSecurityTabProps {
  currentSession: AdminSession | null;
  onLogout: () => void;
  showToast: (msg: string) => void;
}

export const AdminSecurityTab: React.FC<AdminSecurityTabProps> = ({
  currentSession,
  onLogout,
  showToast,
}) => {
  // Admin emails list
  const [adminEmails, setAdminEmails] = useState<string[]>(() => getAuthorizedAdminEmails());
  const [newEmailInput, setNewEmailInput] = useState<string>('');

  // Password change state
  const [currentPasswordInput, setCurrentPasswordInput] = useState<string>('');
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  // Email add/remove
  const handleAddEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmailInput.trim()) return;

    const result = addAuthorizedAdminEmail(newEmailInput);
    if (result.success) {
      setAdminEmails(getAuthorizedAdminEmails());
      setNewEmailInput('');
      showToast(result.message);
    } else {
      showToast(`Gagal: ${result.message}`);
    }
  };

  const handleRemoveEmail = (email: string) => {
    if (confirm(`Yakin ingin mencabut hak akses admin untuk "${email}"?`)) {
      const result = removeAuthorizedAdminEmail(email);
      if (result.success) {
        setAdminEmails(getAuthorizedAdminEmails());
        showToast(result.message);
      } else {
        alert(result.message);
      }
    }
  };

  // Password change submit
  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);

    const actualCurrent = getAdminPassword();
    if (currentPasswordInput !== actualCurrent) {
      setPasswordFeedback({
        type: 'error',
        message: 'Kata sandi saat ini tidak cocok. Silakan periksa kembali.',
      });
      return;
    }

    if (newPasswordInput.length < 6) {
      setPasswordFeedback({
        type: 'error',
        message: 'Kata sandi baru minimal harus 6 karakter.',
      });
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordFeedback({
        type: 'error',
        message: 'Konfirmasi kata sandi tidak cocok dengan kata sandi baru.',
      });
      return;
    }

    const result = setAdminPassword(newPasswordInput);
    if (result.success) {
      setPasswordFeedback({
        type: 'success',
        message: 'Kata sandi admin berhasil diganti! Gunakan sandi baru ini untuk login berikutnya.',
      });
      setCurrentPasswordInput('');
      newPasswordInput;
      setNewPasswordInput('');
      setConfirmPasswordInput('');
      showToast('Kata sandi admin berhasil diperbarui!');
    } else {
      setPasswordFeedback({
        type: 'error',
        message: result.message,
      });
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* 1. Sesi Login Saat Ini */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-900 to-[#10355c] text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-400 text-slate-950 flex items-center justify-center font-bold shadow-md flex-shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-white text-base">Sesi Admin Aktif</h4>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-xs text-emerald-200 font-mono mt-0.5">
              {currentSession?.userEmail || 'promkesdinkesntt2@gmail.com'}
            </p>
            <div className="text-[11px] text-teal-200/80 mt-1 flex items-center gap-2">
              <span>Metode: <strong className="uppercase">{currentSession?.loginMethod || 'Admin'}</strong></span>
              <span>•</span>
              <span>Hak Akses: Penuh (Editor Website)</span>
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar dari Sesi</span>
        </button>
      </div>

      {/* 2. Kelola Daftar Email Admin (Hak Akses) */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <Mail className="w-5 h-5 text-teal-700" />
          <div>
            <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
              Daftar Email Admin yang Diizinkan
            </h4>
            <p className="text-xs text-slate-500">
              Hanya akun dengan email di bawah ini yang dapat login ke mode edit.
            </p>
          </div>
        </div>

        {/* List of allowed emails */}
        <div className="space-y-2">
          {adminEmails.map((email) => {
            const isCurrentUser = currentSession?.userEmail?.toLowerCase() === email.toLowerCase();
            return (
              <div
                key={email}
                className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-mono text-xs font-bold text-slate-800">{email}</span>
                  {isCurrentUser && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Anda Saat Ini
                    </span>
                  )}
                </div>

                {adminEmails.length > 1 && (
                  <button
                    onClick={() => handleRemoveEmail(email)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    title={`Hapus ${email}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Email Form */}
        <form onSubmit={handleAddEmail} className="pt-2 flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            required
            placeholder="Tambah email admin baru (cth: staf.promkes@gmail.com)"
            value={newEmailInput}
            onChange={(e) => setNewEmailInput(e.target.value)}
            className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-teal-600 focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Admin</span>
          </button>
        </form>
      </div>

      {/* 3. Ganti Kata Sandi Master Admin */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <Lock className="w-5 h-5 text-teal-700" />
          <div>
            <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
              Ubah Kata Sandi Cadangan Admin
            </h4>
            <p className="text-xs text-slate-500">
              Ganti kata sandi bawaan sementara untuk meningkatkan keamanan.
            </p>
          </div>
        </div>

        {passwordFeedback && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
              passwordFeedback.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {passwordFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="leading-relaxed">{passwordFeedback.message}</div>
          </div>
        )}

        <form onSubmit={handleChangePasswordSubmit} className="space-y-3.5 max-w-lg">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Kata Sandi Saat Ini *
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={currentPasswordInput}
              onChange={(e) => setCurrentPasswordInput(e.target.value)}
              placeholder="Masukkan sandi lama..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-teal-600 focus:outline-none font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kata Sandi Baru *
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPasswordInput}
                onChange={(e) => setNewPasswordInput(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-teal-600 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ulangi Sandi Baru *
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPasswordInput}
                onChange={(e) => setConfirmPasswordInput(e.target.value)}
                placeholder="Ketik ulang sandi baru"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-teal-600 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showPassword ? 'Sembunyikan' : 'Tampilkan'} karakter</span>
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white font-bold text-xs cursor-pointer shadow-xs"
            >
              Perbarui Kata Sandi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
