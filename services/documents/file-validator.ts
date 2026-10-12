export const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'application/pdf',
]);

export const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.pdf']);

export const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

export interface PickedFile {
  name: string;
  size: number;
  mimeType?: string;
  uri?: string;
  base64?: string;
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates picked file attributes for security and clinical upload safety.
 * Rejects unsupported file types and files larger than 15MB.
 */
export function validatePickedFile(file: PickedFile): FileValidationResult {
  if (!file.name || typeof file.size !== 'number') {
    return {
      isValid: false,
      error: 'Invalid file metadata received from document picker.',
    };
  }

  // File size validation
  if (file.size <= 0) {
    return {
      isValid: false,
      error: 'Selected file is empty (0 bytes). Please select a valid document.',
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      isValid: false,
      error: `File size (${sizeInMB} MB) exceeds maximum allowable limit of 15 MB.`,
    };
  }

  // Extension validation
  const lowerName = file.name.toLowerCase();
  const extMatch = lowerName.lastIndexOf('.');
  const ext = extMatch !== -1 ? lowerName.substring(extMatch) : '';

  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return {
      isValid: false,
      error: `Unsupported file format '${ext || 'unknown'}'. Only JPEG (.jpg, .jpeg), PNG (.png), and PDF (.pdf) documents are accepted.`,
    };
  }

  // MIME type validation (if provided by picker)
  if (file.mimeType && !ALLOWED_MIME_TYPES.has(file.mimeType)) {
    return {
      isValid: false,
      error: `Unsupported MIME type '${file.mimeType}'. Please upload a valid JPEG, PNG, or PDF.`,
    };
  }

  return { isValid: true };
}
