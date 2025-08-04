export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface ImageTransformation {
  resize?: {
    width?: number;
    height?: number;
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  };
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  rotate?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp' | 'gif';
}

export interface BaseUploadOptions {
  file: File | string; // File object or image URL
  fileName?: string;
  transformations?: ImageTransformation;
  onProgress?: (progress: UploadProgress) => void;
  background?: boolean;
}

// S3 specific options
export interface S3UploadOptions extends BaseUploadOptions {
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  folder?: string;
  acl?: 'private' | 'public-read' | 'public-read-write' | 'authenticated-read';
}

// Cloudinary specific options
export interface CloudinaryUploadOptions extends BaseUploadOptions {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  folder?: string;
  publicId?: string;
}

// Firebase specific options
export interface FirebaseUploadOptions extends BaseUploadOptions {
  storageBucket: string;
  projectId: string;
  privateKey: string;
  clientEmail: string;
  folder?: string;
}

export interface UploadResult {
  url: string;
  publicId?: string;
  fileName: string;
  size: number;
  format: string;
  width?: number;
  height?: number;
}

export interface UploadError {
  message: string;
  code?: string;
  details?: any;
}

export type UploadFunction<T extends BaseUploadOptions> = (options: T) => Promise<UploadResult>; 