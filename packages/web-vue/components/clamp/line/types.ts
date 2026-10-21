// Derived from vue-clamp v1.7.2, Copyright (c) 2018-present GU Yiling. MIT; see THIRD_PARTY_NOTICES.md.
import type { ClampExposed, ClampProps, ClampSlots, ClampSlotProps } from '../types';

export type LineClampSlotProps = ClampSlotProps;

export type LineClampExposed = ClampExposed;

export type LineClampSlots = ClampSlots<LineClampSlotProps>;

export interface LineClampProps extends Pick<
  ClampProps,
  'as' | 'maxLines' | 'maxHeight' | 'ellipsis' | 'location' | 'boundary' | 'expanded'
> {
  text?: string;
}
