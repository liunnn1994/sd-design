import { h, type FunctionalComponent } from 'vue';

import { isServerRendering } from '../_utils/dom';
import IconFont from './icon-font.vue';

const scriptUrlCache: string[] = [];

export interface IconFontOptions {
  src?: string;
  extraProps?: { [key: string]: any };
}

export interface IconFontProps {
  type?: string;
  size?: number | string;
  rotate?: number;
  spin?: boolean;
}

export const addFromIconFontCn = (options: IconFontOptions) => {
  const { src, extraProps = {} } = options;

  if (!isServerRendering && src?.length && !scriptUrlCache.includes(src)) {
    const script = document.createElement('script');
    script.setAttribute('src', src);
    script.setAttribute('data-namespace', src);
    scriptUrlCache.push(src);
    document.body.appendChild(script);
  }

  const IconFontWithOptions: FunctionalComponent<IconFontProps> = (props, { slots }) =>
    h(IconFont, { ...props, extraProps }, slots);

  IconFontWithOptions.displayName = 'IconFont';
  IconFontWithOptions.props = {
    type: String,
    size: [Number, String],
    rotate: Number,
    spin: Boolean,
  };

  return IconFontWithOptions;
};
