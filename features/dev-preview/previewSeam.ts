// DEV ONLY seam. Lets the screen preview start the Today screen with an upload in
// progress, which otherwise needs a real file pick and a real upload.
// In production nothing ever sets it, so every read returns null and behaviour is unchanged.
export interface PreviewSeam {
  /** Status text of an upload that is already running when Today opens. */
  processingStatus: string | null;
  /**
   * S07 states: open the Dose update sheet for this dose once Today has loaded, with this
   * answer already chosen (as the patient would have tapped it). Nothing is saved until Save.
   */
  doseUpdate?: { doseId: string; draft: Partial<PreviewDoseDraft> } | null;
}

/** The S07 answer, as plain data (see features/today/doseUpdate.ts). */
export interface PreviewDoseDraft {
  choice: 'took' | 'skipped' | 'missed' | null;
  when: 'scheduled' | 'now' | 'other';
  otherTime: Date | null;
  reason: 'FELT_UNWELL' | 'DOCTOR_ADVISED' | 'RAN_OUT' | 'SIDE_EFFECTS' | 'OTHER' | null;
}

let current: PreviewSeam | null = null;

/** Ignored unless `isDev` is true, so a release build can never set it. */
export function setPreviewSeam(seam: PreviewSeam | null, isDev: boolean): void {
  current = isDev === true ? seam : null;
}

export function initialProcessingStatus(): string | null {
  return current?.processingStatus ?? null;
}

/** The S07 sheet the preview opens, or null (always null in a release build). */
export function previewDoseUpdate(): PreviewSeam['doseUpdate'] {
  return current?.doseUpdate ?? null;
}
