import React, { useRef, useState, useEffect } from 'react';
import { Image, Upload, Trash2, AlertCircle, Check, Loader2, Sparkles } from 'lucide-react';
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from '../../services/firebase/storageService';
import { optimizeImageFile, formatBytes, OptimizationResult } from '../../utils/imageOptimizer';

interface ImageUploadFieldProps {
  label: string;
  currentImageUrl?: string;
  onFileSelect: (file: File | null) => void;
  onRemoveCurrent: () => void;
  uploadProgress?: number | null;
  isRemoved?: boolean;
  disabled?: boolean;
  helpText?: string;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  currentImageUrl,
  onFileSelect,
  onRemoveCurrent,
  uploadProgress,
  isRemoved = false,
  disabled = false,
  helpText
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const [optStats, setOptStats] = useState<{ original: number; optimized: number; savings: number } | null>(null);

  // Revoke object URL on unmount or when preview changes to avoid memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidationError(null);
    setOptStats(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const rawFile = files[0];

    // Validate MIME type
    if (!ALLOWED_IMAGE_TYPES.includes(rawFile.type)) {
      setValidationError('Please choose a valid JPG, PNG, or WebP image under 5 MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate size (5 MB max)
    if (rawFile.size > MAX_IMAGE_SIZE_BYTES) {
      setValidationError('Image must be 5 MB or smaller.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      setOptimizing(true);
      // Client-side high performance compression: downscale & convert to WebP
      const optResult: OptimizationResult = await optimizeImageFile(rawFile, {
        maxWidth: 1600,
        maxHeight: 1200,
        quality: 0.82,
        convertToWebP: true
      });

      // Clean up previous blob preview if any
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }

      setPreviewUrl(optResult.previewUrl);
      setSelectedFileName(optResult.file.name);
      if (optResult.savingsPercent > 5) {
        setOptStats({
          original: optResult.originalSizeBytes,
          optimized: optResult.optimizedSizeBytes,
          savings: optResult.savingsPercent
        });
      }

      onFileSelect(optResult.file);
    } catch (err: any) {
      console.warn('Image client optimization fallback:', err);
      // Fallback: pass raw file if canvas fails
      const fallbackUrl = URL.createObjectURL(rawFile);
      setPreviewUrl(fallbackUrl);
      setSelectedFileName(rawFile.name);
      onFileSelect(rawFile);
    } finally {
      setOptimizing(false);
    }
  };

  const handleRemove = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFileName(null);
    setValidationError(null);
    setOptStats(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileSelect(null);
    onRemoveCurrent();
  };

  const activeDisplayUrl = previewUrl || (!isRemoved ? currentImageUrl : null);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label
          htmlFor="image-upload-input"
          className="text-xs font-bold text-slate-700 flex items-center gap-1.5"
        >
          <Image className="w-3.5 h-3.5 text-slate-500" />
          <span>{label}</span>
          <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
        </label>
        {activeDisplayUrl && (
          <span className="text-[11px] font-medium text-emerald-700 flex items-center gap-1">
            <Check className="w-3 h-3" />
            <span>Image attached</span>
          </span>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        id="image-upload-input"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        disabled={disabled || optimizing || (uploadProgress !== null && uploadProgress !== undefined && uploadProgress > 0)}
        className="sr-only"
        aria-label={`Upload ${label}`}
      />

      {/* Image Preview Box */}
      <div className="relative w-full rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 overflow-hidden flex flex-col items-center justify-center min-h-[160px] p-4 transition-colors">
        {optimizing ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-2 text-slate-600">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            <p className="text-xs font-semibold">Optimizing and compressing image for fast loading...</p>
          </div>
        ) : activeDisplayUrl ? (
          <div className="w-full space-y-3">
            <div className="relative w-full h-44 sm:h-52 rounded-xl overflow-hidden bg-slate-900/5 border border-slate-200 flex items-center justify-center">
              <img
                src={activeDisplayUrl}
                alt={`${label} preview`}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-xs text-white text-[10px] font-medium">
                {selectedFileName ? `New: ${selectedFileName}` : 'Currently Saved Photo'}
              </div>
            </div>

            {/* Optimization Savings Badge */}
            {optStats && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  Compressed by {optStats.savings}% ({formatBytes(optStats.original)} → {formatBytes(optStats.optimized)}) for faster mobile browsing.
                </span>
              </div>
            )}

            {/* Action buttons when image exists */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Replace Photo</span>
              </button>

              <button
                type="button"
                onClick={handleRemove}
                disabled={disabled}
                className="px-3.5 py-1.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Remove Photo</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-2.5 py-4">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto text-slate-400 shadow-2xs">
              <Image className="w-6 h-6 text-slate-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">Add an optional banner or photo</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {helpText || 'Displays on public listing cards and detailed view pages'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold rounded-xl inline-flex items-center gap-2 shadow-2xs transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <Upload className="w-3.5 h-3.5 text-slate-600" />
              <span>Choose Photo</span>
            </button>
          </div>
        )}
      </div>

      {/* Progress Bar (Visible during active upload) */}
      {uploadProgress !== null && uploadProgress !== undefined && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-900">
            <span className="flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
              <span>Uploading photo...</span>
            </span>
            <span className="font-mono font-bold text-emerald-800">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-emerald-200/80 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.max(uploadProgress, 5)}%` }}
            />
          </div>
        </div>
      )}

      {/* Validation Error Message */}
      {validationError && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Format and Size Hint */}
      <p className="text-[10px] text-slate-400">
        Supported: JPG, JPEG, PNG, WebP • Maximum size: 5 MB • Automatically optimized for high-speed delivery
      </p>
    </div>
  );
};
