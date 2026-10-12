import { describe, it, expect, vi } from 'vitest';
import { MobileDocumentUploadService } from '../services/documents/upload-service';
import { ApiClient } from '../services/api/client';

describe('Mobile Document Upload & Extraction Pipeline Service', () => {
  it('rejects invalid or oversized files before triggering network calls', async () => {
    const mockClient = new ApiClient({ baseUrl: 'http://mock' });
    const postSpy = vi.spyOn(mockClient, 'post');
    const service = new MobileDocumentUploadService(mockClient);

    await expect(
      service.uploadAndExtractPrescription({
        name: 'huge.pdf',
        size: 20 * 1024 * 1024, // 20 MB
      })
    ).rejects.toThrow('exceeds maximum allowable limit');

    expect(postSpy).not.toHaveBeenCalled();
  });

  it('orchestrates upload intent, confirm upload, and extraction job initiation', async () => {
    const mockClient = new ApiClient({ baseUrl: 'http://mock' });
    const postSpy = vi.spyOn(mockClient, 'post');

    // Mock responses
    postSpy.mockImplementation(async (endpoint: string, _body?: unknown) => {
      if (endpoint === '/documents/upload-intent') {
        return {
          data: {
            storageKey: 'documents/pat_1/mock-key',
            uploadSignedUrl: 'https://storage/upload',
            expiresInSeconds: 900,
          },
        } as any;
      }
      if (endpoint === '/documents/confirm-upload') {
        return {
          data: {
            id: 'doc-123',
            patientProfileId: 'pat_1',
            storageKey: 'documents/pat_1/mock-key',
            originalFilename: 'rx.pdf',
            mimeType: 'application/pdf',
            fileSizeBytes: 1024,
            sha256Checksum: 'fake-hash',
            status: 'UPLOADED',
            uploadedAt: new Date().toISOString(),
          },
        } as any;
      }
      if (endpoint === '/prescriptions/extract-job') {
        return {
          data: {
            id: 'job-456',
            patientProfileId: 'pat_1',
            documentId: 'doc-123',
            status: 'SUCCEEDED',
            retryCount: 0,
            extractedPayload: { medicines: [] },
          },
        } as any;
      }
      return { data: {} } as any;
    });

    const mockDirectUploader = vi.fn().mockResolvedValue(undefined);
    const service = new MobileDocumentUploadService(mockClient, mockDirectUploader);

    const result = await service.uploadAndExtractPrescription({
      name: 'rx.pdf',
      size: 1024,
      mimeType: 'application/pdf',
    });

    expect(result.document.id).toBe('doc-123');
    expect(result.job.id).toBe('job-456');
    expect(mockDirectUploader).toHaveBeenCalledWith('https://storage/upload', expect.any(Object), 'application/pdf');
    expect(postSpy).toHaveBeenCalledTimes(3);
  });

  it('polls job until terminal status is reached', async () => {
    const mockClient = new ApiClient({ baseUrl: 'http://mock' });
    let attempts = 0;

    vi.spyOn(mockClient, 'get').mockImplementation(async (endpoint: string) => {
      if (endpoint === '/prescriptions/extract-job/job-456') {
        attempts += 1;
        if (attempts < 2) {
          return {
            data: { id: 'job-456', status: 'PROCESSING', retryCount: 0 },
          } as any;
        }
        return {
          data: {
            id: 'job-456',
            status: 'SUCCEEDED',
            retryCount: 0,
            extractedPayload: { medicines: [] },
          },
        } as any;
      }
      return { data: {} } as any;
    });

    const service = new MobileDocumentUploadService(mockClient);
    const job = await service.pollJobUntilComplete('job-456', {
      maxAttempts: 5,
      intervalMs: 10,
    });

    expect(job.status).toBe('SUCCEEDED');
    expect(attempts).toBe(2);
  });
});
