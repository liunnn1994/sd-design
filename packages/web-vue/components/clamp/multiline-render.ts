// Derived from vue-clamp v1.7.2, Copyright (c) 2018-present GU Yiling. MIT; see THIRD_PARTY_NOTICES.md.
import { h } from 'vue';
import type { CSSProperties, VNodeChild } from 'vue';

import type { MultilineAffixRefSetter } from './multiline';
import type { ClampSlotProps, ClampSlotRender } from './types';

import { hasSlotContent } from './slot';

type MultilineAffixSlotOptions = {
  part: 'before' | 'after';
  render: ClampSlotRender<ClampSlotProps>;
  setRef: MultilineAffixRefSetter;
  slotProps: ClampSlotProps;
  slotStyle: CSSProperties;
};

export function renderMultilineAffixSlot({
  part,
  render,
  setRef,
  slotProps,
  slotStyle,
}: MultilineAffixSlotOptions): VNodeChild {
  const content = render(slotProps);
  if (!hasSlotContent(content)) {
    return null;
  }

  return h(
    'span',
    {
      'data-part': part,
      'ref': setRef,
      'style': slotStyle,
    },
    content,
  );
}
