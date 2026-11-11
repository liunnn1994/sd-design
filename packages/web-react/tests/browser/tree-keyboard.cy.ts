describe('React Tree keyboard adapter', () => {
  const key = (value: string) =>
    cy.focused().trigger('keydown', { eventConstructor: 'KeyboardEvent', key: value });
  it('navigates visible nodes with arrows and Home/End while preserving typed keys', () => {
    cy.visit('/tree-keyboard.html');
    cy.get('[role="treeitem"][tabindex="0"]').focus();
    key('ArrowRight');
    cy.get('[data-key-type="number"]').should('have.attr', 'aria-expanded', 'true');
    key('ArrowRight');
    cy.focused().should('have.attr', 'data-key', '0').and('have.attr', 'data-key-type', 'string');
    key('ArrowDown');
    cy.focused().should('have.attr', 'data-key', 'locked');
    key('ArrowUp');
    cy.focused().should('have.attr', 'data-key', '0');
    key('ArrowLeft');
    cy.focused().should('have.attr', 'data-key-type', 'number');
    key('ArrowLeft');
    cy.get('[role="treeitem"]').should('have.length', 3);
    key('End');
    cy.focused().should('have.attr', 'data-key', 'lazy');
    key('Home');
    cy.focused().should('have.attr', 'data-key-type', 'number');
    cy.get('[role="treeitem"][tabindex="0"]').should('have.length', 1);
  });
  it('selects by Enter and uses initial selection as the tab stop', () => {
    cy.visit('/tree-keyboard.html?selected');
    cy.get('[role="treeitem"][tabindex="0"]').should('have.attr', 'data-key', 'quote"[]').focus();
    key('Home');
    key('Enter');
    cy.get('[data-testid="selected"]').should('have.text', '[0]');
  });
  it('toggles checkable nodes with Space and leaves disabled nodes unchanged', () => {
    cy.visit('/tree-keyboard.html?check');
    cy.get('[role="treeitem"][tabindex="0"]').focus();
    key(' ');
    cy.get('[data-testid="checked"]').should('have.text', '[0,"0"]');
    key(' ');
    cy.get('[data-testid="checked"]').should('have.text', '[]');
    key('ArrowRight');
    key('ArrowRight');
    key('ArrowDown');
    key('Enter');
    cy.get('[data-testid="checked"]').should('have.text', '[]');
  });
  it('loads lazy nodes through Right and prevents browser navigation defaults', () => {
    cy.visit('/tree-keyboard.html');
    cy.get('[role="treeitem"][tabindex="0"]').focus();
    key('End');
    key('ArrowRight');
    cy.get('[data-testid="loads"]').should('have.text', '1');
    cy.focused()
      .should('have.attr', 'aria-expanded', 'true')
      .then(($node) => {
        const win = $node[0].ownerDocument.defaultView!;
        const event = new win.KeyboardEvent('keydown', {
          key: 'ArrowDown',
          bubbles: true,
          cancelable: true,
        });
        $node[0].dispatchEvent(event);
        expect(event.defaultPrevented).to.equal(true);
      });
  });
  it('escapes special keys, retries pending focus after mounting and falls back after removal', () => {
    cy.visit('/tree-keyboard.html');
    cy.contains('button', 'Toggle DOM').click();
    cy.contains('button', 'Focus escaped').click();
    cy.get('[data-testid="scroll"]').should('have.text', 'string:quote"[]');
    cy.contains('button', 'Toggle DOM').click();
    cy.focused().should('have.attr', 'data-key', 'quote"[]');
    cy.contains('button', 'Remove escaped').click();
    cy.get('[role="treeitem"][tabindex="0"]').should('have.attr', 'data-key-type', 'number');
  });
  it('respects cancelled node key events and IME composition', () => {
    cy.visit('/tree-keyboard.html?prevent');
    cy.get('[role="treeitem"][tabindex="0"]').focus();
    key('End');
    cy.focused().should('have.attr', 'data-key-type', 'number');
    cy.visit('/tree-keyboard.html');
    cy.get('[role="treeitem"][tabindex="0"]')
      .focus()
      .trigger('keydown', { eventConstructor: 'KeyboardEvent', key: 'End', isComposing: true });
    cy.focused().should('have.attr', 'data-key-type', 'number');
  });
});
