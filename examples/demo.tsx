import React, { useState } from 'react';
import { 
  uploadS3,
  ImageUploader,
  UploadProgress 
} from '../src/index';
import { S3UploadOptions, UploadResult } from '../src/types';

// Example credentials (replace with your actual credentials)
const DEMO_CREDENTIALS = {
  // S3
  s3: {
    bucket: process.env.AWS_S3_BUCKET || 'your-s3-bucket',
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  // Cloudinary
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  // Firebase
  firebase: {
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'your-project.appspot.com',
    projectId: process.env.FIREBASE_PROJECT_ID || 'your-project-id',
    privateKey: process.env.FIREBASE_PRIVATE_KEY || '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
  },
};

export const UploadDemo: React.FC = () => {
  const [results, setResults] = useState<UploadResult[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleS3Upload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setProgress({ loaded: 0, total: 0, percentage: 0 });

    try {
      const options: S3UploadOptions = {
        file: selectedFile,
        ...DEMO_CREDENTIALS.s3,
        folder: 'demo-uploads',
        fileName: `demo-${Date.now()}.jpg`,
        transformations: {
          resize: {
            width: 800,
            height: 600,
            fit: 'cover',
          },
          quality: 0.9,
          format: 'webp',
        },
        onProgress: (progress) => {
          setProgress(progress);
        },
      };

      const result = await uploadS3(options);
      setResults(prev => [...prev, result]);
      alert(`S3 Upload successful! URL: ${result.url}`);
    } catch (error) {
      alert(`S3 Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      setProgress(null);
    }
  };

  const handleCloudinaryUpload = async () => {
    alert('Cloudinary upload not available in this demo. Please use S3 upload instead.');
  };

  const handleFirebaseUpload = async () => {
    alert('Firebase upload not available in this demo. Please use S3 upload instead.');
  };

  const handleMultipleUpload = async () => {
    alert('Multiple upload not available in this demo. Please use S3 upload instead.');
  };

  const handleUrlUpload = async () => {
    setIsUploading(true);
    setProgress({ loaded: 0, total: 0, percentage: 0 });

    try {
      const imageUrl = 'https://picsum.photos/800/600';
      
      const options: S3UploadOptions = {
        file: imageUrl,
        ...DEMO_CREDENTIALS.s3,
        folder: 'demo-url-uploads',
        fileName: `url-demo-${Date.now()}.jpg`,
        onProgress: (progress) => {
          setProgress(progress);
        },
      };

      const result = await uploadS3(options);
      setResults(prev => [...prev, result]);
      alert(`URL Upload successful! URL: ${result.url}`);
    } catch (error) {
      alert(`URL Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      setProgress(null);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>React Image Uploader Demo</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <h3>Select an image file:</h3>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ marginBottom: '1rem' }}
        />
        {selectedFile && (
          <p>Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)}KB)</p>
        )}
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3>Upload Functions:</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button 
            onClick={handleS3Upload} 
            disabled={!selectedFile || isUploading}
            style={{ padding: '0.5rem 1rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Upload to S3
          </button>
          
          <button 
            onClick={handleCloudinaryUpload} 
            disabled={!selectedFile || isUploading}
            style={{ padding: '0.5rem 1rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Upload to Cloudinary
          </button>
          
          <button 
            onClick={handleFirebaseUpload} 
            disabled={!selectedFile || isUploading}
            style={{ padding: '0.5rem 1rem', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Upload to Firebase
          </button>
          
          <button 
            onClick={handleMultipleUpload} 
            disabled={!selectedFile || isUploading}
            style={{ padding: '0.5rem 1rem', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Multiple Upload
          </button>
          
          <button 
            onClick={handleUrlUpload} 
            disabled={isUploading}
            style={{ padding: '0.5rem 1rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Upload from URL
          </button>
        </div>
      </div>

      {isUploading && progress && (
        <div style={{ marginBottom: '2rem' }}>
          <h3>Upload Progress:</h3>
          <UploadProgress 
            progress={progress} 
            fileName={selectedFile?.name}
          />
        </div>
      )}

      <div style={{ marginBottom: '2rem' }}>
        <h3>React Component Demo:</h3>
        <ImageUploader
          uploadType="s3"
          uploadOptions={{
            ...DEMO_CREDENTIALS.s3,
            file: selectedFile || new File([''], 'placeholder.jpg')
          }}
          onUploadComplete={(result) => {
            setResults(prev => [...prev, result]);
            alert(`Component upload successful! URL: ${result.url}`);
          }}
          onUploadError={(error) => {
            alert(`Component upload failed: ${error.message}`);
          }}
          multiple={true}
          maxSize={5 * 1024 * 1024} // 5MB
          showPreview={true}
        />
      </div>

      {results.length > 0 && (
        <div>
          <h3>Upload Results:</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {results.map((result, index) => (
              <div 
                key={index} 
                style={{ 
                  padding: '1rem', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '6px',
                  backgroundColor: '#f9fafb'
                }}
              >
                <h4>{result.fileName}</h4>
                <p><strong>URL:</strong> <a href={result.url} target="_blank" rel="noopener noreferrer">{result.url}</a></p>
                <p><strong>Size:</strong> {Math.round(result.size / 1024)}KB</p>
                <p><strong>Format:</strong> {result.format}</p>
                {result.width && result.height && (
                  <p><strong>Dimensions:</strong> {result.width} x {result.height}</p>
                )}
                {result.publicId && (
                  <p><strong>Public ID:</strong> {result.publicId}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '6px' }}>
        <h4>Note:</h4>
        <p>This demo uses placeholder credentials. Replace them with your actual cloud service credentials to test the uploads.</p>
        <p>Make sure to set up your environment variables:</p>
        <ul>
          <li>AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY for S3</li>
          <li>CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET for Cloudinary</li>
          <li>FIREBASE_PRIVATE_KEY and FIREBASE_CLIENT_EMAIL for Firebase</li>
        </ul>
      </div>
    </div>
  );
}; 