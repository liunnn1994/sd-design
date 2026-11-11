describe('React ModelSelector compound components', () => {
  const input = () => cy.get('input[placeholder="Search models"]');
  const open = () => cy.contains('.sd-model-selector-trigger', 'Choose models').click();
  it('opens the actual dialog and emits item, root and visibility events in order', () => {
    cy.visit('/model-selector.html');
    open();
    cy.get('[role="dialog"]').should('be.visible');
    cy.get('[role="listbox"]').should('exist');
    cy.contains('[role="option"]', 'Alpha').click();
    cy.get('[data-testid="events"]').should(
      'have.text',
      'update:true|visible:true|item:alpha:click|root:alpha:click|update:false|visible:false',
    );
    cy.get('[role="dialog"]').should('not.be.visible');
  });
  it('navigates by current DOM order after keyed items move and skips disabled items', () => {
    cy.visit('/model-selector.html?inline&disabled&keep');
    cy.contains('button', 'Reorder').click();
    cy.get('[role="option"]').first().should('contain.text', 'Beta');
    input().type('{downarrow}');
    cy.contains('[role="option"]', 'Alpha').should('have.class', 'sd-model-selector-item--active');
    input().type('{downarrow}{enter}');
    cy.get('[data-testid="events"]').should('contain.text', 'root:third:keydown');
    input().type('{downarrow}');
    cy.contains('[role="option"]', 'Alpha').should('have.class', 'sd-model-selector-item--active');
  });
  it('filters labels, values and keywords and provides the empty state', () => {
    cy.visit('/model-selector.html?inline&keep');
    input().type('REASONING');
    cy.get('[role="option"]:visible').should('have.length', 1).and('contain.text', 'Alpha');
    input().clear().type('unmatched');
    cy.get('.sd-model-selector-empty').should('be.visible').and('contain.text', '未找到匹配的模型');
    input().clear().type('third');
    cy.get('[role="option"]:visible').should('have.length', 1).and('contain.text', 'Gamma');
  });
  it('tracks actual rendered labels with MutationObserver', () => {
    cy.visit('/model-selector.html?inline&rendered&keep');
    cy.contains('button', 'Rename').click();
    input().type('Delta');
    cy.get('[role="option"]:visible').should('have.length', 1).and('contain.text', 'Delta');
  });
  it('expands matching groups for search and restores normal collapsed state', () => {
    cy.visit('/model-selector.html?inline&collapsed&keep');
    cy.contains('.sd-model-selector-group-heading', 'First group').should(
      'have.attr',
      'aria-expanded',
      'false',
    );
    input().type('Alpha');
    cy.contains('.sd-model-selector-group-heading', 'First group')
      .should('have.attr', 'aria-expanded', 'true')
      .click();
    cy.get('.sd-model-selector-group-content').first().should('have.attr', 'inert');
    input().type(' ');
    cy.contains('.sd-model-selector-group-heading', 'First group').should(
      'have.attr',
      'aria-expanded',
      'false',
    );
    input().type('x').type('{backspace}');
    cy.contains('.sd-model-selector-group-heading', 'First group').should(
      'have.attr',
      'aria-expanded',
      'true',
    );
    input().clear();
    cy.contains('.sd-model-selector-group-heading', 'First group').should(
      'have.attr',
      'aria-expanded',
      'false',
    );
  });
  it('uses shared shortcut parsing only while visible and in expanded groups', () => {
    cy.visit('/model-selector.html?inline&keep');
    cy.get('body').trigger('keydown', { key: '!', code: 'Digit1', altKey: true, shiftKey: true });
    cy.get('[data-testid="events"]').should(
      'contain.text',
      'item:alpha:keydown|root:alpha:keydown',
    );
    cy.get('body').trigger('keydown', {
      key: '!',
      code: 'Digit1',
      altKey: true,
      shiftKey: true,
      repeat: true,
    });
    cy.get('[data-testid="events"]')
      .invoke('text')
      .then((text) => expect(text.split('root:alpha').length).to.equal(2));
    cy.contains('.sd-model-selector-group-heading', 'Second group').click();
    cy.get('body').trigger('keydown', { key: '#', code: 'Digit3', altKey: true, shiftKey: true });
    cy.get('[data-testid="events"]').should('not.contain.text', 'root:third');
  });
  it('preserves first-child trigger handlers/classes and sibling content', () => {
    cy.visit('/model-selector.html?custom-trigger');
    cy.get('.custom-trigger.sd-model-selector-trigger')
      .should('have.css', 'color', 'rgb(100, 50, 20)')
      .click();
    cy.get('[data-testid="events"]').should('have.text', 'child-click|update:true|visible:true');
    cy.get('[data-testid="sibling"]').should('have.text', 'Sibling');
  });
  it('keeps controlled visibility frozen until parent props change', () => {
    cy.visit('/model-selector.html?controlled&frozen');
    open();
    cy.get('[data-testid="visible"]').should('have.text', 'false');
    cy.get('[data-testid="events"]').should('have.text', 'update:true|visible:true');
    cy.contains('button', 'Attach control').click();
    cy.get('[role="dialog"]').should('be.visible');
  });
  for (const dialog of [false, true]) {
    it(`treats an explicit undefined visible prop as controlled false (${dialog ? 'dialog' : 'root'})`, () => {
      cy.visit(`/model-selector.html?undefined${dialog ? '&dialog' : ''}`);
      cy.get('[role="dialog"]').should('not.exist');
      cy.contains('button', 'Attach control').click();
      cy.get('[role="dialog"]').should('be.visible');
    });
  }
  it('updates input ARIA and bridges Escape without bubbling a parent key handler', () => {
    cy.visit('/model-selector.html?inline&keep&input-controlled');
    input().type('Alpha');
    input().should('have.attr', 'role', 'combobox').and('have.attr', 'aria-expanded', 'true');
    input()
      .invoke('attr', 'aria-activedescendant')
      .then((id) => {
        cy.get('[role="option"]#' + CSS.escape(String(id))).should('contain.text', 'Alpha');
      });
    cy.get('[data-testid="events"]')
      .invoke('text')
      .then((before) => {
        input().trigger('keydown', { key: 'Escape' });
        cy.get('[data-testid="events"]').should(
          'have.text',
          `${before}|native-key|update:false|visible:false`,
        );
      });
    input().should('have.value', 'Alpha');
  });
});
