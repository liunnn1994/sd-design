import type { Component } from 'vue';

// `import.meta.glob` is resolved by the Vite dev server at collection time, so
// the keys are static; only the loaders are async. This lets a demo spec mount
// every generated demo for its component and assert on the real rendered DOM.
type DemoModules = Record<string, () => Promise<{ default: Component }>>;

export function runDemoTests(
  componentName: string,
  demos: DemoModules,
  assert?: (demoName: string) => void,
) {
  describe(`<${componentName}> demo:`, () => {
    Object.entries(demos).forEach(([filePath, loader]) => {
      const demoName = filePath
        .split('/')
        .pop()!
        .replace(/\.vue$/, '');

      it(`render [${demoName}] correctly`, () => {
        cy.wrap(loader(), { log: false }).then((mod) => {
          cy.mount((mod as { default: Component }).default);
          if (assert) {
            assert(demoName);
          }
        });
      });
    });
  });
}
