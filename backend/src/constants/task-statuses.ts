/**
 * Valid status values for tasks
 */
export const VALID_TASK_STATUSES = [
  'Assigned',
  'Claimed',
  'Pending Reach Out',
  'Pending Meeting',
  'Pending Employee Reach Out',
  'Pending Discussion',
  'Completed'
] as const;

export type TaskStatus = typeof VALID_TASK_STATUSES[number];

/**
 * Check if a value is a valid task status
 */
export function isValidTaskStatus(value: any): value is TaskStatus {
  return VALID_TASK_STATUSES.includes(value);
}

/**
 * Get a valid task status or return a default
 */
export function getValidTaskStatus(value: any, defaultStatus: TaskStatus = 'Assigned'): TaskStatus {
  return isValidTaskStatus(value) ? value : defaultStatus;
}
