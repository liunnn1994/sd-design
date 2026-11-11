describe('React TreeSelect filtering and interaction', () => {
  it('orders popup/input/search events and retains matching ancestors with mapped keys', () => {
    cy.visit('/tree-select-interaction.html');
    cy.get('input').type('one');
    cy.get('[data-testid="filtered"]').should('have.text', '["root","one"]');
    cy.get('[data-testid="events"]').should(
      'contain.text',
      'popup:true|show:true|input:o|search:o',
    );
    cy.contains('button', 'Close').click();
    cy.get('[data-testid="visible"]').should('have.text', 'false');
    cy.get('[data-testid="events"]').should('contain.text', 'popup:false|show:false|blur');
  });
  it('supports custom filtering and exposes an empty result after the debounce', () => {
    cy.visit('/tree-select-interaction.html?custom');
    cy.get('input').type('Alpha');
    cy.get('[data-testid="filtered"]').should('have.text', '["root","one"]');
    cy.get('input').clear().type('missing');
    cy.get('[data-testid="empty"]').should('have.text', 'true');
  });
  it('keeps filtering disabled when requested', () => {
    cy.visit('/tree-select-interaction.html?nofilter');
    cy.get('input').type('missing');
    cy.get('[data-testid="filtered"]').should('have.text', '["root","one","two"]');
    cy.get('[data-testid="empty"]').should('have.text', 'false');
  });
  it('respects controlled rejection and readonly open tips', () => {
    cy.visit('/tree-select-interaction.html?controlled');
    cy.contains('button', 'Open').click();
    cy.get('[data-testid="visible"]').should('have.text', 'false');
    cy.get('input').type('a').should('have.value', '');
    cy.visit('/tree-select-interaction.html?readonly');
    cy.contains('button', 'Open').click();
    cy.get('[data-testid="events"]').should('have.text', 'tip');
    cy.get('[data-testid="visible"]').should('have.text', 'false');
  });
});
