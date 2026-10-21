import type { CSSProperties } from 'vue';

export type {
  NumberFlowValue,
  NumberFlowFormat,
  NumberFlowTrend,
  NumberFlowDigitOptions,
  NumberFlowDigits,
  NumberFlowDigitContext,
  NumberFlowPluginContext,
  NumberFlowPlugin,
  NumberFlowProps,
} from '@sdata/web-core/number-flow/types';

export interface NumberFlowExposed {
  el: HTMLElement | null;
}

export type NumberFlowStyle = CSSProperties & Record<`--${string}`, string | number>;
