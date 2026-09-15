import { BapolesCategory, GalleryItem, PodcastEpisode, BAPOLES_CATEGORIES, FILTER_CATEGORIES } from '../types';

export { BAPOLES_CATEGORIES, FILTER_CATEGORIES };

/**
 * Normalizes any category string (including old/legacy ones) into one of the 9 official BAPOLES categories.
 */
export function normalizeCategory(
  category?: string,
  title?: string,
  desc?: string
): BapolesCategory {
  const catLower = (category || '').toLowerCase().trim();
  const textContext = `${catLower} ${(title || '').toLowerCase()} ${(desc || '').toLowerCase()}`;

  // 1. Check exact match with official categories first
  const exactMatch = BAPOLES_CATEGORIES.find(
    (c) => c.toLowerCase() === catLower
  );
  if (exactMatch) return exactMatch;

  // 2. Intelligent keyword detection
  if (textContext.includes('laboratorium') || textContext.includes('labkesda') || textContext.includes('lab')) {
    return 'Laboratorium Kesehatan';
  }

  if (
    textContext.includes('rskd') ||
    textContext.includes('jiwa') ||
    textContext.includes('naimata') ||
    textContext.includes('mental') ||
    textContext.includes('psikiatri')
  ) {
    return 'RSKD Jiwa Naimata';
  }

  if (
    textContext.includes('pelatihan') ||
    textContext.includes('diklat') ||
    textContext.includes('workshop nakes') ||
    textContext.includes('bapelkes')
  ) {
    return 'Pelatihan Tenaga Kesehatan';
  }

  if (
    textContext.includes('tenaga kesehatan') ||
    textContext.includes('nakes') ||
    textContext.includes('skp') ||
    textContext.includes('bidan') ||
    textContext.includes('dokter spesialis') ||
    textContext.includes('perawat') ||
    textContext.includes('sanitarian') ||
    textContext.includes('praktisi')
  ) {
    return 'Tenaga Kesehatan';
  }

  if (
    textContext.includes('dbd') ||
    textContext.includes('malaria') ||
    textContext.includes('menular') ||
    textContext.includes('pencegahan') ||
    textContext.includes('pengendalian') ||
    textContext.includes('cancer') ||
    textContext.includes('kanker') ||
    textContext.includes('hiv') ||
    textContext.includes('tbc') ||
    textContext.includes('tb ') ||
    textContext.includes('imunisasi') ||
    textContext.includes('vaksin')
  ) {
    return 'Pencegahan dan Pengendalian Penyakit';
  }

  if (
    textContext.includes('pelayanan') ||
    textContext.includes('puskesmas') ||
    textContext.includes('rsud') ||
    textContext.includes('rumah sakit') ||
    textContext.includes('anc') ||
    textContext.includes('ibu & anak') ||
    textContext.includes('ibu dan anak') ||
    textContext.includes('kehamilan') ||
    textContext.includes('persalinan')
  ) {
    return 'Pelayanan Kesehatan';
  }

  if (
    textContext.includes('sekretariat') ||
    textContext.includes('sekertariat') ||
    textContext.includes('tata usaha') ||
    textContext.includes('behind the scenes') ||
    textContext.includes('studio bapoles') ||
    textContext.includes('bts') ||
    textContext.includes('manajemen')
  ) {
    return 'Sekertariat';
  }

  if (
    textContext.includes('mitra') ||
    textContext.includes('unicef') ||
    textContext.includes('who') ||
    textContext.includes('ngo') ||
    textContext.includes('lembaga') ||
    textContext.includes('sponsor')
  ) {
    return 'Mitra';
  }

  if (
    textContext.includes('stunting') ||
    textContext.includes('gizi') ||
    textContext.includes('germas') ||
    textContext.includes('marungga') ||
    textContext.includes('kelor') ||
    textContext.includes('posyandu') ||
    textContext.includes('gaya hidup') ||
    textContext.includes('edukasi komunitas') ||
    textContext.includes('sosialisasi') ||
    textContext.includes('masyarakat')
  ) {
    return 'Kesehatan Masyarakat';
  }

  return 'Kesehatan Masyarakat';
}

/**
 * Extracts speaker name and role from title/description if not explicitly set.
 */
function extractSpeakerInfo(item: GalleryItem): { name: string; role: string } {
  const text = `${item.title} ${item.description}`;
  
  const bersamaMatch = text.match(/bersama\s+([^,.\n]+)(?:,\s*([^.\n]+))?/i);
  if (bersamaMatch) {
    const name = bersamaMatch[1]?.trim();
    const role = bersamaMatch[2]?.trim() || 'Narasumber Tamu BAPOLES';
    if (name && name.length > 3) {
      return { name, role };
    }
  }

  if (text.toLowerCase().includes('laboratorium')) {
    return {
      name: 'Kepala UPTD Labkesda Provinsi NTT',
      role: 'UPTD Laboratorium Kesehatan Provinsi NTT',
    };
  }

  if (text.toLowerCase().includes('skp') || text.toLowerCase().includes('nakes')) {
    return {
      name: 'Justin M. Thobias, SKM, M.Kes',
      role: 'Koordinator Pelayanan & SDM Kesehatan',
    };
  }

  if (text.toLowerCase().includes('cancer') || text.toLowerCase().includes('kanker')) {
    return {
      name: 'Tim Onkologi & Promkes Dinkes NTT',
      role: 'Pakar Pencegahan Penyakit Tidak Menular',
    };
  }

  return {
    name: 'Tim BAPOLES Dinkes NTT',
    role: normalizeCategory(item.category, item.title, item.description),
  };
}

/**
 * Synchronizes Podcast Episodes with Gallery Items.
 * When gallery items are added, edited, or deleted, this ensures that:
 * 1. Every gallery item with podcast video / information is represented as an Episode in Daftar Episode.
 * 2. Any edits to gallery items (title, category, date, image, youtubeUrl, description) immediately reflect on the episode.
 * 3. Deleted gallery items have their corresponding synced episode removed.
 * 4. Categories are normalized to the 9 official BAPOLES categories.
 */
export function syncEpisodesWithGallery(
  currentEpisodes: PodcastEpisode[],
  currentGallery: GalleryItem[]
): PodcastEpisode[] {
  // Normalize existing episodes categories first
  const updatedEpisodes: PodcastEpisode[] = currentEpisodes.map((ep) => ({
    ...ep,
    category: normalizeCategory(ep.category, ep.title, ep.description),
  }));

  // Track gallery IDs in current gallery
  const activeGalleryIds = new Set(currentGallery.map((g) => g.id));

  // For every gallery item, find or create the corresponding episode
  currentGallery.forEach((gItem) => {
    const normCategory = normalizeCategory(gItem.category, gItem.title, gItem.description);
    const existingIndex = updatedEpisodes.findIndex(
      (ep) =>
        ep.galleryId === gItem.id ||
        ep.id === gItem.id ||
        ep.id === `ep-${gItem.id}` ||
        ep.title.trim().toLowerCase() === gItem.title.trim().toLowerCase()
    );

    if (existingIndex >= 0) {
      // Update existing episode with latest gallery data
      const existing = updatedEpisodes[existingIndex];
      updatedEpisodes[existingIndex] = {
        ...existing,
        galleryId: gItem.id,
        title: gItem.title,
        category: normCategory,
        date: gItem.date || existing.date,
        coverImage: gItem.imageUrl || existing.coverImage,
        description: gItem.description || existing.description,
        youtubeUrl: gItem.youtubeUrl || existing.youtubeUrl,
      };
    } else {
      // Only auto-create an episode if it has a youtube link or represents a podcast episode
      const isPodcastItem =
        Boolean(gItem.youtubeUrl) ||
        gItem.title.toLowerCase().includes('podcast') ||
        gItem.title.toLowerCase().includes('episode') ||
        gItem.title.toLowerCase().includes('bicara') ||
        gItem.title.toLowerCase().includes('bapoles') ||
        gItem.title.toLowerCase().includes('cerita') ||
        gItem.title.toLowerCase().includes('kupas') ||
        gItem.title.toLowerCase().includes('skp');

      // Only auto-create a podcast episode if it has a youtube video or represents a podcast episode
      if (isPodcastItem) {
        const speakerInfo = extractSpeakerInfo(gItem);
        const newEp: PodcastEpisode = {
          id: `ep-${gItem.id}`,
          galleryId: gItem.id,
          episodeNumber: updatedEpisodes.length + 1,
          title: gItem.title,
          category: normCategory,
          date: gItem.date || '2026',
          duration: '38 Menit',
          speakerName: speakerInfo.name,
          speakerRole: speakerInfo.role,
          coverImage: gItem.imageUrl || '/images/podcast_studio.jpg',
          description: gItem.description || `Liputan dan rekaman podcast BAPOLES: ${gItem.title}`,
          youtubeUrl: gItem.youtubeUrl || 'https://www.youtube.com/@dinkesntt',
          audioUrl: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg',
          listensCount: Math.floor(800 + Math.random() * 600),
          featured: Boolean(gItem.youtubeUrl),
        };
        // Add new podcast episode to the top of episodes
        updatedEpisodes.unshift(newEp);
      }
    }
  });

  // Remove episodes that were tied to a galleryId that was deleted from gallery
  const filtered = updatedEpisodes.filter((ep) => {
    if (ep.galleryId && !activeGalleryIds.has(ep.galleryId)) {
      return false;
    }
    return true;
  });

  // Re-index episode numbers so they remain neat and sequential (#1, #2, ...)
  return filtered.map((ep, idx) => ({
    ...ep,
    episodeNumber: idx + 1,
  }));
}
