// API Functions - Only export S3 for browser compatibility
export { uploadS3 } from './api/uploadFunctions';

// React Components
export { ImageUploader } from './components/ImageUploader';
export { UploadProgress } from './components/UploadProgress';

// Types
export type {
  UploadProgress as UploadProgressType,
  ImageTransformation,
  BaseUploadOptions,
  S3UploadOptions,
  CloudinaryUploadOptions,
  FirebaseUploadOptions,
  UploadResult,
  UploadError,
  UploadFunction,
} from './types';

// Utilities
export { ImageProcessor } from './utils/imageProcessor';

// Note: Cloudinary and Firebase uploaders are not exported by default
// to avoid Node.js dependencies in browser environments.
// If you need them, import them directly:
// import { uploadCloudinary } from 'react-image-uploader/lib/cloudinary';
// import { uploadFirebase } from 'react-image-uploader/lib/firebase'; 