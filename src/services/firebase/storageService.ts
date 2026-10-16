import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  FirebaseStorage
} from 'firebase/storage';
import { app, isFirebaseConfigured } from './config';
import { auth } from './authService';

export const storage: FirebaseStorage | null = (app && isFirebaseConfigured) ? getStorage(app) : null;
if (storage) {
  try {
    storage.maxUploadRetryTime = 10000;
    storage.maxOperationRetryTime = 10000;
  } catch (e) {
    console.debug('[Storage] Custom retry config note:', e);
  }
}

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/pjpeg',
  'image/x-png'
];
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No image file provided.' };
  }
  const type = (file.type || '').toLowerCase();
  const name = (file.name || '').toLowerCase();
  const hasValidExt = /\.(jpe?g|png|webp)$/i.test(name);
  const hasValidType = ALLOWED_IMAGE_TYPES.includes(type);

  if (!hasValidType && !hasValidExt) {
    return {
      valid: false,
      error: 'Please choose a valid JPG, PNG, or WebP image under 5 MB.'
    };
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      valid: false,
      error: 'Image file size must be 5 MB or smaller.'
    };
  }
  return { valid: true };
}

export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase();
}

/**
 * Upload directly to Firebase Storage via client SDK with real-time byte progress.
 * If client storage fails or is blocked, attempts authenticated server fallback to Firebase Admin Storage.
 */
async function uploadToFirebaseStorage(
  entityType: 'opportunities' | 'resources' | 'users' | 'public',
  entityId: string,
  file: File,
  onProgress?: (progressPercent: number) => void
): Promise<{ imageUrl: string; imagePath: string }> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid image file.');
  }

  const cleanName = sanitizeFilename(file.name);
  const storagePath = `${entityType}/${entityId}/${Date.now()}_${cleanName}`;

  // 1. Try Direct Client Firebase Storage upload
  if (storage && isFirebaseConfigured) {
    try {
      const storageRef = ref(storage, storagePath);
      const metadata = {
        contentType: file.type || 'image/jpeg',
        customMetadata: {
          entityType,
          entityId,
          originalName: file.name
        }
      };

      const uploadTask = uploadBytesResumable(storageRef, file, metadata);

      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            if (snapshot.totalBytes > 0 && onProgress) {
              const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              onProgress(Math.min(percent, 99));
            }
          },
          (error) => {
            console.warn('[Firebase Storage Client Upload Warning]', error.message);
            reject(error);
          },
          () => {
            if (onProgress) onProgress(100);
            resolve();
          }
        );
      });

      const imageUrl = await getDownloadURL(storageRef);
      return {
        imageUrl,
        imagePath: storagePath
      };
    } catch (clientErr: any) {
      console.warn('[Firebase Storage] Direct client upload failed, attempting backend storage upload:', clientErr.message);
    }
  }

  // 2. Server Upload to Firebase Storage fallback
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

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0 && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
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
              imagePath: response.imagePath || storagePath
            });
          } else {
            reject(new Error(response.error || 'Server rejected file upload.'));
          }
        } catch {
          reject(new Error('Unexpected response format from image upload service.'));
        }
      } else {
        let errorMsg = "Could not upload image to Firebase Storage. Please try again.";
        try {
          const parsed = JSON.parse(xhr.responseText);
          if (parsed.error) errorMsg = parsed.error;
        } catch {}
        reject(new Error(errorMsg));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error during image upload to Firebase Storage. Please check your connection.'));
    };

    xhr.ontimeout = () => {
      reject(new Error('Image upload timed out. Please try again.'));
    };

    const formData = new FormData();
    formData.append('entityType', entityType);
    formData.append('entityId', entityId);
    formData.append('storagePath', storagePath);
    formData.append('file', file);

    xhr.send(formData);
  });
}

export const FirebaseStorageService = {
  getStorageInstance(): FirebaseStorage | null {
    return storage;
  },

  /**
   * Uploads an opportunity photo to Firebase Storage with real-time progress reporting
   */
  async uploadOpportunityPhoto(
    opportunityId: string,
    file: File,
    onProgress?: (progressPercent: number) => void
  ): Promise<{ imageUrl: string; imagePath: string }> {
    return uploadToFirebaseStorage('opportunities', opportunityId, file, onProgress);
  },

  /**
   * Uploads a resource photo to Firebase Storage with real-time progress reporting
   */
  async uploadResourcePhoto(
    resourceId: string,
    file: File,
    onProgress?: (progressPercent: number) => void
  ): Promise<{ imageUrl: string; imagePath: string }> {
    return uploadToFirebaseStorage('resources', resourceId, file, onProgress);
  },

  /**
   * Safely deletes an image file from Firebase Storage
   */
  async deleteFile(filePath?: string): Promise<void> {
    if (!filePath || filePath.startsWith('data:') || filePath.startsWith('blob:')) {
      return;
    }

    // 1. Delete from Firebase Storage via client SDK
    if (storage && isFirebaseConfigured) {
      try {
        const fileRef = ref(storage, filePath);
        await deleteObject(fileRef).catch(() => {});
      } catch {}
    }

    // 2. Also notify backend cleanup
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
      }).catch(() => {});
    } catch {}
  },

  /**
   * Uploads a user applicant document to Firebase Storage
   */
  async uploadUserDocument(
    userId: string,
    file: File | Blob,
    filename: string
  ): Promise<string> {
    const asFile = file instanceof File ? file : new File([file], filename, { type: file.type });
    const result = await uploadToFirebaseStorage('users', userId, asFile);
    return result.imageUrl;
  },

  /**
   * Uploads a public media asset to Firebase Storage
   */
  async uploadPublicAsset(
    file: File | Blob,
    filename: string,
    folder: 'logos' | 'banners' = 'logos'
  ): Promise<string> {
    const asFile = file instanceof File ? file : new File([file], filename, { type: file.type });
    const result = await uploadToFirebaseStorage('public', folder, asFile);
    return result.imageUrl;
  }
};
