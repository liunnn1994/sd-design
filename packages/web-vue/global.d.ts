/// <reference types="vitest/globals" />
/// <reference types="vite/client" />

type RuntimeDomNativeElements = import('@vue/runtime-dom').NativeElements;
type RuntimeDomReservedProps = import('@vue/runtime-dom').ReservedProps;

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  // oxlint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare namespace JSX {
  export type Element = import('vue').VNode;
  export interface ElementClass {
    // oxlint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
    $props: {};
  }
  export interface ElementAttributesProperty {
    // oxlint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
    $props: {};
  }
  export interface IntrinsicElements extends RuntimeDomNativeElements {
    [name: string]: any;
  }
  export type IntrinsicAttributes = RuntimeDomReservedProps;
}

declare module '*.scss' {
  const content: string;
  export default content;
}

declare module '*.css' {
  const content: string;
  export default content;
}

declare module '*.md' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, never>, Record<string, never>, any>;
  export default component;
}

declare module '../icon/*' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, never>, Record<string, never>, any>;
  export default component;
}

declare module '../../icon/*' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, never>, Record<string, never>, any>;
  export default component;
}

declare module 'clean-css';
declare module 'chroma-js';

declare module 'pdfjs-dist/build/pdf.worker.min.mjs' {
  /**
   * @internal 加载该模块会产生副作用：在 globalThis 上挂载 pdfjsWorker，
   * 用于未配置 workerSrc/workerPort 时启用 pdf.js 主线程渲染。
   */
  export const WorkerMessageHandler: unknown;
}
