import * as monaco from 'monaco-editor';
import EditorWorker from 'monaco-editor/editor/editor.worker.js?worker';
import TypeScriptWorker from 'monaco-editor/languages/features/typescript/ts.worker.js?worker';

const previous = globalThis.MonacoEnvironment;
globalThis.MonacoEnvironment = {
  ...previous,
  getWorker(moduleId, label) {
    if (label === 'typescript' || label === 'javascript') return new TypeScriptWorker();
    return previous?.getWorker?.(moduleId, label) ?? new EditorWorker();
  },
};

monaco.typescript.typescriptDefaults.setCompilerOptions({
  target: monaco.typescript.ScriptTarget.ESNext,
  module: monaco.typescript.ModuleKind.ESNext,
  moduleResolution: monaco.typescript.ModuleResolutionKind.NodeJs,
  jsx: monaco.typescript.JsxEmit.ReactJSX,
  jsxImportSource: 'react',
  allowNonTsExtensions: true,
  allowSyntheticDefaultImports: true,
  esModuleInterop: true,
  strict: true,
  skipLibCheck: true,
  noEmit: true,
});

export { monaco };
