import type { BaseNode } from 'markstream-vue';

import { h, ref } from 'vue';

import {
  getMarkdownContentHash,
  getMarkdownNodeSignature,
} from '@sdata/web-core/markdown/virtual-state';

import type { MarkdownRenderMethods } from '../types';

import MarkdownRender from '..';
import { provideMarkdownComponents } from '../context';

describe('Markdown queued restore contract', () => {
  for (const mode of ['empty', 'cache-only', 'foreign']) {
    it(`handles ${mode} imperative restoration with the locked Vue renderer`, () => {
      cy.window().then((window) => {
        cy.stub(window, 'requestIdleCallback').returns(1);
        cy.stub(window, 'cancelIdleCallback');
      });
      const nodes = Array.from({ length: 60 }, (_, index) => ({
        type: 'restore-fixture',
        index,
        raw: `Node ${index}`,
      })) as unknown as BaseNode[];
      const cache = nodes.map((node, index) => ({
        index,
        height: 140,
        nodeType: node.type,
        signature: getMarkdownNodeSignature(node),
      }));
      cy.mount({
        setup() {
          const renderer = ref<MarkdownRenderMethods | null>(null),
            frame = ref<HTMLDivElement | null>(null),
            populated = ref(mode === 'cache-only'),
            expanded = ref(false),
            session = ref('restore');
          provideMarkdownComponents(
            { 'restore-fixture': () => h('div', { style: { height: '80px' } }, 'Node') },
            () => undefined,
          );
          function restore() {
            const current = renderer.value!.captureVirtualState({ includeEmptyState: true })!;
            renderer.value!.restoreVirtualState(
              {
                ...current,
                sessionKey: 'restore',
                width: 480,
                metrics: { ...current.metrics, width: 480 },
                contentHash: getMarkdownContentHash(nodes),
                heightCache: cache,
                anchorCaptured: true,
                anchor: { type: 'bottom', distanceFromBottomPx: 0 },
              },
              { restoreAnchor: mode !== 'cache-only' },
            );
          }
          return () =>
            h('div', [
              h('button', { onClick: restore }, 'Restore'),
              h(
                'button',
                {
                  onClick: () => {
                    populated.value = true;
                  },
                },
                'Populate',
              ),
              h(
                'button',
                {
                  onClick: () => {
                    expanded.value = true;
                  },
                },
                'Expand',
              ),
              h(
                'button',
                {
                  onClick: () => {
                    session.value = 'foreign';
                  },
                },
                'Change session',
              ),
              h(
                'div',
                {
                  'ref': frame,
                  'data-testid': 'viewport',
                  'style': {
                    width: expanded.value ? '480px' : '0px',
                    height: '120px',
                    overflow: 'auto',
                  },
                },
                [
                  h(MarkdownRender, {
                    ref: renderer,
                    nodes: populated.value ? nodes : [],
                    final: true,
                    fade: false,
                    smoothStreaming: false,
                    nodeVirtual: false,
                    batchRendering: false,
                    initialRenderBatchSize: 1,
                    viewportPriorityOptions: { rootMargin: '0px' },
                    virtualScroll: {
                      enabled: true,
                      sessionKey: session.value,
                      scrollRoot: () => frame.value,
                    },
                  }),
                ],
              ),
            ]);
        },
      });
      cy.contains('button', /^Restore$/).click();
      if (mode === 'foreign') cy.contains('button', 'Change session').click();
      cy.contains('button', 'Populate').click();
      cy.contains('button', 'Expand').click();
      if (mode === 'empty')
        cy.get('[data-testid="viewport"]').should(($element) =>
          expect($element[0].scrollTop).to.be.greaterThan(6000),
        );
      else {
        cy.get('.node-slot')
          .last()
          .find('.node-placeholder')
          .should('have.css', 'height', mode === 'cache-only' ? '140px' : '80px');
        cy.get('[data-testid="viewport"]').should(($element) =>
          expect($element[0].scrollTop).to.equal(0),
        );
      }
    });
  }
});
