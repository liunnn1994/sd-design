// Derived from vue-clamp v1.7.2, Copyright (c) 2018-present GU Yiling. MIT; see THIRD_PARTY_NOTICES.md.
import type { ClampExposed, ClampProps, ClampSlots, ClampSlotProps } from '../types';

export interface RichLineClampProps extends Pick<
  ClampProps,
  'as' | 'maxLines' | 'maxHeight' | 'ellipsis' | 'boundary' | 'expanded'
> {
  html: string;
}

export type RichLineClampSlotProps = ClampSlotProps;

export type RichLineClampExposed = ClampExposed;

export type RichLineClampSlots = ClampSlots<RichLineClampSlotProps>;
