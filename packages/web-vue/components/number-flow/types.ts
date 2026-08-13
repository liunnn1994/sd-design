import type { CSSProperties } from 'vue';

export type NumberFlowValue = number | string;

export type NumberFlowFormat = Omit<Intl.NumberFormatOptions, 'notation'> & {
  notation?: Exclude<Intl.NumberFormatOptions['notation'], 'scientific' | 'engineering'>;
};

export type NumberFlowTrend = number | ((oldValue: number, value: number) => number);

export type NumberFlowDigitOptions = { max?: number };
export type NumberFlowDigits = Record<number, NumberFlowDigitOptions>;

export interface NumberFlowDigitContext {
  position: number;
  length: number;
  trend: number;
  highestChangedPosition?: number;
}

export interface NumberFlowPluginContext {
  value: number;
  previousValue: number;
  trend: number;
}

export interface NumberFlowPlugin {
  onUpdate?(context: NumberFlowPluginContext): void;
  getDelta?(value: number, previousValue: number, context: NumberFlowDigitContext): number | void;
}

export interface NumberFlowProps {
  value: NumberFlowValue;
  locales?: Intl.LocalesArgument;
  format?: NumberFlowFormat;
  prefix?: string;
  suffix?: string;
  trend?: NumberFlowTrend;
  plugins?: NumberFlowPlugin[];
  animated?: boolean;
  transformTiming?: KeyframeAnimationOptions;
  spinTiming?: KeyframeAnimationOptions;
  opacityTiming?: KeyframeAnimationOptions;
  respectMotionPreference?: boolean;
  digits?: NumberFlowDigits;
  willChange?: boolean;
  /** CSP nonce for strict-dynamic environments */
  nonce?: string;
}

export interface NumberFlowExposed {
  el: HTMLElement | null;
}

export type NumberFlowStyle = CSSProperties & Record<`--${string}`, string | number>;
