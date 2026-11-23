describe('React progress', () => {
  beforeEach(() => cy.visit('/progress.html'));

  it('renders Progress line dimensions, gradients, animation, custom text and native refs', () => {
    cy.contains('button', 'Mount Progress').click();
    cy.get('[data-testid="progress-line"] [role="progressbar"]').should(
      'have.attr',
      'aria-valuenow',
      '25',
    );
    cy.get('[data-testid="progress-line"] .sd-progress-line')
      .should('have.css', 'width', '160px')
      .and('have.css', 'height', '4px');
    cy.get('[data-testid="progress-line"] .sd-progress-line-bar')
      .should('have.class', 'sd-progress-line-bar-animate')
      .and('have.css', 'background-image')
      .and('include', 'linear-gradient');
    cy.contains('button', 'Toggle Progress width').click();
    cy.get('[data-testid="progress-line"] .sd-progress-line')
      .should('have.css', 'height', '8px')
      .and('have.attr', 'style')
      .and('include', '75%');
    cy.contains('button', 'Toggle Progress text').click();
    cy.get('[data-testid="progress-line"] .sd-progress-line-text').should(
      'have.text',
      'Value 0.25',
    );
    cy.contains('button', 'Toggle Progress visibility').click();
    cy.get('[data-testid="progress-line"] .sd-progress-line-text').should('not.exist');
    cy.contains('button', 'Read Progress ref').click();
    cy.get('[data-testid="progress-ref"]').should('have.text', 'DIV');
  });

  it('isolates Progress SVG gradients and updates circle geometry and status icons', () => {
    cy.contains('button', 'Mount Progress').click();
    cy.get('.sd-progress-circle-svg')
      .should('have.length', 2)
      .then(($svgs) => {
        const ids = [...$svgs].map((svg) => svg.querySelector('linearGradient')!.id);
        expect(new Set(ids).size).to.equal(2);
        [...$svgs].forEach((svg, index) =>
          expect(
            (svg.querySelector('.sd-progress-circle-bar') as SVGElement).style.stroke.replace(
              /["']/g,
              '',
            ),
          ).to.equal(`url(#${ids[index]})`),
        );
      });
    cy.contains('button', 'Toggle Progress width').click();
    cy.get('[data-testid="progress-circle"] [role="progressbar"]').should(
      'have.css',
      'width',
      '96px',
    );
    cy.get('[data-testid="progress-circle"] circle').first().should('have.attr', 'r', '46');
    cy.contains('button', 'Toggle Progress percent').click();
    cy.get('[data-testid="progress-circle"]').should('have.class', 'sd-progress-status-success');
    cy.get('[data-testid="progress-circle"] .sd-icon-check').should('exist');
    cy.contains('button', 'Toggle Progress danger').click();
    cy.get('[data-testid="progress-circle"] .sd-icon-exclamation').should('exist');
    cy.contains('button', 'Toggle Progress gradient').click();
    cy.get('[data-testid="progress-circle"] linearGradient').should('not.exist');
    cy.get('[data-testid="progress-circle"] .sd-progress-circle-bar').should(
      'have.css',
      'stroke',
      'rgb(0, 255, 0)',
    );
  });

  it('switches Progress mini and steps modes while preserving type precedence and text slots', () => {
    cy.contains('button', 'Mount Progress').click();
    cy.contains('button', 'Toggle Progress mini').click();
    cy.contains('button', 'Toggle Progress percent').click();
    cy.get('[data-testid="progress-line"] .sd-progress-circle-svg').should('exist');
    cy.get('[data-testid="progress-line"] [role="progressbar"]')
      .should('have.attr', 'aria-valuemin', '0')
      .and('have.attr', 'aria-valuemax', '100')
      .and('have.attr', 'aria-valuenow', '100');
    cy.get('[data-testid="progress-circle"] .sd-progress-circle-svg').should('not.exist');
    cy.get('[data-testid="progress-circle"] .sd-icon-check').should('exist');
    cy.contains('button', 'Toggle Progress steps').click();
    cy.get('[data-testid="progress-circle"]').should('have.class', 'sd-progress-type-steps');
    cy.get('[data-testid="progress-circle"] .sd-progress-steps-item-active').should(
      'have.length',
      4,
    );
    cy.contains('button', 'Toggle Progress percent').click();
    cy.get('[data-testid="progress-circle"] [role="progressbar"]').should(
      'have.attr',
      'aria-valuenow',
      '25',
    );
    cy.get('[data-testid="progress-circle"] .sd-progress-steps-item-active').should(
      'have.length',
      1,
    );
    cy.get('[data-testid="progress-line"] .sd-progress-steps').should('have.css', 'height', '4px');
    cy.contains('button', 'Toggle Progress gradient').click();
    const line = '[data-testid="progress-line"]';
    cy.get(`${line} .sd-progress-steps-item-active`).should(
      'have.css',
      'background-color',
      'rgb(0, 255, 0)',
    );
    cy.get(`${line} .sd-progress-steps-item`)
      .last()
      .should('have.css', 'background-color', 'rgb(17, 34, 51)');
    cy.contains('button', 'Toggle Progress danger').click();
    cy.get('[data-testid="progress-circle"] .sd-icon-exclamation-circle-fill').should('exist');
    cy.contains('button', 'Toggle Progress text').click();
    cy.get('[data-testid="progress-circle"] .sd-progress-steps-text').should(
      'have.text',
      'Value 0.25',
    );
    cy.get('[data-testid="progress-circle"] .sd-icon-exclamation-circle-fill').should('not.exist');
  });
});
