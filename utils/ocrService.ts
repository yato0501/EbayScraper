import { createWorker } from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
}

/**
 * Extract text from an image using Tesseract.js OCR
 * @param imageUri - URI of the image to process
 * @returns Promise containing extracted text and confidence score
 */
export const extractTextFromImage = async (imageUri: string): Promise<OCRResult> => {
  const worker = await createWorker('eng');

  try {
    // Configure Tesseract for better accuracy
    await worker.setParameters({
      tessedit_pageseg_mode: '6',  // Assume uniform block of text
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .-',  // Only allow relevant characters
      preserve_interword_spaces: '1',  // Keep spaces between words
    });

    const { data } = await worker.recognize(imageUri);

    return {
      text: data.text,
      confidence: data.confidence,
    };
  } finally {
    await worker.terminate();
  }
};
