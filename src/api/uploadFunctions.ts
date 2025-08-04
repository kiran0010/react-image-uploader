import { S3Uploader } from '../uploaders/s3Uploader';
import { CloudinaryUploader } from '../uploaders/cloudinaryUploader';
import { FirebaseUploader } from '../uploaders/firebaseUploader';
import { S3UploadOptions, CloudinaryUploadOptions, FirebaseUploadOptions, UploadResult } from '../types';

// S3 Upload Function
export const uploadS3 = async (options: S3UploadOptions): Promise<UploadResult> => {
  const uploader = new S3Uploader();
  return uploader.uploadS3(options);
};

// Cloudinary Upload Function
export const uploadCloudinary = async (options: CloudinaryUploadOptions): Promise<UploadResult> => {
  const uploader = new CloudinaryUploader();
  return uploader.uploadCloudinary(options);
};

// Firebase Upload Function
export const uploadFirebase = async (options: FirebaseUploadOptions): Promise<UploadResult> => {
  const uploader = new FirebaseUploader();
  return uploader.uploadFirebase(options);
};

// Batch upload function for multiple files
export const uploadMultiple = async <T extends S3UploadOptions | CloudinaryUploadOptions | FirebaseUploadOptions>(
  uploadFunction: (options: T) => Promise<UploadResult>,
  files: (File | string)[],
  baseOptions: Omit<T, 'file'>,
  onProgress?: (fileIndex: number, progress: any) => void
): Promise<UploadResult[]> => {
  const results: UploadResult[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const options = {
      ...baseOptions,
      file,
      onProgress: onProgress ? (progress: any) => onProgress(i, progress) : undefined,
    } as T;

    try {
      const result = await uploadFunction(options);
      results.push(result);
    } catch (error) {
      console.error(`Failed to upload file ${i + 1}:`, error);
      throw error;
    }
  }

  return results;
}; 