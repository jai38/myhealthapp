import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon } from '../Foundations/Icon';
import { Text } from '../Foundations/Text';
import { color, radius, space } from '../../tokens';
import { t } from '../../strings';
import type { StringKey } from '../../strings';
import { stepStates } from './containerStyle';
import type { StepState } from './containerStyle';

export interface StepperProps {
  steps: string[];
  current: number;
  testID?: string;
}

const stateLabel: Record<StepState, StringKey> = {
  done: 'container.stepDone',
  current: 'container.stepCurrent',
  upcoming: 'container.stepUpcoming',
};

export function Stepper({ steps, current, testID }: StepperProps) {
  if (steps.length === 0) return null;

  const states = stepStates(steps.length, current);
  const shownIndex = states.indexOf('current');

  return (
    <View testID={testID} style={styles.wrap}>
      <View style={styles.row}>
        {steps.map((step, index) => {
          const state = states[index];
          return (
            <React.Fragment key={`${index}-${step}`}>
              {index > 0 && <View style={styles.connector} />}
              <View
                testID={testID && `${testID}-step-${index}`}
                accessible
                accessibilityLabel={`${step}, ${t(stateLabel[state])}`}
                style={styles.dotSlot}
              >
                <Dot state={state} />
              </View>
            </React.Fragment>
          );
        })}
      </View>
      <Text variant="caption" tone="secondary" testID={testID && `${testID}-caption`}>
        {t('container.stepOf', { n: shownIndex + 1, total: steps.length })}
      </Text>
    </View>
  );
}

function Dot({ state }: { state: StepState }) {
  if (state === 'done') {
    return <Icon name="checkmark-circle" size="lg" tone="success" />;
  }
  if (state === 'current') {
    return (
      <View style={[styles.ring, styles.currentRing]}>
        <View style={styles.currentDot} />
      </View>
    );
  }
  return <View style={[styles.ring, styles.upcomingRing]} />;
}

const DOT = 20;

const styles = StyleSheet.create({
  wrap: {
    gap: space.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dotSlot: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connector: {
    flex: 1,
    height: 2,
    backgroundColor: color.border.subtle,
  },
  ring: {
    width: DOT,
    height: DOT,
    borderRadius: radius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentRing: {
    borderColor: color.action.primary,
    backgroundColor: color.bg.tintBlue,
  },
  currentDot: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
    backgroundColor: color.action.primary,
  },
  upcomingRing: {
    borderColor: color.border.input,
    backgroundColor: color.bg.screen,
  },
});
