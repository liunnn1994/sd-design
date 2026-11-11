import type { TourPopoverDom } from '@sdata/web-core/tour/types';

import { driver } from '@sdata/web-core/tour/engine';
import {
  createTourPopover,
  getTourConfig,
  getTourSlotProps,
} from '@sdata/web-core/tour/foundation';
import { useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import type { TourConfig, TourProps } from './types.js';

export type {
  TourProps,
  TourInstance,
  TourAlignment,
  TourAllowedButton,
  TourConfig,
  TourController,
  TourExpose,
  TourStepHook,
  TourStep,
  TourPopover,
  TourPopoverDom,
  TourSide,
  TourState,
  TourSlotProps,
} from './types.js';

export function Tour({
  children,
  ref,
  renderTitle,
  renderDescription,
  renderProgress,
  renderFooter,
  ...config
}: TourProps) {
  const [instance] = useState(() => driver(getTourConfig(config)));
  const previousConfig = useRef(getTourConfig(config));
  const [popover, setPopover] = useState<TourPopoverDom>();
  const [hosts, setHosts] =
    useState<Record<'title' | 'description' | 'footer' | 'progress', HTMLDivElement>>();
  const live = useRef({ popover, renderTitle, renderDescription, renderProgress, renderFooter });
  live.current = { popover, renderTitle, renderDescription, renderProgress, renderFooter };
  const foundation = useRef<ReturnType<typeof createTourPopover> | undefined>(undefined);
  useLayoutEffect(() => {
    const createHost = () => {
      const element = document.createElement('div');
      element.style.display = 'contents';
      return element;
    };
    const elements = {
      title: createHost(),
      description: createHost(),
      footer: createHost(),
      progress: createHost(),
    };
    setHosts(elements);
    return () => Object.values(elements).forEach((element) => element.remove());
  }, []);
  useLayoutEffect(() => {
    const next = getTourConfig(config);
    const keys = Object.keys(next) as (keyof TourConfig)[];
    if (
      keys.length !== Object.keys(previousConfig.current).length ||
      keys.some((key) => !Object.is(next[key], previousConfig.current[key]))
    ) {
      previousConfig.current = next;
      instance.setConfig(next);
    }
  });
  useLayoutEffect(() => {
    const current = createTourPopover({
      driver: instance,
      get slots() {
        return {
          title: live.current.renderTitle,
          description: live.current.renderDescription,
          progress: live.current.renderProgress,
          footer: live.current.renderFooter,
        };
      },
      get popover() {
        return live.current.popover;
      },
      set popover(value) {
        live.current.popover = value;
        setPopover(value);
      },
      requestFrame: requestAnimationFrame,
      cancelFrame: cancelAnimationFrame,
      observe(callback) {
        const observer = new MutationObserver(callback);
        observer.observe(document.body, { childList: true });
        return () => observer.disconnect();
      },
    });
    foundation.current = current;
    current.connect();
    return () => {
      foundation.current = undefined;
      current.dispose();
    };
  }, [instance]);
  useImperativeHandle(ref, () => instance, [instance]);
  useLayoutEffect(() => {
    if (!popover) return;
    const observer = new ResizeObserver(() => foundation.current?.scheduleRefresh());
    observer.observe(popover.wrapper);
    return () => observer.disconnect();
  }, [popover]);
  const state = getTourSlotProps(instance, popover);
  useLayoutEffect(() => {
    if (!popover || !hosts) return;
    foundation.current?.syncSlots();
    const active = {
      title: renderTitle,
      description: renderDescription,
      footer: renderFooter,
      progress: !renderFooter && renderProgress,
    };
    for (const name of ['title', 'description', 'footer', 'progress'] as const) {
      if (active[name]) popover[name].appendChild(hosts[name]);
    }
  }, [popover, hosts, renderTitle, renderDescription, renderFooter, renderProgress]);
  return (
    <>
      {children}
      {popover && state && hosts && (
        <>
          {renderTitle && createPortal(renderTitle(state), hosts.title)}
          {renderDescription && createPortal(renderDescription(state), hosts.description)}
          {renderFooter
            ? createPortal(renderFooter(state), hosts.footer)
            : renderProgress && createPortal(renderProgress(state), hosts.progress)}
        </>
      )}
    </>
  );
}
