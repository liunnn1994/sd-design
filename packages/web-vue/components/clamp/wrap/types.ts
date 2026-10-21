import type { WrapClampSlotProps, WrapClampItemSlotProps } from '@sdata/web-core/clamp/wrap/types';

// Derived from vue-clamp v1.7.2, Copyright (c) 2018-present GU Yiling. MIT; see THIRD_PARTY_NOTICES.md.
import type { ClampSlots, ClampSlotRender } from '../types';
export type * from '@sdata/web-core/clamp/wrap/types';
export interface WrapClampSlots<T = unknown> extends ClampSlots<WrapClampSlotProps<T>> {
  item: ClampSlotRender<WrapClampItemSlotProps<T>>;
}
