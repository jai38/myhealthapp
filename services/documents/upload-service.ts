import { ApiClient } from '../api/client';
import { PickedFile, validatePickedFile } from './file-validator';

export interface UploadIntentData {
  storageKey: string;
  uploadSignedUrl: string;
  expiresInSeconds: number;
}

export interface DocumentRecordData {
  id: string;
  patientProfileId: string;
  storageKey: string;
  originalFilename: string;
  mimeType: string;
  fileSizeBytes: number;
  sha256Checksum: string;
  status: string;
  uploadedAt: string;
}

export interface ExtractionJobData {
  id: string;
  patientProfileId: string;
  documentId: string;
  status: 'QUEUED' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED';
  retryCount: number;
  extractedPayload?: any;
  errorMessage?: string;
}

export class MobileDocumentUploadService {
  constructor(private readonly client: ApiClient) {}

  /**
   * Complete pipeline: validates file, gets upload intent, confirms upload, and triggers AI extraction job.
   */
  async uploadAndExtractPrescription(
    file: PickedFile,
    options?: { clientChecksum?: string }
  ): Promise<{ document: DocumentRecordData; job: ExtractionJobData }> {
    // 1. Client-side validation
    const validation = validatePickedFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid file');
    }

    const mimeType =
      file.mimeType ||
      (file.name.endsWith('.pdf')
        ? 'application/pdf'
        : file.name.endsWith('.png')
        ? 'image/png'
        : 'image/jpeg');

    // 2. Request upload intent
    const intentRes = await this.client.post<{ data: UploadIntentData }>(
      '/documents/upload-intent',
      {
        filename: file.name,
        mimeType,
        fileSizeBytes: file.size,
      }
    );

    const storageKey = intentRes.data.storageKey;

    // 3. Confirm upload
    const confirmRes = await this.client.post<{ data: DocumentRecordData }>(
      '/documents/confirm-upload',
      {
        storageKey,
        fileBufferBase64: file.base64,
        clientChecksum: options?.clientChecksum,
      }
    );

    const document = confirmRes.data;

    // 4. Trigger extraction job
    const jobRes = await this.client.post<{ data: ExtractionJobData }>(
      '/prescriptions/extract-job',
      {
        documentId: document.id,
      }
    );

    return {
      document,
      job: jobRes.data,
    };
  }

  /**
   * Polls extraction job until it reaches a terminal state (SUCCEEDED, FAILED, CANCELLED)
   */
  async pollJobUntilComplete(
    jobId: string,
    options?: { maxAttempts?: number; intervalMs?: number }
  ): Promise<ExtractionJobData> {
    const maxAttempts = options?.maxAttempts ?? 10;
    const intervalMs = options?.intervalMs ?? 1000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const res = await this.client.get<{ data: ExtractionJobData }>(
        `/prescriptions/extract-job/${jobId}`
      );
      const job = res.data;

      if (job.status === 'SUCCEEDED' || job.status === 'FAILED' || job.status === 'CANCELLED') {
        return job;
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    throw new Error('Extraction job timed out while waiting for results');
  }

  /**
   * Retrieves short-lived signed preview URL
   */
  async getPreviewUrl(documentId: string): Promise<string> {
    const res = await this.client.get<{ data: { signedUrl: string; expiresInSeconds: number } }>(
      `/documents/${documentId}/signed-url`
    );
    return res.data.signedUrl;
  }

  /**
   * Submits patient review and confirmation
   */
  async confirmPrescription(jobId: string, reviewPayload: any): Promise<any> {
    const res = await this.client.post<{ data: any }>(
      `/prescriptions/${jobId}/confirm`,
      reviewPayload
    );
    return res.data;
  }
}
