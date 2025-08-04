// Mock canvas for image processing tests
const mockCanvas = {
  getContext: jest.fn(() => ({
    drawImage: jest.fn(),
    putImageData: jest.fn(),
    getImageData: jest.fn(() => ({
      data: new Uint8ClampedArray(100),
      width: 10,
      height: 10,
    })),
    translate: jest.fn(),
    rotate: jest.fn(),
  })),
  width: 100,
  height: 100,
  toBlob: jest.fn((callback) => {
    const blob = new Blob(['mock'], { type: 'image/jpeg' });
    callback(blob);
  }),
};

Object.defineProperty(global, 'HTMLCanvasElement', {
  value: class {
    constructor() {
      return mockCanvas;
    }
  },
});

Object.defineProperty(global, 'CanvasRenderingContext2D', {
  value: class {
    constructor() {
      return mockCanvas.getContext();
    }
  },
});

// Mock Image constructor
global.Image = class {
  src: string = '';
  crossOrigin: string = '';
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;

  constructor() {
    setTimeout(() => {
      if (this.onload) {
        this.onload();
      }
    }, 0);
  }
} as any;

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    blob: () => Promise.resolve(new Blob(['mock data'], { type: 'image/jpeg' })),
  })
) as any;

// Mock FileReader
global.FileReader = class {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  result: string | ArrayBuffer | null = null;

  readAsDataURL(blob: Blob) {
    setTimeout(() => {
      this.result = 'data:image/jpeg;base64,mock';
      if (this.onload) {
        this.onload();
      }
    }, 0);
  }

  readAsArrayBuffer(blob: Blob) {
    setTimeout(() => {
      this.result = new ArrayBuffer(8);
      if (this.onload) {
        this.onload();
      }
    }, 0);
  }
} as any; 