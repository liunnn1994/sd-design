describe('React statistic', () => {
  beforeEach(() => cy.visit('/statistic.html'));

  it('formats statistics and updates placeholders, date values and animation start', () => {
    cy.contains('button', 'Mount statistics').click();
    cy.get('[data-testid="statistic-number"] .sd-statistic-title strong').should(
      'have.text',
      'Revenue',
    );
    cy.get('[data-testid="statistic-number"] .sd-statistic-extra').should('have.text', 'Today');
    cy.get('[data-testid="statistic-number"] .sd-statistic-prefix').should('have.text', '$');
    cy.get('[data-testid="statistic-number"] .sd-statistic-suffix').should('have.text', 'USD');
    cy.get('[data-testid="statistic-number"] .sd-number-flow').should(
      'not.have.class',
      'sd-number-flow-animated',
    );
    cy.get('[data-testid="statistic-start"] .sd-number-flow').should(
      'have.class',
      'sd-number-flow-animated',
    );
    cy.get('[data-testid="statistic-number"] .sd-number-flow').should(
      'have.attr',
      'aria-label',
      '1,234.50',
    );
    cy.get('[data-testid="statistic-number"] .sd-statistic-value').should(
      'have.css',
      'color',
      'rgb(1, 2, 3)',
    );
    cy.get('[data-testid="statistic-date"]').should('contain.text', '2026-01-02');
    cy.get('[data-testid="statistic-start"] .sd-number-flow').should(
      'have.attr',
      'aria-label',
      '2',
    );
    cy.contains('button', 'Toggle statistic start').click();
    cy.get('[data-testid="statistic-start"] .sd-number-flow').should(
      'have.attr',
      'aria-label',
      '10',
    );
    cy.contains('button', 'Toggle statistic value').click();
    cy.get('[data-testid="statistic-number"]').should('contain.text', 'Pending');
    cy.get('[data-testid="statistic-number"] .sd-statistic-prefix').should('not.exist');
    cy.get('[data-testid="statistic-number"] .sd-statistic-suffix').should('not.exist');
    cy.contains('button', 'Toggle statistic value').click();
    cy.get('[data-testid="statistic-number"] .sd-number-flow').should(
      'have.attr',
      'aria-label',
      '2,345.75',
    );
  });

  it('resumes expired countdowns once, restarts changed deadlines and cleans up timers', () => {
    cy.clock(10000);
    cy.contains('button', 'Mount statistics').click();
    cy.get('[data-testid="statistic-countdown"] .sd-number-flow').should(
      'have.attr',
      'aria-label',
      '02',
    );
    cy.tick(3000);
    cy.get('[data-testid="statistic-finishes"]').should('have.text', '0');
    cy.contains('button', 'Toggle statistic start').click();
    cy.get('[data-testid="statistic-finishes"]').should('have.text', '1');
    cy.get('[data-testid="statistic-countdown"] .sd-number-flow').should(
      'have.attr',
      'aria-label',
      '00',
    );
    cy.contains('button', 'Toggle statistic start').click();
    cy.contains('button', 'Toggle statistic start').click();
    cy.get('[data-testid="statistic-finishes"]').should('have.text', '1');
    cy.contains('button', 'Reset countdown deadline').click();
    cy.tick(1000);
    cy.get('[data-testid="statistic-countdown"] .sd-number-flow').should(
      'have.attr',
      'aria-label',
      '02',
    );
    cy.contains('button', 'Toggle countdown format').click();
    cy.get('[data-testid="statistic-countdown"] .sd-number-flow').should('have.length', 2);
    cy.get('[data-testid="statistic-countdown"] .sd-number-flow-animated').should('not.exist');
    cy.tick(2100);
    cy.get('[data-testid="statistic-finishes"]').should('have.text', '2');
    cy.contains('button', 'Reset countdown deadline').click();
    cy.contains('button', 'Toggle countdown mount').click();
    cy.tick(4000);
    cy.get('[data-testid="statistic-finishes"]').should('have.text', '2');
  });

  it('freezes a paused countdown and refreshes its changed format when resumed', () => {
    cy.clock(20000);
    cy.contains('button', 'Mount statistics').click();
    cy.contains('button', 'Toggle countdown format').click();
    cy.get('[data-testid="statistic-countdown"] .sd-number-flow').should('have.length', 1);
    cy.tick(500);
    cy.contains('button', 'Toggle statistic start').click();
    cy.tick(100);
    cy.get('[data-testid="statistic-countdown"] .sd-number-flow')
      .should('have.length', 2)
      .last()
      .should('have.attr', 'aria-label', '01');
    cy.contains('button', 'Toggle statistic start').click();
    cy.tick(3000);
    cy.get('[data-testid="statistic-countdown"] .sd-number-flow')
      .last()
      .should('have.attr', 'aria-label', '01');
    cy.get('[data-testid="statistic-finishes"]').should('have.text', '0');
    cy.contains('button', 'Toggle countdown mount').click();
    cy.contains('button', 'Toggle countdown mount').click();
    cy.get('[data-testid="statistic-finishes"]').should('have.text', '1');
  });
});
