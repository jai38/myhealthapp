import React from 'react';
import { trustLabelDisplay } from '../../status';
import { StatusPill } from './StatusPill';

export interface VerificationLabelProps {
  verified: boolean;
  testID?: string;
}

// AI output stays a draft until the patient confirms it.
export function VerificationLabel({ verified, testID }: VerificationLabelProps) {
  const display = verified ? trustLabelDisplay('verifiedByYou') : trustLabelDisplay('aiDraft');
  return <StatusPill display={display} testID={testID} />;
}
