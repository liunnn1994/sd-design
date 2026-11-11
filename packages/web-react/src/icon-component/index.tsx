import type {
  IconFontProps as CoreIconProps,
  IconFontOptions as CoreIconFontOptions,
} from '@sdata/web-core/icon/types';
import type { ComponentPropsWithRef } from 'react';

import { getIconStyle, loadIconFontScript } from '@sdata/web-core/icon/foundation';

import { usePrefix } from '../config-provider/index.js';

export interface IconProps
  extends Omit<ComponentPropsWithRef<'svg'>, keyof CoreIconProps>, CoreIconProps {}
export type IconFontProps = IconProps;
export type IconFontOptions = CoreIconFontOptions<Partial<IconProps> & Record<string, unknown>>;
export type IconInstance = SVGSVGElement;

function IconView({ type, size, rotate, spin, className, style, children, ...attrs }: IconProps) {
  const prefix = usePrefix('icon');
  return (
    <svg
      fill="currentColor"
      {...attrs}
      className={[prefix, spin && `${prefix}-loading`, type, className].filter(Boolean).join(' ')}
      style={{ ...getIconStyle({ size, rotate }), ...style }}
    >
      {children}
    </svg>
  );
}

export function addFromIconFontCn({ src, extraProps = {} }: IconFontOptions) {
  loadIconFontScript(src);
  function IconFont({
    type,
    size,
    rotate,
    spin,
    children,
    className,
    style,
    ...attrs
  }: IconFontProps) {
    const forwarded = { ...attrs };
    for (const [name, configured] of Object.entries(extraProps)) {
      const supplied = Reflect.get(attrs, name);
      if (
        /^on[A-Z]/.test(name) &&
        typeof configured === 'function' &&
        typeof supplied === 'function' &&
        configured !== supplied
      ) {
        Reflect.set(forwarded, name, (...args: unknown[]) => {
          configured(...args);
          supplied(...args);
        });
      }
    }
    return (
      <IconView
        type={type}
        size={size}
        rotate={rotate}
        spin={spin}
        {...extraProps}
        {...forwarded}
        className={[extraProps.className, className].filter(Boolean).join(' ')}
        style={{ ...extraProps.style, ...style }}
      >
        {type ? <use xlinkHref={`#${type}`} /> : children}
      </IconView>
    );
  }
  IconFont.displayName = 'IconFont';
  return IconFont;
}

export const Icon = Object.assign(IconView, { addFromIconFontCn });
export default Icon;
