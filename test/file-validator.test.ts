import { describe, it, expect } from 'vitest';
import {
  validatePickedFile,
  MAX_FILE_SIZE_BYTES,
} from '../services/documents/file-validator';

describe('Mobile Document Capture & File Picker Validation', () => {
  it('accepts valid PDF documents under 15MB', () => {
    const result = validatePickedFile({
      name: 'discharge_summary.pdf',
      size: 1024 * 500, // 500 KB
      mimeType: 'application/pdf',
    });
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('accepts valid JPEG and PNG photos under 15MB', () => {
    const jpegResult = validatePickedFile({
      name: 'camera_capture.jpg',
      size: 1024 * 1024 * 3, // 3 MB
      mimeType: 'image/jpeg',
    });
    expect(jpegResult.isValid).toBe(true);

    const pngResult = validatePickedFile({
      name: 'prescription_scan.png',
      size: 1024 * 1024 * 2, // 2 MB
      mimeType: 'image/png',
    });
    expect(pngResult.isValid).toBe(true);
  });

  it('rejects files exceeding 15MB with informative error message', () => {
    const oversizedResult = validatePickedFile({
      name: 'large_hospital_record.pdf',
      size: MAX_FILE_SIZE_BYTES + 1024, // >15MB
      mimeType: 'application/pdf',
    });
    expect(oversizedResult.isValid).toBe(false);
    expect(oversizedResult.error).toContain('exceeds maximum allowable limit of 15 MB');
  });

  it('rejects empty files (0 bytes)', () => {
    const emptyResult = validatePickedFile({
      name: 'empty.pdf',
      size: 0,
      mimeType: 'application/pdf',
    });
    expect(emptyResult.isValid).toBe(false);
    expect(emptyResult.error).toContain('Selected file is empty');
  });

  it('rejects unsupported extensions and MIME types (e.g. .txt, .zip, .exe)', () => {
    const txtResult = validatePickedFile({
      name: 'notes.txt',
      size: 500,
      mimeType: 'text/plain',
    });
    expect(txtResult.isValid).toBe(false);
    expect(txtResult.error).toContain("Unsupported file format '.txt'");

    const exeResult = validatePickedFile({
      name: 'installer.exe',
      size: 1024 * 100,
    });
    expect(exeResult.isValid).toBe(false);
    expect(exeResult.error).toContain("Unsupported file format '.exe'");
  });
});
