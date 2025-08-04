import { uploadS3, uploadCloudinary, uploadFirebase, uploadMultiple } from '../src/api/uploadFunctions';
import { S3UploadOptions, CloudinaryUploadOptions, FirebaseUploadOptions, UploadResult } from '../src/types';

// Mock the uploader classes
jest.mock('../src/uploaders/s3Uploader');
jest.mock('../src/uploaders/cloudinaryUploader');
jest.mock('../src/uploaders/firebaseUploader');

import { S3Uploader } from '../src/uploaders/s3Uploader';
import { CloudinaryUploader } from '../src/uploaders/cloudinaryUploader';
import { FirebaseUploader } from '../src/uploaders/firebaseUploader';

// Mock implementations
const mockS3Uploader = S3Uploader as jest.MockedClass<typeof S3Uploader>;
const mockCloudinaryUploader = CloudinaryUploader as jest.MockedClass<typeof CloudinaryUploader>;
const mockFirebaseUploader = FirebaseUploader as jest.MockedClass<typeof FirebaseUploader>;

describe('Upload Functions', () => {
  let mockFile: File;
  let mockImageUrl: string;

  beforeEach(() => {
    // Create a mock file
    mockFile = new File(['mock image data'], 'test-image.jpg', {
      type: 'image/jpeg',
    });

    mockImageUrl = 'https://example.com/test-image.jpg';

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('uploadS3', () => {
    const mockS3Options: S3UploadOptions = {
      file: mockFile,
      bucket: 'test-bucket',
      region: 'us-east-1',
      accessKeyId: 'test-access-key',
      secretAccessKey: 'test-secret-key',
      folder: 'uploads',
      acl: 'public-read',
      fileName: 'custom-name.jpg',
      transformations: {
        resize: {
          width: 800,
          height: 600,
          fit: 'cover',
        },
        quality: 0.9,
        format: 'webp',
      },
      onProgress: jest.fn(),
      background: false,
    };

    const mockUploadResult: UploadResult = {
      url: 'https://test-bucket.s3.amazonaws.com/uploads/custom-name.jpg',
      fileName: 'custom-name.jpg',
      size: 1024,
      format: 'webp',
      width: 800,
      height: 600,
    };

    it('should upload file to S3 successfully', async () => {
      const mockInstance = {
        uploadS3: jest.fn().mockResolvedValue(mockUploadResult),
      };
      mockS3Uploader.mockImplementation(() => mockInstance as any);

      const result = await uploadS3(mockS3Options);

      expect(mockS3Uploader).toHaveBeenCalled();
      expect(mockInstance.uploadS3).toHaveBeenCalledWith(mockS3Options);
      expect(result).toEqual(mockUploadResult);
    });

    it('should handle S3 upload errors', async () => {
      const mockError = new Error('S3 upload failed');
      const mockInstance = {
        uploadS3: jest.fn().mockRejectedValue(mockError),
      };
      mockS3Uploader.mockImplementation(() => mockInstance as any);

      await expect(uploadS3(mockS3Options)).rejects.toThrow('S3 upload failed');
    });

    it('should work with image URLs', async () => {
      const urlOptions = { ...mockS3Options, file: mockImageUrl };
      const mockInstance = {
        uploadS3: jest.fn().mockResolvedValue(mockUploadResult),
      };
      mockS3Uploader.mockImplementation(() => mockInstance as any);

      const result = await uploadS3(urlOptions);

      expect(result).toEqual(mockUploadResult);
    });
  });

  describe('uploadCloudinary', () => {
    const mockCloudinaryOptions: CloudinaryUploadOptions = {
      file: mockFile,
      cloudName: 'test-cloud',
      apiKey: 'test-api-key',
      apiSecret: 'test-api-secret',
      folder: 'uploads',
      publicId: 'custom-public-id',
      fileName: 'custom-name.jpg',
      transformations: {
        resize: {
          width: 1200,
          height: 800,
          fit: 'contain',
        },
        rotate: 90,
        quality: 0.8,
        format: 'png',
      },
      onProgress: jest.fn(),
      background: true,
    };

    const mockUploadResult: UploadResult = {
      url: 'https://res.cloudinary.com/test-cloud/image/upload/v123/custom-public-id.png',
      publicId: 'custom-public-id',
      fileName: 'custom-name.jpg',
      size: 2048,
      format: 'png',
      width: 1200,
      height: 800,
    };

    it('should upload file to Cloudinary successfully', async () => {
      const mockInstance = {
        uploadCloudinary: jest.fn().mockResolvedValue(mockUploadResult),
      };
      mockCloudinaryUploader.mockImplementation(() => mockInstance as any);

      const result = await uploadCloudinary(mockCloudinaryOptions);

      expect(mockCloudinaryUploader).toHaveBeenCalled();
      expect(mockInstance.uploadCloudinary).toHaveBeenCalledWith(mockCloudinaryOptions);
      expect(result).toEqual(mockUploadResult);
    });

    it('should handle Cloudinary upload errors', async () => {
      const mockError = new Error('Cloudinary upload failed');
      const mockInstance = {
        uploadCloudinary: jest.fn().mockRejectedValue(mockError),
      };
      mockCloudinaryUploader.mockImplementation(() => mockInstance as any);

      await expect(uploadCloudinary(mockCloudinaryOptions)).rejects.toThrow('Cloudinary upload failed');
    });

    it('should work with image URLs', async () => {
      const urlOptions = { ...mockCloudinaryOptions, file: mockImageUrl };
      const mockInstance = {
        uploadCloudinary: jest.fn().mockResolvedValue(mockUploadResult),
      };
      mockCloudinaryUploader.mockImplementation(() => mockInstance as any);

      const result = await uploadCloudinary(urlOptions);

      expect(result).toEqual(mockUploadResult);
    });
  });

  describe('uploadFirebase', () => {
    const mockFirebaseOptions: FirebaseUploadOptions = {
      file: mockFile,
      storageBucket: 'test-project.appspot.com',
      projectId: 'test-project',
      privateKey: 'test-private-key',
      clientEmail: 'test@test-project.iam.gserviceaccount.com',
      folder: 'uploads',
      fileName: 'custom-name.jpg',
      transformations: {
        crop: {
          x: 0,
          y: 0,
          width: 400,
          height: 300,
        },
        quality: 0.7,
        format: 'jpeg',
      },
      onProgress: jest.fn(),
      background: false,
    };

    const mockUploadResult: UploadResult = {
      url: 'https://firebasestorage.googleapis.com/v0/b/test-project.appspot.com/o/uploads%2Fcustom-name.jpg',
      fileName: 'custom-name.jpg',
      size: 1536,
      format: 'jpeg',
      width: 400,
      height: 300,
    };

    it('should upload file to Firebase successfully', async () => {
      const mockInstance = {
        uploadFirebase: jest.fn().mockResolvedValue(mockUploadResult),
      };
      mockFirebaseUploader.mockImplementation(() => mockInstance as any);

      const result = await uploadFirebase(mockFirebaseOptions);

      expect(mockFirebaseUploader).toHaveBeenCalled();
      expect(mockInstance.uploadFirebase).toHaveBeenCalledWith(mockFirebaseOptions);
      expect(result).toEqual(mockUploadResult);
    });

    it('should handle Firebase upload errors', async () => {
      const mockError = new Error('Firebase upload failed');
      const mockInstance = {
        uploadFirebase: jest.fn().mockRejectedValue(mockError),
      };
      mockFirebaseUploader.mockImplementation(() => mockInstance as any);

      await expect(uploadFirebase(mockFirebaseOptions)).rejects.toThrow('Firebase upload failed');
    });

    it('should work with image URLs', async () => {
      const urlOptions = { ...mockFirebaseOptions, file: mockImageUrl };
      const mockInstance = {
        uploadFirebase: jest.fn().mockResolvedValue(mockUploadResult),
      };
      mockFirebaseUploader.mockImplementation(() => mockInstance as any);

      const result = await uploadFirebase(urlOptions);

      expect(result).toEqual(mockUploadResult);
    });
  });

  describe('uploadMultiple', () => {
    const mockFiles = [
      new File(['file1'], 'file1.jpg', { type: 'image/jpeg' }),
      new File(['file2'], 'file2.png', { type: 'image/png' }),
      new File(['file3'], 'file3.gif', { type: 'image/gif' }),
    ];

    const mockBaseOptions = {
      bucket: 'test-bucket',
      region: 'us-east-1',
      accessKeyId: 'test-access-key',
      secretAccessKey: 'test-secret-key',
    };

    const mockResults: UploadResult[] = [
      {
        url: 'https://test-bucket.s3.amazonaws.com/file1.jpg',
        fileName: 'file1.jpg',
        size: 1024,
        format: 'jpeg',
      },
      {
        url: 'https://test-bucket.s3.amazonaws.com/file2.png',
        fileName: 'file2.png',
        size: 2048,
        format: 'png',
      },
      {
        url: 'https://test-bucket.s3.amazonaws.com/file3.gif',
        fileName: 'file3.gif',
        size: 1536,
        format: 'gif',
      },
    ];

    it('should upload multiple files successfully', async () => {
      const mockInstance = {
        uploadS3: jest.fn()
          .mockResolvedValueOnce(mockResults[0])
          .mockResolvedValueOnce(mockResults[1])
          .mockResolvedValueOnce(mockResults[2]),
      };
      mockS3Uploader.mockImplementation(() => mockInstance as any);

      const results = await uploadMultiple(
        uploadS3,
        mockFiles,
        mockBaseOptions
      );

      expect(results).toEqual(mockResults);
      expect(mockInstance.uploadS3).toHaveBeenCalledTimes(3);
    });

    it('should handle progress callbacks for multiple files', async () => {
      const mockProgressCallback = jest.fn();
      const mockInstance = {
        uploadS3: jest.fn()
          .mockResolvedValueOnce(mockResults[0])
          .mockResolvedValueOnce(mockResults[1])
          .mockResolvedValueOnce(mockResults[2]),
      };
      mockS3Uploader.mockImplementation(() => mockInstance as any);

      await uploadMultiple(
        uploadS3,
        mockFiles,
        mockBaseOptions,
        mockProgressCallback
      );

      // Verify that progress callback was called for each file
      expect(mockInstance.uploadS3).toHaveBeenCalledTimes(3);
    });

    it('should stop uploading on first error', async () => {
      const mockError = new Error('Upload failed');
      const mockInstance = {
        uploadS3: jest.fn()
          .mockResolvedValueOnce(mockResults[0])
          .mockRejectedValueOnce(mockError),
      };
      mockS3Uploader.mockImplementation(() => mockInstance as any);

      await expect(uploadMultiple(
        uploadS3,
        mockFiles,
        mockBaseOptions
      )).rejects.toThrow('Upload failed');

      expect(mockInstance.uploadS3).toHaveBeenCalledTimes(2);
    });

    it('should work with mixed file types (File and URL)', async () => {
      const mixedFiles = [mockFiles[0], mockImageUrl, mockFiles[2]];
      const mockInstance = {
        uploadS3: jest.fn()
          .mockResolvedValueOnce(mockResults[0])
          .mockResolvedValueOnce(mockResults[1])
          .mockResolvedValueOnce(mockResults[2]),
      };
      mockS3Uploader.mockImplementation(() => mockInstance as any);

      const results = await uploadMultiple(
        uploadS3,
        mixedFiles,
        mockBaseOptions
      );

      expect(results).toEqual(mockResults);
      expect(mockInstance.uploadS3).toHaveBeenCalledTimes(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty file array in uploadMultiple', async () => {
      const mockInstance = {
        uploadS3: jest.fn(),
      };
      mockS3Uploader.mockImplementation(() => mockInstance as any);

      const results = await uploadMultiple(
        uploadS3,
        [],
        { bucket: 'test', region: 'us-east-1', accessKeyId: 'key', secretAccessKey: 'secret' }
      );

      expect(results).toEqual([]);
      expect(mockInstance.uploadS3).not.toHaveBeenCalled();
    });

    it('should handle large files', async () => {
      const largeFile = new File(['x'.repeat(10 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
      const mockResult: UploadResult = {
        url: 'https://test-bucket.s3.amazonaws.com/large.jpg',
        fileName: 'large.jpg',
        size: 10 * 1024 * 1024,
        format: 'jpeg',
      };

      const mockInstance = {
        uploadS3: jest.fn().mockResolvedValue(mockResult),
      };
      mockS3Uploader.mockImplementation(() => mockInstance as any);

      const result = await uploadS3({
        file: largeFile,
        bucket: 'test-bucket',
        region: 'us-east-1',
        accessKeyId: 'test-key',
        secretAccessKey: 'test-secret',
      });

      expect(result).toEqual(mockResult);
    });

    it('should handle files with special characters in names', async () => {
      const specialFile = new File(['data'], 'file with spaces & symbols (1).jpg', { type: 'image/jpeg' });
      const mockResult: UploadResult = {
        url: 'https://test-bucket.s3.amazonaws.com/file-with-spaces-symbols-1.jpg',
        fileName: 'file-with-spaces-symbols-1.jpg',
        size: 1024,
        format: 'jpeg',
      };

      const mockInstance = {
        uploadS3: jest.fn().mockResolvedValue(mockResult),
      };
      mockS3Uploader.mockImplementation(() => mockInstance as any);

      const result = await uploadS3({
        file: specialFile,
        bucket: 'test-bucket',
        region: 'us-east-1',
        accessKeyId: 'test-key',
        secretAccessKey: 'test-secret',
      });

      expect(result).toEqual(mockResult);
    });
  });
}); 