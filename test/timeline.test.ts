import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  formatMedicalEventDate,
  groupEventsByPeriod,
  TimelineService,
  TimelineEvent,
} from '../services/timeline/timeline-service';
import { ApiClient, ApiError } from '../services/api/client';

describe('Phase 3 Mobile Timeline: Date Formatting & Period Grouping', () => {
  it('formats exact medical event dates without timezone drift', () => {
    const res = formatMedicalEventDate('2026-10-12', 'EXACT', false);
    expect(res.formatted).toBe('12 Oct 2026');
    expect(res.periodLabel).toBe('October 2026');
    expect(res.year).toBe('2026');
  });

  it('formats month-only precision dates correctly', () => {
    const res = formatMedicalEventDate('2025-03', 'MONTH_ONLY', false);
    expect(res.formatted).toBe('March 2025');
    expect(res.periodLabel).toBe('March 2025');
    expect(res.year).toBe('2025');
  });

  it('formats year-only precision dates correctly', () => {
    const res = formatMedicalEventDate('2024', 'YEAR_ONLY', false);
    expect(res.formatted).toBe('2024');
    expect(res.periodLabel).toBe('2024');
    expect(res.year).toBe('2024');
  });

  it('prefixes uncertain dates with "Approx." to honestly convey clinical uncertainty', () => {
    const resExact = formatMedicalEventDate('2026-05-18', 'EXACT', true);
    expect(resExact.formatted).toBe('Approx. 18 May 2026');

    const resMonth = formatMedicalEventDate('2025-07', 'MONTH_ONLY', true);
    expect(resMonth.formatted).toBe('Approx. July 2025');

    const resYear = formatMedicalEventDate('2023', 'YEAR_ONLY', true);
    expect(resYear.formatted).toBe('Approx. 2023');
  });

  it('handles empty or missing date string gracefully', () => {
    const res = formatMedicalEventDate('', 'EXACT', false);
    expect(res.formatted).toBe('Date not recorded');
    expect(res.periodLabel).toBe('Undated');
  });

  it('groups medical events by period in chronological order', () => {
    const sampleEvents: TimelineEvent[] = [
      {
        id: 'ev-1',
        patientProfileId: 'pat-1',
        eventType: 'PRESCRIPTION',
        eventDate: '2026-10-12',
        dateIsUncertain: false,
        datePrecision: 'EXACT',
        title: 'Prescription 1',
        summary: 'Summary 1',
        sourceDocumentId: 'doc-1',
        isVerified: true,
        createdAt: '2026-10-12T10:00:00Z',
        updatedAt: '2026-10-12T10:00:00Z',
      },
      {
        id: 'ev-2',
        patientProfileId: 'pat-1',
        eventType: 'CONSULTATION',
        eventDate: '2026-10-05',
        dateIsUncertain: false,
        datePrecision: 'EXACT',
        title: 'Consultation 2',
        summary: 'Summary 2',
        sourceDocumentId: 'doc-2',
        isVerified: true,
        createdAt: '2026-10-05T10:00:00Z',
        updatedAt: '2026-10-05T10:00:00Z',
      },
      {
        id: 'ev-3',
        patientProfileId: 'pat-1',
        eventType: 'PRESCRIPTION',
        eventDate: '2025-06-20',
        dateIsUncertain: false,
        datePrecision: 'EXACT',
        title: 'Prescription 3',
        summary: 'Summary 3',
        sourceDocumentId: 'doc-3',
        isVerified: true,
        createdAt: '2025-06-20T10:00:00Z',
        updatedAt: '2025-06-20T10:00:00Z',
      },
    ];

    const groups = groupEventsByPeriod(sampleEvents);
    expect(groups).toHaveLength(2);
    expect(groups[0].periodLabel).toBe('October 2026');
    expect(groups[0].events).toHaveLength(2);
    expect(groups[1].periodLabel).toBe('June 2025');
    expect(groups[1].events).toHaveLength(1);
  });
});

describe('Phase 3 Mobile Timeline: TimelineService API Client', () => {
  let mockFetch: any;
  let client: ApiClient;
  let service: TimelineService;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
    client = new ApiClient({ baseUrl: 'http://api.test/api/v1' });
    service = new TimelineService(client);
  });

  it('constructs correct query parameters for search, category, year, and pagination', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        data: [],
        pagination: { totalCount: 0, limit: 10, offset: 20, hasMore: false },
      }),
    });

    await service.fetchTimeline({
      search: 'Metformin',
      category: 'PRESCRIPTION',
      year: 2026,
      limit: 10,
      offset: 20,
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const calledUrl = mockFetch.mock.calls[0][0];
    expect(calledUrl).toContain('/timeline?');
    expect(calledUrl).toContain('search=Metformin');
    expect(calledUrl).toContain('category=PRESCRIPTION');
    expect(calledUrl).toContain('year=2026');
    expect(calledUrl).toContain('limit=10');
    expect(calledUrl).toContain('offset=20');
  });

  it('fetches and parses event detail with verified medications and source document', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          id: 'ev-100',
          patientProfileId: 'pat-1',
          eventType: 'PRESCRIPTION',
          eventDate: '2026-10-12',
          dateIsUncertain: false,
          datePrecision: 'EXACT',
          title: 'Prescription — Dr. Sharma',
          summary: '1 medication(s) prescribed',
          sourceDocumentId: 'doc-100',
          isVerified: true,
          createdAt: '2026-10-12T10:00:00Z',
          updatedAt: '2026-10-12T10:00:00Z',
          sourceDocument: {
            id: 'doc-100',
            originalFilename: 'rx_scan.pdf',
            mimeType: 'application/pdf',
            fileSizeBytes: 2048,
            pageCount: 1,
            uploadedAt: '2026-10-12T09:50:00Z',
          },
          prescription: {
            id: 'rx-100',
            prescriptionDate: '2026-10-12',
            dateIsUncertain: false,
            doctorName: 'Dr. Sharma',
            clinicHospitalName: 'City Care Hospital',
            diagnosis: 'Hypertension',
            reviewStatus: 'CONFIRMED',
            confirmedAt: '2026-10-12T10:00:00Z',
            confirmedByUserId: 'usr-1',
            items: [
              {
                id: 'item-1',
                nameAsWritten: 'Telmisartan 40mg',
                normalizedMedicineName: 'Telmisartan',
                strength: '40mg',
                dosageForm: 'TABLET',
                frequencyText: 'Once daily',
                durationText: '30 days',
                isActiveMedication: true,
              },
            ],
          },
        },
      }),
    });

    const detail = await service.fetchTimelineDetail('ev-100');
    expect(detail.id).toBe('ev-100');
    expect(detail.prescription?.doctorName).toBe('Dr. Sharma');
    expect(detail.prescription?.items).toHaveLength(1);
    expect(detail.prescription?.items[0].nameAsWritten).toBe('Telmisartan 40mg');
    expect(detail.sourceDocument?.originalFilename).toBe('rx_scan.pdf');
  });

  it('fetches short-lived signed preview URL for source document', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          signedUrl: 'https://s3.amazonaws.com/test-bucket/doc.pdf?signature=abc',
          expiresInSeconds: 900,
          mimeType: 'application/pdf',
          originalFilename: 'rx_scan.pdf',
        },
      }),
    });

    const urlData = await service.fetchTimelineDocumentUrl('ev-100');
    expect(urlData.signedUrl).toContain('signature=abc');
    expect(urlData.expiresInSeconds).toBe(900);
    expect(urlData.originalFilename).toBe('rx_scan.pdf');
  });

  it('propagates API errors when backend returns 404 Not Found', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({
        error: { code: 'NOT_FOUND', message: 'Medical record not found' },
      }),
    });

    await expect(service.fetchTimelineDetail('non-existent')).rejects.toThrow(ApiError);
  });
});
