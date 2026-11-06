// DEV ONLY seam. Lets the screen preview start the Today screen with an upload in
// progress, which otherwise needs a real file pick and a real upload.
// In production nothing ever sets it, so every read returns null and behaviour is unchanged.
export interface PreviewSeam {
  /** Status text of an upload that is already running when Today opens. */
  processingStatus: string | null;
}

let current: PreviewSeam | null = null;

/** Ignored unless `isDev` is true, so a release build can never set it. */
export function setPreviewSeam(seam: PreviewSeam | null, isDev: boolean): void {
  current = isDev === true ? seam : null;
}

export function initialProcessingStatus(): string | null {
  return current?.processingStatus ?? null;
}
