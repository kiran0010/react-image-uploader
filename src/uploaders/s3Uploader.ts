import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { S3UploadOptions, UploadResult, UploadProgress } from '../types';
import { ImageProcessor } from '../utils/imageProcessor';

export class S3Uploader {
  private s3Client!: S3Client;
  private imageProcessor: ImageProcessor;

  constructor() {
    this.imageProcessor = new ImageProcessor();
  }

  async uploadS3(options: S3UploadOptions): Promise<UploadResult> {
    try {
      // Configure AWS SDK v3
      const awsConfig: any = {
        credentials: {
          accessKeyId: options.accessKeyId,
          secretAccessKey: options.secretAccessKey,
        },
        region: options.region,
      };

      // Add session token if provided (for temporary credentials)
      if ((options as any).sessionToken) {
        awsConfig.credentials.sessionToken = (options as any).sessionToken;
      }

      this.s3Client = new S3Client(awsConfig);

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

      // Convert blob to buffer for better compatibility
      const arrayBuffer = await processedBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Create upload command without ACL (modern S3 buckets don't allow ACLs)
      const uploadCommand = new PutObjectCommand({
        Bucket: options.bucket,
        Key: uploadPath,
        Body: uint8Array,
        ContentType: processedBlob.type,
      });

      // Upload file
      const result = await this.s3Client.send(uploadCommand);

      // Generate the URL (S3 v3 doesn't return Location in the same way)
      const url = `https://${options.bucket}.s3.${options.region}.amazonaws.com/${uploadPath}`;

      // Return upload result
      const uploadResult: UploadResult = {
        url,
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