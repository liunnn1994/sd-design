export interface SkeletonLineProps {
  rows?: number;
  widths?: Array<number | string>;
  lineHeight?: number;
  lineSpacing?: number;
}

export function getSkeletonLines({
  rows = 1,
  widths = [],
  lineHeight = 20,
  lineSpacing = 15,
}: SkeletonLineProps) {
  const lines: { width?: string; height: string; marginBottom: string; marginTop?: string }[] = [];
  for (let index = 0; index < rows; index++) {
    const width = widths[index];
    lines.push({
      ...(typeof width === 'number'
        ? { width: `${width}px` }
        : typeof width === 'string'
          ? { width }
          : {}),
      height: `${lineHeight}px`,
      marginBottom: '0',
      ...(index > 0 ? { marginTop: `${lineSpacing}px` } : {}),
    });
  }
  return lines;
}
