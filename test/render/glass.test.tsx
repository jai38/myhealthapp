import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { GlassSection, GALLERY_DOSE_STATES } from '../../design/gallery/sections/GlassSection';
import { DoseChip, MarkTakenButton, NoticeSlot, TimeWheel } from '../../design/components/Glass';
import { BottomSheet } from '../../design/components/Containers/BottomSheet';
import { ThemeProvider } from '../../design/theme';
import { t } from '../../design/strings';

const PARTS = [
  'header',
  'card',
  'hero',
  'hero-done',
  'group',
  'row-taken',
  'row-due',
  'row-nc',
  'row-supplement',
  'mark-taken',
  'mark-taken-off',
  'tile-upload',
  'tile-add',
  'radio-yes',
  'radio-no',
  'segmented',
  'wheel',
  'notice',
  'notice-error',
];

const fmt = (d: Date) => `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;

describe('gallery: Calm Glass parts', () => {
  it('shows every part, and every chip state, in light and in dark', async () => {
    await render(<GlassSection />);
    for (const theme of ['light', 'dark']) {
      for (const part of PARTS) expect(screen.getByTestId(`glass-${theme}-${part}`)).toBeTruthy();
      for (const s of GALLERY_DOSE_STATES) expect(screen.getByTestId(`glass-${theme}-chip-${s.name}`)).toBeTruthy();
    }
  });

  it('opens the bottom sheet and the Undo toast', async () => {
    await render(<GlassSection />);
    await fireEvent.press(screen.getByTestId('glass-dark-open-sheet'));
    expect(screen.getByTestId('glass-dark-sheet-title')).toHaveTextContent('Update dose');
    await fireEvent.press(screen.getByTestId('glass-light-show-toast'));
    expect(screen.getByTestId('glass-light-toast')).toHaveTextContent(/marked as taken/);
  });

  it('the notice slot shows one notice of the two waiting', async () => {
    await render(<GlassSection />);
    expect(screen.getByTestId('glass-light-notice-uploading')).toBeTruthy();
    expect(screen.queryByTestId('glass-light-notice-saved')).toBeNull();
  });
});

describe('DoseChip', () => {
  it('pairs the doseStatusDisplay words with an icon', async () => {
    await render(<DoseChip state={{ kind: 'notConfirmed', scheduledAt: new Date(2026, 10, 6, 8) }} formatTime={fmt} testID="chip" />);
    expect(screen.getByTestId('chip')).toHaveTextContent(t('status.notConfirmed'));
    expect(screen.getByTestId('chip')).not.toHaveTextContent(/missed/i);
  });

  it('draws nothing for a paused or stopped medicine', async () => {
    await render(<DoseChip state={{ kind: 'pausedOrStopped' }} formatTime={fmt} testID="chip" />);
    expect(screen.queryByTestId('chip')).toBeNull();
  });
});

describe('NoticeSlot', () => {
  it('never renders two notices at once', async () => {
    await render(
      <NoticeSlot
        testID="slot"
        notices={[
          { id: 's', kind: 'saved', message: 'Saved' },
          { id: 'u', kind: 'uploading', message: 'Uploading' },
          { id: 'e', kind: 'error', message: 'Failed' },
        ]}
        action={{ label: 'Retry', onPress: () => {}, forKind: 'error' }}
      />,
    );
    const shown = ['error', 'uploading', 'saved'].filter((k) => screen.queryByTestId(`slot-${k}`) !== null);
    expect(shown).toEqual(['error']);
    expect(screen.getByTestId('slot')).toHaveTextContent(/Failed/);
    expect(screen.getByTestId('slot')).not.toHaveTextContent(/Uploading|Saved/);
    expect(screen.getByTestId('slot-action')).toBeTruthy();
  });

  it('renders nothing when the slot is empty', async () => {
    await render(<NoticeSlot testID="slot" notices={[null]} />);
    expect(screen.queryByTestId('slot')).toBeNull();
  });
});

describe('MarkTakenButton', () => {
  it('calls back only on a tap, and says why when disabled', async () => {
    let taps = 0;
    await render(
      <ThemeProvider scheme="dark">
        <MarkTakenButton testID="mt" onPress={() => (taps += 1)} />
        <MarkTakenButton testID="off" onPress={() => (taps += 1)} disabled disabledReason="Offline" />
      </ThemeProvider>,
    );
    expect(taps).toBe(0);
    await fireEvent.press(screen.getByTestId('mt'));
    await fireEvent.press(screen.getByTestId('off'));
    expect(taps).toBe(1);
    expect(screen.getByTestId('off-reason')).toHaveTextContent('Offline');
    expect(screen.getByTestId('mt')).toHaveAccessibleName(t('today.markTaken'));
  });
});

describe('TimeWheel', () => {
  it('offers no time after the limit and never reports one', async () => {
    const max = new Date(2026, 10, 6, 10, 30);
    const seen: Date[] = [];
    await render(<TimeWheel testID="w" value={new Date(2026, 10, 6, 10, 0)} max={max} onChange={(d) => seen.push(d)} />);
    expect(screen.queryByTestId('w-hour-11')).toBeNull();
    expect(screen.queryByTestId('w-minute-35')).toBeNull();
    await fireEvent.press(screen.getByTestId('w-minute-30'));
    await fireEvent.press(screen.getByTestId('w-hour-9'));
    expect(seen.every((d) => d.getTime() <= max.getTime())).toBe(true);
    expect(seen.map((d) => `${d.getHours()}:${d.getMinutes()}`)).toEqual(['10:30', '9:0']);
  });
});

describe('BottomSheet with Cancel and Save', () => {
  it('keeps Save disabled until allowed', async () => {
    let saved = 0;
    await render(
      <BottomSheet visible onClose={() => {}} title="Update dose" confirm={{ label: 'Save', onPress: () => (saved += 1), disabled: true }} testID="s">
        {null}
      </BottomSheet>,
    );
    await fireEvent.press(screen.getByTestId('s-confirm'));
    expect(saved).toBe(0);
    expect(screen.getByTestId('s-cancel')).toBeTruthy();
  });
});
