/**
 * Returns the file extension for a given MIME type.
 */
export function getExtensionFromMimeType(mimeType: string): string {
  switch (mimeType) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/heic':
    case 'image/heif':
      return 'jpg'; // We'll convert HEIC/HEIF to JPEG
    default:
      return 'jpg';
  }
}

/**
 * Returns a normalized filename with the correct extension.
 */
export function normalizeImageFilename(filename: string, ext: string): string {
  return filename.replace(/\.[^.]+$/, `.${ext}`);
} 