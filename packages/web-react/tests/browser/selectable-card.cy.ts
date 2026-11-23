describe('React selectable-card', () => {
  beforeEach(() => cy.visit('/selectable-card.html'));

  it('selects SelectableCard through its native checkbox and blocks selection when disabled', () => {
    cy.get('[data-testid="selectable-main"] > input').focus();
    cy.press(Cypress.Keyboard.Keys.SPACE);
    cy.get('[data-testid="selectable-main"] > input').should('be.checked');
    cy.get('[data-testid="selectable-main"]')
      .should('have.attr', 'data-selected', 'true')
      .and('have.class', 'sd-selectable-card--selected');
    cy.press(Cypress.Keyboard.Keys.SPACE);
    cy.get('[data-testid="selectable-main"] > input').should('not.be.checked');
    cy.get('[data-testid="selectable-content"]').click();
    cy.get('[data-testid="selectable-main"] > input').should('be.checked');
    cy.get('[data-testid="selectable-events"]').should(
      'have.text',
      'change:true|change:false|change:true',
    );
    cy.contains('button', 'Selectable disabled').click();
    cy.get('[data-testid="selectable-main"] > input').should('be.disabled');
    cy.get('[data-testid="selectable-content"]').click();
    cy.get('[data-testid="selectable-events"]').should(
      'have.text',
      'change:true|change:false|change:true',
    );
    cy.get('[data-testid="selectable-main"]').should('have.class', 'sd-selectable-card--disabled');
    cy.contains('button', 'Inner action').click();
    cy.get('[data-testid="selectable-events"]').should(
      'have.text',
      'change:true|change:false|change:true|button',
    );
  });

  it('restores rejected SelectableCard changes and reads updated controlled selection', () => {
    cy.get('[data-testid="selectable-rejected"] > input').focus();
    cy.press(Cypress.Keyboard.Keys.SPACE);
    cy.get('[data-testid="selectable-rejected"] > input').should('not.be.checked');
    cy.press(Cypress.Keyboard.Keys.SPACE);
    cy.get('[data-testid="selectable-rejected"] > input').should('not.be.checked');
    cy.get('[data-testid="selectable-events"]').should('have.text', 'rejected:true|rejected:true');
    cy.contains('button', 'Selectable external').click();
    cy.get('[data-testid="selectable-rejected"] > input').should('be.checked').focus();
    cy.press(Cypress.Keyboard.Keys.SPACE);
    cy.get('[data-testid="selectable-rejected"] > input').should('be.checked');
    cy.get('[data-testid="selectable-events"]').should(
      'have.text',
      'rejected:true|rejected:true|rejected:false',
    );
    cy.get('[data-testid="selectable-rejected"] .sd-selectable-card-title').click();
    cy.get('[data-testid="selectable-events"]').should(
      'have.text',
      'rejected:true|rejected:true|rejected:false|rejected:false',
    );
    cy.get('[data-testid="selectable-rejected"] > input')
      .click({ force: true })
      .should('be.checked');
    cy.get('[data-testid="selectable-events"]').should(
      'have.text',
      'rejected:true|rejected:true|rejected:false|rejected:false|rejected:false',
    );
  });

  it('keeps SelectableCard nested interactive elements independent', () => {
    cy.contains('button', 'Inner action').click();
    cy.contains('a', 'Inner link').click();
    cy.contains('[data-testid="selectable-main"] label', 'Inner label').click();
    cy.get('[data-testid="selectable-inner-check"]').should('be.checked');
    cy.get('[aria-label="Inner select"]').select('two');
    cy.get('[aria-label="Inner textarea"]').click().type(' text');
    cy.contains('[role="button"]', 'Role action').click();
    cy.get('[data-testid="selectable-events"]').should('have.text', 'button|link|role');
    cy.get('[data-testid="selectable-main"] > input').should('not.be.checked');
  });

  it('renders SelectableCard content, zero values, dimensions and reactive variants', () => {
    cy.get('[data-testid="selectable-main"]')
      .should('have.class', 'custom-selectable')
      .and('have.css', 'padding', '8px')
      .and('have.css', 'width', '320px')
      .and('have.css', 'border-radius', '10px');
    cy.get('[data-testid="selectable-main"] .sd-selectable-card-title strong').should(
      'have.text',
      'Main title',
    );
    cy.get('[data-testid="selectable-main"] .sd-selectable-card-value').should('have.text', '0');
    cy.get('[data-testid="selectable-main"] .sd-selectable-card-title').should(
      'have.css',
      'font-size',
      '14px',
    );
    cy.get('[data-testid="selectable-main"] .sd-selectable-card-value')
      .should('have.css', 'font-size', '16px')
      .and('have.css', 'font-weight', '500');
    cy.get('[data-testid="selectable-main"] .sd-selectable-card-content').should(
      'have.css',
      'gap',
      '8px',
    );
    cy.get('[data-testid="selectable-main"] .sd-selectable-card-figure').should(
      'have.text',
      'Figure',
    );
    cy.get('[data-testid="selectable-main"] .sd-selectable-card-description').should(
      'have.text',
      'Plan details',
    );
    cy.get('[data-testid="selectable-content"]').click();
    cy.contains('button', 'Selectable appearance').click();
    cy.get('[data-testid="selectable-main"]')
      .should('have.class', 'sd-selectable-card--filled')
      .and('have.class', 'sd-selectable-card--color-green')
      .and('have.class', 'sd-selectable-card--size-large')
      .and('have.class', 'sd-selectable-card--align-center')
      .and('have.attr', 'data-variant', 'filled')
      .and('have.css', 'padding', '20px 24px')
      .and('have.css', 'height', '260px');
    cy.get('[data-testid="selectable-main"] .sd-selectable-card-body').should(
      'have.css',
      'flex-direction',
      'row',
    );
  });

  it('forwards SelectableCard refs and prefixes while keeping disabled control explicit', () => {
    cy.contains('button', 'Selectable ref').click();
    cy.get('[data-testid="selectable-events"]').should('have.text', 'ref:selectable-main');
    cy.get('[data-testid="selectable-custom"]').should('have.class', 'custom-selectable-card');
    cy.get('[data-testid="selectable-custom"] .custom-selectable-card-title').should(
      'have.text',
      '0',
    );
    cy.get('[data-testid="selectable-custom"] .custom-selectable-card-description').should(
      'have.text',
      '0',
    );
    cy.get('[data-testid="selectable-custom"] > input')
      .should('not.be.disabled')
      .and('have.attr', 'aria-label', 'Custom prefix plan');
    cy.get('[data-testid="selectable-custom"]').click();
    cy.get('[data-testid="selectable-events"]').should('contain.text', 'custom:true');
    cy.get('[data-testid="selectable-fixture"] > .sd-selectable-card > input').then((elements) => {
      expect(new Set([...elements].map((element) => element.id)).size).to.equal(elements.length);
    });
  });
});
