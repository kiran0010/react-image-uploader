import { S3Uploader } from '../uploaders/s3Uploader';
import { S3UploadOptions, UploadResult } from '../types';

// S3 Upload Function
export const uploadS3 = async (options: S3UploadOptions): Promise<UploadResult> => {
  const uploader = new S3Uploader();
  return uploader.uploadS3(options);
}; 