import type {
  RegexVisError,
  RegexVisFlag,
  RegexVisSelectInfo,
} from '@sdata/web-core/regex-vis/types';
import type { ComponentPropsWithRef, ReactNode } from 'react';

export type {
  RegexVisFlag,
  RegexVisNode,
  RegexVisError,
  RegexVisTranslate,
  RegexVisSelectInfo,
} from '@sdata/web-core/regex-vis/types';

export interface RegexVisProps extends Omit<
  ComponentPropsWithRef<'section'>,
  'onSelect' | 'onError' | 'defaultValue' | 'children'
> {
  value?: string;
  defaultValue?: string;
  flags?: RegexVisFlag[];
  defaultFlags?: RegexVisFlag[];
  readonly?: boolean;
  showInput?: boolean;
  showFlags?: boolean;
  selectable?: boolean;
  placeholder?: string;
  emptyText?: string;
  ariaLabel?: string;
  onValueChange?: (value: string) => void;
  onFlagsChange?: (flags: RegexVisFlag[]) => void;
  onSelect?: (info: RegexVisSelectInfo) => void;
  onError?: (error: RegexVisError | undefined) => void;
  renderEmpty?: (params: { text: string }) => ReactNode;
  renderError?: (params: { error: RegexVisError }) => ReactNode;
  renderFooter?: (params: { value: string; flags: RegexVisFlag[] }) => ReactNode;
}
