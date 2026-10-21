// Derived from vue-clamp v1.7.2, Copyright (c) 2018-present GU Yiling. MIT; see THIRD_PARTY_NOTICES.md.
import type { ClampExposed, ClampProps, ClampSlotProps } from '../types.js';

export type WrapClampItemKey<T = unknown> = string | ((item: T, index: number) => string | number);

export interface WrapClampItemSlotProps<T = unknown> {
  item: T;
  index: number;
}

export interface WrapClampSlotProps<T = unknown> extends ClampSlotProps {
  hiddenItems: readonly T[];
}

export type WrapClampExposed = ClampExposed;

export interface WrapClampProps<T = unknown> extends Pick<
  ClampProps,
  'as' | 'maxLines' | 'maxHeight' | 'expanded'
> {
  items?: readonly T[];
  itemKey?: WrapClampItemKey<T>;
}

export type SequenceMeasurement = {
  allFit: boolean;
  beforeSize: Size | null;
  visibleItems: number;
};

export type ClampLimits = {
  clipToRootHeight: boolean;
  lineLimit: number | undefined;
};

export type Size = {
  height: number;
  width: number;
};
