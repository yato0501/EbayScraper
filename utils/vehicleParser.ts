export interface Vehicle {
  year: string;
  make: string;
  model: string;
  fullText: string;
}

/**
 * Common car makes for validation and splitting
 */
const COMMON_MAKES: string[] = [
  'CHEVROLET', 'CHEVY', 'FORD', 'TOYOTA', 'HONDA', 'NISSAN', 'GMC', 'RAM',
  'JEEP', 'DODGE', 'HYUNDAI', 'KIA', 'MAZDA', 'SUBARU', 'VOLKSWAGEN', 'VW',
  'BMW', 'MERCEDES', 'AUDI', 'LEXUS', 'ACURA', 'INFINITI', 'CADILLAC',
  'BUICK', 'PONTIAC', 'LINCOLN', 'MERCURY', 'CHRYSLER', 'VOLVO', 'MITSUBISHI'
];

/**
 * Fix common OCR errors and normalize text
 */
const fixOCRErrors = (text: string): string => {
  let fixed: string = text.toUpperCase();

  // Fix common OCR mistakes
  fixed = fixed.replace(/\bJOI\b/g, '201');  // JOI -> 201
  fixed = fixed.replace(/§/g, '2');          // § -> 2
  fixed = fixed.replace(/[|]/g, '1');        // | -> 1
  fixed = fixed.replace(/\bO\b/g, '0');      // O -> 0 (when standalone)

  return fixed;
};

/**
 * Try to split concatenated make/model (e.g., "CHEVROLETIMPALA" -> "CHEVROLET IMPALA")
 */
const splitMakeModel = (text: string): string => {
  const upperText: string = text.toUpperCase();

  for (const make of COMMON_MAKES) {
    if (upperText.startsWith(make) && upperText.length > make.length) {
      // Found a make at the start, split it
      const model: string = text.substring(make.length);
      return `${make} ${model}`;
    }
  }

  return text;
};

/**
 * Clean and normalize text to improve parsing
 */
const cleanText = (text: string): string => {
  // Remove extra whitespace and normalize
  return text
    .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
    .replace(/[^\w\s\-]/g, ' ')  // Remove special chars except hyphens and alphanumeric
    .trim();
};

/**
 * Extract year from text, handling both 2-digit and 4-digit formats
 */
const extractYear = (text: string): { year: string; restOfText: string } | null => {
  // Try 4-digit year first (e.g., 2004, 2015)
  const fourDigitMatch: RegExpMatchArray | null = text.match(/\b(19\d{2}|20\d{2})\b/);
  if (fourDigitMatch && fourDigitMatch.index !== undefined) {
    return {
      year: fourDigitMatch[0],
      restOfText: text.substring(fourDigitMatch.index + 4).trim()
    };
  }

  // Try 2-digit year with context (e.g., "05 CHEVROLET", ". 05CHEVROLET")
  const twoDigitMatch: RegExpMatchArray | null = text.match(/[^\d](\d{2})(?=[A-Z]|\s[A-Z])/);
  if (twoDigitMatch && twoDigitMatch.index !== undefined) {
    const twoDigit: string = twoDigitMatch[1];
    const yearNum: number = parseInt(twoDigit);
    // Assume 2000s for 00-30, 1900s for 80-99
    const fullYear: string = yearNum >= 0 && yearNum <= 30 ? `20${twoDigit}` : `19${twoDigit}`;

    return {
      year: fullYear,
      restOfText: text.substring((twoDigitMatch.index || 0) + twoDigitMatch[0].length - twoDigit.length).trim()
    };
  }

  return null;
};

/**
 * Parse extracted OCR text to find vehicle information in "YEAR MAKE Model" format
 * @param text - Raw text extracted from image
 * @returns Array of Vehicle objects
 */
export const parseVehicles = (text: string): Vehicle[] => {
  const vehicles: Vehicle[] = [];

  // Fix common OCR errors first
  const fixedText: string = fixOCRErrors(text);

  // Split by newlines
  const lines: string[] = fixedText
    .split(/[\n\r]+/)
    .filter((line: string): boolean => line.trim().length > 0);

  for (const line of lines) {
    let trimmedLine: string = line.trim();

    // Skip lines that don't look like vehicle entries
    if (trimmedLine.length < 5 || trimmedLine.includes('YARD') || trimmedLine.includes('ROW') || trimmedLine.includes('LOCAT') || trimmedLine.includes('Vehicle')) {
      continue;
    }

    // Try to extract year and rest of text
    const yearData = extractYear(trimmedLine);

    if (yearData) {
      const { year, restOfText } = yearData;
      let vehicleText: string = restOfText;

      // Try to split concatenated make/model
      vehicleText = splitMakeModel(vehicleText);

      // Clean the text
      vehicleText = cleanText(vehicleText);

      // Split into words
      const words: string[] = vehicleText.split(/\s+/).filter((word: string): boolean => word.length > 0);

      if (words.length >= 2) {
        // First word after year is typically the make
        const make: string = words[0];
        // Everything else is the model
        const model: string = words.slice(1).join(' ');

        vehicles.push({
          year,
          make,
          model,
          fullText: `${year} ${make} ${model}`,
        });
      } else if (words.length === 1) {
        // Only make, no model
        const make: string = words[0];
        vehicles.push({
          year,
          make,
          model: '',
          fullText: `${year} ${make}`,
        });
      }
    } else {
      // No year found, but include the line anyway for manual editing
      // Clean it up first
      const cleanedLine: string = cleanText(trimmedLine);

      if (cleanedLine.length > 0) {
        vehicles.push({
          year: '',
          make: '',
          model: '',
          fullText: cleanedLine,
        });
      }
    }
  }

  return vehicles;
};

/**
 * Format vehicles array into a readable string list
 * @param vehicles - Array of Vehicle objects
 * @returns Formatted string with one vehicle per line
 */
export const formatVehicleList = (vehicles: Vehicle[]): string => {
  return vehicles.map((vehicle: Vehicle): string => vehicle.fullText).join('\n');
};
