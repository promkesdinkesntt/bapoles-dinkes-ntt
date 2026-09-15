import { GalleryItem, PodcastEpisode } from '../types';
import { compressAndProcessImage, formatFileSize } from './imageUpload';

const DB_NAME = 'bapoles_db_v2';
const GALLERY_STORE = 'gallery_items';
const EPISODES_STORE = 'episodes_items';
const DB_VERSION = 2;

/**
 * Open or initialize the IndexedDB database
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB tidak didukung pada peramban ini.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(GALLERY_STORE)) {
        db.createObjectStore(GALLERY_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(EPISODES_STORE)) {
        db.createObjectStore(EPISODES_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Gagal membuka database galeri & episode.'));
  });
}

/**
 * Safe local storage setter that prevents QuotaExceededError and never throws
 */
export function safeSetLocalStorage(key: string, rawData: any): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const serialized = typeof rawData === 'string' ? rawData : JSON.stringify(rawData);
    localStorage.setItem(key, serialized);
    return true;
  } catch (err: any) {
    console.warn(`[Storage] Quota exceeded for key "${key}". Applying lightweight fallback:`, err);
    try {
      // If data is an array (e.g. episodes or gallery), strip heavy base64 data URLs to prevent quota crash
      const parsed = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
      if (Array.isArray(parsed)) {
        const lightweight = parsed.map((item: any) => {
          const copy = { ...item };
          if (typeof copy.imageUrl === 'string' && copy.imageUrl.startsWith('data:image')) {
            copy.imageUrl = '/images/dinkes_health_talk.jpg';
          }
          if (typeof copy.coverImage === 'string' && copy.coverImage.startsWith('data:image')) {
            copy.coverImage = '/images/podcast_studio.jpg';
          }
          return copy;
        });
        localStorage.setItem(key, JSON.stringify(lightweight));
        return true;
      }
    } catch {
      // ignore
    }
    return false;
  }
}

/**
 * Save all gallery items into IndexedDB (supports virtually unlimited photos & links)
 */
export async function saveGalleryToIndexedDB(items: GalleryItem[]): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(GALLERY_STORE, 'readwrite');
      const store = tx.objectStore(GALLERY_STORE);

      // Clear existing records first
      const clearReq = store.clear();
      clearReq.onsuccess = () => {
        items.forEach((item) => {
          store.put(item);
        });
      };

      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch (err) {
    console.warn('Fallback: Menyimpan galeri ke IndexedDB gagal:', err);
  }
}

/**
 * Load all gallery items from IndexedDB
 */
export async function loadGalleryFromIndexedDB(): Promise<GalleryItem[] | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(GALLERY_STORE, 'readonly');
      const store = tx.objectStore(GALLERY_STORE);
      const req = store.getAll();

      req.onsuccess = () => {
        db.close();
        if (Array.isArray(req.result) && req.result.length > 0) {
          resolve(req.result as GalleryItem[]);
        } else {
          resolve(null);
        }
      };

      req.onerror = () => {
        db.close();
        reject(req.error);
      };
    });
  } catch (err) {
    console.warn('Gagal membaca galeri dari IndexedDB:', err);
    return null;
  }
}

/**
 * Save all episodes into IndexedDB (supports high-res images and unconstrained sizes)
 */
export async function saveEpisodesToIndexedDB(episodes: PodcastEpisode[]): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(EPISODES_STORE, 'readwrite');
      const store = tx.objectStore(EPISODES_STORE);

      const clearReq = store.clear();
      clearReq.onsuccess = () => {
        episodes.forEach((ep) => {
          store.put(ep);
        });
      };

      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch (err) {
    console.warn('Fallback: Menyimpan episode ke IndexedDB gagal:', err);
  }
}

/**
 * Load all episodes from IndexedDB
 */
export async function loadEpisodesFromIndexedDB(): Promise<PodcastEpisode[] | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(EPISODES_STORE, 'readonly');
      const store = tx.objectStore(EPISODES_STORE);
      const req = store.getAll();

      req.onsuccess = () => {
        db.close();
        if (Array.isArray(req.result) && req.result.length > 0) {
          resolve(req.result as PodcastEpisode[]);
        } else {
          resolve(null);
        }
      };

      req.onerror = () => {
        db.close();
        reject(req.error);
      };
    });
  } catch (err) {
    console.warn('Gagal membaca episode dari IndexedDB:', err);
    return null;
  }
}

/**
 * Extract YouTube ID and thumbnail from video URL
 */
export function extractYouTubeThumbnail(url: string): { videoId: string | null; thumbnailUrl: string | null } {
  if (!url) return { videoId: null, thumbnailUrl: null };
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/|live\/)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[2] && match[2].length === 11) {
    const videoId = match[2];
    return {
      videoId,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    };
  }
  return { videoId: null, thumbnailUrl: null };
}

/**
 * Process multiple files in batch for unlimited gallery uploads
 */
export async function processBatchFiles(
  files: File[],
  defaultCategory = 'Kesehatan Masyarakat',
  onProgress?: (processed: number, total: number, currentName: string) => void
): Promise<GalleryItem[]> {
  const results: GalleryItem[] = [];
  const now = new Date();
  const dateStr = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (onProgress) {
      onProgress(i + 1, files.length, file.name);
    }

    try {
      // Compress with high quality while keeping file size small (~60-120KB)
      const compressed = await compressAndProcessImage(file, 1280, 1280, 0.82);
      
      // Clean file name to use as default title
      const cleanTitle = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]+/g, ' ')
        .trim();

      results.push({
        id: `gal-upload-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
        title: cleanTitle ? cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1) : `Dokumentasi Kegiatan ${i + 1}`,
        category: defaultCategory as any,
        imageUrl: compressed.dataUrl,
        date: dateStr,
        description: `Dokumentasi visual kegiatan BAPOLES (${compressed.sizeFormatted})`,
      });
    } catch (err) {
      console.error(`Gagal memproses foto ${file.name}:`, err);
    }
  }

  return results;
}

/**
 * Parse batch URL links (image links and/or YouTube links)
 */
export function parseBatchLinks(
  rawText: string,
  defaultCategory = 'Kesehatan Masyarakat'
): GalleryItem[] {
  const lines = rawText
    .split(/[\n,]+/)
    .map((l) => l.trim())
    .filter((l) => Boolean(l) && (l.startsWith('http://') || l.startsWith('https://')));

  const items: GalleryItem[] = [];
  const now = new Date();
  const dateStr = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  lines.forEach((url, idx) => {
    const yt = extractYouTubeThumbnail(url);
    const isYouTube = Boolean(yt.thumbnailUrl);

    let imageUrl = '';
    let youtubeUrl = '';

    if (isYouTube) {
      imageUrl = yt.thumbnailUrl!;
      youtubeUrl = url;
    } else {
      imageUrl = url;
    }

    const cleanTitle = isYouTube
      ? `Video Kegiatan BAPOLES #${idx + 1}`
      : `Foto Kegiatan BAPOLES #${idx + 1}`;

    items.push({
      id: `gal-link-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
      title: cleanTitle,
      category: defaultCategory as any,
      imageUrl,
      youtubeUrl,
      date: dateStr,
      description: isYouTube
        ? `Tautan video dokumentasi kegiatan BAPOLES di YouTube`
        : `Tautan dokumentasi foto kegiatan BAPOLES`,
    });
  });

  return items;
}
