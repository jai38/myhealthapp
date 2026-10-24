export const AndroidImportance = {
  MAX: 5,
  HIGH: 4,
  DEFAULT: 3,
  LOW: 2,
  MIN: 1,
  NONE: 0,
};

export const AndroidNotificationPriority = {
  MAX: 'max',
  HIGH: 'high',
  DEFAULT: 'default',
  LOW: 'low',
  MIN: 'min',
};

export const SchedulableTriggerInputTypes = {
  CALENDAR: 'calendar',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
  DATE: 'date',
  TIME_INTERVAL: 'timeInterval',
};

export const setNotificationHandler = () => {};
export const getPermissionsAsync = async () => ({ status: 'granted' });
export const requestPermissionsAsync = async () => ({ status: 'granted' });
export const setNotificationChannelAsync = async () => {};
export const scheduleNotificationAsync = async () => 'mock-notif-id-123';
export const cancelScheduledNotificationAsync = async () => {};
export const getAllScheduledNotificationsAsync = async () => [];
export const getPresentedNotificationsAsync = async () => [];
export const dismissNotificationAsync = async () => {};
export const dismissAllNotificationsAsync = async () => {};
export const cancelAllScheduledNotificationsAsync = async () => {};
