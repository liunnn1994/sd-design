import type { ClampSlotProps } from '@sdata/web-core/clamp/types';

// Derived from vue-clamp v1.7.2, Copyright (c) 2018-present GU Yiling. MIT; see THIRD_PARTY_NOTICES.md.
import type { VNodeChild } from 'vue';
export type * from '@sdata/web-core/clamp/types';
export type ClampSlotRender<Props> = (props: Props) => VNodeChild;
export interface ClampSlots<Props = ClampSlotProps> {
  before?: ClampSlotRender<Props>;
  after?: ClampSlotRender<Props>;
}
