import { createColorPanel } from '@sdata/web-core/color-picker/panel';
import {
  getActiveGradientPoint,
  getFormatInputs,
  normalizeFormat,
  parseColorState,
} from '@sdata/web-core/color-picker/utils';
import { useLayoutEffect, useReducer, useRef, useState } from 'react';

import { useAfterRender } from '../_shared/use-after-render.js';

export type ColorPanelOptions = Parameters<typeof createColorPanel>[0]['props'];

export function useColorPanel(props: ColorPanelOptions) {
  const live = useRef(props);
  live.current = props;
  const track = useRef<HTMLButtonElement>(null);
  const shell = useRef<HTMLDivElement>(null);
  const [, render] = useReducer((value: number) => value + 1, 0);
  const afterRender = useAfterRender();
  const epoch = useRef(0);
  useLayoutEffect(() => {
    epoch.current++;
    return () => {
      epoch.current++;
    };
  }, []);
  const [snapshot] = useState(() => {
    const state = parseColorState(props.value, props.colorModes);
    const format = normalizeFormat(props.format, props.enableAlpha);
    return {
      state,
      format,
      drafts: getFormatInputs(
        getActiveGradientPoint(state)?.hsva ?? state.hsva,
        format,
        props.enableAlpha,
      ),
    };
  });
  const [foundation] = useState(() =>
    createColorPanel({
      get props() {
        return live.current;
      },
      get state() {
        return snapshot.state;
      },
      set state(next) {
        snapshot.state = next;
        render();
      },
      get format() {
        return snapshot.format;
      },
      set format(next) {
        snapshot.format = next;
        render();
      },
      get drafts() {
        return snapshot.drafts;
      },
      set drafts(next) {
        snapshot.drafts = next;
        render();
      },
      afterRender(callback) {
        const activeEpoch = epoch.current;
        void afterRender().then(() => {
          if (epoch.current === activeEpoch) callback();
        });
      },
      trackRect: () => (track.current ?? shell.current)?.getBoundingClientRect(),
      isTrackTarget: (event) => event.target === track.current || event.target === shell.current,
    }),
  );
  const modes = props.colorModes.join('|');
  const previous = useRef({
    value: props.value,
    modes,
    format: props.format,
    alpha: props.enableAlpha,
  });
  useLayoutEffect(() => {
    if (previous.current.value !== props.value || previous.current.modes !== modes) {
      previous.current.value = props.value;
      previous.current.modes = modes;
      foundation.syncValue();
    }
    if (previous.current.format !== props.format || previous.current.alpha !== props.enableAlpha) {
      previous.current.format = props.format;
      previous.current.alpha = props.enableAlpha;
      foundation.syncFormat();
    }
  }, [foundation, props.value, modes, props.format, props.enableAlpha]);
  return { ...snapshot, foundation, track, shell };
}
