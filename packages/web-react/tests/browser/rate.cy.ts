describe('React rate', () => {
  beforeEach(() => cy.visit('/form-controls.html'));

  it('selects Rate half values, clears through provider defaults and validates the form', () => {
    cy.get('[aria-label="Model rating"] .sd-rate-character-left').eq(2).click({ force: true });
    cy.get('[data-testid="rate-value"]').should('have.text', '2.5');
    const radios = () => cy.get('[aria-label="Model rating"] [role="radio"]');
    radios().should('have.length', 10);
    radios()
      .filter('[aria-checked="true"]')
      .should('have.length', 1)
      .and('have.attr', 'aria-posinset', '5')
      .and('have.attr', 'aria-setsize', '10');
    radios().first().should('have.attr', 'aria-posinset', '1');
    radios().last().should('have.attr', 'aria-posinset', '10');
    cy.get('[data-testid="rate-events"]').should('contain.text', 'value:2.5|change:2.5');
    cy.get('[aria-label="Model rating"] .sd-rate-character-left').eq(2).click({ force: true });
    cy.get('[data-testid="rate-value"]').should('have.text', '0');
    cy.contains('Score required').should('be.visible');
    cy.get('[aria-label="Model rating"] .sd-rate-character-right').eq(3).click({ force: true });
    cy.contains('Score required').should('not.exist');
    cy.get('[aria-label="No clear rating"] .sd-rate-character-right').eq(1).click({ force: true });
    cy.get('[aria-label="No clear rating"] [aria-checked="true"]').should(
      'have.attr',
      'aria-posinset',
      '2',
    );
  });

  it('applies Rate keyboard bounds, controlled rejection and dynamic half mode', () => {
    const rating = () => cy.get('[aria-label="Model rating"]');
    rating().should('have.attr', 'role', 'radiogroup').and('have.attr', 'tabindex', '0').focus();
    cy.press(Cypress.Keyboard.Keys.RIGHT);
    cy.get('[data-testid="rate-value"]').should('have.text', '2.5');
    cy.get('[aria-label="Model rating"]').trigger('keydown', { key: 'End' });
    cy.get('[data-testid="rate-value"]').should('have.text', '5');
    cy.get('[aria-label="Model rating"]').trigger('keydown', { key: 'ArrowRight' });
    cy.get('[data-testid="rate-value"]').should('have.text', '5');
    cy.get('[aria-label="Model rating"]').trigger('keydown', { key: 'Home' });
    cy.get('[data-testid="rate-value"]').should('have.text', '0');
    cy.contains('button', 'Toggle rate half').click();
    cy.get('[aria-label="Model rating"] [role="radio"]').should('have.length', 5);
    cy.get('[aria-label="Model rating"]').trigger('keydown', { key: 'ArrowUp' });
    cy.get('[data-testid="rate-value"]').should('have.text', '1');
    cy.get('[aria-label="Locked rating"]').trigger('keydown', { key: 'End' });
    cy.get('[aria-label="Locked rating"] [aria-checked="true"]').should(
      'have.attr',
      'aria-posinset',
      '2',
    );
    cy.contains('button', 'Set rate externally').click();
    cy.get('[data-testid="rate-value"]').should('have.text', '4');
  });

  it('previews a half rating on hover without changing the selected radio, then restores the display', () => {
    const rating = () => cy.get('[aria-label="Model rating"]');
    rating().find('.sd-rate-character-left').eq(3).trigger('mouseover', { force: true });
    rating().find('.sd-rate-character-full').should('have.length', 3);
    rating().find('.sd-rate-character-half').should('have.length', 1);
    rating().find('[aria-checked="true"]').should('have.attr', 'aria-posinset', '4');
    cy.get('[data-testid="rate-value"]').should('have.text', '2');
    cy.get('[data-testid="rate-events"]').should('have.text', 'hover:3.5');
    rating().trigger('mouseout', { eventConstructor: 'MouseEvent' });
    rating().find('.sd-rate-character-full').should('have.length', 2);
    rating().find('.sd-rate-character-half').should('not.exist');
    cy.get('[data-testid="rate-events"]').should('have.text', 'hover:3.5|hover:0');
  });

  it('clears Rate hover on disable and displays readonly tips only when enabled', () => {
    cy.get('[aria-label="Model rating"] .sd-rate-character-right')
      .eq(4)
      .trigger('mouseover', { force: true });
    cy.get('[aria-label="Model rating"] .sd-rate-character-full').should('have.length', 5);
    cy.contains('button', 'Toggle rate disabled').click();
    cy.get('[aria-label="Model rating"] .sd-rate-character-full').should('have.length', 2);
    cy.get('[aria-label="Model rating"]').should('not.have.attr', 'tabindex');
    cy.get('[data-testid="rate-events"]').should('contain.text', 'hover:5|hover:0');
    cy.contains('button', 'Toggle rate readonly').click();
    cy.get('[aria-label="Model rating"] .sd-rate-character-right').eq(4).click({ force: true });
    cy.contains('.sd-tooltip-content', 'Rating is locked').should('not.exist');
    cy.contains('button', 'Toggle rate disabled').click();
    cy.get('[aria-label="Model rating"] .sd-rate-character-right').eq(4).click({ force: true });
    cy.contains('.sd-tooltip-content', 'Rating is locked').should('be.visible');
    cy.get('[data-testid="rate-value"]').should('have.text', '2');
  });

  it('renders Rate threshold colors, custom characters and grading faces', () => {
    cy.get('[aria-label="Model rating"] .sd-rate-character-right')
      .eq(0)
      .should('have.css', 'color', 'rgb(255, 0, 0)');
    cy.contains('button', 'Set rate externally').click();
    cy.get('[aria-label="Model rating"] .sd-rate-character-right')
      .eq(2)
      .should('have.css', 'color', 'rgb(0, 0, 255)');
    cy.get('[aria-label="Custom rating"] .sd-rate-character').should('have.length', 3);
    cy.get('[data-testid="rate-custom"]').first().should('have.text', '0');
    cy.contains('button', 'Toggle rate grading').click();
    cy.get('[aria-label="Grading rating"] .sd-rate-character').should('have.length', 5);
    cy.get('[aria-label="Grading rating"] .sd-icon-face-smile-fill').should('have.length', 10);
  });
});
