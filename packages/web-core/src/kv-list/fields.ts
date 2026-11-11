import type { KvListType } from './types.js';

import { COMMON_HTTP_HEADERS } from './constants.js';
export function getKvListFieldProps<T extends { disabled?: boolean }>(
  props: T | undefined,
  disabled: boolean,
  placeholder: string,
) {
  return { placeholder, ...props, disabled: disabled || Boolean(props?.disabled) };
}
export function getKvListKeyProps<T extends { disabled?: boolean }>(
  props: T | undefined,
  disabled: boolean,
  placeholder: string,
  type?: KvListType,
) {
  return {
    ...(type === 'http-header' ? { data: [...COMMON_HTTP_HEADERS] } : {}),
    ...getKvListFieldProps(props, disabled, placeholder),
  };
}
