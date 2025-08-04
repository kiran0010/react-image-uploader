import AWS from 'aws-sdk';
import { S3UploadOptions, UploadResult, UploadProgress } from '../types';
import { ImageProcessor } from '../utils/imageProcessor';

export class S3Uploader {
  private s3!: AWS.S3;
  private imageProcessor: ImageProcessor;

  constructor() {
    this.imageProcessor = new ImageProcessor();
  }

  async uploadS3(options: S3UploadOptions): Promise<UploadResult> {
    try {
      // Configure AWS
      this.s3 = new AWS.S3({
        accessKeyId: options.accessKeyId,
        secretAccessKey: options.secretAccessKey,
        region: options.region,
      });

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

      // Create upload parameters
      const uploadParams: AWS.S3.PutObjectRequest = {
        Bucket: options.bucket,
        Key: uploadPath,
        Body: processedBlob,
        ContentType: processedBlob.type,
        ACL: options.acl || 'public-read',
      };

      // Upload with progress tracking
      const upload = this.s3.upload(uploadParams);
      
      if (options.onProgress) {
        upload.on('httpUploadProgress', (progress) => {
          const uploadProgress: UploadProgress = {
            loaded: progress.loaded,
            total: progress.total,
            percentage: Math.round((progress.loaded / progress.total) * 100),
          };
          options.onProgress!(uploadProgress);
        });
      }

      const result = await upload.promise();

      // Return upload result
      const uploadResult: UploadResult = {
        url: result.Location,
        fileName,
        size: processedBlob.size,
        format: processedBlob.type.split('/')[1],
      };

      return uploadResult;
    } catch (error) {
      throw new Error(`S3 upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 