import { startDrag, moveDrag } from '../../../web-vue/cypress/support/drag-sort';

describe('React Tree drag adapter', () => {
  const source = '.sd-tree [data-key="0"] .sd-tree-node-title';
  const target = '.sd-tree [data-key="target"] .sd-tree-node-title';
  for (const [position, name, value] of [
    [0.1, 'gap-top', -1],
    [0.5, 'highlight', 0],
    [0.9, 'gap-bottom', 1],
  ] as const) {
    it(`renders ${name} and emits drop before drag-end without changing DOM order`, () => {
      cy.visit('/tree-drag.html');
      startDrag(source);
      moveDrag(target, position, false);
      cy.get(target).should('have.class', `sd-tree-node-title-${name}`);
      moveDrag(target, position);
      cy.get('[data-testid="events"]').should(
        'have.text',
        `start:0:true|drop:0:target:${value}|leave:target|end:0`,
      );
      cy.get('.sd-tree [role="treeitem"]').then(($nodes) =>
        expect([...$nodes].map((node) => node.getAttribute('data-key'))).to.deep.equal([
          '0',
          'child',
          'target',
          'fixed',
        ]),
      );
      cy.get('.sd-tree-node-title-dragging').should('not.exist');
    });
  }
  it('rejects descendants and live allowDrop changes', () => {
    cy.visit('/tree-drag.html');
    startDrag(source);
    moveDrag('.sd-tree [data-key="child"] .sd-tree-node-title');
    cy.get('[data-testid="events"]').should('not.contain.text', 'drop:');
    cy.contains('button', 'Toggle allowed').click();
    startDrag(source);
    moveDrag(target);
    cy.get('[data-testid="events"]').should('not.contain.text', 'drop:');
  });
  it('cancels Escape and respects per-node draggable overrides', () => {
    cy.visit('/tree-drag.html');
    cy.get('[data-key="fixed"]').should('not.have.attr', 'data-tree-draggable');
    startDrag(source);
    cy.document().trigger('keydown', { key: 'Escape' });
    moveDrag(target);
    cy.get('[data-testid="events"]').should('have.text', 'start:0:true|leave:target|end:0');
    cy.contains('button', 'Toggle draggable').click();
    cy.get('[data-tree-draggable]').should('not.exist');
  });
  it('cleans up a live gesture when its root unmounts and binds the replacement root', () => {
    cy.visit('/tree-drag.html');
    startDrag(source);
    cy.window().then((win) => win.dispatchEvent(new win.Event('tree-unmount')));
    cy.get('.sd-tree').should('not.exist');
    cy.get('.sortable-fallback').should('not.exist');
    cy.get('body').should('not.have.css', 'user-select', 'none');
    cy.document().trigger('pointerup', { eventConstructor: 'PointerEvent', pointerType: 'mouse' });
    cy.document().trigger('mouseup', { eventConstructor: 'MouseEvent' });
    cy.document().trigger('click', { eventConstructor: 'MouseEvent' });
    cy.contains('button', 'Toggle mount').click();
    startDrag(source);
    moveDrag(target);
    cy.get('[data-testid="events"]').should('contain.text', 'drop:0:target:0');
  });
});
