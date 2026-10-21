// Derived from vue-clamp v1.7.2, Copyright (c) 2018-present GU Yiling. MIT; see THIRD_PARTY_NOTICES.md.
import type { ClampProps } from '../types.js';

export interface InlineClampParts {
  start?: string;
  body: string;
  end?: string;
}

export type InlineClampSplit = (text: string) => InlineClampParts;

export interface InlineClampProps extends Pick<
  ClampProps,
  'as' | 'ellipsis' | 'location' | 'boundary'
> {
  text: string;
  split?: InlineClampSplit;
}
