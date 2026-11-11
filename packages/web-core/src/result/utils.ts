export const RESULT_STATUS = [
  'info',
  'success',
  'warning',
  'error',
  '403',
  '404',
  '500',
  null,
] as const;
export type ResultStatus = (typeof RESULT_STATUS)[number];

export function resolveResultStatus(status: unknown): ResultStatus {
  return RESULT_STATUS.includes(status as ResultStatus) ? (status as ResultStatus) : 'info';
}
