import type { UnionToIntersection } from 'type-fest';

import type { App, RenderFunction } from 'vue';
import { VNode } from 'vue';

export interface SDOptions {
  classPrefix?: string;
  componentPrefix?: string;
}

export interface SDIconOptions {
  iconPrefix?: string;
}

export interface SDGlobalConfig {
  classPrefix?: string;
}

export type BaseType = string | number;
export type UnionType = BaseType | Record<string, unknown>;
export type Data = Record<string, unknown>;
export type RenderContent = string | RenderFunction;

export type EmitFn<T> = (event: T, ...args: unknown[]) => void;

export type EmitFn2<
  Options = Record<string, unknown>,
  Event extends keyof Options = keyof Options,
> = UnionToIntersection<
  {
    [key in Event]: Options[key] extends (...args: infer Args) => unknown
      ? (event: key, ...args: Args) => void
      : (event: key, ...args: unknown[]) => void;
  }[Event]
>;

export type EmitType<T> = T | T[];

export type SFCWithInstall<T, D = Record<string, never>> = T &
  D & {
    install: (app: App, opt?: SDOptions) => void;
  };

export type ClassName = string | Record<string, boolean> | (string | Record<string, boolean>)[];

export type FieldString<T> = {
  [K in keyof T]?: string;
};

export interface SlotChildren {
  value?: VNode[];
}

export interface ValueData {
  value: string | number;
  label: string;
  closable?: boolean;

  [other: string]: unknown;
}

export type AnimationDuration =
  | number
  | {
      enter: number;
      leave: number;
    };
