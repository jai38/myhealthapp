import type { StatusDisplay } from '../../../design/status';

// Review-state pills. These describe the draft, never a dose, so they are not doseStatusDisplay results.
export const CLINICAL_REVIEW_PILL: StatusDisplay = {
  labelKey: 'prescriptions.review.clinicalReview',
  tone: 'caution',
  variant: 'soft',
  icon: 'medkit-outline',
};

export const INCOMPLETE_PILL: StatusDisplay = {
  labelKey: 'prescriptions.review.incomplete',
  tone: 'caution',
  variant: 'soft',
  icon: 'alert-circle-outline',
};

export const ACTIVE_AS_NEEDED_PILL: StatusDisplay = {
  labelKey: 'prescriptions.review.activeAsNeeded',
  tone: 'success',
  variant: 'soft',
  icon: 'checkmark-circle',
};

export const ACTIVE_REGIMEN_PILL: StatusDisplay = {
  labelKey: 'prescriptions.review.activeRegimen',
  tone: 'success',
  variant: 'soft',
  icon: 'checkmark-circle',
};

export const HISTORICAL_PILL: StatusDisplay = {
  labelKey: 'prescriptions.review.historical',
  tone: 'neutral',
  variant: 'soft',
  icon: 'ellipse-outline',
};
