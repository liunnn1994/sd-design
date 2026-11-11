import type { SkeletonLineProps as CoreLineProps } from '@sdata/web-core/skeleton/foundation';
import type { ComponentRef as ReactComponentRef } from 'react';
import type { ComponentPropsWithRef, ReactNode } from 'react';

import { getSkeletonLines } from '@sdata/web-core/skeleton/foundation';

import { usePrefix } from '../config-provider/index.js';

export interface SkeletonProps extends Omit<ComponentPropsWithRef<'div'>, 'content'> {
  loading?: boolean;
  animation?: boolean;
  content?: ReactNode;
}

function SkeletonRoot({
  loading = true,
  animation = false,
  content,
  children,
  className,
  ...attrs
}: SkeletonProps) {
  const prefix = usePrefix('skeleton');
  return (
    <div
      {...attrs}
      aria-busy={loading || undefined}
      className={[prefix, animation && `${prefix}-animation`, className].filter(Boolean).join(' ')}
    >
      {loading ? children : content}
    </div>
  );
}

export interface SkeletonLineProps
  extends Omit<ComponentPropsWithRef<'ul'>, 'children'>, CoreLineProps {}

export function SkeletonLine({
  rows,
  widths,
  lineHeight,
  lineSpacing,
  className,
  ...attrs
}: SkeletonLineProps) {
  const prefix = usePrefix('skeleton-line');
  return (
    <ul {...attrs} className={[prefix, className].filter(Boolean).join(' ')}>
      {getSkeletonLines({ rows, widths, lineHeight, lineSpacing }).map((style, index) => (
        <li key={index} className={`${prefix}-row`} style={style} />
      ))}
    </ul>
  );
}

export interface SkeletonShapeProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  shape?: 'square' | 'circle';
  size?: 'small' | 'medium' | 'large';
}

export function SkeletonShape({
  shape = 'square',
  size = 'medium',
  className,
  ...attrs
}: SkeletonShapeProps) {
  const prefix = usePrefix('skeleton-shape');
  return (
    <div
      {...attrs}
      className={[prefix, `${prefix}-${shape}`, `${prefix}-${size}`, className]
        .filter(Boolean)
        .join(' ')}
    />
  );
}

export const Skeleton = Object.assign(SkeletonRoot, { Line: SkeletonLine, Shape: SkeletonShape });
export default Skeleton;

export type SkeletonInstance = ReactComponentRef<typeof Skeleton>;
export type SkeletonLineInstance = ReactComponentRef<typeof SkeletonLine>;
export type SkeletonShapeInstance = ReactComponentRef<typeof SkeletonShape>;
