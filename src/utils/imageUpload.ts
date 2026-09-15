/**
 * Utility to process and optimize image uploads (PNG, JPG, JPEG, WebP)
 * using HTML5 Canvas to prevent localStorage QuotaExceededError and ensure fast rendering.
 */

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function compressAndProcessImage(
  file: File,
  maxWidth = 1400,
  maxHeight = 1400,
  quality = 0.85
): Promise<{ dataUrl: string; name: string; sizeFormatted: string }> {
  return new Promise((resolve, reject) => {
    // Validate image format
    const isValidExtension = /\.(jpe?g|png|webp|gif|bmp)$/i.test(file.name);
    const isImageMime = file.type.startsWith('image/');
    
    if (!isImageMime && !isValidExtension) {
      reject(new Error('Format file tidak didukung. Harap pilih file foto berupa PNG, JPG, JPEG, atau WebP.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file foto dari perangkat Anda.'));
    
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        reject(new Error('Isi file gambar kosong.'));
        return;
      }

      const img = new Image();
      img.onerror = () => reject(new Error('Gambar tidak dapat diproses oleh peramban.'));
      
      img.onload = () => {
        try {
          let { width, height } = img;
          
          // Downscale large camera photos while maintaining aspect ratio
          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            resolve({
              dataUrl: result,
              name: file.name,
              sizeFormatted: formatFileSize(file.size),
            });
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Use JPEG for best compression unless user specifically provided PNG with potential transparency
          const isPng = file.type === 'image/png' || /\.png$/i.test(file.name);
          const outputMime = isPng ? 'image/png' : 'image/jpeg';
          const compressedDataUrl = canvas.toDataURL(outputMime, isPng ? undefined : quality);

          const approxBytes = Math.round((compressedDataUrl.length * 3) / 4);

          resolve({
            dataUrl: compressedDataUrl,
            name: file.name,
            sizeFormatted: formatFileSize(approxBytes),
          });
        } catch {
          resolve({
            dataUrl: result,
            name: file.name,
            sizeFormatted: formatFileSize(file.size),
          });
        }
      };

      img.src = result;
    };

    reader.readAsDataURL(file);
  });
}
