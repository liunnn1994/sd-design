import InputNumber from '../index';

describe('InputNumber boundary clearing', () => {
  for (const mode of ['embed', 'button'] as const) {
    it(`restores stepping after clearing the maximum in ${mode} mode`, () => {
      cy.mount(InputNumber, { props: { mode, defaultValue: 5, max: 5, allowClear: true } });
      cy.get('[aria-label="增加"]').should('be.disabled');
      cy.get('.sd-input-clear-btn').click({ force: true });
      cy.get('input').should('have.value', '');
      cy.get('[aria-label="增加"]').should('not.be.disabled');
      cy.get('input').type('{upArrow}').should('have.value', '0');
      cy.get('[aria-label="增加"]').trigger('mousedown').trigger('mouseup');
      cy.get('input').should('have.value', '1');
    });
  }
});
