export const PRESCRIPTION_SAVE_FAILED_MESSAGE =
  "We couldn't save this prescription. Check your connection and try again.";

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
  addActiveMedicine: (medicine: any) => Promise<void>;
}): Promise<PrescriptionConfirmOutcome> {
  try {
    await args.confirmOnServer();
  } catch {
    return { ok: false, message: PRESCRIPTION_SAVE_FAILED_MESSAGE };
  }

  const active = Array.isArray(args.payload.medicines)
    ? args.payload.medicines.filter((m) => m.is_active_medication)
    : [];
  for (const m of active) {
    await args.addActiveMedicine(m);
  }
  return { ok: true, activeCount: active.length };
}
