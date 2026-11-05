// English string catalog for the design system.
// Every user-visible string in design/ must come from this object.
// Keys are typed through `StringKey` (see ./index.ts), so a missing key fails typecheck.
// Placeholders use {name} and are filled by `t()`.

export const en = {
  'common.retry': 'Retry',
  'common.cancel': 'Cancel',
  'common.done': 'Done',
  'common.undo': 'Undo',
  'common.close': 'Close',
  'common.viewAll': 'View all',
  'common.clearAll': 'Clear all',
  'common.showPassword': 'Show password',
  'common.hidePassword': 'Hide password',
  'common.optional': 'Optional',
  'common.loading': 'Loading',

  'feedback.errorTitle': 'Something went wrong',
  'feedback.errorBody': 'Nothing was lost. Please try again.',
  'feedback.offlineTitle': 'You are offline',
  'feedback.lastUpdated': 'Last updated {time}',
  'feedback.syncPending': 'Saved on this device, waiting to sync',
  'feedback.synced': 'All changes synced',
  'feedback.syncError': 'Could not sync. Will retry.',
  'feedback.noResults': 'No results',

  'status.upcoming': 'Upcoming · {time}',
  'status.dueNow': 'Due now',
  'status.snoozed': 'Reminder at {time}',
  'status.taken': 'Taken at {time}',
  'status.skipped': 'Skipped',
  'status.missedByUser': 'Marked missed',
  'status.notConfirmed': 'Not confirmed',

  'trust.fromDocument': 'From document',
  'trust.addedByYou': 'Added by you',
  'trust.fromDoctor': "From doctor's record",
  'trust.aiDraft': 'AI draft',
  'trust.verifiedByYou': 'Verified by you',
  'trust.uncertain': 'Uncertain',
  'trust.revisions': 'See revision history',
  'trust.asOf': 'As of {date}',

  'password.ruleLength': 'At least 8 characters',
  'password.ruleNumber': 'At least 1 number',
  'password.ruleLetter': 'At least 1 letter',

  'nav.today': 'Today',
  'nav.records': 'Records',
  'nav.medicines': 'Medicines',
  'nav.healthPlan': 'Health Plan',
  'nav.profile': 'Profile',
  'nav.notifications': 'Notifications',
  'nav.notificationsCount': '{count} new notifications',

  'patient.viewing': 'Viewing {name}',

  'passkey.use': 'Use a passkey',

  'disclaimer.notMedicalAdvice': 'Ayoreni organizes your records. It does not give medical advice.',
} as const;
