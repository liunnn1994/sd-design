import type { BaseNode } from 'markstream-vue';

import { h, ref } from 'vue';

import { estimateMarkdownCodeHeight } from '@sdata/web-core/markdown/code-height';
import { getMarkdownFallbackHeight } from '@sdata/web-core/markdown/fallback-height';
import { PreCodeNode, CodeBlockNode } from 'markstream-vue';

import MarkdownRender from '..';
import {
  markdownCodeHeightNodes,
  markdownCodeHeightScenarios,
} from '../../../../web-core/tests/fixtures/markdown-code-height-nodes';
import { provideMarkdownComponents } from '../context';

describe('Markdown locked code height geometry', () => {
  for (const scenario of [
    ...markdownCodeHeightScenarios,
    { name: 'custom', pre: true, options: {}, props: {} },
    { name: 'native-pre', pre: true, options: {}, props: {} },
    { name: 'native-code', pre: true, options: {}, props: {} },
  ]) {
    it(`matches Core against actual Vue ${scenario.name} estimates`, () => {
      cy.window().then((window) => {
        cy.stub(window, 'requestIdleCallback').returns(1);
        cy.stub(window, 'cancelIdleCallback');
      });
      cy.mount({
        setup() {
          const narrow = ref(false);
          provideMarkdownComponents(
            {
              'fixture-height': () => h('div', { style: { height: '80px' } }, 'Measured'),
              ...(scenario.name === 'custom' ? { code_block: () => h('div', 'Custom code') } : {}),
              ...(scenario.name === 'native-pre'
                ? { txt: PreCodeNode }
                : scenario.name === 'native-code'
                  ? { txt: CodeBlockNode }
                  : {}),
            },
            () => undefined,
          );
          return () =>
            h('div', [
              h(
                'button',
                {
                  onClick: () => {
                    narrow.value = !narrow.value;
                  },
                },
                'Resize',
              ),
              h(
                'div',
                {
                  style: {
                    width: narrow.value ? '320px' : '600px',
                    height: '1px',
                    overflow: 'auto',
                  },
                },
                [
                  h(MarkdownRender, {
                    nodes: markdownCodeHeightNodes as unknown as BaseNode[],
                    final: true,
                    fade: false,
                    smoothStreaming: false,
                    renderCodeBlocksAsPre: scenario.pre,
                    codeBlockOptions: scenario.options,
                    codeBlockProps: scenario.props,
                    nodeVirtual: false,
                    batchRendering: false,
                    initialRenderBatchSize: 1,
                    viewportPriorityOptions: { rootMargin: '0px' },
                    virtualScroll: { enabled: true, sessionKey: 'code-height' },
                  }),
                ],
              ),
            ]);
        },
      });
      const captured: Record<string, number[]> = {};
      for (const [name, width] of [
        ['wide', 585],
        ['narrow', 305],
      ] as const) {
        if (name === 'narrow') cy.contains('button', 'Resize').click();
        cy.get('.node-slot > .node-placeholder').should(($nodes) => {
          const actual = [...$nodes].map((node) => Number.parseFloat(node.style.height));
          const expected = markdownCodeHeightNodes.slice(1).map((node) =>
            ['custom', 'native-pre', 'native-code'].includes(scenario.name)
              ? getMarkdownFallbackHeight(node, width, 80)
              : estimateMarkdownCodeHeight(node, width, {
                  rendererKind: scenario.pre ? 'pre' : 'stream-diffs',
                  codeBlockOptions: scenario.options,
                  codeBlockProps: scenario.props,
                })!.height,
          );
          expect(actual).to.deep.equal(expected);
          captured[name] = actual;
        });
      }
      cy.writeFile(`../../.local/markdown-code-height-vue-${scenario.name}.json`, captured);
    });
  }
});
