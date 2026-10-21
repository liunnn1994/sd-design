import { querySelector } from '../_utils/dom.js';
import { isString } from '../_utils/is.js';

export function resolvePopupContainer<T extends HTMLElement | undefined>(state: {
  readonly popupContainer: string | HTMLElement | undefined;
  readonly defaultContainer: T;
}): HTMLElement | T {
  return (
    (isString(state.popupContainer) ? querySelector(state.popupContainer) : state.popupContainer) ||
    state.defaultContainer
  );
}
