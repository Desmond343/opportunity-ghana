import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  FirebaseStorage
} from 'firebase/storage';
import { app, isFirebaseConfigured, firebaseConfig } from './config';

export const storage: FirebaseStorage | null = (app && isFirebaseConfigured) ? getStorage(app) : null;

export const FirebaseStorageService = {
  getStorageInstance(): FirebaseStorage | null {
    return storage;
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
      console.info('[Opportunity Ghana] In local demo mode: simulating document upload for', filename);
      return `https://example.com/demo-storage/users/${userId}/${encodeURIComponent(filename)}`;
    }

    const storageRef = ref(storage, `users/${userId}/documents/${Date.now()}_${filename}`);
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
      return `https://example.com/demo-storage/public/${folder}/${encodeURIComponent(filename)}`;
    }

    const assetRef = ref(storage, `public/${folder}/${Date.now()}_${filename}`);
    const snapshot = await uploadBytes(assetRef, file);
    return await getDownloadURL(snapshot.ref);
  }
};
