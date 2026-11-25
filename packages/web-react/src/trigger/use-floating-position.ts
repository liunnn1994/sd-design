import type {
  ComputePositionConfig,
  ComputePositionReturn,
  ReferenceElement,
  TriggerFloatingOptions,
} from '@sdata/web-core/trigger/floating';

import {
  autoUpdate,
  computePosition,
  createTriggerMiddleware,
} from '@sdata/web-core/trigger/floating';
import { toFloatingPlacement } from '@sdata/web-core/trigger/position';
import { useLayoutEffect, useState } from 'react';

export interface FloatingOptions extends Partial<ComputePositionConfig> {
  whileElementsMounted?: (
    reference: ReferenceElement,
    floating: HTMLElement,
    update: () => void,
  ) => () => void;
}

export function useFloatingPosition(
  reference: ReferenceElement | null,
  popup: HTMLElement | null,
  arrowElement: HTMLElement | null,
  visible: boolean,
  options: TriggerFloatingOptions & {
    autoFixPosition: boolean;
    updateAtScroll: boolean;
    floatingOptions?: FloatingOptions | undefined;
  },
) {
  const [position, setPosition] = useState<ComputePositionReturn>();
  const {
    popupOffset,
    popupTranslate,
    position: placement,
    autoFitPosition,
    autoFitPopupSize,
    showArrow,
    autoFixPosition,
    updateAtScroll,
    floatingOptions,
  } = options;
  useLayoutEffect(() => {
    if (!visible || !reference || !popup) return;
    setPosition(undefined);
    let disposed = false;
    let request = 0;
    const update = () => {
      const currentRequest = ++request;
      void computePosition(reference, popup, {
        placement: toFloatingPlacement(placement),
        middleware: createTriggerMiddleware(
          {
            popupOffset,
            popupTranslate,
            position: placement,
            autoFitPosition,
            autoFitPopupSize,
            showArrow,
          },
          arrowElement,
        ),
        ...floatingOptions,
      }).then((next) => {
        if (!disposed && currentRequest === request) setPosition(next);
      });
    };
    const cleanup = floatingOptions?.whileElementsMounted
      ? floatingOptions.whileElementsMounted(reference, popup, update)
      : autoUpdate(reference, popup, update, {
          ancestorScroll: updateAtScroll,
          ancestorResize: true,
          elementResize: autoFixPosition,
          layoutShift: autoFixPosition,
        });
    return () => {
      disposed = true;
      cleanup();
    };
  }, [
    reference,
    popup,
    arrowElement,
    visible,
    popupOffset,
    popupTranslate,
    placement,
    autoFitPosition,
    autoFitPopupSize,
    showArrow,
    autoFixPosition,
    updateAtScroll,
    floatingOptions,
  ]);
  return position;
}
