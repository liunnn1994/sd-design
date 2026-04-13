declare module 'vite' {
  export interface Plugin {
    name?: string;
    enforce?: 'pre' | 'post';
    resolveId?: (this: any, source: string, importer?: string) => any;
    load?: (this: any, id: string) => any;
    transform?: (this: any, code: string, id: string) => any;
    configResolved?: (this: any, config: any) => void | Promise<void>;
    handleHotUpdate?: (this: any, ctx: any) => any;
    generateBundle?: (this: any, outputOptions: any, bundle: Record<string, any>) => any;
    [key: string]: any;
  }

  export type InlineConfig = any;

  export function defineConfig(config: any): any;
  export function build(config: any): Promise<any>;
  export function createServer(config: any): Promise<any>;
}

declare module '@vitejs/plugin-vue' {
  const vue: (...args: any[]) => any;
  export default vue;
}

declare module '@vitejs/plugin-vue-jsx' {
  const vueJsx: (...args: any[]) => any;
  export default vueJsx;
}
