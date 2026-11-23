describe('React spin', () => {
  beforeEach(() => {
    cy.clock(0, ['setTimeout', 'clearTimeout']);
    cy.visit('/spin.html');
  });

  it('delays the loading mask, cancels short requests and keeps standalone indicators visible', () => {
    cy.get('[data-testid="standalone-spin"]').should('have.attr', 'aria-busy', 'true');
    cy.get('[data-testid="standalone-spin"] .sd-dot-loading-item').should('have.length', 5);
    cy.contains('button', '切换加载').click();
    cy.tick(399);
    cy.get('[data-testid="delayed-spin"] .sd-spin-mask').should('not.exist');
    cy.tick(1);
    cy.get('[data-testid="delayed-spin"] .sd-spin-mask').should('be.visible');
    cy.contains('button', '切换加载').click();
    cy.get('[data-testid="delayed-spin"] .sd-spin-mask').should('not.exist');
    cy.contains('button', '切换加载').click();
    cy.tick(100);
    cy.contains('button', '切换加载').click();
    cy.tick(400);
    cy.get('[data-testid="delayed-spin"]').should('not.have.attr', 'aria-busy');
    cy.get('[data-testid="delayed-spin"]').should('contain.text', '保留内容');
  });

  it('delays standalone indicators and exposes loading through the live region', () => {
    const spin = '[data-testid="standalone-delayed-spin"]';
    cy.get(spin).should('have.attr', 'role', 'status').and('have.attr', 'aria-live', 'polite');
    cy.tick(399);
    cy.get(spin).should('not.have.attr', 'aria-busy');
    cy.get(`${spin} .sd-spin-icon`).should('not.exist');
    cy.tick(1);
    cy.get(spin).should('have.attr', 'aria-busy', 'true');
    cy.get(`${spin} .sd-spin-icon`).should('have.attr', 'aria-hidden', 'true');
    cy.get(`${spin} .sd-spin-tip`).should('have.text', 'Delayed indicator');
  });

  it('applies provider defaults and switches indicator precedence without losing the local tip', () => {
    const spin = '[data-testid="configured-spin"]';
    const choose = (mode: string) => cy.get('[aria-label="Spin indicator"]').select(mode);
    cy.get(`${spin} .sd-spin-icon i`).should('have.text', 'Provider indicator');
    cy.get(`${spin} .sd-spin-icon`).should('have.css', 'font-size', '10px');
    choose('dot');
    cy.get(`${spin} .sd-dot-loading`).should('have.css', 'width', '70px');
    cy.get(`${spin} .sd-spin-icon i`).should('not.exist');
    choose('element');
    cy.get(`${spin} .sd-spin-icon b`).should('have.text', 'Custom element');
    cy.get(`${spin} .sd-dot-loading`).should('not.exist');
    choose('icon');
    cy.get('[data-testid="custom-spin-icon"]').should('have.class', 'sd-icon-spin');
    cy.get(`${spin} .sd-spin-icon b`).should('not.exist');
    choose('hidden');
    cy.get(`${spin} .sd-spin-icon`).should('not.exist');
    cy.get(`${spin} .sd-spin-tip`).should('have.text', 'Local tip');
  });
});
