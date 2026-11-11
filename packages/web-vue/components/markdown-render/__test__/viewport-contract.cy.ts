import { h } from 'vue';

import MarkdownRender from '..';

describe('Markdown viewport placeholder contract', () => {
  const nodes = Array.from({ length: 60 }, (_, index) => ({
    type: 'heading',
    level: 2,
    children: [{ type: 'text', content: `Heading ${index}`, raw: '' }],
    raw: '',
  }));
  it('retains every slot and activates content inside the actual scroll parent', () => {
    cy.window().then((window) => {
      cy.stub(window, 'requestIdleCallback').returns(1);
      cy.stub(window, 'cancelIdleCallback');
    });
    cy.mount(() =>
      h('div', { 'data-testid': 'viewport', 'style': { height: '120px', overflowY: 'auto' } }, [
        h(MarkdownRender, {
          nodes,
          final: true,
          nodeVirtual: false,
          batchRendering: false,
          initialRenderBatchSize: 1,
          viewportPriorityOptions: { rootMargin: '0px' },
        }),
      ]),
    );
    cy.get('.node-slot').should('have.length', 60);
    cy.get('.node-placeholder').should('have.length.greaterThan', 40);
    cy.contains('h2', 'Heading 59').should('not.exist');
    cy.get('[data-testid="viewport"]').scrollTo('bottom');
    cy.contains('h2', 'Heading 59').should('exist');
  });
  it('does not defer nodes when viewport priority is disabled', () => {
    cy.mount(MarkdownRender, {
      props: {
        nodes,
        final: true,
        nodeVirtual: false,
        batchRendering: false,
        initialRenderBatchSize: 1,
        viewportPriority: false,
      },
    });
    cy.get('.node-content').should('have.length', 60);
    cy.get('.node-placeholder').should('not.exist');
  });
});
