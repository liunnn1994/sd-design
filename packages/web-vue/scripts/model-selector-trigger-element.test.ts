import type { Component } from 'vue';

import vue from '@vitejs/plugin-vue';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

interface TestNode {
  text: string;
  children: TestNode[];
  parent: TestNode | null;
}

test('updates replaced trigger slots in production when attributes stay unchanged', async () => {
  // Bundle Vue with the component so production slot tracking and rendering use one runtime.
  const entry = fileURLToPath(new URL('./trigger-production-entry.ts', import.meta.url));
  const component = fileURLToPath(
    new URL('../components/model-selector/model-selector-trigger-element.vue', import.meta.url),
  );
  const result = await build({
    configFile: false,
    logLevel: 'silent',
    plugins: [
      vue(),
      {
        name: 'trigger-production-test',
        resolveId: (id) => (id === entry ? entry : undefined),
        load: (id) =>
          id === entry
            ? `export { default } from ${JSON.stringify(component)};
               export { createRenderer, defineComponent, h, shallowRef, nextTick } from 'vue';`
            : undefined,
      },
    ],
    define: { 'process.env.NODE_ENV': '"production"' },
    build: {
      write: false,
      minify: false,
      lib: { entry, formats: ['es'] },
    },
  });
  const bundle = Array.isArray(result) ? result[0] : result;
  assert.ok('output' in bundle);
  const chunk = bundle.output.find((item) => item.type === 'chunk' && item.isEntry);
  assert.ok(chunk && chunk.type === 'chunk');
  const {
    default: TriggerElement,
    createRenderer,
    defineComponent,
    h,
    shallowRef,
    nextTick,
  } = (await import(
    `data:text/javascript;base64,${Buffer.from(chunk.code).toString('base64')}`
  )) as typeof import('vue') & { default: Component };

  const node = (text = ''): TestNode => ({ text, children: [], parent: null });
  const { createApp } = createRenderer<TestNode, TestNode>({
    createElement: () => node(),
    createText: node,
    createComment: () => node(),
    setText: (target, text) => (target.text = text),
    setElementText: (target, text) => (target.text = text),
    parentNode: (target) => target.parent,
    nextSibling: (target) => {
      const siblings = target.parent?.children ?? [];
      return siblings[siblings.indexOf(target) + 1] ?? null;
    },
    patchProp: () => {},
    insert: (target, parent, anchor) => {
      if (target.parent) {
        const siblings = target.parent.children;
        siblings.splice(siblings.indexOf(target), 1);
      }
      target.parent = parent;
      const index = anchor ? parent.children.indexOf(anchor) : -1;
      if (index < 0) parent.children.push(target);
      else parent.children.splice(index, 0, target);
    },
    remove: (target) => {
      const siblings = target.parent!.children;
      siblings.splice(siblings.indexOf(target), 1);
    },
  });
  const switched = shallowRef(false);
  const app = createApp(
    defineComponent(
      () => () =>
        h(
          TriggerElement,
          { class: 'trigger' },
          switched.value
            ? { default: () => h('button', 'B') }
            : { default: () => h('button', 'A') },
        ),
    ),
  );
  const root = node();
  const text = (target: TestNode): string => target.text + target.children.map(text).join('');
  app.mount(root);
  try {
    assert.equal(text(root), 'A');
    switched.value = true;
    await nextTick();
    assert.equal(text(root), 'B');
  } finally {
    app.unmount();
  }
});
