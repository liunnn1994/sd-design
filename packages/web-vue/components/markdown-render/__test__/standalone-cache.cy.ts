import type { BaseNode } from 'markstream-vue';

import { h, ref } from 'vue';

import { getMarkdownNodeSignature } from '@sdata/web-core/markdown/virtual-state';

import MarkdownRender from '..';
import { provideMarkdownComponents } from '../context';

describe('Markdown standalone height cache contract', () => {
  for (const mode of ['compatible', 'unsigned', 'wrong-width', 'disabled']) {
    it(`handles ${mode} cache entries with the locked Vue renderer`, () => {
      cy.window().then((window) => {
        cy.stub(window, 'requestIdleCallback').returns(1);
        cy.stub(window, 'cancelIdleCallback');
      });
      const nodes = Array.from({ length: 60 }, (_, index) => ({
        type: 'cache-fixture',
        index,
        raw: `Node ${index}`,
      })) as unknown as BaseNode[];
      const cache = nodes.map((node, index) => ({
        index,
        height: 140,
        nodeType: node.type,
        signature: mode === 'unsigned' ? '' : getMarkdownNodeSignature(node),
      }));
      cy.mount({
        setup() {
          const narrow = ref(false),
            cacheWidth = ref(mode === 'wrong-width' ? 640 : 480);
          provideMarkdownComponents(
            { 'cache-fixture': () => h('div', { style: { height: '80px' } }, 'Node') },
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
                'button',
                {
                  onClick: () => {
                    cacheWidth.value = narrow.value ? 320 : 480;
                  },
                },
                'Match width',
              ),
              h(
                'div',
                {
                  style: {
                    width: narrow.value ? '320px' : '480px',
                    height: '1px',
                    overflow: 'auto',
                  },
                },
                [
                  h(MarkdownRender, {
                    nodes,
                    final: true,
                    fade: false,
                    smoothStreaming: false,
                    nodeVirtual: false,
                    batchRendering: false,
                    initialRenderBatchSize: 1,
                    viewportPriorityOptions: { rootMargin: '0px' },
                    virtualScroll: {
                      enabled: mode !== 'disabled',
                      sessionKey: 'cache',
                      heightCache: cache,
                      heightCacheWidth: cacheWidth.value,
                    },
                  }),
                ],
              ),
            ]);
        },
      });
      const last = () => cy.get('.node-slot').last().find('.node-placeholder');
      last().should(
        'have.css',
        'height',
        mode === 'compatible' ? '140px' : mode === 'disabled' ? '40px' : '80px',
      );
      if (mode === 'compatible') {
        cy.contains('button', 'Resize').click();
        last().should('have.css', 'height', '80px');
        cy.contains('button', 'Match width').click();
        last().should('have.css', 'height', '140px');
      }
    });
  }
});
