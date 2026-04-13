declare module 'vite' {
  export interface Plugin {
    name?: string;
    enforce?: 'pre' | 'post';
    resolveId?: (this: any, source: string, importer?: string) => any;
    load?: (this: any, id: string) => any;
    transform?: (this: any, code: string, id: string) => any;
    configResolved?: (this: any, config: any) => void | Promise<void>;
    handleHotUpdate?: (this: any, ctx: any) => any;
    [key: string]: any;
  }
}
