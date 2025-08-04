import React, { useState, useCallback, useRef } from 'react';
import { UploadProgress } from './UploadProgress';
import { uploadS3, uploadCloudinary, uploadFirebase } from '../api/uploadFunctions';
import { S3UploadOptions, CloudinaryUploadOptions, FirebaseUploadOptions, UploadResult, UploadProgress as UploadProgressType } from '../types';

type UploadFunctionType = 's3' | 'cloudinary' | 'firebase';

interface ImageUploaderProps {
  uploadType: UploadFunctionType;
  uploadOptions: S3UploadOptions | CloudinaryUploadOptions | FirebaseUploadOptions;
  onUploadComplete?: (result: UploadResult) => void;
  onUploadError?: (error: Error) => void;
  multiple?: boolean;
  accept?: string;
  maxSize?: number; // in bytes
  showPreview?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  uploadType,
  uploadOptions,
  onUploadComplete,
  onUploadError,
  multiple = false,
  accept = 'image/*',
  maxSize,
  showPreview = true,
  className = '',
  children,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgressType | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadResult[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files);
    
    // Validate files
    for (const file of fileArray) {
      if (maxSize && file.size > maxSize) {
        onUploadError?.(new Error(`File ${file.name} is too large. Maximum size is ${formatBytes(maxSize)}`));
        return;
      }
    }

    // Create preview URLs
    if (showPreview) {
      const urls = fileArray.map(file => URL.createObjectURL(file));
      setPreviewUrls(urls);
    }

    setIsUploading(true);
    setProgress({ loaded: 0, total: 0, percentage: 0 });

    try {
      const results: UploadResult[] = [];

      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        const options = {
          ...uploadOptions,
          file,
          onProgress: (progress: UploadProgressType) => {
            setProgress(progress);
          },
        };

        let result: UploadResult;

        switch (uploadType) {
          case 's3':
            result = await uploadS3(options as S3UploadOptions);
            break;
          case 'cloudinary':
            result = await uploadCloudinary(options as CloudinaryUploadOptions);
            break;
          case 'firebase':
            result = await uploadFirebase(options as FirebaseUploadOptions);
            break;
          default:
            throw new Error(`Unsupported upload type: ${uploadType}`);
        }

        results.push(result);
        onUploadComplete?.(result);
      }

      setUploadedFiles(prev => [...prev, ...results]);
    } catch (error) {
      onUploadError?.(error instanceof Error ? error : new Error('Upload failed'));
    } finally {
      setIsUploading(false);
      setProgress(null);
    }
  }, [uploadType, uploadOptions, onUploadComplete, onUploadError, maxSize, showPreview]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`image-uploader ${className}`}>
      <div
        className={`image-uploader__dropzone ${isDragging ? 'image-uploader__dropzone--dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />
        
        {children || (
          <div className="image-uploader__content">
            <div className="image-uploader__icon">📁</div>
            <div className="image-uploader__text">
              {isDragging ? 'Drop files here' : 'Click to select or drag files here'}
            </div>
            <div className="image-uploader__hint">
              {accept !== 'image/*' ? `Accepted formats: ${accept}` : 'All image formats supported'}
            </div>
            {maxSize && (
              <div className="image-uploader__hint">
                Max file size: {formatBytes(maxSize)}
              </div>
            )}
          </div>
        )}
      </div>

      {isUploading && progress && (
        <div className="image-uploader__progress">
          <UploadProgress progress={progress} />
        </div>
      )}

      {showPreview && previewUrls.length > 0 && (
        <div className="image-uploader__preview">
          {previewUrls.map((url, index) => (
            <div key={index} className="image-uploader__preview-item">
              <img src={url} alt={`Preview ${index + 1}`} />
            </div>
          ))}
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="image-uploader__results">
          <h4>Uploaded Files:</h4>
          {uploadedFiles.map((file, index) => (
            <div key={index} className="image-uploader__result-item">
              <a href={file.url} target="_blank" rel="noopener noreferrer">
                {file.fileName}
              </a>
              <span> ({formatBytes(file.size)})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 