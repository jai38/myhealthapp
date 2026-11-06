// DEV ONLY. Freezes the clock so "due now" and "Not confirmed" are the same on every run.
// `new Date()` and `Date.now()` return the frozen moment; `new Date(x)` and every other
// Date function are untouched. Returns a function that puts the real clock back.
export function freezeClock(frozenMs: number): () => void {
  const RealDate = Date;

  class FrozenDate extends RealDate {
    constructor(...args: unknown[]) {
      if (args.length === 0) {
        super(frozenMs);
      } else {
        super(...(args as [number]));
      }
    }

    static now(): number {
      return frozenMs;
    }
  }

  globalThis.Date = FrozenDate as unknown as DateConstructor;
  return () => {
    globalThis.Date = RealDate;
  };
}
