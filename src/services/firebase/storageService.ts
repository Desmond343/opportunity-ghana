import {
  getStorage,
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  FirebaseStorage
} from 'firebase/storage';
import { app, isFirebaseConfigured } from './config';
import { auth } from './authService';

export const storage: FirebaseStorage | null = (app && isFirebaseConfigured) ? getStorage(app) : null;
if (storage) {
  // Lower maximum retry time to prevent hanging for 10 minutes on unprovisioned/blocked buckets
  try {
    storage.maxUploadRetryTime = 5000;
    storage.maxOperationRetryTime = 5000;
  } catch (e) {
    console.debug('[Storage] Custom retry config ignored:', e);
  }
}

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Please choose a valid JPG, PNG, or WebP image under 5 MB.'
    };
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      valid: false,
      error: 'Image must be 5 MB or smaller.'
    };
  }
  return { valid: true };
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase();
}

/**
 * Robust upload engine that sends files to the backend endpoint with real-time byte progress events
 */
async function uploadViaServer(
  entityType: 'opportunities' | 'resources' | 'users' | 'public',
  entityId: string,
  file: File,
  onProgress?: (progressPercent: number) => void
): Promise<{ imageUrl: string; imagePath: string }> {
  // Check offline capability
  if (typeof window !== 'undefined' && !window.navigator.onLine) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (onProgress) onProgress(100);
        resolve({
          imageUrl: reader.result as string,
          imagePath: `local_${entityType}/${entityId}/${Date.now()}_${sanitizeFilename(file.name)}`
        });
      };
      reader.onerror = () => reject(new Error('Failed to read image file in offline mode.'));
      reader.readAsDataURL(file);
    });
  }

  // Retrieve Firebase Auth ID Token if user is currently signed in
  let token: string | null = null;
  try {
    if (auth?.currentUser) {
      token = await auth.currentUser.getIdToken();
    }
  } catch (err) {
    console.warn('[Opportunity Ghana Storage] ID token retrieval skipped:', err);
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload');

    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    // Capture REAL-TIME upload progress from the browser's XMLHttpRequest upload channel
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0 && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        // Cap intermediate progress at 99% until server finishes writing to disk
        onProgress(Math.min(percent, 99));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.success && response.imageUrl) {
            if (onProgress) onProgress(100);
            resolve({
              imageUrl: response.imageUrl,
              imagePath: response.imagePath
            });
          } else {
            reject(new Error(response.error || 'Server rejected file upload.'));
          }
        } catch (e) {
          reject(new Error('Unexpected response format from image upload service.'));
        }
      } else {
        let errorMsg = "We couldn't upload this photo. Please try again.";
        try {
          const parsed = JSON.parse(xhr.responseText);
          if (parsed.error) errorMsg = parsed.error;
        } catch {}
        reject(new Error(errorMsg));
      }
    };

    xhr.onerror = () => {
      console.error('[Opportunity Ghana Storage] Network failure during upload');
      reject(new Error('Network error during photo upload. Please check your connection and try again.'));
    };

    xhr.ontimeout = () => {
      console.error('[Opportunity Ghana Storage] Upload request timed out');
      reject(new Error('Photo upload timed out. Please try again.'));
    };

    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityType', entityType);
    formData.append('entityId', entityId);

    xhr.send(formData);
  });
}

export const FirebaseStorageService = {
  getStorageInstance(): FirebaseStorage | null {
    return storage;
  },

  /**
   * Uploads an opportunity photo with real-time progress reporting and reliable persistence
   */
  async uploadOpportunityPhoto(
    opportunityId: string,
    file: File,
    onProgress?: (progressPercent: number) => void
  ): Promise<{ imageUrl: string; imagePath: string }> {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid image file.');
    }

    return uploadViaServer('opportunities', opportunityId, file, onProgress);
  },

  /**
   * Uploads a resource photo with real-time progress reporting and reliable persistence
   */
  async uploadResourcePhoto(
    resourceId: string,
    file: File,
    onProgress?: (progressPercent: number) => void
  ): Promise<{ imageUrl: string; imagePath: string }> {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid image file.');
    }

    return uploadViaServer('resources', resourceId, file, onProgress);
  },

  /**
   * Safely deletes an image file from storage and server
   */
  async deleteFile(filePath?: string): Promise<void> {
    if (!filePath || filePath.startsWith('local_') || filePath.startsWith('data:')) {
      return;
    }

    // 1. Delete from local server upload if stored on disk
    try {
      let token: string | null = null;
      if (auth?.currentUser) {
        token = await auth.currentUser.getIdToken().catch(() => null);
      }

      await fetch('/api/upload', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ imagePath: filePath })
      }).catch((e) => console.warn('[Opportunity Ghana Storage] File delete notice:', e));
    } catch (err) {
      console.warn('[Opportunity Ghana Storage] Error triggering file delete:', err);
    }

    // 2. Also clean up in Firebase Storage if configured
    if (storage && isFirebaseConfigured) {
      try {
        const fileRef = ref(storage, filePath);
        await deleteObject(fileRef).catch(() => {});
      } catch {}
    }
  },

  /**
   * Uploads an applicant resume or document to the user's private folder in storage
   */
  async uploadUserDocument(
    userId: string,
    file: File | Blob,
    filename: string
  ): Promise<string> {
    const asFile = file instanceof File ? file : new File([file], filename, { type: file.type });
    const result = await uploadViaServer('users', userId, asFile);
    return result.imageUrl;
  },

  /**
   * Uploads an organization logo or public opportunity media asset
   */
  async uploadPublicAsset(
    file: File | Blob,
    filename: string,
    folder: 'logos' | 'banners' = 'logos'
  ): Promise<string> {
    const asFile = file instanceof File ? file : new File([file], filename, { type: file.type });
    const result = await uploadViaServer('public', folder, asFile);
    return result.imageUrl;
  }
};
