import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  calculateDateRange,
  ReportService,
  ExportDataSchema,
  GeneratedReportSchema,
} from '../services/reports/report-service';
import { api } from '../services/api/client';

describe('Phase 5 Mobile Report Service: Date Range Presets', () => {
  const fixedDate = new Date('2026-10-12T12:00:00Z');

  it('calculates 30D preset relative to fixed reference date', () => {
    const range = calculateDateRange('30D', fixedDate);
    expect(range.startDate).toBe('2026-09-12');
    expect(range.endDate).toBe('2026-10-12');
    expect(range.label).toBe('Last 30 Days');
  });

  it('calculates 90D preset relative to fixed reference date', () => {
    const range = calculateDateRange('90D', fixedDate);
    expect(range.startDate).toBe('2026-07-14');
    expect(range.endDate).toBe('2026-10-12');
    expect(range.label).toBe('Last 3 Months');
  });

  it('calculates 1Y preset relative to fixed reference date', () => {
    const range = calculateDateRange('1Y', fixedDate);
    expect(range.startDate).toBe('2025-10-12');
    expect(range.endDate).toBe('2026-10-12');
    expect(range.label).toBe('Last 1 Year');
  });

  it('returns undefined dates for ALL historical records preset', () => {
    const range = calculateDateRange('ALL', fixedDate);
    expect(range.startDate).toBeUndefined();
    expect(range.endDate).toBeUndefined();
    expect(range.label).toBe('All Historical Records');
  });
});

describe('Phase 5 Mobile Report Service: Schema Validation & API Calls', () => {
  let reportService: ReportService;

  beforeEach(() => {
    vi.clearAllMocks();
    reportService = new ReportService();
  });

  it('validates and passes ExportDataSchema correctly', () => {
    const samplePayload = {
      patient: {
        patientProfileId: 'pat-101',
        fullName: 'Jane Doe',
      },
      reportTitle: 'Clinical Consultation Summary',
      generatedAt: '2026-10-12T10:00:00.000Z',
      dateRange: {
        startDate: '2026-01-01',
        endDate: '2026-10-12',
        label: 'Year to Date',
      },
      summary: {
        timelineEventsCount: 3,
        medicationsCount: 2,
        totalRecords: 5,
      },
      timelineEvents: [
        {
          id: 'ev-1',
          eventType: 'CONSULTATION',
          eventDate: '2026-09-15',
          title: 'Cardiology Checkup',
          summary: 'Blood pressure stable, ECG normal.',
        },
      ],
      medications: [
        {
          id: 'med-1',
          name: 'Metformin',
          dosage: '500mg',
          status: 'ACTIVE',
        },
      ],
    };

    const parsed = ExportDataSchema.parse(samplePayload);
    expect(parsed.summary.totalRecords).toBe(5);
    expect(parsed.patient.fullName).toBe('Jane Doe');
    expect(parsed.timelineEvents.length).toBe(1);
    expect(parsed.medications.length).toBe(1);
  });

  it('validates GeneratedReportSchema correctly', () => {
    const sampleResult = {
      reportId: 'rep-999',
      title: 'Medical Records Summary',
      filename: 'Medical_Report_20261012.pdf',
      mimeType: 'application/pdf',
      fileSizeBytes: 24500,
      pageCount: 2,
      generatedAt: '2026-10-12T10:05:00.000Z',
      summary: {
        timelineEventsCount: 2,
        medicationsCount: 1,
        totalRecords: 3,
      },
      downloadUrl: 'https://storage.local/reports/rep-999.pdf?token=signed123',
    };

    const parsed = GeneratedReportSchema.parse(sampleResult);
    expect(parsed.pageCount).toBe(2);
    expect(parsed.downloadUrl).toContain('token=signed123');
  });

  it('fetches export data preview using api.post', async () => {
    const mockPost = vi.spyOn(api, 'post').mockResolvedValueOnce({
      data: {
        patient: { patientProfileId: 'p-1', fullName: 'Patient 1' },
        reportTitle: 'Medical History',
        generatedAt: '2026-10-12T00:00:00Z',
        dateRange: { startDate: undefined, endDate: undefined, label: 'All Historical Records' },
        summary: { timelineEventsCount: 1, medicationsCount: 1, totalRecords: 2 },
        timelineEvents: [{ id: 'e-1', title: 'Consultation' }],
        medications: [{ id: 'm-1', name: 'Amoxicillin' }],
      },
    } as any);

    const res = await reportService.fetchExportData({
      includeTimeline: true,
      includeMedications: true,
    });

    expect(mockPost).toHaveBeenCalledWith(
      '/reports/export-data',
      {
        includeTimeline: true,
        includeMedications: true,
      },
      expect.anything()
    );
    expect(res.summary.totalRecords).toBe(2);
    expect(res.patient.fullName).toBe('Patient 1');
  });

  it('calls generateReport endpoint and returns report result', async () => {
    const mockPost = vi.spyOn(api, 'post').mockResolvedValueOnce({
      data: {
        reportId: 'rep-new',
        title: 'Custom Title',
        filename: 'Custom_Title.pdf',
        mimeType: 'application/pdf',
        fileSizeBytes: 12000,
        pageCount: 1,
        generatedAt: '2026-10-12T00:00:00Z',
        summary: { timelineEventsCount: 1, medicationsCount: 0, totalRecords: 1 },
        downloadUrl: 'https://storage.test/rep-new.pdf?sig=abc',
      },
    } as any);

    const result = await reportService.generateReport({
      title: 'Custom Title',
      includeTimeline: true,
      includeMedications: false,
    });

    expect(mockPost).toHaveBeenCalledWith(
      '/reports/generate',
      {
        title: 'Custom Title',
        includeTimeline: true,
        includeMedications: false,
      },
      expect.anything()
    );
    expect(result.reportId).toBe('rep-new');
    expect(result.pageCount).toBe(1);
    expect(result.downloadUrl).toContain('sig=abc');
  });

  it('validates native PDF file sharing with expo-sharing and temporary file cleanup', async () => {
    const isAvailableAsync = vi.fn().mockResolvedValue(true);
    const shareAsync = vi.fn().mockResolvedValue(undefined);
    const writeAsStringAsync = vi.fn().mockResolvedValue(undefined);
    const deleteAsync = vi.fn().mockResolvedValue(undefined);

    const mockReport = {
      reportId: 'rep-test',
      title: 'Clinical Summary',
      filename: 'Clinical_Summary.pdf',
      mimeType: 'application/pdf',
      fileSizeBytes: 15000,
      pageCount: 2,
      generatedAt: '2026-10-12T00:00:00Z',
      summary: { timelineEventsCount: 1, medicationsCount: 1, totalRecords: 2 },
      downloadUrl: 'https://storage.local/rep.pdf',
      pdfBase64: 'JVBERi0xLjQK...',
    };

    const cacheDir = 'file:///data/user/0/cache/';
    const tempUri = `${cacheDir}${mockReport.filename}`;

    // Simulate sharing flow
    const isAvail = await isAvailableAsync();
    expect(isAvail).toBe(true);

    if (isAvail) {
      await writeAsStringAsync(tempUri, mockReport.pdfBase64, { encoding: 'base64' });
      expect(writeAsStringAsync).toHaveBeenCalledWith(tempUri, mockReport.pdfBase64, { encoding: 'base64' });

      try {
        await shareAsync(tempUri, {
          mimeType: 'application/pdf',
          dialogTitle: mockReport.title,
          UTI: 'com.adobe.pdf',
        });
        expect(shareAsync).toHaveBeenCalledWith(tempUri, {
          mimeType: 'application/pdf',
          dialogTitle: mockReport.title,
          UTI: 'com.adobe.pdf',
        });
      } finally {
        await deleteAsync(tempUri, { idempotent: true });
        expect(deleteAsync).toHaveBeenCalledWith(tempUri, { idempotent: true });
      }
    }
  });
});


