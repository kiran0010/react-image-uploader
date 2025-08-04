# React Image Uploader

A comprehensive React image uploader package that supports multiple cloud platforms including Amazon S3, Cloudinary, and Firebase Storage. Features include image transformations, progress tracking, drag & drop support, and a simple API.

## Features

✅ **Multiple Platform Support**
- Amazon S3
- Cloudinary
- Firebase Storage

✅ **Image Processing**
- Resize, crop, rotate images
- Quality and format conversion
- Support for both local files and URLs

✅ **User Experience**
- Drag & drop interface
- Real-time progress tracking
- Image preview
- Error handling

✅ **Developer Friendly**
- Simple function-based API
- TypeScript support
- Comprehensive documentation

## Installation

```bash
npm install react-image-uploader
```

## Quick Start

### Basic Usage

```tsx
import { uploadS3, uploadCloudinary, uploadFirebase } from 'react-image-uploader';

// Upload to S3
const result = await uploadS3({
  file: selectedFile,
  bucket: 'my-bucket',
  region: 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  onProgress: (progress) => {
    console.log(`Upload progress: ${progress.percentage}%`);
  }
});

console.log('Uploaded URL:', result.url);
```

### React Component Usage

```tsx
import { ImageUploader } from 'react-image-uploader';

function App() {
  const s3Options = {
    bucket: 'my-bucket',
    region: 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  };

  return (
    <ImageUploader
      uploadType="s3"
      uploadOptions={s3Options}
      onUploadComplete={(result) => {
        console.log('Upload complete:', result.url);
      }}
      onUploadError={(error) => {
        console.error('Upload failed:', error.message);
      }}
      multiple={true}
      maxSize={5 * 1024 * 1024} // 5MB
    />
  );
}
```

## API Reference

### Upload Functions

#### `uploadS3(options: S3UploadOptions): Promise<UploadResult>`

Uploads an image to Amazon S3.

```tsx
const result = await uploadS3({
  file: File | string,
  bucket: string,
  region: string,
  accessKeyId: string,
  secretAccessKey: string,
  folder?: string,
  acl?: 'private' | 'public-read' | 'public-read-write' | 'authenticated-read',
  fileName?: string,
  transformations?: ImageTransformation,
  onProgress?: (progress: UploadProgress) => void,
  background?: boolean,
});
```

#### `uploadCloudinary(options: CloudinaryUploadOptions): Promise<UploadResult>`

Uploads an image to Cloudinary.

```tsx
const result = await uploadCloudinary({
  file: File | string,
  cloudName: string,
  apiKey: string,
  apiSecret: string,
  folder?: string,
  publicId?: string,
  fileName?: string,
  transformations?: ImageTransformation,
  onProgress?: (progress: UploadProgress) => void,
  background?: boolean,
});
```

#### `uploadFirebase(options: FirebaseUploadOptions): Promise<UploadResult>`

Uploads an image to Firebase Storage.

```tsx
const result = await uploadFirebase({
  file: File | string,
  storageBucket: string,
  projectId: string,
  privateKey: string,
  clientEmail: string,
  folder?: string,
  fileName?: string,
  transformations?: ImageTransformation,
  onProgress?: (progress: UploadProgress) => void,
  background?: boolean,
});
```

### Image Transformations

```tsx
const transformations: ImageTransformation = {
  resize: {
    width: 800,
    height: 600,
    fit: 'cover' | 'contain' | 'fill' | 'inside' | 'outside',
  },
  crop: {
    x: 0,
    y: 0,
    width: 400,
    height: 300,
  },
  rotate: 90,
  quality: 0.8,
  format: 'jpeg' | 'png' | 'webp' | 'gif',
};
```

### React Components

#### `ImageUploader`

A complete upload interface with drag & drop support.

```tsx
<ImageUploader
  uploadType="s3" | "cloudinary" | "firebase"
  uploadOptions={S3UploadOptions | CloudinaryUploadOptions | FirebaseUploadOptions}
  onUploadComplete?: (result: UploadResult) => void
  onUploadError?: (error: Error) => void
  multiple?: boolean
  accept?: string
  maxSize?: number
  showPreview?: boolean
  className?: string
  children?: React.ReactNode
/>
```

#### `UploadProgress`

A progress bar component for displaying upload progress.

```tsx
<UploadProgress
  progress={UploadProgress}
  fileName?: string
  showPercentage?: boolean
  showProgressBar?: boolean
  className?: string
/>
```

## Environment Variables

### Amazon S3
```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
```

### Cloudinary
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Firebase
```env
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
```

## Examples

### Multiple File Upload

```tsx
import { uploadMultiple } from 'react-image-uploader';

const files = [file1, file2, file3];
const results = await uploadMultiple(
  uploadS3,
  files,
  {
    bucket: 'my-bucket',
    region: 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  (fileIndex, progress) => {
    console.log(`File ${fileIndex + 1} progress: ${progress.percentage}%`);
  }
);
```

### Custom Upload Interface

```tsx
import { ImageUploader } from 'react-image-uploader';

function CustomUploader() {
  return (
    <ImageUploader
      uploadType="cloudinary"
      uploadOptions={{
        cloudName: 'my-cloud',
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
      }}
      onUploadComplete={(result) => {
        console.log('Uploaded:', result.url);
      }}
    >
      <div className="custom-upload-area">
        <h3>Upload Your Images</h3>
        <p>Drag and drop or click to select</p>
      </div>
    </ImageUploader>
  );
}
```

### Image Transformation Example

```tsx
const result = await uploadS3({
  file: imageFile,
  bucket: 'my-bucket',
  region: 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
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
    console.log(`Processing and uploading: ${progress.percentage}%`);
  },
});
```

## Types

```tsx
interface UploadResult {
  url: string;
  publicId?: string;
  fileName: string;
  size: number;
  format: string;
  width?: number;
  height?: number;
}

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface ImageTransformation {
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
```

## Styling

The package includes default styles, but you can customize them by importing the CSS:

```tsx
import 'react-image-uploader/dist/styles.css';
```

Or override the classes in your own CSS:

```css
.image-uploader__dropzone {
  /* Your custom styles */
}

.upload-progress__bar-fill {
  /* Custom progress bar styles */
}
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 