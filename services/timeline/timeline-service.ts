import { z } from 'zod';
import { ApiClient, api } from '../api/client';

export const TimelineEventSchema = z.object({
  id: z.string(),
  patientProfileId: z.string(),
  eventType: z.string(),
  eventDate: z.string(),
  dateIsUncertain: z.boolean(),
  datePrecision: z.string(),
  title: z.string(),
  summary: z.string(),
  sourceDocumentId: z.string(),
  sourcePrescriptionId: z.string().nullable().optional(),
  isVerified: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type TimelineEvent = z.infer<typeof TimelineEventSchema>;

export const TimelineResponseSchema = z.object({
  data: z.array(TimelineEventSchema),
  pagination: z.object({
    totalCount: z.number(),
    limit: z.number(),
    offset: z.number(),
    hasMore: z.boolean(),
  }),
});

export type TimelineResponse = z.infer<typeof TimelineResponseSchema>;

export const PrescriptionItemDetailSchema = z.object({
  id: z.string(),
  prescriptionId: z.string().optional(),
  nameAsWritten: z.string(),
  normalizedMedicineName: z.string().nullable().optional(),
  strength: z.string().nullable().optional(),
  dosageForm: z.string(),
  frequencyText: z.string().nullable().optional(),
  durationText: z.string().nullable().optional(),
  route: z.string().optional(),
  instructions: z.string().nullable().optional(),
  isActiveMedication: z.boolean(),
});

export type PrescriptionItemDetail = z.infer<typeof PrescriptionItemDetailSchema>;

export const TimelineDetailSchema = z.object({
  data: TimelineEventSchema.extend({
    sourceDocument: z
      .object({
        id: z.string(),
        originalFilename: z.string(),
        mimeType: z.string(),
        fileSizeBytes: z.number(),
        pageCount: z.number().nullable().optional(),
        uploadedAt: z.string(),
      })
      .optional(),
    prescription: z
      .object({
        id: z.string(),
        prescriptionDate: z.string().nullable().optional(),
        dateIsUncertain: z.boolean(),
        doctorName: z.string().nullable().optional(),
        clinicHospitalName: z.string().nullable().optional(),
        diagnosis: z.string().nullable().optional(),
        reviewStatus: z.string(),
        confirmedAt: z.string(),
        confirmedByUserId: z.string(),
        items: z.array(PrescriptionItemDetailSchema),
      })
      .optional(),
  }),
});

export type TimelineDetail = z.infer<typeof TimelineDetailSchema>['data'];

export const TimelineDocumentUrlSchema = z.object({
  data: z.object({
    signedUrl: z.string(),
    expiresInSeconds: z.number(),
    mimeType: z.string(),
    originalFilename: z.string(),
  }),
});

export type TimelineDocumentUrl = z.infer<typeof TimelineDocumentUrlSchema>['data'];

export interface TimelineFilters {
  search?: string;
  year?: number;
  category?: string;
  offset?: number;
  limit?: number;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/**
 * Timezone-safe medical event date formatter.
 * Uses strict string extraction without converting to local time Date objects
 * to prevent calendar day shifting.
 */
export function formatMedicalEventDate(
  dateString: string,
  precision: string = 'EXACT',
  isUncertain: boolean = false
): { formatted: string; periodLabel: string; year: string } {
  if (!dateString) {
    return { formatted: 'Date not recorded', periodLabel: 'Undated', year: '' };
  }

  const parts = dateString.split('-');
  const rawYear = parts[0] || '';
  const monthNum = parts.length > 1 ? parseInt(parts[1], 10) : NaN;
  const dayNum = parts.length > 2 ? parseInt(parts[2], 10) : NaN;

  const validMonth = !isNaN(monthNum) && monthNum >= 1 && monthNum <= 12;
  const validDay = !isNaN(dayNum) && dayNum >= 1 && dayNum <= 31;

  let formatted = dateString;
  let periodLabel = rawYear;

  if (precision === 'YEAR_ONLY' || (!validMonth && !validDay)) {
    formatted = isUncertain ? `Approx. ${rawYear}` : rawYear;
    periodLabel = rawYear;
  } else if (precision === 'MONTH_ONLY' || !validDay) {
    const monthName = MONTH_NAMES[monthNum - 1];
    formatted = isUncertain ? `Approx. ${monthName} ${rawYear}` : `${monthName} ${rawYear}`;
    periodLabel = `${monthName} ${rawYear}`;
  } else {
    // Exact YYYY-MM-DD
    const monthShort = MONTH_SHORT[monthNum - 1];
    const monthFull = MONTH_NAMES[monthNum - 1];
    formatted = isUncertain
      ? `Approx. ${validDay ? `${dayNum} ` : ''}${monthShort} ${rawYear}`
      : `${dayNum} ${monthShort} ${rawYear}`;
    periodLabel = `${monthFull} ${rawYear}`;
  }

  return {
    formatted,
    periodLabel,
    year: rawYear,
  };
}

export interface TimelineGroup {
  periodLabel: string;
  year: string;
  events: TimelineEvent[];
}

/**
 * Groups timeline events by period (Month & Year or Year) preserving chronological order.
 */
export function groupEventsByPeriod(events: TimelineEvent[]): TimelineGroup[] {
  const groups: TimelineGroup[] = [];
  const map = new Map<string, TimelineGroup>();

  for (const event of events) {
    const { periodLabel, year } = formatMedicalEventDate(
      event.eventDate,
      event.datePrecision,
      event.dateIsUncertain
    );

    let group = map.get(periodLabel);
    if (!group) {
      group = { periodLabel, year, events: [] };
      map.set(periodLabel, group);
      groups.push(group);
    }
    group.events.push(event);
  }

  return groups;
}

export class TimelineService {
  constructor(private client: ApiClient = api) {}

  async fetchTimeline(filters: TimelineFilters = {}): Promise<TimelineResponse> {
    const query = new URLSearchParams();
    if (filters.search) query.append('search', filters.search);
    if (filters.year) query.append('year', String(filters.year));
    if (filters.category) query.append('category', filters.category);
    if (filters.limit !== undefined) query.append('limit', String(filters.limit));
    if (filters.offset !== undefined) query.append('offset', String(filters.offset));

    const qs = query.toString();
    const endpoint = `/timeline${qs ? `?${qs}` : ''}`;
    return this.client.get(endpoint, TimelineResponseSchema);
  }

  async fetchTimelineDetail(id: string): Promise<TimelineDetail> {
    const res = await this.client.get(
      `/timeline/${encodeURIComponent(id)}`,
      TimelineDetailSchema
    );
    return res.data;
  }

  async fetchTimelineDocumentUrl(id: string): Promise<TimelineDocumentUrl> {
    const res = await this.client.get(
      `/timeline/${encodeURIComponent(id)}/document-url`,
      TimelineDocumentUrlSchema
    );
    return res.data;
  }
}

export const timelineService = new TimelineService();
