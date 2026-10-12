import { z } from 'zod';
import { ApiClient, api } from '../api/client';

export type DateRangePreset = 'ALL' | '30D' | '90D' | '1Y' | 'CUSTOM';

export interface ReportConfig {
  title?: string;
  startDate?: string;
  endDate?: string;
  includeTimeline?: boolean;
  includeMedications?: boolean;
  selectedEventIds?: string[];
  selectedMedicationIds?: string[];
  allowEmpty?: boolean;
}

export const ExportDataSchema = z.object({
  patient: z.object({
    patientProfileId: z.string(),
    fullName: z.string(),
  }),
  reportTitle: z.string(),
  generatedAt: z.string(),
  dateRange: z.object({
    startDate: z.string().nullable().optional(),
    endDate: z.string().nullable().optional(),
    label: z.string(),
  }),
  summary: z.object({
    timelineEventsCount: z.number(),
    medicationsCount: z.number(),
    totalRecords: z.number(),
  }),
  timelineEvents: z.array(z.any()),
  medications: z.array(z.any()),
});

export type ExportDataPayload = z.infer<typeof ExportDataSchema>;

export const GeneratedReportSchema = z.object({
  reportId: z.string(),
  title: z.string(),
  filename: z.string(),
  mimeType: z.string(),
  fileSizeBytes: z.number(),
  pageCount: z.number(),
  generatedAt: z.string(),
  summary: z.object({
    timelineEventsCount: z.number(),
    medicationsCount: z.number(),
    totalRecords: z.number(),
  }),
  downloadUrl: z.string(),
  pdfBase64: z.string().optional(),
});

export type GeneratedReportResult = z.infer<typeof GeneratedReportSchema>;

/**
 * Calculates start and end dates for a given preset relative to a reference date.
 */
export function calculateDateRange(preset: DateRangePreset, refDate = new Date()): {
  startDate?: string;
  endDate?: string;
  label: string;
} {
  const toYMD = (d: Date) => d.toISOString().split('T')[0];

  switch (preset) {
    case '30D': {
      const start = new Date(refDate);
      start.setDate(start.getDate() - 30);
      return {
        startDate: toYMD(start),
        endDate: toYMD(refDate),
        label: 'Last 30 Days',
      };
    }
    case '90D': {
      const start = new Date(refDate);
      start.setDate(start.getDate() - 90);
      return {
        startDate: toYMD(start),
        endDate: toYMD(refDate),
        label: 'Last 3 Months',
      };
    }
    case '1Y': {
      const start = new Date(refDate);
      start.setFullYear(start.getFullYear() - 1);
      return {
        startDate: toYMD(start),
        endDate: toYMD(refDate),
        label: 'Last 1 Year',
      };
    }
    case 'ALL':
    default:
      return {
        startDate: undefined,
        endDate: undefined,
        label: 'All Historical Records',
      };
  }
}

export class ReportService {
  constructor(private client: ApiClient = api) {}

  /**
   * Fetches the preview data and count of eligible records matching the configuration.
   */
  async fetchExportData(config: ReportConfig): Promise<ExportDataPayload> {
    const res = await this.client.post<{ data: ExportDataPayload }>(
      '/reports/export-data',
      config,
      z.object({ data: ExportDataSchema })
    );
    return res.data;
  }

  /**
   * Generates a confidential medical report PDF, saves it securely to private storage,
   * and returns signed preview URL and summary metadata.
   */
  async generateReport(config: ReportConfig): Promise<GeneratedReportResult> {
    const res = await this.client.post<{ data: GeneratedReportResult }>(
      '/reports/generate',
      config,
      z.object({ data: GeneratedReportSchema })
    );
    return res.data;
  }
}

export const reportService = new ReportService();

