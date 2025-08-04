import { ImageTransformation } from '../types';

export class ImageProcessor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  async processImage(
    file: File | string,
    transformations?: ImageTransformation
  ): Promise<Blob> {
    const image = await this.loadImage(file);
    
    if (!transformations) {
      return this.fileToBlob(file);
    }

    this.canvas.width = image.width;
    this.canvas.height = image.height;

    // Apply transformations
    if (transformations.resize) {
      this.applyResize(image, transformations.resize);
    } else {
      this.ctx.drawImage(image, 0, 0);
    }

    if (transformations.crop) {
      this.applyCrop(transformations.crop);
    }

    if (transformations.rotate) {
      this.applyRotate(transformations.rotate);
    }

    // Convert to blob with specified quality and format
    const quality = transformations.quality || 0.8;
    const format = transformations.format || 'jpeg';
    const mimeType = `image/${format}`;

    return new Promise((resolve) => {
      this.canvas.toBlob((blob) => {
        resolve(blob!);
      }, mimeType, quality);
    });
  }

  private async loadImage(file: File | string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => resolve(img);
      img.onerror = reject;

      if (typeof file === 'string') {
        img.src = file;
      } else {
        img.src = URL.createObjectURL(file);
      }
    });
  }

  private applyResize(
    image: HTMLImageElement,
    resize: NonNullable<ImageTransformation['resize']>
  ) {
    let { width, height, fit = 'cover' } = resize;
    const aspectRatio = image.width / image.height;

    if (!width && !height) {
      width = image.width;
      height = image.height;
    } else if (!width) {
      width = height! * aspectRatio;
    } else if (!height) {
      height = width / aspectRatio;
    }

    // Ensure width and height are defined
    const finalWidth = width!;
    const finalHeight = height!;

    let drawWidth = finalWidth;
    let drawHeight = finalHeight;
    let drawX = 0;
    let drawY = 0;

    if (fit === 'cover') {
      const scale = Math.max(finalWidth / image.width, finalHeight / image.height);
      drawWidth = image.width * scale;
      drawHeight = image.height * scale;
      drawX = (finalWidth - drawWidth) / 2;
      drawY = (finalHeight - drawHeight) / 2;
    } else if (fit === 'contain') {
      const scale = Math.min(finalWidth / image.width, finalHeight / image.height);
      drawWidth = image.width * scale;
      drawHeight = image.height * scale;
      drawX = (finalWidth - drawWidth) / 2;
      drawY = (finalHeight - drawHeight) / 2;
    }

    this.canvas.width = finalWidth;
    this.canvas.height = finalHeight;
    this.ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  }

  private applyCrop(crop: NonNullable<ImageTransformation['crop']>) {
    const { x, y, width, height } = crop;
    const imageData = this.ctx.getImageData(x, y, width, height);
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx.putImageData(imageData, 0, 0);
  }

  private applyRotate(angle: number) {
    const radians = (angle * Math.PI) / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);

    const width = this.canvas.width;
    const height = this.canvas.height;

    const newWidth = Math.abs(width * cos) + Math.abs(height * sin);
    const newHeight = Math.abs(width * sin) + Math.abs(height * cos);

    const newCanvas = document.createElement('canvas');
    const newCtx = newCanvas.getContext('2d')!;
    newCanvas.width = newWidth;
    newCanvas.height = newHeight;

    newCtx.translate(newWidth / 2, newHeight / 2);
    newCtx.rotate(radians);
    newCtx.drawImage(this.canvas, -width / 2, -height / 2);

    this.canvas = newCanvas;
    this.ctx = newCtx;
  }

  private async fileToBlob(file: File | string): Promise<Blob> {
    if (typeof file === 'string') {
      const response = await fetch(file);
      return response.blob();
    }
    return file;
  }

  generateFileName(originalName?: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const extension = originalName ? originalName.split('.').pop() : 'jpg';
    return `${timestamp}_${random}.${extension}`;
  }
} 