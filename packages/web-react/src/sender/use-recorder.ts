import type { RecorderCoreInstance } from '@sdata/web-core/sender/recorder-engine';

import { createSenderRecorder, type SenderRecorderState } from '@sdata/web-core/sender/recorder';
import Recorder from '@sdata/web-core/sender/recorder-engine';
import { useLayoutEffect, useReducer, useRef, useState } from 'react';

import type { SenderProps } from './types.js';

import { useI18n } from '../locale/index.js';

export function useSenderRecorder(props: SenderProps) {
  const [, refresh] = useReducer((value: number) => value + 1, 0);
  const current = useRef(props);
  current.current = props;
  const data = useRef({
    supported: false,
    recording: false,
    level: 0,
    requesting: false,
    stopping: false,
    permissionDenied: false,
    captureError: undefined as string | undefined,
    recorder: undefined as SenderRecorderState['recorder'],
  });
  function set<Key extends keyof typeof data.current>(key: Key, value: (typeof data.current)[Key]) {
    if (data.current[key] !== value) {
      data.current[key] = value;
      refresh();
    }
  }
  const [controller] = useState(() =>
    createSenderRecorder(
      {
        get config() {
          return current.current.allowSpeech;
        },
        get available(): boolean {
          return controller.available();
        },
        get supported() {
          return data.current.supported;
        },
        set supported(value) {
          set('supported', value);
        },
        get recording() {
          return data.current.recording;
        },
        set recording(value) {
          set('recording', value);
        },
        get level() {
          return data.current.level;
        },
        set level(value) {
          set('level', value);
        },
        get requesting() {
          return data.current.requesting;
        },
        set requesting(value) {
          set('requesting', value);
        },
        get stopping() {
          return data.current.stopping;
        },
        set stopping(value) {
          set('stopping', value);
        },
        get permissionDenied() {
          return data.current.permissionDenied;
        },
        set permissionDenied(value) {
          set('permissionDenied', value);
        },
        get captureError() {
          return data.current.captureError;
        },
        set captureError(value) {
          set('captureError', value);
        },
        get recorder() {
          return data.current.recorder;
        },
        set recorder(value) {
          set('recorder', value);
        },
      },
      Recorder,
      {
        onStop: (...args) => current.current.onSpeechEnd?.(...args),
        onError: (...args) => current.current.onSpeechError?.(...args),
      },
    ),
  );
  useLayoutEffect(() => {
    controller.mount();
    return controller.dispose;
  }, [controller]);
  useLayoutEffect(() => {
    controller.syncEnabled(Boolean(props.allowSpeech));
  }, [controller, Boolean(props.allowSpeech)]);
  const { t } = useI18n();
  return {
    Recorder,
    get recorder() {
      return data.current.recorder as RecorderCoreInstance | undefined;
    },
    get recording() {
      return data.current.recording;
    },
    get level() {
      return data.current.level;
    },
    get requesting() {
      return data.current.requesting;
    },
    get stopping() {
      return data.current.stopping;
    },
    get available() {
      return controller.available();
    },
    statusText: t(controller.statusKey()),
    trigger: controller.trigger,
  };
}
