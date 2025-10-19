/**
 * Preprocess an image to improve OCR accuracy
 * Enhances contrast, brightness, and converts to grayscale
 */
export const preprocessImageForOCR = async (imageUri: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img: HTMLImageElement = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = (): void => {
      try {
        // Create canvas
        const canvas: HTMLCanvasElement = document.createElement('canvas');
        const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Set canvas size to image size
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw image
        ctx.drawImage(img, 0, 0);

        // Get image data
        const imageData: ImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data: Uint8ClampedArray = imageData.data;

        // Process each pixel
        for (let i = 0; i < data.length; i += 4) {
          const r: number = data[i];
          const g: number = data[i + 1];
          const b: number = data[i + 2];

          // Convert to grayscale
          const gray: number = 0.299 * r + 0.587 * g + 0.114 * b;

          // Increase contrast and brightness
          const contrast: number = 1.5;  // Contrast multiplier
          const brightness: number = 20;  // Brightness adjustment

          let enhanced: number = (gray - 128) * contrast + 128 + brightness;

          // Apply threshold for better text detection
          // Values closer to white (light backgrounds) become pure white
          // Values closer to black (dark text) become pure black
          if (enhanced > 160) {
            enhanced = 255;  // Pure white
          } else if (enhanced < 100) {
            enhanced = 0;    // Pure black
          }

          // Clamp values
          enhanced = Math.max(0, Math.min(255, enhanced));

          // Set RGB to same value (grayscale)
          data[i] = enhanced;
          data[i + 1] = enhanced;
          data[i + 2] = enhanced;
          // Alpha channel (i + 3) stays the same
        }

        // Put processed image data back
        ctx.putImageData(imageData, 0, 0);

        // Convert canvas to data URL
        const processedImageUri: string = canvas.toDataURL('image/png');
        resolve(processedImageUri);
      } catch (error: unknown) {
        reject(error);
      }
    };

    img.onerror = (): void => {
      reject(new Error('Failed to load image'));
    };

    img.src = imageUri;
  });
};
