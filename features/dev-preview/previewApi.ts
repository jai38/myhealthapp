// DEV ONLY. A stand-in for the backend, installed over `fetch` while a preview is open.
// The real services, schemas and stores run unchanged; only the network underneath them
// is replaced. Requests to the app's API base URL are answered from the fixtures. Requests
// to the same origin (the dev bundle and its fonts) pass through. Anything else is refused,
// so a preview can never reach a real server. Blocked URLs are listed in `blocked`.
import { getApiBaseUrl } from '../../services/api/client';
import type { PreviewScenario } from './fixtures';

export const blocked: string[] = [];

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

function serverError(): Response {
  return json(500, { error: { code: 'PREVIEW_FORCED_ERROR', message: 'Synthetic server error for the preview.' } });
}

/** Answers one API call from the scenario. */
export function answer(scenario: PreviewScenario, method: string, path: string, query: URLSearchParams): Response {
  if (scenario.apiFails) return serverError();

  if (method === 'GET' && path === '/medications') {
    const status = query.get('status');
    const data = status ? scenario.medications.filter((m) => m.status === status) : scenario.medications;
    return json(200, { data });
  }
  if (method === 'GET' && path === '/medications/doses') {
    return json(200, { data: scenario.doses });
  }
  if (method === 'GET' && path === '/timeline') {
    const search = (query.get('search') ?? '').toLowerCase();
    const year = query.get('year');
    const category = query.get('category');
    const limit = Number(query.get('limit') ?? 20);
    const offset = Number(query.get('offset') ?? 0);
    const matching = scenario.events.filter(
      (e) =>
        (!search || `${e.title} ${e.summary}`.toLowerCase().includes(search)) &&
        (!year || e.eventDate.startsWith(year)) &&
        (!category || e.eventType === category),
    );
    const data = matching.slice(offset, offset + limit);
    return json(200, {
      data,
      pagination: { totalCount: matching.length, limit, offset, hasMore: offset + data.length < matching.length },
    });
  }
  if (method === 'POST' && path === '/reports/export-data') {
    const timelineEventsCount = scenario.events.length;
    const medicationsCount = scenario.medications.length;
    return json(200, {
      data: {
        patient: { patientProfileId: 'preview-patient', fullName: 'Asha Test' },
        reportTitle: 'Preview report',
        generatedAt: new Date().toISOString(),
        dateRange: { startDate: null, endDate: null, label: 'All Historical Records' },
        summary: { timelineEventsCount, medicationsCount, totalRecords: timelineEventsCount + medicationsCount },
        timelineEvents: scenario.events,
        medications: scenario.medications,
      },
    });
  }
  return json(404, { error: { code: 'NOT_FOUND', message: 'Not part of the preview.' } });
}

/** Installs the fake backend over `fetch`. Returns a function that restores the real one. */
export function installPreviewApi(scenario: PreviewScenario): () => void {
  const realFetch = globalThis.fetch;
  const base = getApiBaseUrl().replace(/\/+$/, '');
  blocked.length = 0;

  const fake = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    if (url.startsWith(base)) {
      const method = (init?.method ?? (typeof input === 'object' && 'method' in input ? input.method : 'GET')).toUpperCase();
      const parsed = new URL(url);
      const path = parsed.pathname.slice(new URL(base).pathname.length) || '/';
      return answer(scenario, method, path, parsed.searchParams);
    }
    const origin = typeof location !== 'undefined' ? location.origin : '';
    if (url.startsWith('/') || (origin !== '' && url.startsWith(origin)) || url.startsWith('data:') || url.startsWith('blob:')) {
      return realFetch(input as RequestInfo, init);
    }
    blocked.push(url);
    throw new TypeError('Network is disabled in the screen preview.');
  };

  globalThis.fetch = fake as typeof fetch;
  return () => {
    globalThis.fetch = realFetch;
  };
}
