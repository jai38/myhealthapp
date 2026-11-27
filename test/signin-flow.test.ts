// Phase 5 sign-in flow (screens.md Flow 1 and Flow 3).
import { describe, it, expect } from 'vitest';
import { INITIAL_SIGNIN, signinReducer, type SigninEvent, type SigninState } from '../features/signin/signinFlow';

const run = (events: SigninEvent[], from: SigninState = INITIAL_SIGNIN) => events.reduce(signinReducer, from);
const sent: SigninEvent = { type: 'CODE_SENT', phone: '9876543210', requestId: 'r1', sentAtMs: 0, resendAfterSeconds: 30 };

describe('sign-in flow', () => {
  it('new user: S01 → S02 → S03 → A01 offer → A02 show → done', () => {
    let s = run([sent]);
    expect(s.step).toBe('S02');
    s = run([{ type: 'SIGNED_IN', isNewUser: true, profileComplete: false }], s);
    expect(s.step).toBe('S03');
    s = run([{ type: 'ACCOUNT_SAVED' }], s);
    expect(s.step).toBe('A01_OFFER');
    s = run([{ type: 'APP_LOCK_DECIDED' }], s);
    expect(s.step).toBe('A02_SHOW');
    expect(run([{ type: 'RECOVERY_CODE_SAVED' }], s).step).toBe('DONE');
  });

  it('under 18 on S03 goes to A04 and stops; Check Date of Birth returns to S03', () => {
    const s = run([sent, { type: 'SIGNED_IN', isNewUser: true, profileComplete: false }, { type: 'UNDER_18' }]);
    expect(s.step).toBe('A04');
    // Nothing else moves the flow on from A04.
    expect(run([{ type: 'ACCOUNT_SAVED' }, { type: 'APP_LOCK_DECIDED' }], s).step).toBe('A04');
    expect(run([{ type: 'CHECK_DOB' }], s).step).toBe('S03');
  });

  it('a returning user on the same phone goes straight in', () => {
    expect(run([sent, { type: 'SIGNED_IN', isNewUser: false, profileComplete: true }]).step).toBe('DONE');
  });

  it('a returning user who never finished S03 finishes it, with no app lock offer or new code', () => {
    const s = run([sent, { type: 'SIGNED_IN', isNewUser: false, profileComplete: false }, { type: 'ACCOUNT_SAVED' }]);
    expect(s.step).toBe('DONE');
  });

  it('new phone with a recovery code: A03 check → A02 enter → a used-up code means a new one (A02 show)', () => {
    let s = run([sent, { type: 'SECOND_FACTOR', secondFactorToken: 'sf', withoutCode: 'RECORDS_HIDDEN' }]);
    expect(s).toMatchObject({ step: 'A03_CHECK', secondFactorToken: 'sf' });
    s = run([{ type: 'CHOOSE_RECOVERY_CODE' }], s);
    expect(s.step).toBe('A02_ENTER');
    s = run([{ type: 'SIGNED_IN', isNewUser: false, profileComplete: true, recoveryCodeUsed: true }], s);
    expect(s).toMatchObject({ step: 'A02_SHOW', secondFactorToken: null });
  });

  it('"I don\'t have my code" leads where the server said', () => {
    const hidden = run([sent, { type: 'SECOND_FACTOR', secondFactorToken: 'sf', withoutCode: 'RECORDS_HIDDEN' }, { type: 'CHOOSE_RECOVERY_CODE' }, { type: 'NO_RECOVERY_CODE' }]);
    expect(hidden.step).toBe('A03_HIDDEN');
    const support = run([sent, { type: 'SECOND_FACTOR', secondFactorToken: 'sf', withoutCode: 'CONTACT_SUPPORT' }, { type: 'CHOOSE_RECOVERY_CODE' }, { type: 'NO_RECOVERY_CODE' }]);
    // Stays on A02 enter; the screen opens the support contact.
    expect(support.step).toBe('A02_ENTER');
  });

  it('SUPPORT_REQUIRED shows A03 records hidden, with no session', () => {
    expect(run([sent, { type: 'SUPPORT_REQUIRED' }]).step).toBe('A03_HIDDEN');
  });

  it('back and change number return to S01 with the number kept', () => {
    expect(run([sent, { type: 'CHANGE_NUMBER' }])).toMatchObject({ step: 'S01', phone: '9876543210', requestId: null });
    expect(run([sent, { type: 'BACK' }])).toMatchObject({ step: 'S01', phone: '9876543210' });
  });

  it('ignores events that do not belong to the current step', () => {
    expect(run([{ type: 'SIGNED_IN', isNewUser: true, profileComplete: true }]).step).toBe('S01');
    expect(run([{ type: 'SECOND_FACTOR', secondFactorToken: 'x', withoutCode: 'RECORDS_HIDDEN' }]).step).toBe('S01');
    expect(run([{ type: 'RECOVERY_CODE_SAVED' }]).step).toBe('S01');
  });
});
