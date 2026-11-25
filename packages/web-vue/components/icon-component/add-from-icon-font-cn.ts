import type {
  IconFontOptions as CoreIconFontOptions,
  IconFontProps as CoreIconFontProps,
} from '@sdata/web-core/icon/types';

import { h, type FunctionalComponent } from 'vue';

import { definedProps } from '@sdata/web-core/_utils/defined-props';
import { loadIconFontScript } from '@sdata/web-core/icon/foundation';

import IconFont from './icon-font.vue';

export interface IconFontOptions extends CoreIconFontOptions {}
export interface IconFontProps extends CoreIconFontProps {}

export const addFromIconFontCn = (options: IconFontOptions) => {
  const { src, extraProps = {} } = options;

  loadIconFontScript(src);

  const IconFontWithOptions: FunctionalComponent<IconFontProps> = (props, { slots }) =>
    h(IconFont, { ...definedProps(props), extraProps }, slots);

  IconFontWithOptions.displayName = 'IconFont';
  IconFontWithOptions.props = {
    type: String,
    size: [Number, String],
    rotate: Number,
    spin: Boolean,
  };

  return IconFontWithOptions;
};
