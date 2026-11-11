import type { Middleware } from '@floating-ui/dom';

import { arrow, flip, offset, shift, size } from '@floating-ui/dom';

import type { TriggerPosition } from '../_utils/constant.js';
import type { TriggerPopupTranslate } from './position.js';

export interface TriggerFloatingOptions {
  popupOffset: number;
  popupTranslate?: TriggerPopupTranslate;
  position: TriggerPosition;
  autoFitPosition: boolean;
  autoFitPopupSize: boolean;
  showArrow: boolean;
}

export function createTriggerMiddleware(
  options: TriggerFloatingOptions,
  arrowElement?: HTMLElement | null,
): Middleware[] {
  const middleware: Middleware[] = [offset(options.popupOffset)];
  const translate = Array.isArray(options.popupTranslate)
    ? options.popupTranslate
    : options.popupTranslate?.[options.position];
  if (translate) {
    middleware.push({
      name: 'sdTriggerTranslate',
      options: translate,
      fn: ({ x, y }) => ({ x: x + translate[0], y: y + translate[1] }),
    });
  }
  const padding = options.autoFitPopupSize ? 8 : 0;
  if (options.autoFitPosition) middleware.push(flip({ padding }), shift({ padding }));
  if (options.autoFitPopupSize) {
    middleware.push(
      size({
        padding,
        apply({ availableWidth, availableHeight, elements }) {
          elements.floating.style.setProperty(
            '--sd-trigger-available-width',
            `${Math.max(0, availableWidth)}px`,
          );
          elements.floating.style.setProperty(
            '--sd-trigger-available-height',
            `${Math.max(0, availableHeight)}px`,
          );
        },
      }),
    );
  }
  if (options.showArrow && arrowElement) middleware.push(arrow({ element: arrowElement }));
  return middleware;
}

export { autoUpdate, computePosition } from '@floating-ui/dom';
export type {
  ComputePositionConfig,
  ComputePositionReturn,
  Middleware,
  ReferenceElement,
  VirtualElement,
} from '@floating-ui/dom';
