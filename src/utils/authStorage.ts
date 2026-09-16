export interface AdminSession {
  isLoggedIn: boolean;
  userEmail: string;
  loginMethod: 'google' | 'password';
  userName?: string;
  userAvatar?: string;
  loginTime: string;
}

const STORAGE_KEY_ADMIN_EMAILS = 'bapoles_admin_emails_v1';
const STORAGE_KEY_ADMIN_PASSWORD = 'bapoles_admin_password_v1';
const STORAGE_KEY_ADMIN_SESSION = 'bapoles_admin_session_v1';

export const DEFAULT_ADMIN_EMAIL = 'promkesdinkesntt2@gmail.com';
export const DEFAULT_ADMIN_PASSWORD = 'Bapoles2026!';

/**
 * Mendapatkan daftar email admin yang diizinkan mengakses mode edit
 */
export function getAuthorizedAdminEmails(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ADMIN_EMAILS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((e) => String(e).trim().toLowerCase());
      }
    }
  } catch (e) {
    console.error('Gagal membaca daftar admin dari storage:', e);
  }
  return [DEFAULT_ADMIN_EMAIL.toLowerCase()];
}

/**
 * Menyimpan daftar email admin yang diizinkan
 */
export function saveAuthorizedAdminEmails(emails: string[]): void {
  try {
    const cleaned = Array.from(
      new Set(
        emails
          .map((e) => e.trim().toLowerCase())
          .filter((e) => e.length > 3 && e.includes('@'))
      )
    );
    if (cleaned.length === 0) {
      cleaned.push(DEFAULT_ADMIN_EMAIL.toLowerCase());
    }
    localStorage.setItem(STORAGE_KEY_ADMIN_EMAILS, JSON.stringify(cleaned));
  } catch (e) {
    console.error('Gagal menyimpan daftar admin ke storage:', e);
  }
}

/**
 * Menambahkan email admin baru
 */
export function addAuthorizedAdminEmail(email: string): { success: boolean; message: string } {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !normalized.includes('@')) {
    return { success: false, message: 'Alamat email tidak valid.' };
  }
  const current = getAuthorizedAdminEmails();
  if (current.includes(normalized)) {
    return { success: false, message: `Email ${normalized} sudah terdaftar sebagai admin.` };
  }
  const updated = [...current, normalized];
  saveAuthorizedAdminEmails(updated);
  return { success: true, message: `Email ${normalized} berhasil ditambahkan sebagai admin!` };
}

/**
 * Menghapus email admin
 */
export function removeAuthorizedAdminEmail(email: string): { success: boolean; message: string } {
  const normalized = email.trim().toLowerCase();
  const current = getAuthorizedAdminEmails();
  if (current.length <= 1) {
    return {
      success: false,
      message: 'Minimal harus ada 1 email admin aktif untuk keamanan.',
    };
  }
  const updated = current.filter((e) => e !== normalized);
  saveAuthorizedAdminEmails(updated);
  return { success: true, message: `Email ${normalized} berhasil dihapus dari daftar admin.` };
}

/**
 * Memeriksa apakah suatu email berwenang sebagai admin
 */
export function isEmailAuthorized(email: string): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  const authorized = getAuthorizedAdminEmails();
  return authorized.includes(normalized);
}

/**
 * Mengambil kata sandi admin yang tersimpan
 */
export function getAdminPassword(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_ADMIN_PASSWORD);
    if (stored && stored.trim().length > 0) {
      return stored;
    }
  } catch (e) {
    console.error('Gagal membaca password admin:', e);
  }
  return DEFAULT_ADMIN_PASSWORD;
}

/**
 * Memperbarui kata sandi admin
 */
export function setAdminPassword(newPassword: string): { success: boolean; message: string } {
  if (!newPassword || newPassword.trim().length < 6) {
    return { success: false, message: 'Kata sandi minimal harus 6 karakter.' };
  }
  try {
    localStorage.setItem(STORAGE_KEY_ADMIN_PASSWORD, newPassword.trim());
    return { success: true, message: 'Kata sandi admin berhasil diperbarui!' };
  } catch (e) {
    console.error('Gagal menyimpan password baru:', e);
    return { success: false, message: 'Gagal menyimpan kata sandi ke browser.' };
  }
}

/**
 * Mengambil sesi admin saat ini jika masih tersimpan
 */
export function getAdminSession(): AdminSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ADMIN_SESSION);
    if (raw) {
      const session = JSON.parse(raw) as AdminSession;
      if (session && session.isLoggedIn && session.userEmail) {
        // Pastikan email masih terdaftar di daftar admin yang diizinkan
        if (isEmailAuthorized(session.userEmail)) {
          return session;
        } else {
          // Jika email sudah dicabut hak aksesnya, hapus sesi
          clearAdminSession();
          return null;
        }
      }
    }
  } catch (e) {
    console.error('Gagal membaca sesi admin:', e);
  }
  return null;
}

/**
 * Menyimpan sesi admin ke localStorage
 */
export function saveAdminSession(session: AdminSession): void {
  try {
    localStorage.setItem(STORAGE_KEY_ADMIN_SESSION, JSON.stringify(session));
  } catch (e) {
    console.error('Gagal menyimpan sesi admin:', e);
  }
}

/**
 * Menghapus sesi admin (Logout)
 */
export function clearAdminSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_ADMIN_SESSION);
  } catch (e) {
    console.error('Gagal menghapus sesi admin:', e);
  }
}

/**
 * Autentikasi dengan Email & Password
 */
export function authenticateWithPassword(
  email: string,
  passwordInput: string
): { success: boolean; error?: string; session?: AdminSession } {
  const normalizedEmail = email.trim().toLowerCase();

  // Validasi apakah email diizinkan
  if (!isEmailAuthorized(normalizedEmail)) {
    return {
      success: false,
      error: `Email "${email}" tidak memiliki hak akses admin. Harap gunakan email resmi yang terdaftar (misal: ${DEFAULT_ADMIN_EMAIL}).`,
    };
  }

  // Validasi password
  const currentPassword = getAdminPassword();
  if (passwordInput !== currentPassword) {
    return {
      success: false,
      error: 'Kata sandi salah. Silakan periksa kembali kata sandi admin Anda.',
    };
  }

  const session: AdminSession = {
    isLoggedIn: true,
    userEmail: normalizedEmail,
    userName: normalizedEmail.split('@')[0],
    loginMethod: 'password',
    loginTime: new Date().toISOString(),
  };

  saveAdminSession(session);
  return { success: true, session };
}

/**
 * Autentikasi dengan Akun Google
 */
export function authenticateWithGoogle(
  email: string,
  name?: string,
  avatar?: string
): { success: boolean; error?: string; session?: AdminSession } {
  const normalizedEmail = email.trim().toLowerCase();

  // Validasi apakah email diizinkan
  if (!isEmailAuthorized(normalizedEmail)) {
    return {
      success: false,
      error: `Akun Google "${email}" tidak terdaftar dalam daftar pengelola resmi BAPOLES Dinkes NTT. Silakan hubungi Super Admin untuk menambahkan email ini.`,
    };
  }

  const session: AdminSession = {
    isLoggedIn: true,
    userEmail: normalizedEmail,
    userName: name || normalizedEmail.split('@')[0],
    userAvatar: avatar,
    loginMethod: 'google',
    loginTime: new Date().toISOString(),
  };

  saveAdminSession(session);
  return { success: true, session };
}
