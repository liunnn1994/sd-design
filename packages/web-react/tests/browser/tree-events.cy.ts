import { startDrag, moveDrag } from '../../../web-vue/cypress/support/drag-sort';
describe('React Tree public event integration', () => {
  it('forwards native node events and honors cancellation before keyboard actions', () => {
    cy.visit('/tree-root.html?prevent');
    cy.get('[data-key="0"] .sd-tree-node-title').click();
    cy.get('[data-key="0"]')
      .focus()
      .trigger('keydown', { eventConstructor: 'KeyboardEvent', key: 'ArrowRight' });
    cy.get('[role="treeitem"]').should('have.length', 1);
    cy.get('[data-testid="events"]').should('have.text', 'click:0:true|key:0');
  });
  for (const forbid of [false, true])
    it(`forwards drag payloads and applies allowDrop=${!forbid}`, () => {
      cy.visit(`/tree-root.html?drag${forbid ? '&forbid' : ''}`);
      startDrag('[data-key="one"] .sd-tree-node-title');
      moveDrag('[data-key="two"] .sd-tree-node-title', 0.9);
      cy.get('[data-testid="events"]').should(
        'have.text',
        forbid ? 'drag:one|dragEnd:one' : 'drag:one|drop:one:two:1|dragEnd:one',
      );
    });
  it('forwards long-press and swipe data from titles through the root', () => {
    cy.visit('/tree-root.html');
    cy.clock();
    cy.get('[data-key="0"] .sd-tree-node-title').trigger('pointerdown', {
      eventConstructor: 'PointerEvent',
    });
    cy.tick(500);
    cy.get('[data-testid="events"]').should('have.text', 'long:0');
    cy.get('[data-key="0"] .sd-tree-node-title').then(($title) => {
      const win = $title[0].ownerDocument.defaultView!;
      for (const [name, x] of [
        ['touchstart', 0],
        ['touchmove', 60],
        ['touchend', 60],
      ] as const) {
        const touch = new win.Touch({ identifier: 1, target: $title[0], clientX: x, clientY: 0 });
        $title[0].dispatchEvent(
          new win.TouchEvent(name, {
            bubbles: true,
            touches: name === 'touchend' ? [] : [touch],
            changedTouches: [touch],
          }),
        );
      }
    });
    cy.get('[data-testid="events"]').should(
      'have.text',
      'long:0|start:0:none|swipe:0:right|end:0:right',
    );
  });
});
