describe('React list', () => {
  beforeEach(() => cy.visit('/list.html'));

  it('merges List loading configuration while keeping the List loading flag authoritative', () => {
    cy.get('[data-testid="list-main"] .sd-list-spin').should('not.have.attr', 'aria-busy');
    cy.contains('button', 'List loading', { matchCase: true }).click();
    cy.get('[data-testid="list-main"] .sd-spin-mask').should(
      'contain.text',
      'Inherited list loading',
    );
    cy.contains('button', 'List local spin').click();
    cy.get('[data-testid="list-main"] .sd-spin-mask')
      .should('contain.text', 'Local list loading')
      .and('not.contain.text', 'Inherited list loading');
    cy.contains('button', 'List loading', { matchCase: true }).click();
    cy.get('[data-testid="list-main"] .sd-spin-mask').should('not.exist');
    cy.get('[data-testid="list-initial-virtual"] .sd-list-item-content')
      .first()
      .should('have.text', 'Virtual node 0');
  });

  it('paginates List data, derives totals and publishes pagination callbacks in order', () => {
    cy.get('[data-testid="list-main"] .sd-list')
      .should('have.class', 'sd-list-small')
      .and('have.class', 'sd-list-hover');
    cy.get('[data-testid="list-main"] .sd-pagination-total').should('contain.text', '25');
    cy.get('[data-testid="list-main"] .sd-list-item-content')
      .should('have.length', 5)
      .first()
      .should('have.text', 'List row 0');
    cy.get('[data-testid="list-main"]').contains('.sd-pagination-item', /^2$/).click();
    cy.get('[data-testid="list-main"] .sd-list-item-content')
      .first()
      .should('have.text', 'List row 5');
    cy.get('[data-testid="list-events"]').should('contain.text', 'pagination:2|page:2');
    cy.get('[data-testid="list-main"] .sd-pagination-options .sd-select-view').click();
    cy.contains('.sd-select-dropdown:visible [role="option"]', /^10 /).click();
    cy.get('[data-testid="list-main"] .sd-list-item-content').should('have.length', 10);
    cy.get('[data-testid="list-events"]').should('contain.text', 'size:10');
  });

  it('keeps controlled List pagination until writeback and accepts external page changes', () => {
    cy.contains('button', 'List controlled').click();
    cy.get('[data-testid="list-main"]').contains('.sd-pagination-item', /^2$/).click();
    cy.get('[data-testid="list-main"] [aria-current="page"]').should('have.text', '1');
    cy.get('[data-testid="list-main"] .sd-list-item-content')
      .first()
      .should('have.text', 'List row 0');
    cy.contains('button', 'List external page').click();
    cy.get('[data-testid="list-main"] .sd-list-item-content')
      .should('have.length', 5)
      .first()
      .should('have.text', 'List row 20');
    cy.contains('button', 'List controlled').click();
    cy.get('[data-testid="list-main"] .sd-list-item-content')
      .first()
      .should('have.text', 'List row 10');
  });

  it('splits List grid rows at 24 columns, preserves indexes and gives grid priority over virtualization', () => {
    cy.contains('button', 'List grid', { matchCase: true }).click();
    cy.get('[data-testid="list-main"] .sd-virtual-list').should('not.exist');
    cy.get('[data-testid="list-main"] .sd-list-row')
      .should('have.length', 7)
      .then((rows) =>
        expect([...rows].map((row) => row.querySelectorAll('.sd-list-col').length)).to.deep.equal([
          4, 4, 4, 4, 4, 4, 1,
        ]),
      );
    cy.get('[data-testid="list-main"] [data-index]').then((items) =>
      expect([...items].map((item) => Number(item.getAttribute('data-index')))).to.deep.equal(
        Array.from({ length: 25 }, (_, index) => index),
      ),
    );
    cy.contains('button', 'List responsive grid').click();
    cy.get('[data-testid="list-main"] .sd-list-row')
      .should('have.length', 1)
      .find('.sd-list-col')
      .should('have.length', 25);
  });

  it('prioritizes List children, refreshes replaced content and renders item meta and actions', () => {
    cy.get('[data-testid="list-main"] .sd-list-item')
      .first()
      .find('.sd-list-item-main > .sd-list-item-action')
      .should('not.exist');
    cy.contains('button', 'List actions layout').click();
    cy.get('[data-testid="list-main"] .sd-list-item')
      .first()
      .find('.sd-list-item-main > .sd-list-item-action li')
      .should('have.length', 2);
    cy.contains('button', 'List meta visibility').click();
    cy.get('[data-testid="list-main"] .sd-list-item-meta').should('not.exist');
    cy.contains('button', 'List meta visibility').click();
    cy.get('[data-testid="list-main"] .sd-list-item-meta').should('have.length', 5);
    cy.contains('button', 'List children').click();
    cy.get('[data-testid="list-main"] .sd-pagination-total').should('contain.text', '6');
    cy.get('[data-testid="list-main"] .sd-list-item-content').first().should('have.text', '0:a');
    cy.get('[data-testid="list-main"]').contains('.sd-pagination-item', /^2$/).click();
    cy.get('[data-testid="list-main"] .sd-list-item-content')
      .should('have.length', 1)
      .and('have.text', '5:f');
  });

  it('renders configured List empty content and replaces it with scroll-loading content', () => {
    cy.contains('button', 'List empty').click();
    cy.get('[data-testid="list-main"]').should('contain.text', 'Empty list');
    cy.contains('button', 'List scroll loading').click();
    cy.get('[data-testid="list-main"]')
      .should('not.contain.text', 'Empty list')
      .and('contain.text', 'Loading more');
    cy.get('[data-testid="list-main"] .sd-list-header').should('have.text', 'List header');
    cy.get('[data-testid="list-main"] .sd-list-footer').should('have.text', 'List footer');
  });

  it('renders bounded virtual List rows and exposes scrollIntoView and its virtual instance', () => {
    cy.contains('button', 'List virtual', { matchCase: true }).click();
    cy.get('[data-testid="list-main"] .sd-list-item').its('length').should('be.lessThan', 40);
    cy.contains('button', 'List scroll 400').click();
    cy.get('[data-testid="list-main"] .sd-list-item-content')
      .contains(/^List row 400$/)
      .should('be.visible');
    cy.get('[data-testid="list-events"]').should('contain.text', 'ref:true');
  });

  it('checks List initial viewport without false bottom events and publishes bottom before scroll', () => {
    cy.get('[data-testid="list-events"]')
      .invoke('text')
      .should((text) => {
        expect(text.split('|').filter((value) => value === 'short-bottom')).to.have.length(1);
        expect(text.split('|')).not.to.include('bottom');
        expect(text.split('|')).not.to.include('virtual-bottom');
      });
    cy.get('[data-testid="list-main"] .sd-list [data-overlayscrollbars-viewport]').scrollTo(
      'bottom',
    );
    cy.get('[data-testid="list-events"]').should('contain.text', 'bottom|scroll');
  });
});
