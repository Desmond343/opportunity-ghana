/**
 * Client-Side Image Optimizer and WebP Compressor
 * Significantly reduces image payload before upload to Firebase Storage or local persistence,
 * preventing UI thread lag, mobile data overuse, and storage bloat.
 */

export interface OptimizeImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
  convertToWebP?: boolean;
}

export interface OptimizationResult {
  file: File;
  previewUrl: string;
  originalSizeBytes: number;
  optimizedSizeBytes: number;
  savingsPercent: number;
  dimensions: {
    width: number;
    height: number;
  };
}

/**
 * Optimizes an image File using an offscreen HTML Canvas.
 * Automatically downscales large dimensions (max 1600x1200 by default)
 * and recompresses to WebP (with fallback to JPEG).
 */
export async function optimizeImageFile(
  file: File,
  options: OptimizeImageOptions = {}
): Promise<OptimizationResult> {
  const {
    maxWidth = 1600,
    maxHeight = 1200,
    quality = 0.82,
    convertToWebP = true
  } = options;

  const originalSizeBytes = file.size;

  // If already a tiny SVG or already small WebP under 120KB, return as-is
  if (file.type === 'image/svg+xml' || (file.size < 120 * 1024 && file.type === 'image/webp')) {
    const previewUrl = URL.createObjectURL(file);
    return {
      file,
      previewUrl,
      originalSizeBytes,
      optimizedSizeBytes: originalSizeBytes,
      savingsPercent: 0,
      dimensions: { width: 800, height: 600 }
    };
  }

  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let targetWidth = img.naturalWidth || img.width;
      let targetHeight = img.naturalHeight || img.height;

      // Calculate constrained aspect ratio
      if (targetWidth > maxWidth || targetHeight > maxHeight) {
        const ratio = Math.min(maxWidth / targetWidth, maxHeight / targetHeight);
        targetWidth = Math.round(targetWidth * ratio);
        targetHeight = Math.round(targetHeight * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) {
        reject(new Error('Canvas 2D context could not be created.'));
        return;
      }

      // High-quality image rendering smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Determine target MIME type
      const targetMimeType = convertToWebP ? 'image/webp' : (file.type || 'image/jpeg');
      const baseFilename = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      const extension = convertToWebP ? 'webp' : (file.name.split('.').pop() || 'jpg');
      const newFilename = `${baseFilename}.${extension}`;

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Image optimization failed during blob conversion.'));
            return;
          }

          // If optimized file is somehow larger than original (rare), use original
          if (blob.size >= originalSizeBytes && file.size < 2 * 1024 * 1024) {
            const previewUrl = URL.createObjectURL(file);
            resolve({
              file,
              previewUrl,
              originalSizeBytes,
              optimizedSizeBytes: originalSizeBytes,
              savingsPercent: 0,
              dimensions: { width: targetWidth, height: targetHeight }
            });
            return;
          }

          const optimizedFile = new File([blob], newFilename, {
            type: targetMimeType,
            lastModified: Date.now()
          });

          const optimizedSizeBytes = optimizedFile.size;
          const savingsPercent = Math.max(
            0,
            Math.round(((originalSizeBytes - optimizedSizeBytes) / originalSizeBytes) * 100)
          );

          const previewUrl = URL.createObjectURL(optimizedFile);

          resolve({
            file: optimizedFile,
            previewUrl,
            originalSizeBytes,
            optimizedSizeBytes,
            savingsPercent,
            dimensions: { width: targetWidth, height: targetHeight }
          });
        },
        targetMimeType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image for optimization. Please check file format.'));
    };

    img.src = objectUrl;
  });
}

/**
 * Format bytes into human readable KB / MB
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
