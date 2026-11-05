import { useCallback, useEffect, useMemo, useState } from 'react';
import { medicationStore, toLocalDateString } from '../../services/medications/medication-store';
import type { DoseLog, MedicationRecord } from '../../services/medications/medication-service';
import { useConnectivity } from '../../services/network/useConnectivity';
import { useTodayData } from './useTodayData';
import {
  greetingFor,
  groupTodayDoses,
  todayScreenState,
  type GroupedTodayDoses,
  type TodayDose,
  type TodayScreenState,
} from './todayModel';
import type { StringKey } from '../../design/strings';

const TICK_MS = 60_000;

export interface UseTodayResult {
  screenState: TodayScreenState;
  groups: GroupedTodayDoses;
  /** The one next dose (see pickNextDose), with its medicine when known. */
  next: (TodayDose & { medication: MedicationRecord | null }) | null;
  greeting: { key: StringKey; params?: { name: string } };
  /** True only when the connection is known to be down. Unknown is not offline. */
  isOffline: boolean;
  /** Epoch ms of the last successful load in this app run, or null. */
  lastUpdatedAt: number | null;
  loadFailed: boolean;
  retry: () => Promise<void>;
  nowMs: number;
  medications: MedicationRecord[];
  todayDoses: DoseLog[];
  session: ReturnType<typeof useTodayData>['session'];
  recentEvents: ReturnType<typeof useTodayData>['recentEvents'];
  totalRecordsCount: number;
  loadDashboardData: () => Promise<void>;
}

/** Today's data and states. Reminder sync and timeline loading stay in useTodayData. */
export function useToday(): UseTodayResult {
  const data = useTodayData();
  const { status } = useConnectivity();
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [storeVersion, setStoreVersion] = useState(0);

  // Move upcoming -> due now -> not confirmed without a reload.
  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), TICK_MS);
    return () => clearInterval(id);
  }, []);

  // Re-read doses whenever the medication store changes.
  useEffect(() => medicationStore.subscribe(() => setStoreVersion((v) => v + 1)), []);

  const { medications, session, initialized, loadFailed, lastUpdatedAt, loadDashboardData } = data;

  const todayDoses = useMemo(
    () => medicationStore.getDosesForDate(toLocalDateString(new Date(nowMs))),
    // storeVersion is the store's change signal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nowMs, storeVersion],
  );

  const medFor = useCallback(
    (id: string) => medications.find((m) => m.id === id) ?? medicationStore.getMedicationById(id),
    [medications],
  );

  const groups = useMemo(() => groupTodayDoses(todayDoses, nowMs, medFor), [todayDoses, nowMs, medFor]);

  const screenState = todayScreenState({ initialized, loadFailed, medications, doses: todayDoses, nowMs });

  const next = groups.next
    ? { ...groups.next, medication: medFor(groups.next.dose.medicationId) ?? null }
    : null;

  const greeting = greetingFor(new Date(nowMs).getHours(), session?.fullName);

  const retry = useCallback(() => loadDashboardData(), [loadDashboardData]);

  return {
    screenState,
    groups,
    next,
    greeting,
    isOffline: status === 'offline',
    lastUpdatedAt,
    loadFailed,
    retry,
    nowMs,
    medications,
    todayDoses,
    session,
    recentEvents: data.recentEvents,
    totalRecordsCount: data.totalRecordsCount,
    loadDashboardData,
  };
}
