import { t } from '../../design/strings';
import type { MedicationRecord } from '../../services/medications/medication-service';

export const PRESCRIPTION_SAVE_FAILED_MESSAGE = t('prescription.saveFailed');

/**
 * Finds the server's saved medicine for one confirmed prescription line. The confirm response
 * carries prescription items, not medicine records, so the match is by the name as written.
 * A server medicine is used once only. No match means the phone copy stays sparse (never guessed).
 */
export function matchServerMedicine(
  line: { name_as_written?: string },
  serverMedicines: MedicationRecord[],
  usedIds: Set<string>,
): MedicationRecord | null {
  const name = line.name_as_written?.trim();
  if (!name) return null;
  const found = serverMedicines.find((s) => !usedIds.has(s.id) && s.nameAsWritten.trim() === name);
  if (!found) return null;
  usedIds.add(found.id);
  return found;
}

export type PrescriptionConfirmOutcome =
  | { ok: true; activeCount: number }
  | { ok: false; message: string };

/**
 * Confirms a reviewed prescription. The server must accept it first; only then are the medicines
 * the patient marked active added locally. On failure nothing is added and the draft stays a draft.
 */
export async function confirmPrescriptionDraft(args: {
  payload: { medicines?: Array<{ is_active_medication?: boolean }> };
  confirmOnServer: () => Promise<unknown>;
  addActiveMedicine: (medicine: any, serverMedicine: MedicationRecord | null) => Promise<void>;
  /** Re-reads the saved medicines from the server after confirmation. A failure leaves the copies sparse. */
  fetchServerMedicines?: () => Promise<MedicationRecord[]>;
}): Promise<PrescriptionConfirmOutcome> {
  try {
    await args.confirmOnServer();
  } catch {
    return { ok: false, message: PRESCRIPTION_SAVE_FAILED_MESSAGE };
  }

  const active = Array.isArray(args.payload.medicines)
    ? args.payload.medicines.filter((m) => m.is_active_medication)
    : [];
  let serverMedicines: MedicationRecord[] = [];
  if (active.length > 0 && args.fetchServerMedicines) {
    try {
      serverMedicines = await args.fetchServerMedicines();
    } catch {
      serverMedicines = [];
    }
  }
  const used = new Set<string>();
  for (const m of active) {
    await args.addActiveMedicine(m, matchServerMedicine(m as { name_as_written?: string }, serverMedicines, used));
  }
  return { ok: true, activeCount: active.length };
}
