import React from 'react';
import { UploadProgress as UploadProgressType } from '../types';

interface UploadProgressProps {
  progress: UploadProgressType;
  fileName?: string;
  showPercentage?: boolean;
  showProgressBar?: boolean;
  className?: string;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({
  progress,
  fileName,
  showPercentage = true,
  showProgressBar = true,
  className = '',
}) => {
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`upload-progress ${className}`}>
      {fileName && (
        <div className="upload-progress__filename">
          {fileName}
        </div>
      )}
      
      {showProgressBar && (
        <div className="upload-progress__bar">
          <div 
            className="upload-progress__bar-fill"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      )}
      
      {showPercentage && (
        <div className="upload-progress__info">
          <span className="upload-progress__percentage">
            {progress.percentage}%
          </span>
          <span className="upload-progress__bytes">
            {formatBytes(progress.loaded)} / {formatBytes(progress.total)}
          </span>
        </div>
      )}
    </div>
  );
}; 