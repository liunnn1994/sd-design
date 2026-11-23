import {
  dropOnBottomIndicator,
  startDrag,
  moveDrag,
} from '../../../web-core/tests/browser/drag-sort';

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
      cy.get(source).should('have.css', 'cursor', 'grab');
      cy.get(source).find('.sd-tree-node-drag-icon').should('not.exist');
      startDrag(source);
      cy.get(source).should('have.css', 'cursor', 'grabbing');
      moveDrag(target, position, false);
      cy.get(target).should('have.class', `sd-tree-node-title-${name}`);
      cy.get(target).should('have.css', 'cursor', 'grabbing');
      moveDrag(target, position);
      cy.get(target).should('have.css', 'cursor', 'grab');
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
  it('accepts release on the visible bottom insertion line outside the title', () => {
    cy.visit('/tree-drag.html?edge');
    startDrag(source);
    moveDrag(target, 0.9, false);
    cy.get(target).should('have.class', 'sd-tree-node-title-gap-bottom');
    dropOnBottomIndicator(target);
    cy.get('[data-testid="events"]').should('contain.text', 'drop:0:target:1');
  });

  it('animates nodes after a controlled drop updates their order', () => {
    cy.visit('/tree-drag.html?reorder');
    cy.window().then((win) => {
      cy.spy(win.Element.prototype, 'animate').as('nodeAnimation');
    });
    startDrag(source);
    moveDrag(target, 0.9);
    cy.get('[role="treeitem"]').first().should('have.attr', 'data-key', 'target');
    cy.get('@nodeAnimation').should('have.been.called');
  });

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
    cy.get(source).should('have.css', 'cursor', 'grab');
    moveDrag(target);
    cy.get('[data-testid="events"]').should('have.text', 'start:0:true|leave:target|end:0');
    cy.contains('button', 'Toggle draggable').click();
    cy.get('[data-tree-draggable]').should('not.exist');
  });
  it('cleans up the cursor without dropping on pointer cancellation', () => {
    cy.visit('/tree-drag.html');
    startDrag(source);
    moveDrag(target, 0.9, false);
    cy.get(target).should('have.css', 'cursor', 'grabbing');
    cy.document().trigger('pointercancel', {
      eventConstructor: 'PointerEvent',
      pointerType: 'mouse',
    });
    cy.get(target).should('have.css', 'cursor', 'grab');
    cy.get('.sortable-fallback').should('not.exist');
    cy.get('[data-testid="events"]')
      .should('contain.text', 'end:0')
      .and('not.contain.text', 'drop:');
  });
  it('cleans up a live gesture when its root unmounts and binds the replacement root', () => {
    cy.visit('/tree-drag.html');
    startDrag(source);
    cy.window().then((win) => win.dispatchEvent(new win.Event('tree-unmount')));
    cy.get('.sd-tree').should('not.exist');
    cy.get('.sortable-fallback').should('not.exist');
    cy.get('body').should('not.have.attr', 'data-sd-dragging');
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
