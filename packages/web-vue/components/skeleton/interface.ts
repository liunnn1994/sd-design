export interface SkeletonProps {
  loading?: boolean;
  animation?: boolean;
}

export interface SkeletonLineProps {
  rows?: number;
  widths?: Array<number | string>;
  lineHeight?: number;
  lineSpacing?: number;
}

export interface SkeletonShapeProps {
  shape?: 'square' | 'circle';
  size?: 'small' | 'medium' | 'large';
}
