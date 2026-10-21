import type { ClampStyle } from '../clamp/style-types.js';

export function resolveEllipsisMaxLines(lineClamp: number | string | undefined) {
  if (lineClamp === undefined) return 1;
  const value = Number(lineClamp);
  return Number.isFinite(value) && value > 0 ? value : 1;
}

export function getEllipsisRootStyle(
  isLineClamp: boolean,
  expanded: boolean,
  getMaxLines: () => number,
): ClampStyle {
  if (isLineClamp) {
    return expanded
      ? {
          overflow: 'visible',
          textOverflow: 'clip',
          display: 'block',
          whiteSpace: 'normal',
          WebkitLineClamp: 'unset',
          WebkitBoxOrient: 'vertical',
        }
      : {
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          whiteSpace: 'normal',
          WebkitLineClamp: String(getMaxLines()),
          WebkitBoxOrient: 'vertical',
        };
  }
  return expanded
    ? { overflow: 'visible', textOverflow: 'clip', whiteSpace: 'normal' }
    : { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
}

export function getEllipsisMeasurementStyle(width: number, padding: string): ClampStyle {
  return {
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: -1,
    boxSizing: 'border-box',
    width: `${width}px`,
    padding: padding,
    margin: 0,
    visibility: 'hidden',
    pointerEvents: 'none',
    whiteSpace: 'normal',
  };
}
