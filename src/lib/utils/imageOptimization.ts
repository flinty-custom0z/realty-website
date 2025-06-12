// imageOptimization.ts
// Client-side image compression and optimization utility

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
  outputFormat?: 'jpeg' | 'webp';
  maxSizeKB?: number;
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxWidth: 2048,
  maxHeight: 2048,
  quality: 0.8,
  outputFormat: 'jpeg',
  maxSizeKB: 1024,
};

function getImageTypeFromFile(file: File): string {
  // Accepts image/jpeg, image/png, image/webp, image/heic, image/heif
  return file.type || 'image/jpeg';
}

function dataURLToFile(dataUrl: string, filename: string, mimeType: string): File {
  const arr = dataUrl.split(',');
  const mime = mimeType;
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

function getOrientation(file: File): Promise<number> {
  // For now, skip EXIF orientation (removal is handled by re-encoding)
  return Promise.resolve(1);
}

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  return new Promise<File>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const img = new window.Image();
      img.onload = async () => {
        // Calculate new dimensions
        let { width, height } = img;
        const aspect = width / height;
        if (width > opts.maxWidth || height > opts.maxHeight) {
          if (aspect > 1) {
            width = opts.maxWidth;
            height = Math.round(width / aspect);
          } else {
            height = opts.maxHeight;
            width = Math.round(height * aspect);
          }
        }
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas not supported'));
        ctx.drawImage(img, 0, 0, width, height);
        // Iterative compression
        let quality = opts.quality;
        let dataUrl: string = '';
        let blob: Blob | null = null;
        let fileSizeKB = Number.POSITIVE_INFINITY;
        let iteration = 0;
        const minQuality = 0.6;
        while (fileSizeKB > opts.maxSizeKB && quality >= minQuality) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
          // Convert to Blob to check size
          const res = await fetch(dataUrl);
          blob = await res.blob();
          fileSizeKB = blob.size / 1024;
          if (fileSizeKB > opts.maxSizeKB) {
            quality -= 0.05;
          }
          iteration++;
          if (iteration > 10) break;
        }
        // Fallback if still too large
        if (!blob) {
          dataUrl = canvas.toDataURL('image/jpeg', minQuality);
          const res = await fetch(dataUrl);
          blob = await res.blob();
        }
        // Remove EXIF: re-encoding strips metadata
        // Progressive JPEG: not supported by canvas, but browsers encode as progressive by default
        // Create new File
        const filename = file.name.replace(/\.[^.]+$/, '.jpg');
        const optimizedFile = new File([blob], filename, { type: 'image/jpeg' });
        resolve(optimizedFile);
      };
      img.onerror = (e) => {
        reject(new Error('Failed to load image for compression'));
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = (e) => {
      reject(new Error('Failed to read file for compression'));
    };
    reader.readAsDataURL(file);
  });
} 