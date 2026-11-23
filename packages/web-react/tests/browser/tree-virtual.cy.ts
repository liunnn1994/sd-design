import { startDrag, moveDrag } from '../../../web-core/tests/browser/drag-sort';
describe('React Tree real virtual interactions', () => {
  it('preserves the virtual viewport and scroll anchor as the first row is inserted and removed', () => {
    cy.visit('/tree-root.html?virtual&shift');
    const viewport = () => cy.get('.sd-virtual-list-scroller');
    viewport().scrollTo(0, 64);
    viewport()
      .should('have.prop', 'scrollTop', 64)
      .then(([$original]) => {
        cy.contains('button', 'Toggle first row').click();
        viewport().should(([$current]) => {
          expect($current).to.equal($original);
          expect($current.scrollTop).to.equal(96);
        });
        cy.contains('button', 'Toggle first row').click();
        viewport().should(([$current]) => {
          expect($current).to.equal($original);
          expect($current.scrollTop).to.equal(64);
        });
      });
  });

  it('focuses End and Home targets after virtual scrolling mounts them', () => {
    cy.visit('/tree-root.html?virtual');
    cy.get('[data-key="0"]')
      .focus()
      .trigger('keydown', { eventConstructor: 'KeyboardEvent', key: 'End' });
    cy.focused().should('have.attr', 'data-key', '199');
    cy.get('[role="treeitem"][tabindex="0"]').should('have.length', 1);
    cy.focused().trigger('keydown', { eventConstructor: 'KeyboardEvent', key: 'Home' });
    cy.focused().should('have.attr', 'data-key', '0');
  });
  it('keeps a drag alive while its source row is recycled and drops on the mounted target', () => {
    cy.visit('/tree-root.html?virtual&drag');
    startDrag('.sd-tree [data-key="1"] .sd-tree-node-title');
    cy.window().then((win) => win.dispatchEvent(new win.Event('tree-scroll-last')));
    cy.get('.sd-tree [data-key="199"]').should('be.visible');
    cy.get('.sd-tree [data-key="1"]').should('not.exist');
    moveDrag('.sd-tree [data-key="199"] .sd-tree-node-title', 0.9);
    cy.get('[data-testid="events"]').should('contain.text', 'drag:1|drop:1:199:1|dragEnd:1');
    cy.get('.sortable-fallback').should('not.exist');
  });
  it('uses the correct drop position after scrolling before a drag starts', () => {
    cy.visit('/tree-root.html?virtual&drag');
    cy.contains('button', 'Scroll last').click();
    cy.get('.sd-tree [data-key="199"]').should('be.visible');
    startDrag('.sd-tree [data-key="198"] .sd-tree-node-title');
    moveDrag('.sd-tree [data-key="199"] .sd-tree-node-title', 0.1);
    cy.get('[data-testid="events"]').should('contain.text', 'drag:198|drop:198:199:-1|dragEnd:198');
  });
});
