import { describe, it, expect, vi } from 'vitest';
import {
  confirmPrescriptionDraft,
  PRESCRIPTION_SAVE_FAILED_MESSAGE,
} from '../features/today/prescription-confirmation';

const payload = {
  medicines: [
    { name_as_written: 'Synthetic A', is_active_medication: true },
    { name_as_written: 'Synthetic B', is_active_medication: false },
    { name_as_written: 'Synthetic C', is_active_medication: true },
  ],
};

describe('confirmPrescriptionDraft', () => {
  it('failed server confirm reports failure, adds nothing locally and keeps the draft', async () => {
    const add = vi.fn(async () => {});
    const outcome = await confirmPrescriptionDraft({
      payload,
      confirmOnServer: async () => {
        throw new Error('network down');
      },
      addActiveMedicine: add,
    });
    expect(outcome).toEqual({ ok: false, message: PRESCRIPTION_SAVE_FAILED_MESSAGE });
    expect(add).not.toHaveBeenCalled();
  });

  it('successful confirm adds only the medicines the patient marked active', async () => {
    const add = vi.fn(async () => {});
    const outcome = await confirmPrescriptionDraft({
      payload,
      confirmOnServer: async () => ({ ok: true }),
      addActiveMedicine: add,
    });
    expect(outcome).toEqual({ ok: true, activeCount: 2 });
    expect(add).toHaveBeenCalledTimes(2);
    expect(add.mock.calls.map((c: any[]) => c[0].name_as_written)).toEqual([
      'Synthetic A',
      'Synthetic C',
    ]);
  });
});
