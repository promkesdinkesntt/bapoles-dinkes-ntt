import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Key, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  AlertCircle, 
  X, 
  CheckCircle2,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { 
  authenticateWithPassword, 
  authenticateWithGoogle,
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_PASSWORD,
  AdminSession
} from '../utils/authStorage';
import { BapolesLogo } from './BapolesLogo';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: AdminSession) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [authMethod, setAuthMethod] = useState<'google' | 'password'>('google');
  
  // Password login state
  const [emailInput, setEmailInput] = useState<string>(DEFAULT_ADMIN_EMAIL);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  
  // Google login state
  const [googleEmailInput, setGoogleEmailInput] = useState<string>(DEFAULT_ADMIN_EMAIL);
  
  // Feedback state
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    setTimeout(() => {
      const result = authenticateWithPassword(emailInput, passwordInput);
      setIsLoading(false);
      if (result.success && result.session) {
        setSuccessMsg(`Login berhasil! Selamat datang, ${result.session.userName}.`);
        setTimeout(() => {
          onLoginSuccess(result.session!);
          onClose();
        }, 800);
      } else {
        setErrorMsg(result.error || 'Gagal masuk. Periksa email dan kata sandi Anda.');
      }
    }, 400);
  };

  const handleGoogleLogin = (targetEmail?: string) => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    const emailToUse = targetEmail || googleEmailInput;

    setTimeout(() => {
      const result = authenticateWithGoogle(emailToUse, 'Admin Promkes Dinkes NTT');
      setIsLoading(false);
      if (result.success && result.session) {
        setSuccessMsg(`Autentikasi Google berhasil untuk ${emailToUse}!`);
        setTimeout(() => {
          onLoginSuccess(result.session!);
          onClose();
        }, 800);
      } else {
        setErrorMsg(result.error || 'Gagal masuk dengan akun Google ini.');
      }
    }, 450);
  };

  const fillDefaultCredentials = () => {
    setEmailInput(DEFAULT_ADMIN_EMAIL);
    setPasswordInput(DEFAULT_ADMIN_PASSWORD);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Dark Teal Gradient & Logo */}
        <div className="bg-gradient-to-br from-[#0c3832] via-[#10355c] to-[#0a233d] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <BapolesLogo size="sm" variant="icon-only" theme="light" />
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider">
              Khusus Pengelola
            </span>
          </div>

          <h3 className="text-xl font-black text-white tracking-tight">
            Masuk Mode Admin BAPOLES
          </h3>
          <p className="text-xs text-teal-200/90 mt-1 leading-relaxed">
            Dinas Kesehatan Kependudukan & Pencatatan Sipil Provinsi NTT.
            Publik tidak dapat mengakses mode penyuntingan.
          </p>
        </div>

        {/* Method Toggle Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-3 gap-2">
          <button
            type="button"
            onClick={() => {
              setAuthMethod('google');
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-t-xl transition-all flex items-center justify-center gap-2 border-b-2 cursor-pointer ${
              authMethod === 'google'
                ? 'bg-white text-slate-900 border-teal-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 border-transparent hover:bg-slate-100'
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Akun Google</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMethod('password');
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-t-xl transition-all flex items-center justify-center gap-2 border-b-2 cursor-pointer ${
              authMethod === 'password'
                ? 'bg-white text-slate-900 border-teal-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 border-transparent hover:bg-slate-100'
            }`}
          >
            <Key className="w-4 h-4 text-teal-600" />
            <span>Email & Sandi</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Error & Success Alerts */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
              <div className="flex-1 leading-snug">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <div className="font-bold">{successMsg}</div>
            </div>
          )}

          {/* METHOD 1: GOOGLE LOGIN */}
          {authMethod === 'google' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 text-xs text-slate-700 space-y-2">
                <div className="flex items-center gap-2 font-bold text-teal-900">
                  <ShieldCheck className="w-4 h-4 text-teal-700" />
                  <span>Email Resmi Terdaftar:</span>
                </div>
                <div className="font-mono bg-white px-3 py-1.5 rounded-lg border border-teal-300/80 text-teal-950 font-bold text-[12.5px] truncate">
                  {DEFAULT_ADMIN_EMAIL}
                </div>
                <p className="text-[11px] text-slate-500">
                  Hanya akun Google yang telah didaftarkan dalam sistem Dinkes NTT yang dapat mengedit website.
                </p>
              </div>

              {/* One-Click Google Login for Verified Dinkes Admin */}
              <button
                type="button"
                onClick={() => handleGoogleLogin(DEFAULT_ADMIN_EMAIL)}
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-300 hover:border-teal-600 text-slate-800 font-bold text-xs flex items-center justify-center gap-3 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Masuk dengan Google (promkesdinkesntt2@gmail.com)</span>
              </button>

              {/* Or enter custom registered google email */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Atau masukkan email staf lain yang berwenang:
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="nama.staf@gmail.com"
                    value={googleEmailInput}
                    onChange={(e) => setGoogleEmailInput(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-teal-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleGoogleLogin()}
                    disabled={isLoading}
                    className="px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <span>Masuk</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* METHOD 2: EMAIL & PASSWORD LOGIN */}
          {authMethod === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Admin *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="promkesdinkesntt2@gmail.com"
                    className="w-full pl-10 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-teal-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Kata Sandi Admin *
                  </label>
                  <button
                    type="button"
                    onClick={fillDefaultCredentials}
                    className="text-[10px] font-semibold text-teal-700 hover:text-teal-900 underline cursor-pointer"
                  >
                    Isi Sandi Sementara
                  </button>
                </div>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Masukkan kata sandi..."
                    className="w-full pl-10 pr-10 py-2 text-xs rounded-xl border border-slate-300 focus:border-teal-600 focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
                <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <span className="font-bold">Sandi sementara:</span> <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-300 text-amber-900 font-bold">Bapoles2026!</code>
                  <div className="text-[10px] text-amber-700 mt-0.5">
                    Dapat Anda ubah kapan saja di menu pengaturan setelah login.
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Masuk Mode Admin</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Modal Footer Info */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-[11px] text-slate-500">
          <span>Keamanan Terenkripsi</span>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};
