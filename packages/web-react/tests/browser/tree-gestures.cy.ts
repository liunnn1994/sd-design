describe('React Tree title gestures', () => {
  const title = '[data-key="0"] .sd-tree-node-title';
  const pointer = (name: string, x = 0) =>
    cy.get(title).trigger(name, { eventConstructor: 'PointerEvent', clientX: x, clientY: 0 });
  const touch = (name: string, x: number, y = 0) =>
    cy.get(title).then(($title) => {
      const win = $title[0].ownerDocument.defaultView!;
      const point = new win.Touch({ identifier: 1, target: $title[0], clientX: x, clientY: y });
      $title[0].dispatchEvent(
        new win.TouchEvent(name, {
          bubbles: true,
          touches: name === 'touchend' || name === 'touchcancel' ? [] : [point],
          changedTouches: [point],
        }),
      );
    });
  it('fires once after 500ms and cancels on movement or pointer release', () => {
    cy.visit('/tree-node.html');
    cy.clock();
    pointer('pointerdown');
    cy.tick(499);
    cy.get('[data-testid="events"]').should('have.text', '');
    cy.tick(1);
    cy.get('[data-testid="events"]').should('have.text', 'long:0');
    cy.tick(500);
    pointer('pointerup');
    pointer('pointerdown');
    pointer('pointermove', 10);
    cy.tick(500);
    pointer('pointerdown');
    pointer('pointercancel');
    cy.tick(500);
    cy.get('[data-testid="events"]').should('have.text', 'long:0');
  });
  for (const [x, y, direction] of [
    [-50, 0, 'left'],
    [50, 0, 'right'],
    [0, -50, 'up'],
    [0, 50, 'down'],
  ] as const) {
    it(`reports ${direction} after the threshold and ends on cancellation`, () => {
      cy.visit('/tree-node.html');
      touch('touchstart', 0);
      touch('touchmove', x / 2, y / 2);
      cy.get('[data-testid="events"]').should('have.text', 'start:none');
      touch('touchmove', x, y);
      touch('touchcancel', x, y);
      cy.get('[data-testid="events"]').should(
        'have.text',
        `start:none|swipe:${direction}|end:${direction}`,
      );
    });
  }
  it('clears pending long presses on unmount and rebinds on remount', () => {
    cy.visit('/tree-node.html');
    cy.clock();
    pointer('pointerdown');
    cy.contains('button', 'Toggle nodes').click();
    cy.tick(500);
    cy.get('[data-testid="events"]').should('have.text', '');
    cy.contains('button', 'Toggle nodes').click();
    pointer('pointerdown');
    cy.tick(500);
    cy.get('[data-testid="events"]').should('have.text', 'long:0');
  });
});
