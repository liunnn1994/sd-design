let suppressCompatibilityMouseEvents = false;

export function startDrag(selector: string) {
  cy.get(selector)
    .filter((_, element) => !element.closest('.sortable-fallback'))
    .first()
    .then(($handle) => {
      const rect = $handle[0].getBoundingClientRect();
      const point = { clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 };
      const pointerdown = new PointerEvent('pointerdown', {
        ...point,
        bubbles: true,
        cancelable: true,
        button: 0,
        pointerType: 'mouse',
        isPrimary: true,
      });
      $handle[0].dispatchEvent(pointerdown);
      suppressCompatibilityMouseEvents = pointerdown.defaultPrevented;
      cy.document().trigger('pointermove', {
        ...point,
        clientY: point.clientY + 5,
        eventConstructor: 'PointerEvent',
        pointerType: 'mouse',
      });
    });
  cy.get('.sortable-fallback').should('exist');
}

export function moveDrag(selector: string, position = 0.5, end = true) {
  cy.get(selector)
    .filter((_, element) => !element.closest('.sortable-fallback'))
    .last()
    .then(($target) => {
      const element = $target[0];
      const rect = (
        getComputedStyle(element).display === 'contents' ? element.firstElementChild! : element
      ).getBoundingClientRect();
      const point = {
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height * position,
      };
      cy.document().trigger('pointermove', {
        ...point,
        eventConstructor: 'PointerEvent',
        pointerType: 'mouse',
      });
      if (end) {
        cy.document().trigger('pointerup', {
          ...point,
          eventConstructor: 'PointerEvent',
          pointerType: 'mouse',
        });
        // Cancelling pointerdown suppresses compatibility mouseup in browsers.
        if (!suppressCompatibilityMouseEvents) {
          cy.document().trigger('mouseup', { ...point, eventConstructor: 'MouseEvent' });
        }
        cy.get('.sortable-fallback').should('not.exist');
        // Browsers dispatch a click after release; Sortable consumes it.
        cy.document().trigger('click', { ...point, eventConstructor: 'MouseEvent' });
      }
    });
}
