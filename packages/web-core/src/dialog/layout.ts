import { isNumber, isUndefined } from '../_utils/is.js';

export function applyModalLayout<
  Style extends { width?: string | number; top?: string | number; transform?: string },
>(
  style: Style,
  options: {
    width: string | number | undefined;
    fullscreen: boolean;
    alignCenter: boolean;
    top: string | number | undefined;
    position: [number, number] | undefined;
  },
): Style {
  if (options.width && !options.fullscreen)
    style.width = isNumber(options.width) ? `${options.width}px` : options.width;
  if (!options.alignCenter && !isUndefined(options.top))
    style.top = isNumber(options.top) ? `${options.top}px` : options.top;
  if (options.position)
    style.transform = `translate(${options.position[0]}px, ${options.position[1]}px)`;
  return style;
}

export function applyDrawerLayout<
  Style extends { width?: string | number; height?: string | number },
>(
  style: Style,
  placement: string,
  width: string | number | undefined,
  height: string | number | undefined,
): Style {
  if (['right', 'left'].includes(placement)) style.width = isNumber(width) ? `${width}px` : width;
  else style.height = isNumber(height) ? `${height}px` : height;
  return style;
}
