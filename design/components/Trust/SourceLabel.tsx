import React from 'react';
import type { TrustKind } from '../../status';
import { trustLabelDisplay } from '../../status';
import { StatusPill } from './StatusPill';

export interface SourceLabelProps {
  kind: Extract<TrustKind, 'fromDocument' | 'addedByYou' | 'fromDoctor'>;
  testID?: string;
}

export function SourceLabel({ kind, testID }: SourceLabelProps) {
  return <StatusPill display={trustLabelDisplay(kind)} testID={testID} />;
}
