/**
 * Opportunity Ghana - Client-Side Image Optimizer
 * 
 * Compresses and resizes images before uploading to Firebase Storage.
 * Reduces 3-8MB mobile camera photos to ~150-300KB WebP/JPEG,
 * speeding up uploads by up to 10x and dramatically improving runtime performance.
 */

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0 (default 0.82)
  targetFormat?: 'image/webp' | 'image/jpeg';
}

export interface OptimizedImageResult {
  file: File;
  previewUrl: string;
  originalSize: number;
  optimizedSize: number;
  reductionPercentage: number;
  width: number;
  height: number;
}

export async function optimizeImageForUpload(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImageResult> {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.82,
    targetFormat = 'image/webp'
  } = options;

  // If file is already tiny (less than 120KB) and valid format, create preview and return as is
  if (file.size < 120 * 1024 && (file.type === 'image/webp' || file.type === 'image/jpeg')) {
    const previewUrl = URL.createObjectURL(file);
    return {
      file,
      previewUrl,
      originalSize: file.size,
      optimizedSize: file.size,
      reductionPercentage: 0,
      width: 0,
      height: 0
    };
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('Could not read image file.'));
    };

    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => {
        reject(new Error('Invalid image data.'));
      };

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Scale down proportionally if oversized
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Canvas 2d context not available, fallback to original
          resolve({
            file,
            previewUrl: URL.createObjectURL(file),
            originalSize: file.size,
            optimizedSize: file.size,
            reductionPercentage: 0,
            width: img.width,
            height: img.height
          });
          return;
        }

        // Image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Test webp support or fallback to jpeg
        let outputFormat = targetFormat;
        const testCanvas = document.createElement('canvas');
        testCanvas.width = 1;
        testCanvas.height = 1;
        const supportsWebp = testCanvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
        if (!supportsWebp) {
          outputFormat = 'image/jpeg';
        }

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve({
                file,
                previewUrl: URL.createObjectURL(file),
                originalSize: file.size,
                optimizedSize: file.size,
                reductionPercentage: 0,
                width,
                height
              });
              return;
            }

            const extension = outputFormat === 'image/webp' ? '.webp' : '.jpg';
            const baseName = file.name.replace(/\.[^/.]+$/, '');
            const optimizedFilename = `${baseName}_optimized${extension}`;

            const optimizedFile = new File([blob], optimizedFilename, {
              type: outputFormat,
              lastModified: Date.now()
            });

            const reduction = Math.max(
              0,
              Math.round(((file.size - optimizedFile.size) / file.size) * 100)
            );

            const previewUrl = URL.createObjectURL(optimizedFile);

            resolve({
              file: optimizedFile,
              previewUrl,
              originalSize: file.size,
              optimizedSize: optimizedFile.size,
              reductionPercentage: reduction,
              width,
              height
            });
          },
          outputFormat,
          quality
        );
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
