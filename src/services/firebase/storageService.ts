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

export const storage: FirebaseStorage | null = (app && isFirebaseConfigured) ? getStorage(app) : null;

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

export const FirebaseStorageService = {
  getStorageInstance(): FirebaseStorage | null {
    return storage;
  },

  /**
   * Uploads an opportunity photo with real-time progress reporting
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

    if (!storage || !isFirebaseConfigured) {
      // In offline/unconfigured mode, convert to persistent Data URL so previews and saves still work
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (onProgress) onProgress(100);
          resolve({
            imageUrl: reader.result as string,
            imagePath: `local_opportunities/${opportunityId}/${Date.now()}_${sanitizeFilename(file.name)}`
          });
        };
        reader.onerror = () => reject(new Error('Failed to read image file locally.'));
        reader.readAsDataURL(file);
      });
    }

    const cleanName = sanitizeFilename(file.name);
    const imagePath = `opportunities/${opportunityId}/${Date.now()}_${cleanName}`;
    const storageRef = ref(storage, imagePath);

    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: file.type
      });

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          if (snapshot.totalBytes > 0 && onProgress) {
            const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            onProgress(percent);
          }
        },
        (error) => {
          console.error('[Opportunity Ghana Storage] Upload failed:', error);
          reject(new Error("We couldn't upload this photo. Please try again."));
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            if (onProgress) onProgress(100);
            resolve({
              imageUrl: downloadUrl,
              imagePath
            });
          } catch (err) {
            reject(err);
          }
        }
      );
    });
  },

  /**
   * Uploads a resource photo with real-time progress reporting
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

    if (!storage || !isFirebaseConfigured) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (onProgress) onProgress(100);
          resolve({
            imageUrl: reader.result as string,
            imagePath: `local_resources/${resourceId}/${Date.now()}_${sanitizeFilename(file.name)}`
          });
        };
        reader.onerror = () => reject(new Error('Failed to read image file locally.'));
        reader.readAsDataURL(file);
      });
    }

    const cleanName = sanitizeFilename(file.name);
    const imagePath = `resources/${resourceId}/${Date.now()}_${cleanName}`;
    const storageRef = ref(storage, imagePath);

    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: file.type
      });

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          if (snapshot.totalBytes > 0 && onProgress) {
            const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            onProgress(percent);
          }
        },
        (error) => {
          console.error('[Opportunity Ghana Storage] Upload failed:', error);
          reject(new Error("We couldn't upload this photo. Please try again."));
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            if (onProgress) onProgress(100);
            resolve({
              imageUrl: downloadUrl,
              imagePath
            });
          } catch (err) {
            reject(err);
          }
        }
      );
    });
  },

  /**
   * Safely deletes a file from Firebase Storage
   */
  async deleteFile(filePath?: string): Promise<void> {
    if (!filePath || filePath.startsWith('local_') || filePath.startsWith('data:')) {
      return;
    }
    if (!storage || !isFirebaseConfigured) {
      return;
    }

    try {
      const fileRef = ref(storage, filePath);
      await deleteObject(fileRef);
    } catch (err: any) {
      if (err?.code !== 'storage/object-not-found') {
        console.warn('[Opportunity Ghana Storage] Could not delete file:', filePath, err?.message);
      }
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
    if (!storage || !isFirebaseConfigured) {
      throw new Error('Firebase Storage is currently unavailable. Please verify storage configuration.');
    }

    const cleanName = sanitizeFilename(filename);
    const storageRef = ref(storage, `users/${userId}/documents/${Date.now()}_${cleanName}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  },

  /**
   * Uploads an organization logo or public opportunity media asset
   */
  async uploadPublicAsset(
    file: File | Blob,
    filename: string,
    folder: 'logos' | 'banners' = 'logos'
  ): Promise<string> {
    if (!storage || !isFirebaseConfigured) {
      throw new Error('Firebase Storage is currently unavailable.');
    }

    const cleanName = sanitizeFilename(filename);
    const assetRef = ref(storage, `public/${folder}/${Date.now()}_${cleanName}`);
    const snapshot = await uploadBytes(assetRef, file);
    return await getDownloadURL(snapshot.ref);
  }
};
