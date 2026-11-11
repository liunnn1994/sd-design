import type { IconNode, IconStrokeProps } from '@sdata/web-core/icon/types';
import type { ComponentPropsWithRef, ReactNode } from 'react';

import { getIconStyle } from '@sdata/web-core/icon/foundation';
import { createElement } from 'react';

import { usePrefix } from '../config-provider/index.js';

export interface GeneratedIconProps
  extends Omit<ComponentPropsWithRef<'svg'>, keyof IconStrokeProps | 'children'>, IconStrokeProps {}
export type GeneratedIconInstance = SVGSVGElement;

function attributes(source: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(source).map(([name, value]) => [
      /^(aria|data)-/.test(name)
        ? name
        : name.replace(/[-:]([a-z])/g, (_, letter: string) => letter.toUpperCase()),
      value,
    ]),
  );
}

function renderNode(node: IconNode | string, key: number): ReactNode {
  if (typeof node === 'string') return node;
  return createElement(
    node.tag,
    { ...attributes(node.attributes), key },
    ...node.children.map(renderNode),
  );
}

export function createIcon(name: string, displayName: string, definition: IconNode) {
  const svgAttributes = attributes(definition.attributes);
  const content = definition.children.map(renderNode);
  function GeneratedIcon({
    size,
    rotate,
    spin,
    strokeWidth = 4,
    strokeLinecap = 'butt',
    strokeLinejoin = 'miter',
    className,
    style,
    ...attrs
  }: GeneratedIconProps) {
    const prefix = usePrefix('icon');
    return (
      <svg
        {...svgAttributes}
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin as ComponentPropsWithRef<'svg'>['strokeLinejoin']}
        {...attrs}
        className={[prefix, `${prefix}-${name}`, spin && `${prefix}-spin`, className]
          .filter(Boolean)
          .join(' ')}
        style={{ ...getIconStyle({ size, rotate }), ...style }}
      >
        {content}
      </svg>
    );
  }
  GeneratedIcon.displayName = displayName;
  return GeneratedIcon;
}
