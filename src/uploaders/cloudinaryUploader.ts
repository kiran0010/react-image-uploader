import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryUploadOptions, UploadResult, UploadProgress } from '../types';
import { ImageProcessor } from '../utils/imageProcessor';

export class CloudinaryUploader {
  private imageProcessor: ImageProcessor;

  constructor() {
    this.imageProcessor = new ImageProcessor();
  }

  async uploadCloudinary(options: CloudinaryUploadOptions): Promise<UploadResult> {
    try {
      // Configure Cloudinary
      cloudinary.config({
        cloud_name: options.cloudName,
        api_key: options.apiKey,
        api_secret: options.apiSecret,
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

      // Prepare upload options
      const uploadOptions: any = {
        public_id: options.publicId || fileName.replace(/\.[^/.]+$/, ''),
        folder: options.folder,
        resource_type: 'image',
      };

      // Convert blob to base64 for Cloudinary
      const base64Data = await this.blobToBase64(processedBlob);
      const dataURI = `data:${processedBlob.type};base64,${base64Data}`;

      // Upload with progress tracking
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              reject(new Error(`Cloudinary upload failed: ${error.message}`));
              return;
            }

            if (!result) {
              reject(new Error('Cloudinary upload failed: No result returned'));
              return;
            }

            const uploadResult: UploadResult = {
              url: result.secure_url,
              publicId: result.public_id,
              fileName,
              size: result.bytes,
              format: result.format,
              width: result.width,
              height: result.height,
            };

            resolve(uploadResult);
          }
        );

        // Simulate progress for Cloudinary (since it doesn't provide progress events)
        if (options.onProgress) {
          this.simulateProgress(options.onProgress, processedBlob.size);
        }

        // Write the data to the upload stream
        const reader = new FileReader();
        reader.onload = () => {
          const arrayBuffer = reader.result as ArrayBuffer;
          const uint8Array = new Uint8Array(arrayBuffer);
          uploadStream.write(uint8Array);
          uploadStream.end();
        };
        reader.readAsArrayBuffer(processedBlob);
      });
    } catch (error) {
      throw new Error(`Cloudinary upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private simulateProgress(
    onProgress: (progress: UploadProgress) => void,
    totalSize: number
  ) {
    let loaded = 0;
    const interval = setInterval(() => {
      loaded += Math.random() * (totalSize * 0.1);
      if (loaded >= totalSize) {
        loaded = totalSize;
        clearInterval(interval);
      }
      
      onProgress({
        loaded: Math.floor(loaded),
        total: totalSize,
        percentage: Math.round((loaded / totalSize) * 100),
      });
    }, 100);
  }
} 