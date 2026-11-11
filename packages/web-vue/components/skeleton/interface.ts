export interface SkeletonProps {
  loading?: boolean;
  animation?: boolean;
}

export type { SkeletonLineProps } from '@sdata/web-core/skeleton/foundation';

export interface SkeletonShapeProps {
  shape?: 'square' | 'circle';
  size?: 'small' | 'medium' | 'large';
}
