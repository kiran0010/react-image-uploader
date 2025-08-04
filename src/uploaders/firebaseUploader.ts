import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { FirebaseUploadOptions, UploadResult, UploadProgress } from '../types';
import { ImageProcessor } from '../utils/imageProcessor';

export class FirebaseUploader {
  private imageProcessor: ImageProcessor;
  private storage: any;

  constructor() {
    this.imageProcessor = new ImageProcessor();
  }

  async uploadFirebase(options: FirebaseUploadOptions): Promise<UploadResult> {
    try {
      // Initialize Firebase
      const firebaseConfig = {
        storageBucket: options.storageBucket,
        projectId: options.projectId,
      };

      const app = initializeApp(firebaseConfig);
      this.storage = getStorage(app);

      // Process image if transformations are specified
      const processedBlob = await this.imageProcessor.processImage(
        options.file,
        options.transformations
      );

      // Generate file name
      const fileName = options.fileName || 
        this.imageProcessor.generateFileName(
          typeof options.file === 'string' ? options.file : options.file.name
        );

      // Prepare upload path
      const uploadPath = options.folder 
        ? `${options.folder}/${fileName}`
        : fileName;

      // Create storage reference
      const storageRef = ref(this.storage, uploadPath);

      // Upload with progress tracking
      const uploadTask = uploadBytesResumable(storageRef, processedBlob);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            if (options.onProgress) {
              const progress: UploadProgress = {
                loaded: snapshot.bytesTransferred,
                total: snapshot.totalBytes,
                percentage: Math.round(
                  (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                ),
              };
              options.onProgress(progress);
            }
          },
          (error) => {
            reject(new Error(`Firebase upload failed: ${error.message}`));
          },
          async () => {
            try {
              // Get download URL
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

              // Get metadata
              const metadata = uploadTask.snapshot.metadata;

              const uploadResult: UploadResult = {
                url: downloadURL,
                fileName,
                size: metadata.size,
                format: metadata.contentType?.split('/')[1] || 'unknown',
              };

              resolve(uploadResult);
            } catch (error) {
              reject(new Error(`Failed to get download URL: ${error instanceof Error ? error.message : 'Unknown error'}`));
            }
          }
        );
      });
    } catch (error) {
      throw new Error(`Firebase upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 