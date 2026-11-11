import { startDrag, moveDrag } from '../../../web-vue/cypress/support/drag-sort';

describe('React Table drag integration', () => {
  it('commits reordered page and all-row data while retaining framework DOM ownership', () => {
    cy.visit('/table-drag.html');
    startDrag('[data-table-drag-path="[0]"] .sd-table-drag-handle');
    moveDrag('[data-table-drag-path="[2]"]');
    cy.get('[data-testid="count"]').should('have.text', '1');
    cy.get('[data-testid="result"]').should(
      'have.text',
      '{"type":"drag","target":0,"page":[1,2,0,3,4,5],"all":[1,2,0,3,4,5]}',
    );
    cy.get('.sd-table-tbody .sd-table-td-content').then(($nodes) =>
      expect([...$nodes].map((node) => node.textContent)).to.deep.equal([
        'Row 1',
        'Row 2',
        'Row 0',
        'Row 3',
        'Row 4',
        'Row 5',
      ]),
    );
    cy.get('.sd-table-dragging').should('not.exist');
    cy.get('.sortable-fallback').should('not.exist');
  });
  it('uses full sorted-data paths for a paginated window', () => {
    cy.visit('/table-drag.html?page');
    startDrag('[data-table-drag-path="[2]"] .sd-table-drag-handle');
    moveDrag('[data-table-drag-path="[3]"]');
    cy.get('[data-testid="result"]').should(
      'have.text',
      '{"type":"drag","target":2,"page":[3,2],"all":[0,1,3,2,4,5]}',
    );
  });
  it('restricts nested drags to siblings and returns their reordered raw children', () => {
    cy.visit('/table-drag.html?nested');
    startDrag('[data-table-drag-path="[0,0]"] .sd-table-drag-handle');
    moveDrag('[data-table-drag-path="[1]"]');
    cy.get('[data-testid="count"]').should('have.text', '0');
    startDrag('[data-table-drag-path="[0,0]"] .sd-table-drag-handle');
    moveDrag('[data-table-drag-path="[0,1]"]');
    cy.get('[data-testid="count"]').should('have.text', '1');
    cy.get('[data-testid="result"]').should('contain', '"children":["b","a"]');
    cy.get('[data-table-drag-path="[0,0]"]').should('contain.text', 'Child B');
  });
  it('keeps controlled DOM order when the parent declines the update and cancels Escape without a change', () => {
    cy.visit('/table-drag.html?readonly');
    startDrag('[data-table-drag-path="[0]"] .sd-table-drag-handle');
    moveDrag('[data-table-drag-path="[2]"]');
    cy.get('[data-testid="count"]').should('have.text', '1');
    cy.get('[data-table-drag-path="[0]"]').should('contain.text', 'Row 0');
    startDrag('[data-table-drag-path="[0]"] .sd-table-drag-handle');
    cy.document().trigger('keydown', { key: 'Escape' });
    moveDrag('[data-table-drag-path="[2]"]');
    cy.get('[data-testid="count"]').should('have.text', '1');
  });
  it('cleans up active gestures on unmount and supports the replacement root', () => {
    cy.visit('/table-drag.html');
    startDrag('[data-table-drag-path="[0]"] .sd-table-drag-handle');
    cy.window().then((win) => win.dispatchEvent(new win.Event('table-unmount')));
    cy.get('.sd-table').should('not.exist');
    cy.get('.sortable-fallback').should('not.exist');
    cy.get('body').should('not.have.css', 'user-select', 'none');
    cy.get('[data-testid="count"]').should('have.text', '0');
    cy.document().trigger('pointerup', { eventConstructor: 'PointerEvent', pointerType: 'mouse' });
    cy.document().trigger('mouseup', { eventConstructor: 'MouseEvent' });
    cy.document().trigger('click', { eventConstructor: 'MouseEvent' });
    cy.contains('button', 'Toggle mount').click();
    startDrag('[data-table-drag-path="[0]"] .sd-table-drag-handle');
    moveDrag('[data-table-drag-path="[2]"]');
    cy.get('[data-testid="count"]').should('have.text', '1');
  });
  it('reorders a scrolled real virtual window and remains scrollable after commit', () => {
    cy.visit('/table-drag.html?virtual');
    cy.get('.sd-virtual-list-scroller').scrollTo(0, 2000);
    cy.get('[data-table-drag-path="[51]"]').should('exist');
    startDrag('[data-table-drag-path="[51]"] .sd-table-drag-handle');
    moveDrag('[data-table-drag-path="[53]"]');
    cy.get('[data-testid="count"]').should('have.text', '1');
    cy.get('[data-testid="result"]')
      .should('contain', '"target":51')
      .and('contain', '50,52,53,51,54');
    cy.get('.sd-virtual-list-scroller').scrollTo('bottom');
    cy.get('.sd-table-body').should('contain.text', 'Row 199');
    cy.get('.sd-virtual-list-scroller').scrollTo('top');
    cy.get('.sd-table-body').should('contain.text', 'Row 0');
  });
  it('cancels an active drag when draggable is disabled', () => {
    cy.visit('/table-drag.html');
    startDrag('[data-table-drag-path="[0]"] .sd-table-drag-handle');
    cy.window().then((win) => win.dispatchEvent(new win.Event('table-disable')));
    cy.get('[data-table-drag-path]').should('not.exist');
    cy.get('.sd-table-dragging').should('not.exist');
    cy.get('.sortable-fallback').should('not.exist');
    cy.get('body').should('not.have.css', 'user-select', 'none');
    cy.get('[data-testid="count"]').should('have.text', '0');
  });
  it('commits on the first real browser mouse release without requiring another click', () => {
    cy.visit('/table-drag.html');
    const mouseAt = (index: number, type: string, buttons: number) =>
      cy
        .get(`[data-table-drag-path="[${index}]"] .sd-table-drag-handle`)
        .first()
        .then(($element) => {
          const rect = $element[0]!.getBoundingClientRect();
          let x = rect.left + rect.width / 2;
          let y = rect.top + rect.height / 2;
          let view: Window = $element[0]!.ownerDocument.defaultView!;
          while (view !== view.top) {
            const frame = (view.frameElement ??
              Array.from(view.parent.document.querySelectorAll('iframe')).find(
                (iframe) => iframe.contentWindow === view,
              )) as HTMLElement;
            const bounds = frame.getBoundingClientRect();
            x = bounds.left + (x * bounds.width) / frame.offsetWidth;
            y = bounds.top + (y * bounds.height) / frame.offsetHeight;
            view = view.parent;
          }
          return Cypress.automation('remote:debugger:protocol', {
            command: 'Input.dispatchMouseEvent',
            params: {
              type,
              x,
              y,
              button: type === 'mouseMoved' ? 'none' : 'left',
              buttons,
              clickCount: 1,
            },
          });
        });
    mouseAt(0, 'mousePressed', 1);
    mouseAt(1, 'mouseMoved', 1);
    cy.get('.sortable-fallback').should('exist');
    mouseAt(2, 'mouseMoved', 1);
    mouseAt(2, 'mouseReleased', 0);
    cy.get('.sortable-fallback').should('not.exist');
    cy.get('[data-testid="count"]').should('have.text', '1');
    mouseAt(1, 'mouseMoved', 0);
    cy.get('.sortable-fallback').should('not.exist');
  });
});
