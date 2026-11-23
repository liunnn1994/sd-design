describe('React pagination', () => {
  beforeEach(() => cy.visit('/pagination.html'));

  it('adjusts accepted controlled Pagination once and honors autoAdjust opt-out', () => {
    cy.get('[data-testid="pager-accepted"] .sd-select-view').click();
    cy.contains('.sd-select-dropdown:visible [role="option"]', /^5 /).click();
    cy.get('[data-testid="pager-accepted"] [aria-current="page"]').should('have.text', '5');
    cy.get('[data-testid="pager-events"]')
      .invoke('text')
      .should((text) =>
        expect(text.split('|').filter((value) => value === 'accepted:5')).to.have.length(1),
      );
    cy.get('[data-testid="pager-no-adjust"] .sd-select-view').click();
    cy.contains('.sd-select-dropdown:visible [role="option"]', /^5 /).click();
    cy.get('[data-testid="pager-no-adjust"] [aria-current="page"]').should('have.text', '8');
    cy.contains('button', 'Pagination shrink').click();
    cy.get('[data-testid="pager-no-adjust"] [aria-current="page"]').should('not.exist');
  });

  it('disables page-size selection and both ellipses despite permissive select props', () => {
    const pager = '[data-testid="pager"]';
    const ellipses = `${pager} .sd-pagination-item-ellipsis`;
    const select = `${pager} .sd-pagination-options .sd-select-view`;
    cy.get(pager).should('have.attr', 'role', 'navigation');
    cy.get(select).trigger('mouseover');
    cy.get(`${pager} .sd-pagination-options .sd-select-view-clear-btn`).should('not.exist');
    cy.get(ellipses).should('have.length', 2).last().click();
    cy.get(`${pager} [aria-current="page"]`).should('have.text', '8');
    cy.contains('button', 'Pagination disabled').click();
    cy.get(select).should('have.class', 'sd-select-view-disabled').click({ force: true });
    cy.get('.sd-select-dropdown:visible').should('not.exist');
    cy.get(ellipses).each(($item) => {
      const item = cy.wrap($item);
      item.should('have.attr', 'aria-disabled', 'true').and('have.attr', 'tabindex', '-1');
      cy.wrap($item).click({ force: true });
    });
    cy.get(`${pager} [aria-current="page"]`).should('have.text', '8');
    cy.get('[data-testid="pager-events"]').should('have.text', 'update:8|change:8');
  });

  it('changes Pagination by keyboard and preserves update-before-change order', () => {
    cy.get('[data-testid="pager"] .sd-pagination-item')
      .contains(/^4$/)
      .focus()
      .trigger('keydown', { key: 'Enter' });
    cy.get('[data-testid="pager"] [aria-current="page"]').should('have.text', '4');
    cy.get('[data-testid="pager-events"]').should('have.text', 'update:4|change:4');
    cy.get('[data-testid="pager"] .sd-pagination-item-next')
      .focus()
      .trigger('keydown', { key: ' ' });
    cy.get('[data-testid="pager"] [aria-current="page"]').should('have.text', '5');
    cy.contains('button', 'Pagination disabled').click();
    cy.get('[data-testid="pager"] .sd-pagination-item-next')
      .should('have.attr', 'tabindex', '-1')
      .click();
    cy.get('[data-testid="pager"] [aria-current="page"]').should('have.text', '5');
  });

  it('adjusts Pagination around the first record after page-size and total changes', () => {
    cy.get('[data-testid="pager"] .sd-pagination-options .sd-select-view').click();
    cy.contains('.sd-select-dropdown:visible [role="option"]', /^20 /).click();
    cy.get('[data-testid="pager"] [aria-current="page"]').should('have.text', '2');
    cy.get('[data-testid="pager-events"]').should(
      'contain.text',
      'size-update:20|size:20|update:2|change:2',
    );
    cy.contains('button', 'Pagination shrink').click();
    cy.get('[data-testid="pager"] [aria-current="page"]').should('have.text', '1');
    cy.get('[data-testid="pager"] .sd-pagination-item-next').should(
      'have.attr',
      'aria-disabled',
      'true',
    );
  });

  it('labels the step controls and blocks them at the first and last pages', () => {
    const pager = '[data-testid="pager"]';
    const previous = () => cy.get(`${pager} .sd-pagination-item-previous`);
    const next = () => cy.get(`${pager} .sd-pagination-item-next`);
    previous().should('have.attr', 'aria-label', '上一页');
    next().should('have.attr', 'aria-label', '下一页');
    previous().click();
    previous().click();
    cy.get(`${pager} [aria-current="page"]`).should('have.text', '1');
    previous().should('have.attr', 'aria-disabled', 'true').click({ force: true });
    cy.get('[data-testid="pager-events"]').should(
      'have.text',
      'update:2|change:2|update:1|change:1',
    );

    cy.get(`${pager} .sd-pagination-jumper input`).type('10{enter}');
    cy.get(`${pager} [aria-current="page"]`).should('have.text', '10');
    next().should('have.attr', 'aria-disabled', 'true').trigger('keydown', { key: 'Enter' });
    cy.get('[data-testid="pager-events"]').should(
      'have.text',
      'update:2|change:2|update:1|change:1|update:10|change:10',
    );
  });

  it('keeps controlled Pagination values until writeback and recalculates external sizes', () => {
    cy.get('[data-testid="pager-controlled"] .sd-pagination-item').contains(/^4$/).click();
    cy.get('[data-testid="pager-controlled"] [aria-current="page"]').should('have.text', '3');
    cy.get('[data-testid="pager-events"]').should('contain.text', 'rejected:4');
    cy.contains('button', 'Pagination external current').click();
    cy.get('[data-testid="pager-controlled"] [aria-current="page"]').should('have.text', '7');
    cy.contains('button', 'Pagination external size').click();
    cy.get('[data-testid="pager-events"]').should('contain.text', 'rejected:4');
    cy.get('[data-testid="pager-controlled"] .sd-pagination-options').should('contain.text', '20');
  });

  it('commits Pagination jumpers, clears ordinary drafts and synchronizes simple mode', () => {
    cy.get('[data-testid="pager"] .sd-pagination-jumper input').type('6{enter}');
    cy.get('[data-testid="pager"] [aria-current="page"]').should('have.text', '6');
    cy.get('[data-testid="pager"] .sd-pagination-jumper input').should('have.value', '');
    cy.get('[data-testid="pager"] .sd-pagination-jumper input').type('99').blur();
    cy.get('[data-testid="pager"] [aria-current="page"]').should('have.text', '10');
    cy.get('[data-testid="pager"] .sd-pagination-item-next').should(
      'have.attr',
      'aria-disabled',
      'true',
    );
    cy.contains('button', 'Pagination simple').click();
    cy.get('[data-testid="pager"] .sd-pagination-jumper input')
      .should('have.value', '10')
      .clear()
      .type('8{enter}');
    cy.get('[data-testid="pager"] .sd-pagination-jumper input').should('have.value', '8');
    cy.get('[data-testid="pager"] .sd-pagination-item-next').click();
    cy.get('[data-testid="pager"] .sd-pagination-jumper input').should('have.value', '9');
  });

  it('keeps the empty-result jumper usable without navigating and hides a single-page pager', () => {
    const pager = '[data-testid="pager-empty"]';
    const input = () => cy.get(`${pager} .sd-pagination-jumper input`);
    input().should('not.be.disabled');
    input().should('have.attr', 'aria-valuemax', '1').and('have.attr', 'aria-valuemin', '1');
    input().type('2{enter}');
    input().should('have.value', '');
    for (const step of ['previous', 'next']) {
      cy.get(`${pager} .sd-pagination-item-${step}`)
        .should('have.attr', 'aria-disabled', 'true')
        .click({ force: true });
    }
    cy.get('[data-testid="pager-events"]').should('be.empty');
    cy.get('[data-testid="pager-hidden"]').should('not.exist');
  });

  it('inherits Pagination configuration, renders custom slots and permits local opt-outs', () => {
    cy.get('[data-testid="pager-provider"]')
      .should('have.class', 'sd-pagination-size-small')
      .and('contain.text', 'Rows 200')
      .and('contain.text', 'Jump')
      .and('contain.text', 'page');
    cy.get('[data-testid="pager-provider"] .sd-pagination-item-ellipsis').first().click();
    cy.get('[data-testid="pager-provider"] [aria-current="page"]').should('have.text', 'P4');
    cy.get('[data-testid="pager-provider"] .sd-pagination-options .sd-select-view').click();
    cy.get('.sd-select-dropdown:visible [role="option"]').should('have.length', 2);
    cy.contains('.sd-select-dropdown:visible [role="option"]', /^50 /).click();
    cy.get('[data-testid="pager-provider"] [aria-current="page"]').should('have.text', 'P2');
    cy.get(
      '[data-testid="pager-optout"] .sd-pagination-total, [data-testid="pager-optout"] .sd-pagination-jumper, [data-testid="pager-optout"] .sd-pagination-options',
    ).should('not.exist');
  });
});
