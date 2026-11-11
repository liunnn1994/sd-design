import { h, ref } from 'vue';

import MarkdownRender from '..';
import { markdownHeightNodes } from '../../../../web-core/tests/fixtures/markdown-height-nodes';
import { provideMarkdownComponents } from '../context';

describe('Markdown static placeholder height contract', () => {
  it('uses node-specific heights and updates text wrapping after a width change', () => {
    cy.window().then((window) => {
      cy.stub(window, 'requestIdleCallback').returns(1);
      cy.stub(window, 'cancelIdleCallback');
    });
    cy.mount({
      setup() {
        const narrow = ref(false);
        provideMarkdownComponents(
          { 'fixture-height': () => h('div', { style: { height: '40px' } }, 'Measured') },
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
                style: { width: narrow.value ? '320px' : '600px', height: '1px', overflow: 'auto' },
              },
              [
                h(MarkdownRender, {
                  nodes: markdownHeightNodes,
                  final: true,
                  fade: false,
                  smoothStreaming: false,
                  nodeVirtual: false,
                  batchRendering: false,
                  initialRenderBatchSize: 1,
                  viewportPriorityOptions: { rootMargin: '0px' },
                }),
              ],
            ),
          ]);
      },
    });
    cy.get('.node-placeholder').should('have.length', 10);
    [44, 32, 28, 144, 220, 212, 32, 102, 180, 40].forEach((height, index) =>
      cy
        .get(`.node-slot[data-node-index="${index + 1}"] > .node-placeholder`)
        .should('have.css', 'height', `${height}px`),
    );
    cy.get('.height-estimation-probes').should('not.exist');
    cy.contains('button', 'Resize').click();
    cy.get('.node-slot[data-node-index="4"] > .node-placeholder').should(
      'have.css',
      'height',
      '232px',
    );
    cy.get('.node-content').should('have.length', 1);
  });
});
