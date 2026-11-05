import { describe, it, expect } from 'vitest';
import { getGlobalErrorCopy } from '../features/system/globalErrorCopy';

describe('GlobalErrorScreen copy', () => {
  it('uses the offline title and body', () => {
    expect(getGlobalErrorCopy('offline')).toEqual({
      title: "You're offline",
      body: 'Your saved information is still on this device. Connect to the internet to refresh it.',
    });
  });

  it('ignores message for the offline variant', () => {
    expect(getGlobalErrorCopy('offline', 'Network request failed').body).toBe(
      'Your saved information is still on this device. Connect to the internet to refresh it.',
    );
  });

  it('uses the error fallback body when no message is given', () => {
    expect(getGlobalErrorCopy('error')).toEqual({
      title: 'Something went wrong',
      body: 'Nothing was lost. Please try again.',
    });
  });

  it('uses the provided message for the error variant', () => {
    expect(getGlobalErrorCopy('error', 'Upload could not finish.').body).toBe('Upload could not finish.');
  });

  it('falls back when the message is blank', () => {
    expect(getGlobalErrorCopy('error', '   ').body).toBe('Nothing was lost. Please try again.');
  });
});
